import {
  Agent,
  AgentContext,
  ClinicalSafetyOutput,
  ClinicalSafetyOutputSchema,
  ClinicalHistoryOutput,
  RedFlagDetail,
} from "./types";
import { globalSafetyEngine, SafetyCheckResult } from "./safety-rules-engine";
import { callGeminiStructured } from "./gemini-client";

export interface ClinicalSafetyInput {
  history: ClinicalHistoryOutput;
  uploadedMedications?: string[];
  rawTranscript?: string;
  patientMessages?: string[];
}

const SAFETY_SYSTEM_PROMPT = `You are ClinicalSafetyAgent, the highest-priority patient safety auditor for Industra Medicose.
You review patient clinical intake transcripts, symptoms, and uploaded document findings to detect life-threatening red flags, clinical inconsistencies, and missing critical information.

SAFETY RULES & POSTURE:
1. You must extract exact patient quotes that triggered each red flag.
2. Identify clinical inconsistencies (e.g. acute crushing chest pain reported for 2 hours, but patient claims no shortness of breath, or discrepancies between reported vs documented medications).
3. Identify missing critical triage information (e.g. unknown cardiac history, unmeasured vitals, missing duration).
4. Suggest 1-2 urgent clarifying clinical questions for the physician.
5. You may assign urgency: "routine", "attention", or "urgent". Remember: the deterministic safety layer has already evaluated immediate red flags. You may elevate or confirm urgency, but never compromise safety.`;

