import { GoogleGenAI } from "@google/genai";
import { SHARED_GUARDRAIL_SYSTEM_PROMPT, sanitizeAgentOutput } from "./guardrails";

let clientInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your-gemini-api-key") {
    return null;
  }
  if (!clientInstance) {
    clientInstance = new GoogleGenAI({ apiKey: apiKey.trim() });
  }
  return clientInstance;
}

export interface CallGeminiParams {
  systemPrompt: string;
  userPrompt: string;
  responseSchema?: Record<string, unknown>;
  temperature?: number;
}

/**
 * Call Gemini 2.5 Flash with structured JSON output and strict guardrails.
 * Returns the parsed JSON object, or null if API key is not configured.
 */
export async function callGeminiStructured<T = unknown>({
  systemPrompt,
  userPrompt,
  responseSchema,
  temperature = 0.2,
}: CallGeminiParams): Promise<T | null> {
  const ai = getGeminiClient();
  if (!ai) {
    return null;
  }

  const fullSystemInstruction = `${SHARED_GUARDRAIL_SYSTEM_PROMPT}\n\n${systemPrompt}`;

  try {
    const config: Record<string, unknown> = {
      systemInstruction: fullSystemInstruction,
      responseMimeType: "application/json",
      temperature,
    };

    if (responseSchema) {
      config.responseSchema = responseSchema;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: config as any,
    });

    const rawText = response.text || "{}";

    // Strip markdown code fences if present
    const cleanedText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // Run guardrails sanitization filter
    const { sanitizedText } = sanitizeAgentOutput(cleanedText);

    const parsed = JSON.parse(sanitizedText) as T;
    return parsed;
  } catch (error) {
    console.warn("Gemini API call failed or timed out, falling back to mock LLM:", error);
    return null;
  }
}

export interface MultimodalInlinePart {
  inlineData: {
    mimeType: string;
    data: string; // base64 encoded
  };
}

export interface CallGeminiMultimodalParams {
  systemPrompt: string;
  userPrompt: string;
  mediaParts: MultimodalInlinePart[];
  responseSchema?: Record<string, unknown>;
  temperature?: number;
}

/**
 * Call Gemini 2.5 Flash with multimodal inputs (Image / PDF) and structured JSON output.
 */
export async function callGeminiMultimodalStructured<T = unknown>({
  systemPrompt,
  userPrompt,
  mediaParts,
  responseSchema,
  temperature = 0.1,
}: CallGeminiMultimodalParams): Promise<T | null> {
  const ai = getGeminiClient();
  if (!ai) {
    return null;
  }

  const fullSystemInstruction = `${SHARED_GUARDRAIL_SYSTEM_PROMPT}\n\n${systemPrompt}`;

  try {
    const config: Record<string, unknown> = {
      systemInstruction: fullSystemInstruction,
      responseMimeType: "application/json",
      temperature,
    };

    if (responseSchema) {
      config.responseSchema = responseSchema;
    }

    const contents: unknown[] = [
      ...mediaParts,
      userPrompt,
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents as any,
      config: config as any,
    });

    const rawText = response.text || "{}";

    const cleanedText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const { sanitizedText } = sanitizeAgentOutput(cleanedText);
    const parsed = JSON.parse(sanitizedText) as T;
    return parsed;
  } catch (error) {
    console.warn("Gemini Multimodal API call failed, falling back to deterministic extractor:", error);
    return null;
  }
}
