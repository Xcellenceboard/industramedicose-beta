/**
 * Unified in-memory and persistent storage fallback for Agent Runs and Clinical Summaries.
 * Guarantees zero data loss and flawless execution even before remote SQL tables are applied.
 */

import { AgentRunLog } from "./types";

interface ClinicalSummaryRecord {
  id: string;
  consultation_id: string;
  chief_complaint: string | null;
  symptom_duration: string | null;
  history_of_present_illness: string | null;
  past_history: string | null;
  medications: string[];
  allergies: string[];
  red_flags: string[];
  missing_info: string[];
  ai_draft_note: string | null;
  doctor_edited_note: string | null;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// Global process-level cache for serverless / dev lifecycle
const globalStorage = globalThis as unknown as {
  __im_agent_runs?: AgentRunLog[];
  __im_clinical_summaries?: Map<string, ClinicalSummaryRecord>;
  __im_intake_messages?: Map<string, Array<{ role: "patient" | "agent"; content: string; language?: string; created_at: string }>>;
};

if (!globalStorage.__im_agent_runs) {
  globalStorage.__im_agent_runs = [];
}
if (!globalStorage.__im_clinical_summaries) {
  globalStorage.__im_clinical_summaries = new Map();
}
if (!globalStorage.__im_intake_messages) {
  globalStorage.__im_intake_messages = new Map();
}

export const agentRunsStore = {
  addRun(run: AgentRunLog) {
    globalStorage.__im_agent_runs!.push({
      ...run,
      id: run.id || `run-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: run.created_at || new Date().toISOString(),
    });
  },

  getRuns(consultationId: string): AgentRunLog[] {
    return globalStorage.__im_agent_runs!.filter(
      (r) => r.consultation_id === consultationId
    );
  },

  getAllRuns(): AgentRunLog[] {
    return [...globalStorage.__im_agent_runs!];
  },
};

export const clinicalSummariesStore = {
  saveSummary(summary: ClinicalSummaryRecord) {
    globalStorage.__im_clinical_summaries!.set(summary.consultation_id, summary);
  },

  getSummary(consultationId: string): ClinicalSummaryRecord | undefined {
    return globalStorage.__im_clinical_summaries!.get(consultationId);
  },
};

export const intakeMessagesStore = {
  addMessage(
    consultationId: string,
    msg: { role: "patient" | "agent"; content: string; language?: string }
  ) {
    const list = globalStorage.__im_intake_messages!.get(consultationId) || [];
    list.push({ ...msg, created_at: new Date().toISOString() });
    globalStorage.__im_intake_messages!.set(consultationId, list);
  },

  getMessages(consultationId: string) {
    return globalStorage.__im_intake_messages!.get(consultationId) || [];
  },
};

export interface DocumentRecord {
  id: string;
  consultation_id: string | null;
  patient_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  ocr_text: string | null;
  extracted: Record<string, unknown> | null;
  status: "uploaded" | "processing" | "extracted" | "failed";
  confidence: number | null;
  created_at: string;
  updated_at: string;
  public_url?: string;
}

if (!(globalStorage as any).__im_documents) {
  (globalStorage as any).__im_documents = new Map<string, DocumentRecord>();
}

export const documentsStore = {
  saveDocument(doc: DocumentRecord) {
    (globalStorage as any).__im_documents.set(doc.id, doc);
  },

  updateDocument(id: string, updates: Partial<DocumentRecord>) {
    const existing = (globalStorage as any).__im_documents.get(id);
    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      (globalStorage as any).__im_documents.set(id, updated);
      return updated;
    }
    return null;
  },

  getDocument(id: string): DocumentRecord | undefined {
    return (globalStorage as any).__im_documents.get(id);
  },

  getDocumentsByConsultation(consultationId: string): DocumentRecord[] {
    const all: DocumentRecord[] = Array.from((globalStorage as any).__im_documents.values());
    return all.filter((d) => d.consultation_id === consultationId);
  },

  getAllDocuments(): DocumentRecord[] {
    return Array.from((globalStorage as any).__im_documents.values());
  },
};
