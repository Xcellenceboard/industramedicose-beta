import { GoogleGenAI } from "@google/genai";

let genAIClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (typeof window !== "undefined") {
    throw new Error("getGeminiClient can only be called from server-side code (API routes or Server Actions).");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables.");
  }

  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }

  return genAIClient;
}

export const CLINICAL_DEFAULT_MODEL = "gemini-2.5-flash";
