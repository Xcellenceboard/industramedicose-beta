import { z } from "zod";
import {
  Agent,
  AgentContext,
  AgentRunLog,
  PatientInteractionOutputSchema,
  ClinicalHistoryOutputSchema,
  DocumentIntelligenceOutputSchema,
  ClinicalSafetyOutputSchema,
  ClinicalDocumentationOutputSchema,
  WorkflowCoordinationOutputSchema,
} from "./types";
import { PatientInteractionAgent } from "./patient-interaction";
import { ClinicalHistoryAgent } from "./clinical-history";
import { DocumentIntelligenceAgent } from "./document-intelligence";
import { ClinicalSafetyAgent } from "./clinical-safety";
import { ClinicalDocumentationAgent } from "./clinical-documentation";
import { WorkflowCoordinationAgent } from "./workflow-coordination";
import { createAdminClient } from "@/lib/supabase/admin";
import { agentRunsStore, clinicalSummariesStore } from "./store";

export interface ExecuteOptions {
  timeoutMs?: number;
  maxRetries?: number;
}

export class Orchestrator {
  private patientInteractionAgent = new PatientInteractionAgent();
  private clinicalHistoryAgent = new ClinicalHistoryAgent();
  private documentIntelligenceAgent = new DocumentIntelligenceAgent();
  private clinicalSafetyAgent = new ClinicalSafetyAgent();
  private clinicalDocumentationAgent = new ClinicalDocumentationAgent();
  private workflowCoordinationAgent = new WorkflowCoordinationAgent();

