"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  Camera,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  FileCheck,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DocumentItem, SAMPLE_DOCUMENTS, SampleDocType } from "./types";

interface DocumentUploaderProps {
  consultationId?: string;
  patientId?: string;
  consentGiven?: boolean;
  onDocumentUploaded?: (doc: DocumentItem) => void;
  onProcessStarted?: (docId: string) => void;
  onDocumentProcessed?: (doc: DocumentItem) => void;
  autoProcess?: boolean;
}

interface QueuedFile {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: "pending" | "uploading" | "uploaded" | "error";
  errorMessage?: string;
  documentId?: string;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;

export function DocumentUploader({
  consultationId = "c-demo-default",
  patientId = "demo-patient-001",
  consentGiven = true,
  onDocumentUploaded,
  onProcessStarted,
  onDocumentProcessed,
  autoProcess = true,
}: DocumentUploaderProps) {
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isProcessingSample, setIsProcessingSample] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Trigger processing endpoint
  const triggerDocumentProcessing = useCallback(
    async (docId: string, fileName?: string) => {
      onProcessStarted?.(docId);
      try {
        const res = await fetch("/api/documents/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            document_id: docId,
            consultation_id: consultationId,
          }),
        });

        const data = await res.json();
        if (data.success && data.extracted) {
          const processedItem: DocumentItem = {
            id: docId,
            consultation_id: consultationId,
            file_name: fileName || "medical-doc.jpg",
            mime_type: "image/jpeg",
            status: "extracted",
            confidence: data.overall_confidence,
            ocr_text: data.ocr_text,
            extracted: data.extracted,
            conflicts: data.conflicts,
          };
          onDocumentProcessed?.(processedItem);
        }
      } catch (e) {
        console.error("Document processing error:", e);
      }
    },
    [consultationId, onProcessStarted, onDocumentProcessed]
  );

  // Upload single file to Supabase backend
  const uploadSingleFile = useCallback(
    async (queued: QueuedFile) => {
      setQueuedFiles((prev) =>
        prev.map((f) => (f.id === queued.id ? { ...f, status: "uploading", progress: 20 } : f))
      );

      try {
        const formData = new FormData();
        formData.append("file", queued.file);
        formData.append("consultation_id", consultationId);
        formData.append("patient_id", patientId);
        formData.append("consent_given", consentGiven ? "true" : "false");

        // Progress animation simulation while fetch completes
        const progressTimer = setInterval(() => {
          setQueuedFiles((prev) =>
            prev.map((f) =>
              f.id === queued.id && f.status === "uploading" && f.progress < 85
                ? { ...f, progress: f.progress + 15 }
                : f
            )
          );
        }, 150);

        const res = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressTimer);

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to upload document");
        }

        const docItem: DocumentItem = {
          id: data.document.id,
          consultation_id: consultationId,
          patient_id: patientId,
          file_name: data.document.file_name,
          mime_type: data.document.mime_type,
          size_bytes: data.document.size_bytes,
          status: "uploaded",
          public_url: data.document.public_url || queued.previewUrl,
        };

        setQueuedFiles((prev) =>
          prev.map((f) =>
            f.id === queued.id
              ? { ...f, status: "uploaded", progress: 100, documentId: docItem.id }
              : f
          )
        );

        onDocumentUploaded?.(docItem);

        // Auto-trigger Document Intelligence OCR & Extraction if enabled
        if (autoProcess) {
          triggerDocumentProcessing(docItem.id, queued.file.name);
        }
      } catch (err: unknown) {
        const errorMsg = (err as Error)?.message || "Upload failed";
        setQueuedFiles((prev) =>
          prev.map((f) =>
            f.id === queued.id ? { ...f, status: "error", errorMessage: errorMsg } : f
          )
        );
      }
    },
    [
      consultationId,
      patientId,
      consentGiven,
      onDocumentUploaded,
      autoProcess,
      triggerDocumentProcessing,
    ]
  );

  // Validate and enqueue files
  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      setGlobalError(null);

      if (!consentGiven) {
        setGlobalError("Consent required: Patient consent is necessary before uploading clinical documents.");
        return;
      }

      const fileArray = Array.from(files);

      if (queuedFiles.length + fileArray.length > MAX_FILES) {
        setGlobalError(`You can upload a maximum of ${MAX_FILES} documents at a time.`);
        return;
      }

      const validFiles: QueuedFile[] = [];

      for (const file of fileArray) {
        // Size validation (Max 10MB)
        if (file.size > MAX_FILE_SIZE_BYTES) {
          setGlobalError(`File "${file.name}" exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
          continue;
        }

        // Format validation (JPG, PNG, WEBP, PDF)
        const isImage = file.type.startsWith("image/");
        const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");

        if (!isImage && !isPdf) {
          setGlobalError(`"${file.name}" is not supported. Please upload JPG, PNG, WEBP, or PDF.`);
          continue;
        }

        const previewUrl = isImage ? URL.createObjectURL(file) : "/images/pdf-icon.png";

        validFiles.push({
          id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          previewUrl,
          progress: 0,
          status: "pending",
        });
      }

      if (validFiles.length > 0) {
        setQueuedFiles((prev) => [...prev, ...validFiles]);
        // Automatically start uploading
        validFiles.forEach((qf) => uploadSingleFile(qf));
      }
    },
    [queuedFiles.length, consentGiven, uploadSingleFile]
  );

  // Sample report trigger (prescription, cbc, discharge, hba1c)
  const handleUseSample = async (sampleType: SampleDocType) => {
    setGlobalError(null);
    setIsProcessingSample(sampleType);

    try {
      const sample = SAMPLE_DOCUMENTS.find((s) => s.id === sampleType);
      const mockDocId = `doc-sample-${sampleType}-${Date.now()}`;

      const initialDoc: DocumentItem = {
        id: mockDocId,
        consultation_id: consultationId,
        patient_id: patientId,
        file_name: `${sample?.title || sampleType}.jpg`,
        mime_type: "image/jpeg",
        status: "processing",
        public_url: sample?.url,
      };

      onDocumentUploaded?.(initialDoc);
      onProcessStarted?.(mockDocId);

      const res = await fetch("/api/documents/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: mockDocId,
          consultation_id: consultationId,
          sample_type: sampleType,
        }),
      });

      const data = await res.json();

      if (data.success && data.extracted) {
        const completedDoc: DocumentItem = {
          id: mockDocId,
          consultation_id: consultationId,
          patient_id: patientId,
          file_name: `${sample?.title || sampleType}.jpg`,
          mime_type: "image/jpeg",
          status: "extracted",
          confidence: data.overall_confidence,
          ocr_text: data.ocr_text,
          extracted: data.extracted,
          public_url: sample?.url,
          conflicts: data.conflicts,
        };
        onDocumentProcessed?.(completedDoc);
      }
    } catch (err: unknown) {
      setGlobalError((err as Error)?.message || "Failed to process sample document.");
    } finally {
      setIsProcessingSample(null);
    }
  };

  const removeQueuedFile = (id: string) => {
    setQueuedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* 1. Drag and Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all ${
          isDragging
            ? "border-teal-500 bg-teal-50/50 dark:bg-navy-800/80 scale-[1.01]"
            : "border-slate-300 dark:border-navy-700 bg-slate-50/50 dark:bg-navy-900/40 hover:border-teal-400"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-sm">
            <Upload className="w-7 h-7" />
          </div>

          <div>
            <h4 className="text-base font-bold text-navy dark:text-white">
              Drop prescription or medical report here
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Supports JPG, PNG, WEBP, and PDF up to 10 MB (max 5 documents).
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              leftIcon={<FileText className="w-4 h-4" />}
            >
              Browse Files
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => cameraInputRef.current?.click()}
              leftIcon={<Camera className="w-4 h-4" />}
            >
              Take Photo
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Encrypted & stored in private clinical bucket</span>
          </div>
        </div>
      </div>

      {/* Global Error Alert */}
      {globalError && (
        <div className="p-3 rounded-2xl bg-coral-500/10 border border-coral-500/30 text-coral-700 dark:text-coral-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      {/* 2. Uploaded / Queued Thumbnails & Progress Bars */}
      {queuedFiles.length > 0 && (
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-navy dark:text-white flex items-center justify-between">
            <span>Uploading Documents ({queuedFiles.length}/{MAX_FILES})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {queuedFiles.map((qf) => (
              <div
                key={qf.id}
                className="p-3 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 flex items-center gap-3 relative shadow-2xs"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-navy-900 border overflow-hidden shrink-0 flex items-center justify-center">
                  {qf.file.type.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qf.previewUrl}
                      alt={qf.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="w-6 h-6 text-teal-600" />
                  )}
                </div>

                {/* Details & Progress */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="text-xs font-semibold text-foreground truncate">
                    {qf.file.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {(qf.file.size / (1024 * 1024)).toFixed(2)} MB &bull;{" "}
                    {qf.status === "uploading"
                      ? "Uploading..."
                      : qf.status === "uploaded"
                      ? "Uploaded to bucket"
                      : qf.status === "error"
                      ? "Upload Error"
                      : "Pending"}
                  </div>

                  {/* Progress bar */}
                  {qf.status === "uploading" && (
                    <div className="w-full bg-slate-100 dark:bg-navy-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-500 h-full rounded-full transition-all duration-200"
                        style={{ width: `${qf.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Status Icon / Delete */}
                <div className="shrink-0">
                  {qf.status === "uploaded" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : qf.status === "uploading" ? (
                    <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeQueuedFile(qf.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. "Use sample report" Demo Buttons (Requirement 7) */}
      <div className="pt-2 border-t border-slate-200 dark:border-navy-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-navy dark:text-white">
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            <span>Try with Instant Synthetic Sample Reports:</span>
          </div>
          <Badge variant="verified" size="sm">
            Demo Ready
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLE_DOCUMENTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              disabled={isProcessingSample !== null}
              onClick={() => handleUseSample(sample.id)}
              className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                isProcessingSample === sample.id
                  ? "bg-teal-500/10 border-teal-500 scale-[0.98]"
                  : "bg-white dark:bg-navy-800/80 border-slate-200 dark:border-navy-700 hover:border-teal-500 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300">
                  {sample.badge}
                </span>
                {isProcessingSample === sample.id ? (
                  <Loader2 className="w-3 h-3 text-teal-500 animate-spin" />
                ) : (
                  <FileCheck className="w-3 h-3 text-muted-foreground group-hover:text-teal-500 transition-colors" />
                )}
              </div>
              <div className="text-xs font-bold text-foreground truncate">
                {sample.title}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {sample.subtitle}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