export class ClinicalSafetyAgent
  implements Agent<ClinicalSafetyInput, ClinicalSafetyOutput>
{
  name = "ClinicalSafetyAgent";
  description =
    "Two-tier patient safety engine combining instantaneous deterministic keyword/negation rules with Gemini clinical reasoning to detect red flags, contraindications, and urgent presentations.";

  async run(
    input: ClinicalSafetyInput,
    _ctx: AgentContext
  ): Promise<ClinicalSafetyOutput> {
    const fullText = [
      input.history.chief_complaint,
      input.history.history_of_present_illness,
      input.history.past_history.join(" "),
      ...(input.patientMessages || []),
      input.rawTranscript || "",
    ]
      .filter(Boolean)
      .join(" ");

    // =========================================================
    // LAYER 1: DETERMINISTIC EVALUATION (Zero-latency safety net)
    // =========================================================
    const deterministicCheck: SafetyCheckResult = globalSafetyEngine.evaluate(fullText);

    const deterministicRedFlags: RedFlagDetail[] = deterministicCheck.matches.map((m) => ({
      flag: `${m.rule_name}: ${m.guidance_en}`,
      quote: m.matched_keyword,
      severity: m.severity,
    }));

    // Contraindications & Allergies
    const contraindications: string[] = [];
    const allergyAlerts: string[] = [];

    const allergyText = input.history.allergies.join(" ").toLowerCase();
    const allMedsText = [
      ...input.history.medications,
      ...(input.uploadedMedications || []),
    ].join(" ").toLowerCase();

    if (allergyText.includes("penicillin")) {
      allergyAlerts.push("Penicillin Hypersensitivity: High risk of anaphylaxis with Beta-Lactams (Amoxicillin, Ampicillin, Augmentin)");
      if (/amox|ampicil|augmentin|penicillin|piperacillin/i.test(allMedsText)) {
        contraindications.push("CRITICAL CONTRAINDICATION: Patient allergic to Penicillin, but beta-lactam medication is documented!");
      }
    }

    if (allergyText.includes("sulfa")) {
      allergyAlerts.push("Sulfa Allergy: Avoid Trimethoprim-Sulfamethoxazole (Bactrim/Septra)");
    }

    if (allergyText.includes("aspirin") || allergyText.includes("nsaid")) {
      allergyAlerts.push("NSAID / Aspirin Sensitivity: Avoid Ibuprofen, Diclofenac, Naproxen");
    }

    // =========================================================
    // LAYER 2: AI REASONING (Gemini 2.5 Flash)
    // =========================================================
    let aiUrgency: "routine" | "attention" | "urgent" = "routine";
    let aiRedFlagDetails: RedFlagDetail[] = [];
    let inconsistencies: string[] = [];
    let missingInfo: string[] = [...input.history.missing_info];
    let clarifyingQuestions: string[] = [];

    try {
      const aiPrompt = `Review this clinical intake case:
CHIEF COMPLAINT: "${input.history.chief_complaint}"
DURATION: "${input.history.symptom_duration}"
HISTORY OF PRESENT ILLNESS: "${input.history.history_of_present_illness}"
PAST HISTORY: ${JSON.stringify(input.history.past_history)}
REPORTED MEDICATIONS: ${JSON.stringify(input.history.medications)}
UPLOADED DOCUMENT MEDICATIONS: ${JSON.stringify(input.uploadedMedications || [])}
ALLERGIES: ${JSON.stringify(input.history.allergies)}
DETERMINISTIC LAYER RESULT: ${deterministicCheck.severity} (Urgent: ${deterministicCheck.is_urgent})

Return JSON with:
{
  "urgency": "routine" | "attention" | "urgent",
  "red_flag_details": [ { "flag": "string", "quote": "exact patient quote from text", "severity": "urgent"|"attention" } ],
  "inconsistencies": [ "string" ],
  "missing_critical_info": [ "string" ],
  "suggested_clarifying_questions": [ "string" ]
}`;

      const aiResponse = await callGeminiStructured<{
        urgency: "routine" | "attention" | "urgent";
        red_flag_details: RedFlagDetail[];
        inconsistencies: string[];
        missing_critical_info: string[];
        suggested_clarifying_questions: string[];
      }>({
        systemPrompt: SAFETY_SYSTEM_PROMPT,
        userPrompt: aiPrompt,
        temperature: 0.1,
      });

      if (aiResponse) {
        aiUrgency = aiResponse.urgency || "routine";
        aiRedFlagDetails = aiResponse.red_flag_details || [];
        inconsistencies = aiResponse.inconsistencies || [];
        if (aiResponse.missing_critical_info) {
          missingInfo = Array.from(new Set([...missingInfo, ...aiResponse.missing_critical_info]));
        }
        clarifyingQuestions = aiResponse.suggested_clarifying_questions || [];
      }
    } catch (aiErr) {
      console.warn("AI safety reasoning fallback to deterministic layer:", aiErr);
    }

    // =========================================================
    // LAYER RESOLUTION: AI CAN ONLY ELEVATE URGENCY, NEVER LOWER
    // =========================================================
    const severityRank: Record<string, number> = { routine: 1, attention: 2, urgent: 3 };
    const deterministicRank = severityRank[deterministicCheck.severity] || 1;
    const aiRank = severityRank[aiUrgency] || 1;

    // Highest rank wins
    const finalUrgency = (
      aiRank > deterministicRank ? aiUrgency : deterministicCheck.severity
    ) as "routine" | "attention" | "urgent";

    // Combine red flags with exact quotes
    const combinedRedFlagDetails: RedFlagDetail[] = [
      ...deterministicRedFlags,
      ...aiRedFlagDetails.filter(
        (aiFlag) => !deterministicRedFlags.some((df) => df.flag.toLowerCase().includes(aiFlag.flag.toLowerCase()))
      ),
    ];

    const simpleRedFlagStrings: string[] = combinedRedFlagDetails.map(
      (rf) => `${rf.flag} [Triggered by quote: "${rf.quote}"]`
    );

    const output: ClinicalSafetyOutput = {
      urgency: finalUrgency,
      red_flags: simpleRedFlagStrings,
      red_flag_details: combinedRedFlagDetails,
      inconsistencies,
      missing_critical_info: missingInfo,
      suggested_clarifying_questions: clarifyingQuestions,
      contraindications,
      allergy_alerts: allergyAlerts,
      deterministic_matched: deterministicCheck.matches.length > 0,
      status: "ready",
    };

    return ClinicalSafetyOutputSchema.parse(output);
  }
}
