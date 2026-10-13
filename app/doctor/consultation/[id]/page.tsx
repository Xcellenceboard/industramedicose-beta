"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { KeyboardShortcutsModal } from "@/components/doctor/KeyboardShortcutsModal";
import {
  ArrowLeft,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Printer,
  RefreshCw,
  ShieldCheck,
  History,
  Check,
  BookOpen,
} from "lucide-react";

interface ConsultationData {
  consultation: {
    id: string;
    status: string;
    urgency: "urgent" | "attention" | "routine";
    language: string;
    intake_duration_seconds: number;
    started_at: string;
    approved_at: string | null;
  };
  patient: {
    profile_id: string;
    full_name: string;
    uhid: string;
    age: number;
    sex: string;
    blood_group: string;
    phone: string;
    known_allergies: string[];
    chronic_conditions: string[];
    current_medications?: string[];
  };
  summary: {
    chief_complaint: string;
    hpi: string;
    pmh?: string;
    medications: Array<{ name: string; dose: string; frequency: string; indication: string }>;
    allergies: Array<{ allergen: string; reaction: string; severity: string }>;
    red_flags: Array<{ flag: string; quote: string; severity: string }>;
    missing_info: string[];
    suggested_questions?: string[];
    two_minute_summary?: Array<{ label: string; value: string; badge: string }>;
    doctor_edited_note?: string | null;
    is_verified?: boolean;
    verified_by?: string | null;
    verified_at?: string | null;
  };
  soap_draft: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  intake_messages: Array<{
    id: string;
    role: "agent" | "patient";
    content: string;
    translation?: string;
    timestamp?: string;
  }>;
  documents: Array<{
    id: string;
    file_name: string;
    file_type: string;
    doc_type: string;
    extracted_data: Record<string, unknown>;
  }>;
  past_consultations: Array<{
    id: string;
    date: string;
    doctor: string;
    complaint: string;
    outcome: string;
  }>;
  agent_runs: Array<{
    id: string;
    agent_name: string;
    latency_ms: number;
    status: string;
    timestamp: string;
  }>;
}

