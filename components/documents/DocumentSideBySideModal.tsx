"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  AlertTriangle,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Building,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DocumentItem } from "./types";

interface DocumentSideBySideModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentSideBySideModal({
  document: doc,
  isOpen,
  onClose,
}: DocumentSideBySideModalProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredField, setHoveredField] = useState<string | null>(null);

  if (!isOpen || !doc) return null;

  const extracted = doc.extracted;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy-950/80 backdrop-blur-md overflow-hidden animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="side-by-side-title"
    >
      <div className="relative w-full max-w-7xl h-[92vh] bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-teal-500/30 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-navy-700 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-navy-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="side-by-side-title" className="text-base font-bold text-navy dark:text-white">
                  {doc.file_name}
                </h3>
                {extracted?.document_type && (
                  <Badge variant="verified" size="sm">
                    {extracted.document_type.replace("_", " ").toUpperCase()}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                {extracted?.doctor_hospital && (
                  <span className="flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {extracted.doctor_hospital}
                  </span>
                )}
                {extracted?.date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {extracted.date}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="neutral" size="sm">
              Side-by-Side Clinical Audit
            </Badge>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conflict Alert Banner if present */}
        {doc.conflicts && doc.conflicts.length > 0 && (
          <div className="bg-coral-500/15 border-b border-coral-500/30 px-6 py-2.5 flex items-center gap-3 text-xs text-coral-800 dark:text-coral-200">
            <AlertCircle className="w-4 h-4 text-coral-600 shrink-0" />
            <div className="flex-1">
              <span className="font-bold">{doc.conflicts[0].title}:</span>{" "}
              {doc.conflicts[0].description}
            </div>
          </div>
        )}

        {/* Main Split Layout: Left Original Image | Right Extracted Clinical Items */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-navy-700 overflow-hidden">
          {/* ========================================================= */}
          {/* LEFT: ORIGINAL DOCUMENT VIEWER */}
          {/* ========================================================= */}
          <div className="relative flex flex-col h-full bg-slate-100 dark:bg-navy-950/60 overflow-hidden">
            {/* Image Controls toolbar */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-white/90 dark:bg-navy-900/90 backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-slate-200 dark:border-navy-700">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 text-foreground"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 text-foreground"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 text-foreground"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono text-muted-foreground px-1.5">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>

            {/* Document Image with highlight-on-hover overlays */}
            <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
              <div
                className="relative transition-transform duration-200 origin-center max-w-full shadow-2xl rounded-2xl overflow-hidden bg-white"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={doc.public_url || "/samples/sample-prescription.jpg"}
                  alt={doc.file_name}
                  className="max-h-[75vh] w-auto object-contain block select-none"
                />

                {/* Dynamic highlight-on-hover bounding boxes */}
                {hoveredField?.includes("med-0") && (
                  <div className="absolute top-[28%] left-[10%] w-[80%] h-[12%] bg-teal-500/25 border-2 border-teal-500 rounded-lg pointer-events-none transition-all animate-pulse" />
                )}
                {hoveredField?.includes("med-1") && (
                  <div className="absolute top-[42%] left-[10%] w-[80%] h-[12%] bg-teal-500/25 border-2 border-teal-500 rounded-lg pointer-events-none transition-all animate-pulse" />
                )}
                {hoveredField?.includes("allergy") && (
                  <div className="absolute top-[56%] left-[10%] w-[80%] h-[10%] bg-coral-500/30 border-2 border-coral-500 rounded-lg pointer-events-none transition-all animate-pulse" />
                )}
                {hoveredField?.includes("lab-0") && (
                  <div className="absolute top-[32%] left-[8%] w-[84%] h-[8%] bg-teal-500/25 border-2 border-teal-500 rounded-lg pointer-events-none transition-all animate-pulse" />
                )}
                {hoveredField?.includes("lab-1") && (
                  <div className="absolute top-[40%] left-[8%] w-[84%] h-[8%] bg-coral-500/30 border-2 border-coral-500 rounded-lg pointer-events-none transition-all animate-pulse" />
                )}
              </div>
            </div>

            <div className="p-3 bg-white/70 dark:bg-navy-900/70 border-t border-slate-200 dark:border-navy-700 text-center text-xs text-muted-foreground">
              Hover over extracted fields on the right to locate corresponding regions on the source document.
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: EXTRACTED STRUCTURED CLINICAL FIELDS */}
          {/* ========================================================= */}
          <div className="flex flex-col h-full overflow-y-auto p-6 space-y-5 bg-white dark:bg-navy-900">
            {/* Medications section */}
            {extracted?.medications && extracted.medications.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-navy dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Prescribed Medications</span>
                  </h4>
                  <Badge variant="verified" size="sm">
                    {extracted.medications.length} Identified
                  </Badge>
                </div>

                <div className="space-y-2">
                  {extracted.medications.map((m, idx) => (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredField(`med-${idx}`)}
                      onMouseLeave={() => setHoveredField(null)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        hoveredField === `med-${idx}`
                          ? "bg-teal-500/10 border-teal-500 shadow-md scale-[1.01]"
                          : m.confidence < 0.7
                          ? "bg-coral-50/40 dark:bg-coral-950/20 border-coral-300 dark:border-coral-800"
                          : "bg-slate-50 dark:bg-navy-800/80 border-slate-200 dark:border-navy-700 hover:border-teal-400"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-foreground">
                            {m.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {m.dose && <span className="font-semibold text-teal-700 dark:text-teal-300 mr-2">{m.dose}</span>}
                            {m.frequency && <span>{m.frequency}</span>}
                            {m.duration && <span className="ml-2">&bull; {m.duration}</span>}
                          </div>
                        </div>

                        {/* Confidence score */}
                        <div className="shrink-0 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              m.confidence >= 0.85
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : m.confidence >= 0.7
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-coral-100 text-coral-800 dark:bg-coral-950 dark:text-coral-300"
                            }`}
                          >
                            {Math.round(m.confidence * 100)}% Conf
                          </span>
                        </div>
                      </div>

                      {/* Low confidence warning flag */}
                      {m.confidence < 0.7 && (
                        <div className="mt-2 text-[10px] text-coral-700 dark:text-coral-300 flex items-center gap-1 font-semibold">
                          <AlertTriangle className="w-3 h-3 text-coral-600 shrink-0" />
                          <span>Flagged: Poorly legible handwriting. Physician confirmation required.</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Laboratory Tests Section */}
            {extracted?.lab_values && extracted.lab_values.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-navy dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Laboratory Biomarkers</span>
                  </h4>
                  <Badge variant="verified" size="sm">
                    {extracted.lab_values.length} Analyzed
                  </Badge>
                </div>

                <div className="space-y-2">
                  {extracted.lab_values.map((l, idx) => (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredField(`lab-${idx}`)}
                      onMouseLeave={() => setHoveredField(null)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        hoveredField === `lab-${idx}`
                          ? "bg-teal-500/10 border-teal-500 shadow-md scale-[1.01]"
                          : l.flag !== "normal"
                          ? "bg-coral-50/30 dark:bg-coral-950/20 border-coral-300 dark:border-coral-800"
                          : "bg-slate-50 dark:bg-navy-800/80 border-slate-200 dark:border-navy-700 hover:border-teal-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-foreground">
                            {l.test}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            Ref: {l.reference_range || "Standard"} &bull; Unit: {l.unit || "—"}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-extrabold text-foreground">
                            {l.value} {l.unit || ""}
                          </span>
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allergies & Diagnoses */}
            <div className="space-y-2">
              {extracted?.allergies_mentioned && extracted.allergies_mentioned.length > 0 && (
                <div
                  onMouseEnter={() => setHoveredField("allergy")}
                  onMouseLeave={() => setHoveredField(null)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    hoveredField === "allergy"
                      ? "bg-coral-500/20 border-coral-500 shadow-md"
                      : "bg-coral-50/50 dark:bg-coral-950/20 border-coral-300 dark:border-coral-800"
                  }`}
                >
                  <div className="text-[10px] font-bold text-coral-800 dark:text-coral-300 uppercase">
                    Documented Drug Allergy
                  </div>
                  <div className="text-xs font-bold text-coral-900 dark:text-coral-100 mt-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-coral-600 shrink-0" />
                    <span>{extracted.allergies_mentioned[0]?.allergen}</span>
                  </div>
                </div>
              )}

              {extracted?.diagnoses_mentioned && extracted.diagnoses_mentioned.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200 dark:border-navy-700 space-y-1.5">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">
                    Diagnoses Extracted
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {extracted.diagnoses_mentioned.map((d, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700"
                      >
                        {d.condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={onClose}>
                Close Viewer
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={onClose}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                className="shadow-teal-glow"
              >
                Accept & Merge into Summary
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
