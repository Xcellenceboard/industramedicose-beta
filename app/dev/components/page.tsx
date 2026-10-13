"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import {
  Skeleton,
  PatientCardSkeleton,
  ConsultationNoteSkeleton,
} from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useI18n } from "@/components/providers/I18nProvider";
import {
  Stethoscope,
  Pill,
  Users,
  AlertOctagon,
  CheckCircle2,
  ArrowRight,
  HeartPulse,
} from "lucide-react";

export default function ComponentGalleryPage() {
  const { t } = useI18n();
  const { addToast } = useToast();
  const [buttonLoading, setButtonLoading] = useState(false);

  const simulateLoading = () => {
    setButtonLoading(true);
    setTimeout(() => {
      setButtonLoading(false);
      addToast({
        type: "verified",
        title: "Simulation Finished",
        message: "Clinical action completed in 1.4 seconds.",
      });
    }, 1500);
  };

  return (
    <AppShell>
      <div className="space-y-12">
        {/* Header Section */}
        <div className="border-b border-slate-200 dark:border-navy-700 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="info" size="sm">
                  Design System v1.0
                </Badge>
                <Badge variant="ai" size="sm">
                  WCAG AA Compliant
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy dark:text-white">
                {t("galleryTitle")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
                {t("gallerySubtitle")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* 1. Logo Primitives */}
        <section className="space-y-4" aria-labelledby="section-logo">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="section-logo" className="text-lg font-bold text-navy dark:text-white">
                1. Brand Identity & SVG Logo
              </h2>
              <p className="text-xs text-muted-foreground">
                Inline SVG combining the clinical cross mark with neural network synaptic nodes.
              </p>
            </div>
            <Badge variant="neutral" size="sm">
              Inline SVG
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 flex flex-col items-center justify-center text-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground">Small (sm)</span>
              <Logo size="sm" showTagline={false} />
            </Card>

            <Card className="p-6 flex flex-col items-center justify-center text-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground">Medium (md) with Tagline</span>
              <Logo size="md" showTagline />
            </Card>

            <Card className="p-6 flex flex-col items-center justify-center text-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground">Large (lg) Hero Brand</span>
              <Logo size="lg" showTagline />
            </Card>
          </div>
        </section>

        {/* 2. Button System */}
        <section className="space-y-4" aria-labelledby="section-buttons">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="section-buttons" className="text-lg font-bold text-navy dark:text-white">
                2. {t("btnVariants")}
              </h2>
              <p className="text-xs text-muted-foreground">
                All buttons enforce a minimum 44px touch target, visible focus rings, and Framer Motion micro-interactions.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={simulateLoading}
              isLoading={buttonLoading}
            >
              Test Loading State
            </Button>
          </div>

          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                  Semantic Variants
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="default"
                    leftIcon={<Stethoscope className="w-4 h-4" />}
                  >
                    Medical Teal (Default)
                  </Button>
                  <Button variant="navy">Deep Navy (#0B2545)</Button>
                  <Button variant="secondary">Secondary Soft Mint</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button
                    variant="coral"
                    leftIcon={<AlertOctagon className="w-4 h-4" />}
                  >
                    Urgent Alert (#FF6B6B)
                  </Button>
                  <Button
                    variant="verified"
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Doctor Verified
                  </Button>
                  <Button variant="warning">Clinical Caution</Button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-navy-700">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                  Sizes & Icon Placements (Min 44px touch target)
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small (sm)</Button>
                  <Button size="md">Medium (md)</Button>
                  <Button
                    size="lg"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    Large (lg) Primary
                  </Button>
                  <Button size="icon" aria-label="Quick Heart Rate Test">
                    <HeartPulse className="w-5 h-5 text-teal-100" />
                  </Button>
                  <Button size="icon" variant="coral" aria-label="Emergency Alert Trigger">
                    <AlertOctagon className="w-5 h-5 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* 3. Badge System */}
        <section className="space-y-4" aria-labelledby="section-badges">
          <div>
            <h2 id="section-badges" className="text-lg font-bold text-navy dark:text-white">
              3. {t("badgeVariants")}
            </h2>
            <p className="text-xs text-muted-foreground">
              Color coded badges: AI-Generated (Purple), Doctor-Verified (Green), Urgent Alert (Coral), Clinical Warning (Amber).
            </p>
          </div>

          <Card className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <Badge variant="ai" pulse>
                {t("badgeAiGenerated")}
              </Badge>
              <Badge variant="verified">
                {t("badgeVerified")}
              </Badge>
              <Badge variant="urgent" pulse>
                {t("badgeUrgent")}
              </Badge>
              <Badge variant="warning">
                {t("badgeWarning")}
              </Badge>
              <Badge variant="info">
                ABDM / FHIR R4
              </Badge>
              <Badge variant="neutral">
                ICD-10 I10
              </Badge>
              <Badge variant="ai" size="sm">
                Compact AI (sm)
              </Badge>
            </div>
          </Card>
        </section>

        {/* 4. Card Primitives */}
        <section className="space-y-4" aria-labelledby="section-cards">
          <div>
            <h2 id="section-cards" className="text-lg font-bold text-navy dark:text-white">
              4. {t("cardVariants")}
            </h2>
            <p className="text-xs text-muted-foreground">
              Rounded-2xl borders, soft shadows, glassmorphism accents, and hover elevations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Standard Card */}
            <Card interactive>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="info" size="sm">Standard Card</Badge>
                  <span className="text-xs text-muted-foreground">Hover Me</span>
                </div>
                <CardTitle className="mt-2">Dr. Aarav Mehta</CardTitle>
                <CardDescription>Chief of Clinical Operations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Engineered with rounded-2xl geometry, gentle elevation shadows, and theme responsiveness.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span>View Credentials</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>

            {/* Accent Card */}
            <Card variant="accent" interactive>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="ai" size="sm" pulse>AI Scribe Copilot</Badge>
                  <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold">Active</span>
                </div>
                <CardTitle className="mt-2">Real-Time Dictation</CardTitle>
                <CardDescription>Hindi + English Code-Switching</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Listens to doctor-patient conversation in real-time, extracts symptoms and generates SOAP notes in &lt;120 seconds.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="default" size="sm" className="w-full">
                  Start Consultation
                </Button>
              </CardFooter>
            </Card>

            {/* Urgent Alert Card */}
            <Card variant="urgent" interactive>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="urgent" size="sm" pulse>Critical Interaction</Badge>
                  <AlertOctagon className="w-5 h-5 text-coral-500" />
                </div>
                <CardTitle className="mt-2 text-coral-700 dark:text-coral-300">
                  Drug Contraindication
                </CardTitle>
                <CardDescription>Patient Allergy: Penicillin V</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Proposed Amoxicillin 500mg conflicts with charted hypersensitivity. Recommended alternative: Azithromycin 500mg.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="coral" size="sm" className="w-full">
                  Resolve Conflict
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* 5. Skeleton Loaders */}
        <section className="space-y-4" aria-labelledby="section-skeletons">
          <div>
            <h2 id="section-skeletons" className="text-lg font-bold text-navy dark:text-white">
              5. {t("skeletonLoaders")}
            </h2>
            <p className="text-xs text-muted-foreground">
              Smooth shimmer placeholders for high-speed clinical data fetching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground">Basic Skeleton Primitives</span>
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-card space-y-3">
                <Skeleton className="w-1/3 h-4" />
                <Skeleton className="w-full h-8 rounded-xl" />
                <Skeleton className="w-4/5 h-3" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="w-16 h-8 rounded-lg" />
                  <Skeleton className="w-20 h-8 rounded-lg" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground">Patient Queue Card Skeleton</span>
              <PatientCardSkeleton />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground">Consultation SOAP Note Skeleton</span>
              <ConsultationNoteSkeleton />
            </div>
          </div>
        </section>

        {/* 6. Toast Notification Triggers */}
        <section className="space-y-4" aria-labelledby="section-toasts">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="section-toasts" className="text-lg font-bold text-navy dark:text-white">
                6. {t("toastNotifications")}
              </h2>
              <p className="text-xs text-muted-foreground">
                Trigger interactive toasts with clinical severity levels.
              </p>
            </div>
          </div>

          <Card className="p-6">
            <div className="flex flex-wrap gap-3">
              <Button
                variant="coral"
                size="sm"
                onClick={() =>
                  addToast({
                    type: "urgent",
                    title: "URGENT: Anaphylaxis Risk Detected",
                    message: "Patient charted allergy to Sulfa drugs. Prescribed Bactrim DS flagged.",
                  })
                }
              >
                Trigger Urgent Coral Toast
              </Button>

              <Button
                variant="verified"
                size="sm"
                onClick={() =>
                  addToast({
                    type: "verified",
                    title: "Prescription Signed & Verified",
                    message: "Digital signature attached. Synced with Ayushman Bharat (ABDM).",
                  })
                }
              >
                Trigger Verified Toast
              </Button>

              <Button
                variant="warning"
                size="sm"
                onClick={() =>
                  addToast({
                    type: "warning",
                    title: "Dosage Adjustment Recommended",
                    message: "Creatinine clearance 42 mL/min warrants 50% dose reduction.",
                  })
                }
              >
                Trigger Warning Toast
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() =>
                  addToast({
                    type: "ai",
                    title: "AI Diagnostician Agent",
                    message: "Synthesized 3 differential diagnoses based on clinical discourse.",
                  })
                }
              >
                Trigger AI Agent Toast
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  addToast({
                    type: "info",
                    title: "OPD Shift Active",
                    message: "Dr. Aarav Mehta connected to Room 304 terminal.",
                  })
                }
              >
                Trigger Info Toast
              </Button>
            </div>
          </Card>
        </section>

        {/* 7. Empty States */}
        <section className="space-y-4" aria-labelledby="section-empty">
          <div>
            <h2 id="section-empty" className="text-lg font-bold text-navy dark:text-white">
              7. {t("emptyStates")}
            </h2>
            <p className="text-xs text-muted-foreground">
              Accessible, localized empty displays with contextual action buttons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyState
              icon={Users}
              title={t("emptyPatientsTitle")}
              description={t("emptyPatientsDesc")}
              actionLabel={t("startConsultation")}
              onAction={() =>
                addToast({
                  type: "info",
                  title: "Queue Initialized",
                  message: "Retrieving walk-in patients from ABDM registry.",
                })
              }
            />

            <EmptyState
              icon={Pill}
              title={t("emptyPrescriptionsTitle")}
              description={t("emptyPrescriptionsDesc")}
              actionLabel="Add Medication"
              onAction={() =>
                addToast({
                  type: "info",
                  title: "Rx Catalog",
                  message: "Opening Indian Pharmacopeia generic catalog.",
                })
              }
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