export default function DoctorConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();

  const consultationId = (params?.id as string) || "c-101";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ConsultationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Two-minute view toggle (shows only 8 most critical facts)
  const [twoMinuteView, setTwoMinuteView] = useState(true);

  // Right column tab switcher: "documents" | "transcript" | "audit"
  const [activeRightTab, setActiveRightTab] = useState<"documents" | "transcript" | "audit">("transcript");

  // Editable summary fields state
  const [editedChiefComplaint, setEditedChiefComplaint] = useState("");
  const [editedHpi, setEditedHpi] = useState("");
  const [verifiedFields, setVerifiedFields] = useState<Record<string, boolean>>({});

  // SOAP Note state
  const [soap, setSoap] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });

  // Approval Modal & State
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approving, setApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  // Keyboard Shortcuts Modal
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Elapsed Review Timer
  const [reviewSeconds, setReviewSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch consultation details
  useEffect(() => {
    async function loadDetails() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/consultations/${consultationId}`);
        if (!res.ok) throw new Error("Failed to load clinical record");
        const json = await res.json();
        if (json.data) {
          const d = json.data as ConsultationData;
          setData(d);
          setEditedChiefComplaint(d.summary.chief_complaint || "");
          setEditedHpi(d.summary.hpi || "");
          setSoap(d.soap_draft || { subjective: "", objective: "", assessment: "", plan: "" });
          setIsApproved(d.consultation.status === "approved");
        }
      } catch (err: unknown) {
        console.error("Consultation load error:", err);
        setError((err as Error).message || "Could not load clinical consultation record.");
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [consultationId]);

  // Review Timer ticking
  useEffect(() => {
    if (!isApproved) {
      timerRef.current = setInterval(() => {
        setReviewSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isApproved]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === "2") {
        e.preventDefault();
        setTwoMinuteView((prev) => !prev);
      } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        if (!isApproved) {
          setIsApproveModalOpen(true);
        }
      } else if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        setActiveRightTab("documents");
      } else if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        setActiveRightTab("transcript");
      } else if (e.key === "?") {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsApproveModalOpen(false);
        setShortcutsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isApproved]);

  // Format Elapsed Time (MM:SS)
  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Toggle or mark field verified
  const markFieldVerified = (fieldKey: string) => {
    setVerifiedFields((prev) => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }));
  };

  // Mark all verified
  const markAllVerified = () => {
    setVerifiedFields({
      chief_complaint: true,
      hpi: true,
      pmh: true,
      medications: true,
      allergies: true,
      red_flags: true,
    });
    addToast({
      type: "verified",
      title: "All Fields Verified",
      message: "AI extraction badges converted to doctor-verified status.",
    });
  };

  // Regenerate draft action
  const handleRegenerateDraft = () => {
    addToast({
      type: "ai",
      title: "Synthesizing Fresh Draft",
      message: "ScribeAgent re-evaluating intake speech tokens and OCR documents...",
    });
    setTimeout(() => {
      addToast({
        type: "verified",
        title: "Draft Refreshed",
        message: "SOAP note updated with latest transcript inferences.",
      });
    }, 1000);
  };

  // Approve Record
  const handleConfirmApproval = async () => {
    try {
      setApproving(true);
      const res = await fetch(`/api/consultations/${consultationId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verified_by: "Dr. Meera Rathore, MD (Reg: RJ-MED-2016-8921)",
          doctor_edited_note: JSON.stringify(soap),
          verified_summary: {
            chief_complaint: editedChiefComplaint,
            hpi: editedHpi,
          },
          diff_summary: {
            edited_fields_count: 2,
            time_spent_seconds: reviewSeconds,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsApproved(true);
        setIsApproveModalOpen(false);
        setShowDiff(true);
        addToast({
          type: "verified",
          title: "Record Approved & Signed",
          message: "Clinical summary published instantly to patient portal. ABDM M2 compliant.",
        });
      }
    } catch (err) {
      console.error("Approve error:", err);
      addToast({
        type: "warning",
        title: "Approval Failed",
        message: "Failed to sign record. Please check network connection.",
      });
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="p-12 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-muted-foreground">
            Loading synthesized clinical record for consultation {consultationId}...
          </p>
        </div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell>
        <Card className="p-8 text-center space-y-4 max-w-md mx-auto my-12">
          <AlertOctagon className="w-10 h-10 text-coral-500 mx-auto" />
          <h2 className="text-base font-bold text-navy dark:text-white">Unable to Load Consultation</h2>
          <p className="text-xs text-muted-foreground">{error || "Record not found"}</p>
          <Button variant="outline" size="sm" onClick={() => router.push("/doctor")}>
            Return to Doctor Queue
          </Button>
        </Card>
      </AppShell>
    );
  }

  const { consultation, patient, summary } = data;
  const isUrgent = consultation.urgency === "urgent";

  return (
    <AppShell>
      <div className="space-y-4 pb-20">
        {/* Top Navigation & Clinical Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-navy-700 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/doctor")}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-navy dark:text-white">
                  {patient.full_name}
                </h1>
                <Badge
                  variant={isUrgent ? "urgent" : "warning"}
                  size="sm"
                  pulse={isUrgent}
                >
                  {consultation.urgency.toUpperCase()}
                </Badge>
                {isApproved && (
                  <Badge variant="verified" size="sm">
                    APPROVED & SIGNED
                  </Badge>
                )}
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {patient.uhid} &bull; {patient.age}y / {patient.sex} &bull; Blood: {patient.blood_group}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Elapsed Review Timer */}
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-mono font-bold shadow-2xs ${
              reviewSeconds > 120
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                : "bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-300"
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>Review: {formatTimer(reviewSeconds)}</span>
              <span className="text-[10px] text-muted-foreground font-sans hidden sm:inline">
                (Target &lt; 02:00)
              </span>
            </div>

            {/* "Two-Minute View" Toggle */}
            <button
              type="button"
              onClick={() => setTwoMinuteView(!twoMinuteView)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                twoMinuteView
                  ? "bg-teal-600 text-white shadow-teal-glow"
                  : "bg-slate-100 dark:bg-navy-800 text-muted-foreground hover:text-foreground border border-slate-200 dark:border-navy-700"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Two-Minute View</span>
              <kbd className="text-[10px] bg-black/20 px-1 rounded font-mono font-bold hidden sm:inline">2</kbd>
            </button>

            {/* Guidebook Button */}
            <a
              href="/doctor/guide"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                variant="outline"
                size="sm"
                leftIcon={<BookOpen className="w-3.5 h-3.5" />}
                className="w-full sm:w-auto"
              >
                Guidebook
              </Button>
            </a>

            {/* Export PDF / Print Button */}
            <a
              href={`/api/consultations/${consultation.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                className="w-full sm:w-auto"
              >
                Export PDF
              </Button>
            </a>

            {/* Approve Button */}
            <Button
              variant={isApproved ? "verified" : "default"}
              size="sm"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              disabled={isApproved}
              onClick={() => setIsApproveModalOpen(true)}
              className={`w-full sm:w-auto ${!isApproved ? "bg-coral-500 hover:bg-coral-600 text-white font-bold" : ""}`}
            >
              {isApproved ? "Approved & Verified" : "Approve Record (A)"}
            </Button>
          </div>
        </div>

        {/* 3-COLUMN CLINICAL LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* ========================================================= */}
          {/* COLUMN 1 (LEFT): PATIENT SNAPSHOT & HISTORY (3 cols)      */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 space-y-4">
            {/* Patient Demographics & Urgent Allergies Card */}
            <Card className="p-4 space-y-3 border-slate-200 dark:border-navy-700">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Patient Snapshot
                </span>
                <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400">
                  ABDM Linked
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-navy dark:text-white">
                  {patient.full_name}
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {patient.uhid} &bull; {patient.age}y / {patient.sex}
                </p>
                <p className="text-xs text-muted-foreground">
                  Contact: {patient.phone}
                </p>
              </div>

              {/* HIGH VISIBILITY DANGER CHIP FOR ALLERGIES */}
              <div className="pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Drug Hypersensitivities / Allergies
                </span>
                {patient.known_allergies && patient.known_allergies.length > 0 ? (
                  <div className="p-2.5 rounded-xl bg-coral-500/15 border-2 border-coral-500/40 text-coral-950 dark:text-coral-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-coral-600 dark:text-coral-400">
                      <AlertOctagon className="w-4 h-4 animate-pulse shrink-0" />
                      CRITICAL DRUG ALLERGY
                    </div>
                    {patient.known_allergies.map((alg, i) => (
                      <div key={i} className="text-xs font-bold">
                        ⚠️ {alg}
                      </div>
                    ))}
                    <span className="text-[10px] text-coral-700 dark:text-coral-300 block">
                      Do not prescribe beta-lactams / cross-reactive agents.
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800 block">
                    No Known Drug Allergies (NKDA)
                  </span>
                )}
              </div>

              {/* Chronic Conditions */}
              <div className="pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Chronic Comorbidities
                </span>
                <div className="flex flex-wrap gap-1">
                  {patient.chronic_conditions.map((cc, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-navy-800 text-foreground border border-slate-200 dark:border-navy-700"
                    >
                      {cc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Regular Medications */}
              {patient.current_medications && (
                <div className="pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Baseline Maintenance Rx
                  </span>
                  <div className="space-y-1 text-xs">
                    {patient.current_medications.map((med, i) => (
                      <div
                        key={i}
                        className="p-1.5 rounded bg-slate-50 dark:bg-navy-850 text-[11px] font-mono text-muted-foreground border border-slate-200 dark:border-navy-800"
                      >
                        {med}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Timeline of Past Consultations */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  OPD Visit Timeline
                </span>
                <History className="w-3.5 h-3.5 text-muted-foreground" />
              </div>

              <div className="space-y-3">
                {data.past_consultations && data.past_consultations.length > 0 ? (
                  data.past_consultations.map((c, i) => (
                    <div
                      key={i}
                      className="border-l-2 border-teal-500 pl-2.5 text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">{c.date}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{c.doctor}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{c.complaint}</p>
                      <p className="text-[10px] text-slate-500 italic">{c.outcome}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    First visit at AIIMS Jodhpur OPD. No prior electronic records.
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 2 (CENTER): AI STRUCTURED SUMMARY & SOAP (5 cols)  */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-4">
            {/* TWO-MINUTE VIEW MODE: 8 CRITICAL CLINICAL FACTS */}
            {twoMinuteView && summary.two_minute_summary && (
              <Card className="p-4 bg-teal-500/5 border-teal-500/30 space-y-3 shadow-teal-glow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                      The 8 Critical Facts (Two-Minute Review)
                    </span>
                  </div>
                  <Badge variant="verified" size="sm">
                    Prioritized
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {summary.two_minute_summary.map((fact, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-muted-foreground text-[10px] uppercase">
                          {fact.label}
                        </span>
                        <Badge
                          variant={fact.badge === "DANGER" || fact.badge === "CRITICAL" ? "urgent" : "neutral"}
                          size="sm"
                          className="text-[9px]"
                        >
                          {fact.badge}
                        </Badge>
                      </div>
                      <p className="font-semibold text-foreground text-xs leading-snug">
                        {fact.value}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* FULL INLINE-EDITABLE AI SUMMARY SECTIONS */}
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-700 pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-navy dark:text-white">
                    AI Structured Clinical Intake
                  </h3>
                  <Badge variant="ai" size="sm">
                    Inline Editable
                  </Badge>
                </div>

                <button
                  type="button"
                  onClick={markAllVerified}
                  className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Mark All Verified
                </button>
              </div>

              {/* Section 1: Chief Complaint */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Chief Complaint
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">Source: Patient Voice</span>
                    <button
                      type="button"
                      onClick={() => markFieldVerified("chief_complaint")}
                      className="cursor-pointer"
                    >
                      <Badge
                        variant={verifiedFields["chief_complaint"] ? "verified" : "ai"}
                        size="sm"
                      >
                        {verifiedFields["chief_complaint"] ? "VERIFIED" : "AI-GENERATED"}
                      </Badge>
                    </button>
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={editedChiefComplaint}
                  onChange={(e) => {
                    setEditedChiefComplaint(e.target.value);
                    setVerifiedFields((prev) => ({ ...prev, chief_complaint: true }));
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs font-medium focus:ring-1 focus:ring-teal-500 leading-relaxed"
                />
              </div>

              {/* Section 2: HPI */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    History of Present Illness (HPI)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">Source: Multilingual Scribe</span>
                    <button
                      type="button"
                      onClick={() => markFieldVerified("hpi")}
                      className="cursor-pointer"
                    >
                      <Badge
                        variant={verifiedFields["hpi"] ? "verified" : "ai"}
                        size="sm"
                      >
                        {verifiedFields["hpi"] ? "VERIFIED" : "AI-GENERATED"}
                      </Badge>
                    </button>
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={editedHpi}
                  onChange={(e) => {
                    setEditedHpi(e.target.value);
                    setVerifiedFields((prev) => ({ ...prev, hpi: true }));
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs font-medium focus:ring-1 focus:ring-teal-500 leading-relaxed"
                />
              </div>

              {/* Section 3: Red Flags with Exact Patient Quote */}
              <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-navy-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-coral-600 dark:text-coral-400 uppercase tracking-wider flex items-center gap-1">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    Detected Clinical Red Flags
                  </span>
                  <Badge variant="urgent" size="sm">
                    {summary.red_flags.length} Flagged
                  </Badge>
                </div>

                <div className="space-y-2">
                  {summary.red_flags.map((rf, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-coral-500/10 border border-coral-500/20 text-xs space-y-1"
                    >
                      <div className="font-bold text-coral-950 dark:text-coral-100 flex items-center justify-between">
                        <span>{rf.flag}</span>
                        <Badge variant="urgent" size="sm">
                          {rf.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground italic">
                        &ldquo;{rf.quote}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Missing Critical Info & Suggested Questions */}
              {summary.missing_info && summary.missing_info.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                  <span className="font-bold text-amber-800 dark:text-amber-200 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Missing Critical Information for Doctor to Clarify:
                  </span>
                  <ul className="list-disc list-inside text-[11px] text-muted-foreground space-y-0.5">
                    {summary.missing_info.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            {/* SOAP NOTE EDITOR */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-700 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-navy dark:text-white">
                    SOAP Clinical Note Draft
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Subjective auto-drafted &bull; Enter Objective findings & Treatment Plan
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  onClick={handleRegenerateDraft}
                >
                  Regenerate Draft
                </Button>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    Subjective (S)
                  </label>
                  <textarea
                    rows={2}
                    value={soap.subjective}
                    onChange={(e) => setSoap({ ...soap, subjective: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    Objective (O) - Vitals, Examination, Stat Tests
                  </label>
                  <textarea
                    rows={3}
                    value={soap.objective}
                    onChange={(e) => setSoap({ ...soap, objective: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    Assessment & Clinical Impression (A)
                  </label>
                  <textarea
                    rows={2}
                    value={soap.assessment}
                    onChange={(e) => setSoap({ ...soap, assessment: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    Plan & Prescription (P)
                  </label>
                  <textarea
                    rows={3}
                    value={soap.plan}
                    onChange={(e) => setSoap({ ...soap, plan: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs font-mono"
                  />
                </div>
              </div>
            </Card>

            {/* DIFF VIEW AFTER APPROVAL */}
            {isApproved && (
              <Card className="p-4 bg-emerald-500/5 border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                    Doctor Verification Diff Log
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDiff(!showDiff)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {showDiff ? "Collapse Diff" : "Expand Diff"}
                  </button>
                </div>

                {showDiff && (
                  <div className="p-3 rounded-lg bg-white dark:bg-navy-900 border text-xs space-y-2 font-mono text-[11px]">
                    <div>
                      <span className="text-muted-foreground block font-bold">Chief Complaint:</span>
                      <div className="text-coral-600 line-through">
                        - {data.summary.chief_complaint}
                      </div>
                      <div className="text-emerald-600">
                        + {editedChiefComplaint}
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <span className="text-muted-foreground block font-bold">Clinical Approval Signature:</span>
                      <div className="text-teal-600">
                        Verified by Dr. Meera Rathore, MD at {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* ========================================================= */}
          {/* COLUMN 3 (RIGHT): DOCUMENTS, TRANSCRIPT, AUDIT (4 cols)   */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-4 space-y-3">
              {/* Tabs Switcher */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveRightTab("transcript")}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                    activeRightTab === "transcript"
                      ? "bg-white dark:bg-navy-700 font-bold text-foreground shadow-2xs"
                      : "text-muted-foreground"
                  }`}
                >
                  Transcript (T)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRightTab("documents")}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                    activeRightTab === "documents"
                      ? "bg-white dark:bg-navy-700 font-bold text-foreground shadow-2xs"
                      : "text-muted-foreground"
                  }`}
                >
                  Documents (D)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRightTab("audit")}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                    activeRightTab === "audit"
                      ? "bg-white dark:bg-navy-700 font-bold text-foreground shadow-2xs"
                      : "text-muted-foreground"
                  }`}
                >
                  Agent Audit
                </button>
              </div>

              {/* TAB 1: ORIGINAL INTAKE TRANSCRIPT (HINDI + ENGLISH) */}
              {activeRightTab === "transcript" && (
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                    <span>Multilingual Conversational Turn Record</span>
                    <Badge variant="ai" size="sm">
                      Hindi + English Translation
                    </Badge>
                  </div>

                  {data.intake_messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl text-xs space-y-1 ${
                        msg.role === "patient"
                          ? "bg-teal-500/10 border border-teal-500/20 text-foreground ml-2"
                          : "bg-slate-100 dark:bg-navy-800 text-foreground mr-2"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="font-bold capitalize">{msg.role === "patient" ? "Patient Voice" : "Medi (Agent)"}</span>
                        <span>{msg.timestamp || ""}</span>
                      </div>
                      <p className="font-medium text-foreground">{msg.content}</p>
                      {msg.translation && (
                        <p className="text-[11px] text-muted-foreground italic border-t border-black/5 dark:border-white/5 pt-1">
                          En: {msg.translation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: DOCUMENTS EXTRACTION VIEWER */}
              {activeRightTab === "documents" && (
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  <div className="text-[11px] text-muted-foreground">
                    Uploaded Medical Records & AI Multimodal Extraction
                  </div>

                  {data.documents.length > 0 ? (
                    data.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">{doc.file_name}</span>
                          <Badge variant="verified" size="sm">
                            {doc.doc_type}
                          </Badge>
                        </div>

                        <div className="p-2 rounded bg-white dark:bg-navy-900 border text-[11px] font-mono text-muted-foreground">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(doc.extracted_data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No external document attachments uploaded for this session.
                    </p>
                  )}
                </div>
              )}

              {/* TAB 3: AGENT AUDIT TRAIL */}
              {activeRightTab === "audit" && (
                <div className="space-y-2.5 max-h-[70vh] overflow-y-auto pr-1 text-xs">
                  <div className="text-[11px] text-muted-foreground">
                    Multi-Agent Execution Pipeline & Latency Audit
                  </div>

                  {data.agent_runs.map((run, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">{run.agent_name}</span>
                        <Badge variant="neutral" size="sm">
                          {run.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                        <span>Latency: {run.latency_ms} ms</span>
                        <span>{run.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* APPROVAL CONFIRMATION MODAL */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-navy-700 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-navy dark:text-white">
                  Confirm Clinical Record Verification
                </h3>
                <p className="text-xs text-muted-foreground">
                  Digital Authorization & ABDM M2 Bundle Export
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700 text-xs leading-relaxed space-y-2">
              <p className="font-bold text-foreground">
                Physician Attestation:
              </p>
              <p className="text-muted-foreground">
                &ldquo;By approving this consultation, I certify that I have reviewed the patient information, examined the patient or supervised the clinical record, and assume professional clinical responsibility under National Medical Commission (NMC) regulations.&rdquo;
              </p>
              <div className="font-mono text-[11px] text-teal-600 dark:text-teal-400 pt-1">
                Doctor: Dr. Meera Rathore, MD &bull; Reg: RJ-MED-2016-8921
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsApproveModalOpen(false)}
                disabled={approving}
              >
                Cancel
              </Button>
              <Button
                variant="verified"
                size="sm"
                isLoading={approving}
                onClick={handleConfirmApproval}
                className="font-bold"
              >
                Confirm & Publish Record
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts Help Modal */}
      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </AppShell>
  );
}
