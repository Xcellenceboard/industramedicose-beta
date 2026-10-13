import {
  Agent,
  AgentContext,
  ClinicalDocumentationOutput,
  ClinicalDocumentationOutputSchema,
  ClinicalHistoryOutput,
} from "./types";
import { callGeminiStructured } from "./gemini-client";
import { MockLLM } from "@/lib/mock-llm";

export const CLINICAL_DOC_SYSTEM_PROMPT = `
You are the ClinicalDocumentationAgent for Industra Medicose.
Your task is to draft a clean, high-density SOAP note for the clinician's review.

RULES:
1. Subjective MUST be thoroughly populated from the structured clinical history:
   - Chief complaint, duration, character of symptoms.
   - History of Present Illness (HPI).
   - Past medical and surgical history.
   - Current active medications.
   - Known drug and food allergies.
   - Missing info or pending diagnostics to clarify.
2. Objective MUST be set to:
   "To be completed by clinician during physical examination & vitals check."
3. Assessment MUST be set to:
   "To be completed by clinician (Differential diagnoses pending MD verification)."
4. Plan MUST be set to:
   "To be completed by clinician (Prescription & investigations pending MD verification)."
5. Disclaimer MUST be:
   "AI-generated draft - requires physician verification before signature."
6. Output JSON conforming to this schema:
{
  "ai_draft_note": string,
  "subjective": string,
  "objective": string,
  "assessment": string,
  "plan": string,
  "disclaimer": string
}
`.trim();

export interface ClinicalDocumentationInput {
  history: ClinicalHistoryOutput;
  redFlags?: string[];
  contraindications?: string[];
}

export class ClinicalDocumentationAgent
  implements Agent<ClinicalDocumentationInput, ClinicalDocumentationOutput>
{
  name = "ClinicalDocumentationAgent";
  description =
    "Drafts a structured SOAP-style clinical note with Subjective populated and Objective/Assessment/Plan reserved for attending physician.";

  async run(
    input: ClinicalDocumentationInput,
    _ctx: AgentContext
  ): Promise<ClinicalDocumentationOutput> {
    const userPrompt = `
STRUCTURED CLINICAL HISTORY:
Chief Complaint: ${input.history.chief_complaint}
Duration: ${input.history.symptom_duration}
HPI: ${input.history.history_of_present_illness}
Past History: ${input.history.past_history.join(", ")}
Medications: ${input.history.medications.join(", ")}
Allergies: ${input.history.allergies.join(", ")}
Missing Info: ${input.history.missing_info.join(", ")}
Red Flags: ${(input.redFlags || []).join(", ") || "None flagged"}

Draft the SOAP note JSON according to your instructions.
`.trim();

    const geminiResult = await callGeminiStructured<ClinicalDocumentationOutput>({
      systemPrompt: CLINICAL_DOC_SYSTEM_PROMPT,
      userPrompt,
      responseSchema: {
        type: "OBJECT",
        properties: {
          ai_draft_note: { type: "STRING" },
          subjective: { type: "STRING" },
          objective: { type: "STRING" },
          assessment: { type: "STRING" },
          plan: { type: "STRING" },
          disclaimer: { type: "STRING" },
        },
        required: [
          "ai_draft_note",
          "subjective",
          "objective",
          "assessment",
          "plan",
          "disclaimer",
        ],
      },
    });

    if (geminiResult) {
      const parsed = ClinicalDocumentationOutputSchema.safeParse(geminiResult);
      if (parsed.success) {
        return parsed.data;
      }
    }

    // Deterministic Mock fallback
    const mockOutput = MockLLM.mockClinicalDocumentation(input.history);
    return ClinicalDocumentationOutputSchema.parse(mockOutput);
  }
}
