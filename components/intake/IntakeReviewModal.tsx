"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Stethoscope,
  Clock,
  Send,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";

export interface IntakeSummaryPreview {
  chiefComplaint: string;
  duration: string;
  severity: string;
  pastHistory: string;
  medications: string;
  allergies: string;
}

interface IntakeReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultationId: string;
  summary: IntakeSummaryPreview;
  language: "en" | "hi" | "hinglish";
  onSubmitToDoctor: () => Promise<void>;
  status: "intake" | "ready_for_review" | "in_review" | "approved";
}

export function IntakeReviewModal({
  isOpen,
  onClose,
  consultationId,
  summary: initialSummary,
  language,
  onSubmitToDoctor,
  status,
}: IntakeReviewModalProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(status !== "intake");
  const [currentStatus, setCurrentStatus] = useState<
    "intake" | "ready_for_review" | "in_review" | "approved"
  >(status);
  const isHi = language === "hi";

  useEffect(() => {
    setCurrentStatus(status);
    if (status !== "intake") {
      setSubmitted(true);
    }
  }, [status]);

  useEffect(() => {
    if (!consultationId) return;
    try {
      const supabase = createClient();
      const channel = supabase
        .channel(`consultation-status-${consultationId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "consultations",
            filter: `id=eq.${consultationId}`,
          },
          (payload) => {
            if (payload.new && (payload.new as { status?: string }).status) {
              const newStatus = (
                payload.new as {
                  status: "intake" | "ready_for_review" | "in_review" | "approved";
                }
              ).status;
              setCurrentStatus(newStatus);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // Non-blocking fallback
    }
  }, [consultationId]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmitToDoctor();
      setSubmitted(true);
      setCurrentStatus("ready_for_review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-teal-500/30 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
        {!submitted ? (
          <>
            {/* Header */}
            <div className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-navy-800">
              <div className="flex items-center justify-between">
                <Badge variant="verified" size="sm">
                  {isHi ? "समीक्षा एवं अनुमोदन" : "Final Review"}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">
                  {consultationId}
                </span>
              </div>
              <h3 id="review-modal-title" className="text-xl font-bold text-navy dark:text-white">
                {isHi ? "डॉक्टर को भेजने से पहले अपनी जानकारी जांचें" : "Review Your Pre-Consultation Summary"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isHi
                  ? "यदि कोई विवरण बदलना हो तो नीचे 'संपादित करें' पर क्लिक कर सकते हैं।"
                  : "Verify that all clinical details captured by Medi are accurate before sending to your physician."}
              </p>
            </div>

            {/* Structured Answers Cards */}
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              <Card className="p-4 space-y-1">
                <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  {isHi ? "मुख्य शिकायत (Chief Complaint)" : "Chief Complaint"}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={summary.chiefComplaint}
                    onChange={(e) => setSummary({ ...summary, chiefComplaint: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border bg-slate-50 dark:bg-navy-800"
                  />
                ) : (
                  <div className="text-sm font-semibold text-navy dark:text-white">
                    {summary.chiefComplaint || (isHi ? "सीने में तेज दर्द व भारीपन" : "Acute chest pain")}
                  </div>
                )}
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4 space-y-1">
                  <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                    {isHi ? "अवधि (Duration)" : "Duration"}
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={summary.duration}
                      onChange={(e) => setSummary({ ...summary, duration: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border bg-slate-50 dark:bg-navy-800"
                    />
                  ) : (
                    <div className="text-xs font-semibold text-navy dark:text-white">
                      {summary.duration || "2 hours"}
                    </div>
                  )}
                </Card>

                <Card className="p-4 space-y-1">
                  <div className="text-[11px] font-bold text-coral-600 dark:text-coral-400 uppercase tracking-wider">
                    {isHi ? "दर्द की तीव्रता (Severity)" : "Pain Severity"}
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={summary.severity}
                      onChange={(e) => setSummary({ ...summary, severity: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border bg-slate-50 dark:bg-navy-800"
                    />
                  ) : (
                    <div className="text-xs font-semibold text-coral-600 dark:text-coral-400">
                      {summary.severity || "8 / 10 (Severe)"}
                    </div>
                  )}
                </Card>
              </div>

              <Card className="p-4 space-y-1">
                <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  {isHi ? "पुरानी बीमारियाँ व दवाइयाँ" : "Past Conditions & Regular Medications"}
                </div>
                <div className="text-xs text-foreground/90">
                  {summary.pastHistory || "Essential Hypertension (10 years) • Tab Telmisartan 40mg OD"}
                </div>
              </Card>

              <Card variant="urgent" className="p-4 space-y-1">
                <div className="text-[11px] font-bold text-coral-600 dark:text-coral-400 uppercase tracking-wider">
                  {isHi ? "दवाओं से एलर्जी (Allergies)" : "Known Drug Allergies"}
                </div>
                <div className="text-xs font-semibold text-coral-700 dark:text-coral-300">
                  {summary.allergies || "Penicillin (Severe Hypersensitivity)"}
                </div>
              </Card>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-navy-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (isHi ? "संपादन पूर्ण" : "Done Editing") : (isHi ? "संपादित करें" : "Edit Answers")}
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
                  {isHi ? "वापस" : "Back to Chat"}
                </Button>
                <Button
                  variant="default"
                  size="md"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="shadow-teal-glow font-bold"
                  leftIcon={submitting ? undefined : <Send className="w-4 h-4" />}
                >
                  {submitting
                    ? isHi
                      ? "भेजा जा रहा है..."
                      : "Submitting..."
                    : isHi
                    ? "डॉक्टर को भेजें"
                    : "Send to Doctor"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Live Status Tracker after Submission */
          <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-300">
            {/* Friendly celebration icon */}
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-extrabold text-navy dark:text-white">
                {isHi ? "सारांश सफलतापूर्वक भेजा गया!" : "Summary Delivered to Doctor!"}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                {isHi
                  ? "आपका 120-सेकंड प्री-कंसल्टेशन सारांश डॉक्टर के ट्राइएज डैशबोर्ड में तैयार है।"
                  : "Your structured summary is primed in the physician's high-priority queue."}
              </p>
            </div>

            {/* 3-Step Live Status Stepper */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200 dark:border-navy-700 space-y-3 text-left">
              <div className="text-xs font-bold text-navy dark:text-white flex items-center justify-between">
                <span>{isHi ? "लाइव ओपीडी स्थिति (Realtime Status)" : "Live OPD Queue Status"}</span>
                <Badge variant="verified" size="sm" pulse>
                  Live Sync
                </Badge>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">
                      {isHi ? "1. सारांश तैयार एवं भेजा गया" : "1. Intake Finalized & Dispatched"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Multi-agent pipeline complete &bull; FHIR M2 bundle created
                    </div>
                  </div>
                </div>

                {/* Step 2: Doctor Reviewing */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      currentStatus === "approved"
                        ? "bg-emerald-500 text-white"
                        : "bg-teal-500 text-white animate-pulse"
                    }`}
                  >
                    {currentStatus === "approved" ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <div
                      className={`text-xs font-bold ${
                        currentStatus === "approved"
                          ? "text-foreground"
                          : "text-teal-600 dark:text-teal-400"
                      }`}
                    >
                      {currentStatus === "approved"
                        ? isHi
                          ? "2. डॉक्टर द्वारा समीक्षा पूर्ण"
                          : "2. Doctor Review Complete"
                        : currentStatus === "in_review"
                        ? isHi
                          ? "2. डॉक्टर समीक्षा कर रहे हैं (जारी)"
                          : "2. Doctor Reviewing Now (In Review)"
                        : isHi
                        ? "2. डॉक्टर द्वारा समीक्षा (अगला क्रम)"
                        : "2. Waiting for Doctor (Next in Queue)"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Attending MD: Dr. Aarav Mehta &bull; Cabin 4
                    </div>
                  </div>
                </div>

                {/* Step 3: Approved & In Cabin */}
                <div
                  className={`flex items-center gap-3 ${
                    currentStatus === "approved" ? "opacity-100" : "opacity-60"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      currentStatus === "approved"
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-300 dark:bg-navy-600 text-white"
                    }`}
                  >
                    {currentStatus === "approved" ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Stethoscope className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">
                      {currentStatus === "approved"
                        ? isHi
                          ? "3. परामर्श स्वीकृत एवं पर्चा हस्ताक्षरित"
                          : "3. Approved & Digital Prescription Ready"
                        : isHi
                        ? "3. परामर्श एवं पर्चा प्रतीक्षित"
                        : "3. In Cabin & Prescription Signed"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {currentStatus === "approved"
                        ? isHi
                          ? "डॉक्टर ने पर्चे पर हस्ताक्षर कर दिए हैं"
                          : "Physician approved clinical note & e-prescription"
                        : isHi
                        ? "केबिन में परीक्षण के बाद"
                        : "Pending physical exam in cabin"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/patient">
                <Button
                  variant="default"
                  size="md"
                  className="shadow-teal-glow"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {isHi ? "मरीज़ पोर्टल पर जाएं" : "Return to Patient Portal"}
                </Button>
              </Link>

              <Button variant="outline" size="md" onClick={onClose}>
                {isHi ? "बंद करें" : "Dismiss"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
