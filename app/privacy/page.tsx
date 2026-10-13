"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  ShieldCheck,
  Lock,
  Trash2,
  FileCheck,
  AlertTriangle,
  Scale,
  CheckCircle2,
} from "lucide-react";

export default function PrivacyCompliancePage() {
  const { addToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDeleteData = async () => {
    if (!confirm("Are you sure you want to delete all personal intake data? This will soft-delete your profile and anonymize records under DPDP Act 2023.")) {
      return;
    }

    try {
      setIsDeleting(true);
      const res = await fetch("/api/patient/delete-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: "p-101" }),
      });
      const data = await res.json();
      if (data.success) {
        setDeleted(true);
        addToast({
          type: "verified",
          title: "Data Erasure Complete",
          message: "All patient records anonymized and storage cleaned under DPDP Act guidelines.",
        });
      }
    } catch {
      addToast({
        type: "warning",
        title: "Deletion Warning",
        message: "Failed to erase data. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-navy-700 pb-5">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="verified" size="sm">
              DPDP Act 2023 Compliant
            </Badge>
            <Badge variant="ai" size="sm">
              ABDM Milestone 2 Aligned
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy dark:text-white">
            Privacy, Ethics & Clinical Governance Policy
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Plain-language disclosure of how patient voice data, document OCR, and AI agent outputs are governed.
          </p>
        </div>

        {/* Prototype Notice Box */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-200 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            AAYU 2026 Hackathon Prototype Notice
          </div>
          <p className="leading-relaxed">
            Industra Medicose is demonstrated using <strong>100% synthetic, anonymized clinical data</strong> created for Problem T01 &ldquo;The Two-Minute Doctor&rdquo;. No real patient Protected Health Information (PHI) is processed or retained without explicit consent.
          </p>
        </div>

        {/* Core Principles Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 space-y-2">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              1. What Data We Process
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We collect audio microphone input during patient intake (transcribed via browser speech API), user-entered symptoms, and uploaded medical documents (prescriptions, lab tests). Speech audio is processed in memory and never permanently stored as raw audio files.
            </p>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-sm">
              <Scale className="w-5 h-5" />
              2. Doctor-in-the-Loop Mandate
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Strict Clinical Posture:</strong> The AI agent system NEVER makes an unverified clinical diagnosis, never prescribes pharmaceuticals directly to patients, and never lowers emergency triage urgency. Every summary must be reviewed and digitally signed by a licensed physician before release.
            </p>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-sm">
              <Lock className="w-5 h-5" />
              3. Data Retention & Storage Security
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Data is retained strictly for the duration of the clinical consultation lifecycle (30-day demo cycle). Documents uploaded to Supabase Storage are protected by private bucket Row Level Security (RLS) policies requiring authenticated token verification.
            </p>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-sm">
              <FileCheck className="w-5 h-5" />
              4. Consent & Revocation Rights
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              In accordance with Section 6 of the Digital Personal Data Protection Act (DPDP 2023), patients retain unconditional rights to withdraw consent at any time and demand instantaneous data erasure without consequence.
            </p>
          </Card>
        </div>

        {/* Right to Erasure / Delete Data Action Card */}
        <Card className="p-4 sm:p-6 border-coral-500/30 bg-coral-500/5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm text-coral-700 dark:text-coral-300">
                <Trash2 className="w-5 h-5 text-coral-600" />
                Exercise Right to Erasure (DPDP Act 2023)
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                Delete all synthetic consultation records, anonymize clinical intake transcripts, and purge document storage buckets associated with your current session.
              </p>
            </div>

            <Button
              variant="default"
              size="sm"
              leftIcon={<Trash2 className="w-4 h-4" />}
              isLoading={isDeleting}
              disabled={deleted}
              onClick={handleDeleteData}
              className="bg-coral-600 hover:bg-coral-700 text-white font-bold w-full sm:w-auto shrink-0"
            >
              {deleted ? "Data Erased" : "Delete My Data"}
            </Button>
          </div>

          {deleted && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Patient records have been successfully soft-deleted and anonymized. All storage attachments unlinked.
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
