"use client";

import React, { useState } from "react";
import { X, Upload, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { DocumentSideBySideModal } from "@/components/documents/DocumentSideBySideModal";
import { DocumentItem } from "@/components/documents/types";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (docSummary: string) => void;
  language: "en" | "hi" | "hinglish";
  consultationId?: string;
  patientId?: string;
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
  language,
  consultationId = "c-demo-default",
  patientId = "demo-patient-001",
}: DocumentUploadModalProps) {
  const [processedDocs, setProcessedDocs] = useState<DocumentItem[]>([]);
  const [activeSideBySideDoc, setActiveSideBySideDoc] = useState<DocumentItem | null>(null);
  const isHi = language === "hi";

  if (!isOpen) return null;

  const handleDocumentProcessed = (doc: DocumentItem) => {
    setProcessedDocs((prev) => [doc, ...prev.filter((d) => d.id !== doc.id)]);
  };

  const handleFinishAndLink = () => {
    if (processedDocs.length === 0) {
      onClose();
      return;
    }

    const latest = processedDocs[0];
    const docName = latest.extracted?.document_type || "prescription";
    const medCount = latest.extracted?.medications.length || 0;
    const labCount = latest.extracted?.lab_values.length || 0;

    let summaryNote = "";
    if (isHi) {
      summaryNote = `पुरानी मेडिकल रिपोर्ट (${docName} - ${latest.file_name}) सफलतापूर्वक अपलोड एवं स्कैन की गई। ${medCount > 0 ? `${medCount} दवाएं पहचानी गईं।` : ""} ${labCount > 0 ? `${labCount} बायोमार्कर जांचे गए।` : ""}`;
    } else {
      summaryNote = `Attached ${docName.replace("_", " ")} (${latest.file_name}) scanned via Gemini Vision OCR: ${medCount > 0 ? `${medCount} active medications detected` : ""} ${labCount > 0 ? `${labCount} lab parameters analyzed` : ""}.`;
    }

    onUploadSuccess(summaryNote.trim());
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/75 backdrop-blur-md overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
      >
        <div className="relative w-full max-w-2xl bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-teal-500/30 space-y-5 animate-in fade-in zoom-in-95 duration-200 my-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 id="upload-modal-title" className="text-base sm:text-lg font-bold text-navy dark:text-white">
                    {isHi ? "पुरानी पर्ची या जांच रिपोर्ट अपलोड करें" : "Medical Document Intelligence"}
                  </h3>
                  <Badge variant="verified" size="sm">
                    Vision OCR
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isHi
                    ? "डॉक्टर द्वारा दी गई पुरानी पर्ची या लैब रिपोर्ट जोड़ें। एआई तुरंत समझ लेगा।"
                    : "Multimodal Gemini OCR scans prescriptions, discharge summaries, and blood tests."}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Document Uploader Component */}
          <DocumentUploader
            consultationId={consultationId}
            patientId={patientId}
            consentGiven={true}
            onDocumentProcessed={handleDocumentProcessed}
          />

          {/* Extracted Document Cards */}
          {processedDocs.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-navy-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Processed Documents ({processedDocs.length})</span>
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Click Side-by-Side Review to inspect
                </span>
              </div>

              <div className="space-y-3">
                {processedDocs.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onOpenSideBySide={(d) => setActiveSideBySideDoc(d)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-navy-800">
            <span className="text-[11px] text-muted-foreground">
              {processedDocs.length > 0
                ? isHi
                  ? "दस्तावेज़ सफलतापूर्वक प्रोसेस किए गए"
                  : "Clinical intelligence extracted & verified"
                : ""}
            </span>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                {isHi ? "रद्द करें" : "Cancel"}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleFinishAndLink}
                className="shadow-teal-glow"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                {isHi ? "पर्चे को बातचीत में जोड़ें" : "Link Document & Continue"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Review Modal */}
      {activeSideBySideDoc && (
        <DocumentSideBySideModal
          document={activeSideBySideDoc}
          isOpen={true}
          onClose={() => setActiveSideBySideDoc(null)}
        />
      )}
    </>
  );
}
