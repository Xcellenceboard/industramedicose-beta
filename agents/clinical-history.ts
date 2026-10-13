import {
  Agent,
  AgentContext,
  ClinicalHistoryOutput,
  ClinicalHistoryOutputSchema,
} from "./types";
import { callGeminiStructured } from "./gemini-client";
import { MockLLM } from "@/lib/mock-llm";

export const CLINICAL_HISTORY_SYSTEM_PROMPT = `
You are the ClinicalHistoryAgent for Industra Medicose.
Your task is to take the full patient-agent intake discourse and structure it into a comprehensive clinical history.

RULES:
1. ALWAYS output in professional medical English for the physician.
2. Preserve the patient's original vernacular/Hindi/colloquial words in quotes where clinically relevant (e.g., Patient describes retrosternal sensation as "छाती में बहुत भारीपन" (severe chest heaviness)).
3. Extract and categorize:
   - chief_complaint: concise phrase (e.g. "Acute crushing retrosternal chest pain x 2 hours")
   - symptom_duration: clear timeline (e.g. "2 hours (acute onset)")
   - history_of_present_illness: chronological narrative detailing onset, duration, character, radiation, severity, associated symptoms, aggravating/relieving factors.
   - past_history: string array of chronic comorbidities, surgeries, or "No significant past history reported"
   - medications: string array of regular active medications or "None reported"
   - allergies: string array of known drug/food allergies or "No known drug allergies (NKDA)"
   - missing_info: string array of critical clinical elements not clarified during intake (e.g., "Radiation of chest pain to arm/jaw", "Recent baseline ECG")
4. NEVER fabricate, assume, or invent facts that were not stated.
5. Output JSON conforming to this schema:
{
  "chief_complaint": string,
  "symptom_duration": string,
  "history_of_present_illness": string,
  "past_history": string[],
  "medications": string[],
  "allergies": string[],
  "missing_info": string[]
}
`.trim();

export interface ClinicalHistoryInput {
  conversationHistory: Array<{ role: "patient" | "agent"; content: string }>;
}

export class ClinicalHistoryAgent
  implements Agent<ClinicalHistoryInput, ClinicalHistoryOutput>
{
  name = "ClinicalHistoryAgent";
  description =
    "Converts vernacular patient intake conversation into a structured clinical history in English, preserving verbatim quotes.";

  async run(
    input: ClinicalHistoryInput,
    ctx: AgentContext
  ): Promise<ClinicalHistoryOutput> {
    const history = input.conversationHistory || ctx.messageHistory || [];

    const userPrompt = `
CONVERSATION TRANSCRIPT:
${history.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}

Synthesize this transcript into the structured JSON clinical history according to your instructions.
`.trim();

    const geminiResult = await callGeminiStructured<ClinicalHistoryOutput>({
      systemPrompt: CLINICAL_HISTORY_SYSTEM_PROMPT,
      userPrompt,
      responseSchema: {
        type: "OBJECT",
        properties: {
          chief_complaint: { type: "STRING" },
          symptom_duration: { type: "STRING" },
          history_of_present_illness: { type: "STRING" },
          past_history: { type: "ARRAY", items: { type: "STRING" } },
          medications: { type: "ARRAY", items: { type: "STRING" } },
          allergies: { type: "ARRAY", items: { type: "STRING" } },
          missing_info: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: [
          "chief_complaint",
          "symptom_duration",
          "history_of_present_illness",
          "past_history",
          "medications",
          "allergies",
          "missing_info",
        ],
      },
    });

    if (geminiResult) {
      const parsed = ClinicalHistoryOutputSchema.safeParse(geminiResult);
      if (parsed.success) {
        return parsed.data;
      }
    }

    // Deterministic Mock fallback
    const mockOutput = MockLLM.mockClinicalHistory(history);
    return ClinicalHistoryOutputSchema.parse(mockOutput);
  }
}
