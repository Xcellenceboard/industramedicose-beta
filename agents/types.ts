import { z } from "zod";

export interface AgentContext {
  consultationId: string;
  patientId?: string;
  doctorId?: string;
  preferredLanguage?: "en" | "hi";
  messageHistory?: Array<{ role: "patient" | "agent"; content: string; language?: string }>;
  metadata?: Record<string, unknown>;
}

export interface Agent<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  run: (input: TInput, ctx: AgentContext) => Promise<TOutput>;
}

export interface AgentRunLog {
  id?: string;
  consultation_id: string;
  agent_name: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  latency_ms: number;
  status: "success" | "error" | "retry";
  error?: string | null;
  created_at?: string;
}

// -------------------------------------------------------------
// Core Schemas for Agent Outputs
// -------------------------------------------------------------

export const PatientInteractionOutputSchema = z.object({
  next_question: z.string().min(1, "Question cannot be empty"),
  question_language: z.enum(["en", "hi", "hinglish"]),
  covered_aspects: z.array(z.string()),
  missing_aspects: z.array(z.string()),
  question_number: z.number().int().min(1),
  is_intake_complete: z.boolean(),
  reason_for_completion: z.string().optional(),
});
export type PatientInteractionOutput = z.infer<typeof PatientInteractionOutputSchema>;

export const ClinicalHistoryOutputSchema = z.object({
  chief_complaint: z.string().min(1),
  symptom_duration: z.string().min(1),
  history_of_present_illness: z.string().min(1),
  past_history: z.array(z.string()),
  medications: z.array(z.string()),
  allergies: z.array(z.string()),
  missing_info: z.array(z.string()),
});
export type ClinicalHistoryOutput = z.infer<typeof ClinicalHistoryOutputSchema>;

export const MedicationItemSchema = z.object({
  name: z.string(),
  dose: z.string().nullable().optional(),
  frequency: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1).default(0.95),
});
export type MedicationItem = z.infer<typeof MedicationItemSchema>;

export const DiagnosisItemSchema = z.object({
  condition: z.string(),
  confidence: z.number().min(0).max(1).default(0.95),
});
export type DiagnosisItem = z.infer<typeof DiagnosisItemSchema>;

export const LabValueItemSchema = z.object({
  test: z.string(),
  value: z.string(),
  unit: z.string().nullable().optional(),
  reference_range: z.string().nullable().optional(),
  flag: z.enum(["normal", "high", "low"]).default("normal"),
  confidence: z.number().min(0).max(1).default(0.95),
});
export type LabValueItem = z.infer<typeof LabValueItemSchema>;

export const AllergyItemSchema = z.object({
  allergen: z.string(),
  confidence: z.number().min(0).max(1).default(0.95),
});
export type AllergyItem = z.infer<typeof AllergyItemSchema>;

export const DocumentIntelligenceOutputSchema = z.object({
  document_type: z
    .enum(["prescription", "lab_report", "discharge_summary", "other"])
    .default("prescription"),
  date: z.string().nullable().optional(),
  doctor_hospital: z.string().nullable().optional(),
  medications: z.array(MedicationItemSchema).default([]),
  diagnoses_mentioned: z.array(DiagnosisItemSchema).default([]),
  lab_values: z.array(LabValueItemSchema).default([]),
  allergies_mentioned: z.array(AllergyItemSchema).default([]),
  ocr_text: z.string().optional().default(""),
  // Backward compatibility fields
  extracted_medications: z.array(z.string()).default([]),
  extracted_conditions: z.array(z.string()).default([]),
  abnormal_biomarkers: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
        flag: z.string(),
      })
    )
    .default([]),
  confidence: z.number().min(0).max(1).default(1.0),
  status: z.literal("ready").default("ready"),
});
export type DocumentIntelligenceOutput = z.infer<typeof DocumentIntelligenceOutputSchema>;

export const RedFlagDetailSchema = z.object({
  flag: z.string(),
  quote: z.string(), // Exact patient quote that triggered it
  severity: z.enum(["urgent", "attention", "routine"]).default("urgent"),
});
export type RedFlagDetail = z.infer<typeof RedFlagDetailSchema>;

export const ClinicalSafetyOutputSchema = z.object({
  urgency: z.enum(["routine", "attention", "urgent"]),
  red_flags: z.array(z.string()).default([]),
  red_flag_details: z.array(RedFlagDetailSchema).default([]),
  inconsistencies: z.array(z.string()).default([]),
  missing_critical_info: z.array(z.string()).default([]),
  suggested_clarifying_questions: z.array(z.string()).default([]),
  contraindications: z.array(z.string()).default([]),
  allergy_alerts: z.array(z.string()).default([]),
  deterministic_matched: z.boolean().default(false),
  status: z.literal("ready").default("ready"),
});
export type ClinicalSafetyOutput = z.infer<typeof ClinicalSafetyOutputSchema>;

export const ClinicalDocumentationOutputSchema = z.object({
  ai_draft_note: z.string().min(1),
  subjective: z.string().min(1),
  objective: z.string().min(1),
  assessment: z.string().min(1),
  plan: z.string().min(1),
  disclaimer: z.string().min(1),
});
export type ClinicalDocumentationOutput = z.infer<typeof ClinicalDocumentationOutputSchema>;

export const WorkflowCoordinationOutputSchema = z.object({
  consultation_id: z.string().min(1),
  new_status: z.literal("ready_for_review"),
  urgency: z.enum(["routine", "attention", "urgent"]),
  notified_doctor: z.boolean(),
  timestamp: z.string(),
});
export type WorkflowCoordinationOutput = z.infer<typeof WorkflowCoordinationOutputSchema>;
