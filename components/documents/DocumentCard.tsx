"use client";

import React, { useState } from "react";
import {
  FileText,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Calendar,
  Building,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DocumentItem } from "./types";

interface DocumentCardProps {
  document: DocumentItem;
  onOpenSideBySide?: (doc: DocumentItem) => void;
}

export function DocumentCard({ document: doc, onOpenSideBySide }: DocumentCardProps) {
  const [showRawOcr, setShowRawOcr] = useState(false);

  const extracted = doc.extracted;
  const isExtracted = doc.status === "extracted" && !!extracted;
  const isProcessing = doc.status === "processing";

  // Confidence badge color helper (green/amber/red)
  const renderConfidenceBadge = (confidenceScore: number) => {
    const percent = Math.round(confidenceScore * 100);
    if (confidenceScore >= 0.85) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {percent}% High
        </span>
      );
    } else if (confidenceScore >= 0.7) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          {percent}% Medium
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-coral-50 dark:bg-coral-950/60 text-coral-700 dark:text-coral-400 border border-coral-300 dark:border-coral-800 animate-pulse">
          <AlertTriangle className="w-3 h-3 text-coral-600" />
          {percent}% Low Confidence
        </span>
      );
    }
  };

  // Status Chip helper
  const renderStatusChip = () => {
    switch (doc.status) {
      case "extracted":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-navy-800 text-teal-700 dark:text-teal-300 border border-teal-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            Extracted
          </span>
        );
      case "processing":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-navy-800 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 animate-pulse">
            <Clock className="w-3 h-3 animate-spin" />
            Processing OCR...
          </span>
        );
      case "failed":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-coral-50 dark:bg-navy-800 text-coral-700 dark:text-coral-400 border border-coral-500/30">
            OCR Failed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-navy-800 text-muted-foreground border border-slate-200 dark:border-navy-700">
            Uploaded
          </span>
        );
    }
  };

  return (
    <Card className="p-5 space-y-4 border border-slate-200 dark:border-navy-700 shadow-sm hover:shadow-md transition-shadow">
      {/* 1. Header: Document Title, Type, Status, & Confidence */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-navy-800 pb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-navy dark:text-white">
                {doc.file_name}
              </h4>
              {extracted?.document_type && (
                <Badge variant="verified" size="sm">
                  {extracted.document_type.replace("_", " ").toUpperCase()}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
              {extracted?.date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {extracted.date}
                </span>
              )}
              {extracted?.doctor_hospital && (
                <span className="flex items-center gap-1 truncate max-w-[220px]">
                  <Building className="w-3 h-3 shrink-0" />
                  <span className="truncate">{extracted.doctor_hospital}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Status & Action */}
        <div className="flex items-center gap-2">
          {renderStatusChip()}
          {doc.confidence !== undefined && doc.confidence !== null && (
            renderConfidenceBadge(doc.confidence)
          )}
          {onOpenSideBySide && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenSideBySide(doc)}
              leftIcon={<Maximize2 className="w-3.5 h-3.5" />}
              className="text-xs font-semibold shrink-0"
            >
              Side-by-Side Review
            </Button>
          )}
        </div>
      </div>

      {/* 2. Conflict Alerts Banner (Requirement 5) */}
      {doc.conflicts && doc.conflicts.length > 0 && (
        <div className="space-y-2">
          {doc.conflicts.map((conf, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-coral-500/10 border border-coral-500/30 text-coral-800 dark:text-coral-200 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-coral-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-coral-900 dark:text-coral-100">
                  {conf.title}
                </div>
                <div className="text-[11px] mt-0.5 text-coral-700 dark:text-coral-300">
                  {conf.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Extracted Key Clinical Fields as a Clean Table */}
      {isExtracted ? (
        <div className="space-y-3.5">
          {/* Medications Table */}
          {extracted.medications && extracted.medications.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-navy dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Extracted Medications ({extracted.medications.length})</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-navy-700 text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-navy-800/80 text-muted-foreground font-semibold border-b border-slate-200 dark:border-navy-700">
                    <tr>
                      <th className="py-2 px-3">Medication</th>
                      <th className="py-2 px-3">Dose</th>
                      <th className="py-2 px-3">Frequency</th>
                      <th className="py-2 px-3">Duration</th>
                      <th className="py-2 px-3 text-right">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                    {extracted.medications.map((m, i) => (
                      <tr
                        key={i}
                        className={`hover:bg-slate-50 dark:hover:bg-navy-800/40 transition-colors ${
                          m.confidence < 0.7 ? "bg-amber-50/40 dark:bg-amber-950/20" : ""
                        }`}
                      >
                        <td className="py-2 px-3 font-semibold text-foreground">
                          {m.name}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {m.dose || "—"}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {m.frequency || "—"}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {m.duration || "—"}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {renderConfidenceBadge(m.confidence)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Laboratory Biomarkers Table */}
          {extracted.lab_values && extracted.lab_values.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-navy dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Extracted Lab Values ({extracted.lab_values.length})</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-navy-700 text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-navy-800/80 text-muted-foreground font-semibold border-b border-slate-200 dark:border-navy-700">
                    <tr>
                      <th className="py-2 px-3">Test Name</th>
                      <th className="py-2 px-3">Value</th>
                      <th className="py-2 px-3">Unit</th>
                      <th className="py-2 px-3">Biological Ref Interval</th>
                      <th className="py-2 px-3">Status Flag</th>
                      <th className="py-2 px-3 text-right">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                    {extracted.lab_values.map((l, i) => (
                      <tr
                        key={i}
                        className={`hover:bg-slate-50 dark:hover:bg-navy-800/40 transition-colors ${
                          l.flag !== "normal" ? "bg-coral-50/30 dark:bg-coral-950/20" : ""
                        }`}
                      >
                        <td className="py-2 px-3 font-semibold text-foreground">
                          {l.test}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-foreground">
                          {l.value}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {l.unit || "—"}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {l.reference_range || "—"}
                        </td>
                        <td className="py-2 px-3">
                          {l.flag === "high" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-coral-100 dark:bg-coral-950 text-coral-800 dark:text-coral-300">
                              HIGH
                            </span>
                          ) : l.flag === "low" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              LOW
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                              NORMAL
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {renderConfidenceBadge(l.confidence)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Diagnoses & Allergies Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Diagnoses */}
            {extracted.diagnoses_mentioned && extracted.diagnoses_mentioned.length > 0 && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200 dark:border-navy-700 space-y-1.5">
                <div className="text-[11px] font-bold text-muted-foreground uppercase">
                  Diagnoses Mentioned
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {extracted.diagnoses_mentioned.map((d, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xs"
                    >
                      <span>{d.condition}</span>
                      {renderConfidenceBadge(d.confidence)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Allergies */}
            {extracted.allergies_mentioned && extracted.allergies_mentioned.length > 0 && (
              <div className="p-3 rounded-2xl bg-coral-50/50 dark:bg-coral-950/20 border border-coral-200 dark:border-coral-800 space-y-1.5">
                <div className="text-[11px] font-bold text-coral-800 dark:text-coral-300 uppercase">
                  Allergies Mentioned
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {extracted.allergies_mentioned.map((a, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-white dark:bg-navy-900 text-coral-700 dark:text-coral-300 border border-coral-300 dark:border-coral-800"
                    >
                      <AlertTriangle className="w-3 h-3 text-coral-600" />
                      <span>{a.allergen}</span>
                      {renderConfidenceBadge(a.confidence)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : isProcessing ? (
        <div className="py-8 text-center space-y-2">
          <Clock className="w-8 h-8 text-teal-500 animate-spin mx-auto" />
          <div className="text-xs font-bold text-navy dark:text-white">
            Multimodal Gemini OCR processing document...
          </div>
          <div className="text-[11px] text-muted-foreground">
            Transcribing handwriting, normalizing doses, and extracting biomarkers.
          </div>
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-muted-foreground">
          Document is uploaded. Processing ready to start.
        </div>
      )}

      {/* 4. Verbatim OCR Transcript Accordion */}
      {extracted?.ocr_text && (
        <div className="pt-2 border-t border-slate-100 dark:border-navy-800">
          <button
            type="button"
            onClick={() => setShowRawOcr(!showRawOcr)}
            className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground py-1"
          >
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Verbatim OCR Transcript</span>
            </span>
            {showRawOcr ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showRawOcr && (
            <pre className="mt-2 p-3 rounded-xl bg-slate-100 dark:bg-navy-900 text-[11px] font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto border border-slate-200 dark:border-navy-700">
              {extracted.ocr_text}
            </pre>
          )}
        </div>
      )}
    </Card>
  );
}
