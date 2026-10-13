export interface ExtractedMedication {
  name: string;
  dose: string | null;
  frequency: string | null;
  duration: string | null;
  confidence: number;
}

export interface ExtractedDiagnosis {
  condition: string;
  confidence: number;
}

export interface ExtractedLabValue {
  test: string;
  value: string;
  unit: string | null;
  reference_range: string | null;
  flag: "normal" | "high" | "low";
  confidence: number;
}

export interface ExtractedAllergy {
  allergen: string;
  confidence: number;
}

export interface ExtractedDocumentData {
  document_type: "prescription" | "lab_report" | "discharge_summary" | "other";
  date?: string | null;
  doctor_hospital?: string | null;
  medications: ExtractedMedication[];
  diagnoses_mentioned: ExtractedDiagnosis[];
  lab_values: ExtractedLabValue[];
  allergies_mentioned: ExtractedAllergy[];
  ocr_text?: string;
  confidence: number;
}

export interface DocumentItem {
  id: string;
  consultation_id?: string | null;
  patient_id?: string;
  file_name: string;
  mime_type: string;
  size_bytes?: number;
  status: "uploaded" | "processing" | "extracted" | "failed";
  confidence?: number | null;
  ocr_text?: string | null;
  extracted?: ExtractedDocumentData | null;
  public_url?: string;
  created_at?: string;
  conflicts?: Array<{
    type: "allergy" | "medication";
    title: string;
    description: string;
    severity: "critical" | "warning";
  }>;
}

export type SampleDocType = "prescription" | "cbc" | "discharge" | "hba1c";

export const SAMPLE_DOCUMENTS: Array<{
  id: SampleDocType;
  title: string;
  subtitle: string;
  badge: string;
  url: string;
  description: string;
}> = [
  {
    id: "prescription",
    title: "AIIMS OPD Prescription",
    subtitle: "Dr. Meera Rathore • 12 March 2026",
    badge: "Prescription",
    url: "/samples/sample-prescription.jpg",
    description: "Tab Telmisartan 40mg, Tab Metformin 500mg, scribbled elixir, Penicillin allergy.",
  },
  {
    id: "cbc",
    title: "Complete Blood Count (CBC)",
    subtitle: "AIIMS Diagnostic Lab • 10 March 2026",
    badge: "Lab Report",
    url: "/samples/sample-cbc-report.jpg",
    description: "Hemoglobin 10.2 (LOW), Total WBC 12,400 (HIGH), Platelets 220,000.",
  },
  {
    id: "discharge",
    title: "Hospital Discharge Summary",
    subtitle: "Jodhpur Heart • 04 Feb 2026",
    badge: "Discharge Note",
    url: "/samples/sample-discharge-summary.jpg",
    description: "Bronchial Asthma, Inhaler Budesonide + Formoterol, Tab Montelukast.",
  },
  {
    id: "hba1c",
    title: "Diabetes HbA1c Report",
    subtitle: "Dr. Lal PathLabs • 08 March 2026",
    badge: "Biochemistry",
    url: "/samples/sample-hba1c-report.jpg",
    description: "HbA1c 8.4% (HIGH), Fasting Glucose 158 mg/dL (HIGH).",
  },
];
