import { z } from "zod";

// Zod schemas for clinical validation
export const VitalsSchema = z.object({
  bloodPressure: z.string().optional(),
  heartRate: z.number().min(30).max(250).optional(),
  temperature: z.number().min(90).max(110).optional(),
  spo2: z.number().min(50).max(100).optional(),
  respiratoryRate: z.number().min(8).max(60).optional(),
});

export type Vitals = z.infer<typeof VitalsSchema>;

export const PatientSchema = z.object({
  id: z.string().uuid().optional(),
  uhid: z.string(),
  fullName: z.string().min(2),
  age: z.number().positive(),
  gender: z.enum(["Male", "Female", "Other"]),
  contactNumber: z.string().optional(),
  allergies: z.array(z.string()).default([]),
  chronicConditions: z.array(z.string()).default([]),
  createdAt: z.string().optional(),
});

export type Patient = z.infer<typeof PatientSchema>;

export const MedicationItemSchema = z.object({
  name: z.string().min(1),
  dosage: z.string(),
  frequency: z.string(),
  duration: z.string(),
  instructions: z.string().optional(),
  verified: z.boolean().default(false),
  aiGenerated: z.boolean().default(true),
  hasInteractionWarning: z.boolean().default(false),
  warningDetails: z.string().optional(),
});

export type MedicationItem = z.infer<typeof MedicationItemSchema>;

export const SoapNoteSchema = z.object({
  subjective: z.string(),
  objective: z.string(),
  assessment: z.string(),
  plan: z.string(),
  differentialDiagnosis: z.array(z.string()).default([]),
  icd10Codes: z.array(z.string()).default([]),
});

export type SoapNote = z.infer<typeof SoapNoteSchema>;

export type ClinicalAlertLevel = "normal" | "warning" | "urgent";

export interface ClinicalAlert {
  id: string;
  level: ClinicalAlertLevel;
  title: string;
  description: string;
  sourceAgent: "ScribeAgent" | "PharmacistAgent" | "ContraindicationAgent" | "TriageAgent";
  timestamp: string;
}

export type ConsultationStatus = "in_queue" | "recording" | "analyzing" | "review_pending" | "verified" | "completed";

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  status: ConsultationStatus;
  transcript?: string;
  soapNote?: SoapNote;
  medications: MedicationItem[];
  alerts: ClinicalAlert[];
  durationSeconds: number;
  aiProcessingTimeMs: number;
  createdAt: string;
}