  /**
   * Execute an agent in a controlled sandbox with timeout, retry logic (max 2),
   * strict Zod validation, and comprehensive logging to the agent_runs audit table.
   */
  async executeAgent<TInput, TOutput>(
    agent: Agent<TInput, TOutput>,
    input: TInput,
    ctx: AgentContext,
    schema: z.ZodType<TOutput>,
    options: ExecuteOptions = {}
  ): Promise<TOutput> {
    const timeoutMs = options.timeoutMs ?? 15000;
    const maxRetries = options.maxRetries ?? 2;

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      attempt++;
      const startTime = Date.now();
      let status: "success" | "error" | "retry" = "success";
      let errorMsg: string | null = null;
      let rawOutput: unknown = null;

      try {
        // Run with timeout wrapper
        const agentPromise = agent.run(input, ctx);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  `Agent ${agent.name} timed out after ${timeoutMs}ms (attempt ${attempt})`
                )
              ),
            timeoutMs
          )
        );

        rawOutput = await Promise.race([agentPromise, timeoutPromise]);

        // Validate output with Zod
        const validatedOutput = schema.parse(rawOutput);
        const latencyMs = Date.now() - startTime;

        // Log successful run
        await this.logAgentRun({
          consultation_id: ctx.consultationId,
          agent_name: agent.name,
          input: (input as Record<string, unknown>) || {},
          output: (validatedOutput as Record<string, unknown>) || {},
          latency_ms: latencyMs,
          status: "success",
          error: null,
        });

        return validatedOutput;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        errorMsg = lastError.message;
        const latencyMs = Date.now() - startTime;
        status = attempt <= maxRetries ? "retry" : "error";

        // Log failure/retry attempt
        await this.logAgentRun({
          consultation_id: ctx.consultationId,
          agent_name: agent.name,
          input: (input as Record<string, unknown>) || {},
          output: (rawOutput as Record<string, unknown>) || {},
          latency_ms: latencyMs,
          status,
          error: errorMsg,
        });

        if (attempt <= maxRetries) {
          console.warn(
            `[Orchestrator] Retrying ${agent.name} (attempt ${attempt + 1}/${maxRetries + 1}):`,
            errorMsg
          );
          // Exponential backoff
          await new Promise((res) => setTimeout(res, 200 * attempt));
        }
      }
    }

    throw (
      lastError ||
      new Error(`Agent ${agent.name} failed after ${maxRetries} retries.`)
    );
  }

  /**
   * Persist agent run audit record to Supabase agent_runs and local fallback store
   */
  private async logAgentRun(run: AgentRunLog): Promise<void> {
    // 1. Always record in resilient process store
    agentRunsStore.addRun(run);

    // 2. Attempt remote Supabase write
    try {
      const supabase = createAdminClient();
      await supabase.from("agent_runs").insert({
        consultation_id: run.consultation_id,
        agent_name: run.agent_name,
        input: run.input as any,
        output: run.output as any,
        latency_ms: run.latency_ms,
        status: run.status,
        error: run.error || null,
      });
    } catch {
      // Non-blocking: fallback store ensures audit records are preserved
    }
  }

  /**
   * Run a single conversational intake step using PatientInteractionAgent
   */
  async processIntakeMessage(
    consultationId: string,
    message: string,
    history: Array<{ role: "patient" | "agent"; content: string }>,
    preferredLanguage: "en" | "hi" = "en"
  ) {
    const ctx: AgentContext = {
      consultationId,
      preferredLanguage,
      messageHistory: history,
    };

    return this.executeAgent(
      this.patientInteractionAgent,
      {
        latestMessage: message,
        conversationHistory: history,
        preferredLanguage,
      },
      ctx,
      PatientInteractionOutputSchema,
      { timeoutMs: 12000, maxRetries: 2 }
    );
  }

  /**
   * Run the full multi-agent finalization pipeline:
   * 1. ClinicalHistoryAgent
   * 2. DocumentIntelligenceAgent
   * 3. ClinicalSafetyAgent
   * 4. ClinicalDocumentationAgent
   * 5. WorkflowCoordinationAgent
   *
   * Writes results to clinical_summaries and agent_runs.
   */
  async runFinalizePipeline(
    consultationId: string,
    history: Array<{ role: "patient" | "agent"; content: string }>,
    intakeDurationSeconds: number = 114
  ) {
    const ctx: AgentContext = {
      consultationId,
      messageHistory: history,
    };

    // Step 1: Structure Clinical History
    const clinicalHistory = await this.executeAgent(
      this.clinicalHistoryAgent,
      { conversationHistory: history },
      ctx,
      ClinicalHistoryOutputSchema
    );

    // Step 2: Document Intelligence (Interface scaffold)
    const docIntelligence = await this.executeAgent(
      this.documentIntelligenceAgent,
      { documentIds: [] },
      ctx,
      DocumentIntelligenceOutputSchema
    );

    // Step 3: Clinical Safety Check
    const safetyCheck = await this.executeAgent(
      this.clinicalSafetyAgent,
      {
        history: clinicalHistory,
        uploadedMedications: docIntelligence.extracted_medications,
      },
      ctx,
      ClinicalSafetyOutputSchema
    );

    // Step 4: Clinical Documentation (SOAP Note Draft)
    const documentation = await this.executeAgent(
      this.clinicalDocumentationAgent,
      {
        history: clinicalHistory,
        redFlags: safetyCheck.red_flags,
        contraindications: safetyCheck.contraindications,
      },
      ctx,
      ClinicalDocumentationOutputSchema
    );

    // Step 5: Workflow Coordination & Status Update
    const workflow = await this.executeAgent(
      this.workflowCoordinationAgent,
      {
        consultationId,
        safety: safetyCheck,
        intakeDurationSeconds,
      },
      ctx,
      WorkflowCoordinationOutputSchema
    );

    // Save final summary record
    const summaryRecord = {
      id: `sum-${consultationId}`,
      consultation_id: consultationId,
      chief_complaint: clinicalHistory.chief_complaint,
      symptom_duration: clinicalHistory.symptom_duration,
      history_of_present_illness: clinicalHistory.history_of_present_illness,
      past_history: clinicalHistory.past_history.join(", "),
      medications: clinicalHistory.medications,
      allergies: clinicalHistory.allergies,
      red_flags: safetyCheck.red_flags,
      missing_info: clinicalHistory.missing_info,
      ai_draft_note: documentation.ai_draft_note,
      doctor_edited_note: null,
      is_verified: false,
      verified_by: null,
      verified_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Store in process fallback store
    clinicalSummariesStore.saveSummary(summaryRecord);

    // Attempt remote Supabase write
    try {
      const supabase = createAdminClient();
      await supabase.from("clinical_summaries").upsert({
        consultation_id: consultationId,
        chief_complaint: clinicalHistory.chief_complaint,
        symptom_duration: clinicalHistory.symptom_duration,
        history_of_present_illness: clinicalHistory.history_of_present_illness,
        past_history: clinicalHistory.past_history.join(", "),
        medications: clinicalHistory.medications as any,
        allergies: clinicalHistory.allergies as any,
        red_flags: safetyCheck.red_flags as any,
        missing_info: clinicalHistory.missing_info as any,
        ai_draft_note: documentation.ai_draft_note,
        is_verified: false,
      });
    } catch {
      // Non-blocking
    }

    return {
      consultationId,
      clinicalHistory,
      docIntelligence,
      safetyCheck,
      documentation,
      workflow,
      summary: summaryRecord,
      runs: agentRunsStore.getRuns(consultationId),
    };
  }
}

export const orchestrator = new Orchestrator();
