import {
  Agent,
  AgentContext,
  PatientInteractionOutput,
  PatientInteractionOutputSchema,
} from "./types";
import { callGeminiStructured } from "./gemini-client";
import { MockLLM } from "@/lib/mock-llm";

export const PATIENT_INTERACTION_SYSTEM_PROMPT = `
You are the PatientInteractionAgent for Industra Medicose.
Your goal is to conduct an empathetic, focused pre-consultation intake with the patient.

RULES:
1. Conduct the intake conversation in the patient's language (Hindi, English, or Hinglish).
2. Ask exactly ONE simple, clear question at a time.
3. Systematically cover these 7 core aspects:
   - Chief complaint (what is bothering you?)
   - Duration (when did it start?)
   - Severity (on a scale of 1 to 10)
   - Associated symptoms (any fever, nausea, breathlessness, radiation?)
   - Past medical history (any diabetes, hypertension, asthma?)
   - Current medications (any regular tablets or drops?)
   - Allergies (any known allergies to medicines like penicillin?)
4. STOPPING CONDITION:
   - Set is_intake_complete to TRUE when all 7 fields have been gathered OR when question_number reaches 10.
   - Once is_intake_complete is true, thank the patient warmly and explain that the doctor will review their structured summary shortly.
5. NEVER give a diagnosis, medication advice, or reassurance about causes (e.g., do not say "this sounds like a heart attack" or "it is probably just gas").
6. Output JSON conforming to this schema:
{
  "next_question": string,
  "question_language": "en" | "hi" | "hinglish",
  "covered_aspects": string[],
  "missing_aspects": string[],
  "question_number": number,
  "is_intake_complete": boolean,
  "reason_for_completion": string (optional)
}
`.trim();

export interface PatientInteractionInput {
  latestMessage: string;
  conversationHistory: Array<{ role: "patient" | "agent"; content: string }>;
  preferredLanguage?: "en" | "hi";
}

export class PatientInteractionAgent
  implements Agent<PatientInteractionInput, PatientInteractionOutput>
{
  name = "PatientInteractionAgent";
  description =
    "Conducts bilingual patient intake asking one question at a time covering chief complaint, duration, severity, history, medications, and allergies.";

  async run(
    input: PatientInteractionInput,
    ctx: AgentContext
  ): Promise<PatientInteractionOutput> {
    const history = input.conversationHistory || ctx.messageHistory || [];
    const language = input.preferredLanguage || ctx.preferredLanguage || "en";

    const userPrompt = `
CONVERSATION HISTORY:
${history.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}

LATEST PATIENT MESSAGE:
"${input.latestMessage}"

PREFERRED LANGUAGE: ${language}

Generate the next single clinical question in JSON according to your instructions.
`.trim();

    // Call Gemini 2.5 Flash
    const geminiResult = await callGeminiStructured<PatientInteractionOutput>({
      systemPrompt: PATIENT_INTERACTION_SYSTEM_PROMPT,
      userPrompt,
      responseSchema: {
        type: "OBJECT",
        properties: {
          next_question: { type: "STRING" },
          question_language: { type: "STRING", enum: ["en", "hi", "hinglish"] },
          covered_aspects: { type: "ARRAY", items: { type: "STRING" } },
          missing_aspects: { type: "ARRAY", items: { type: "STRING" } },
          question_number: { type: "INTEGER" },
          is_intake_complete: { type: "BOOLEAN" },
          reason_for_completion: { type: "STRING" },
        },
        required: [
          "next_question",
          "question_language",
          "covered_aspects",
          "missing_aspects",
          "question_number",
          "is_intake_complete",
        ],
      },
    });

    if (geminiResult) {
      const parsed = PatientInteractionOutputSchema.safeParse(geminiResult);
      if (parsed.success) {
        return parsed.data;
      }
    }

    // Deterministic Mock fallback
    const mockOutput = MockLLM.mockPatientInteraction(
      input.latestMessage,
      history,
      language
    );

    return PatientInteractionOutputSchema.parse(mockOutput);
  }
}
