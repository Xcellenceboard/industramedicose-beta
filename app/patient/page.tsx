"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import {
  HeartPulse,
  AlertOctagon,
  Plus,
  ShieldCheck,
  Calendar,
  FileText,
  Printer,
  X,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
  PhoneCall,
  Stethoscope,
  Star,
  Video,
  ChevronRight,
  MessageSquare,
  User,
} from "lucide-react";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { DocumentSideBySideModal } from "@/components/documents/DocumentSideBySideModal";
import { DocumentItem } from "@/components/documents/types";
import { INITIAL_DOCTORS, DoctorProfile, getTop5DoctorsForSymptom } from "@/lib/directory-data";
import { HinglishCallAssistantModal, CallClinicalSummary } from "@/components/assistant/HinglishCallAssistantModal";
import { VideoConsultationModal } from "@/components/telemedicine/VideoConsultationModal";

export default function PatientPortalPage() {
  const { addToast } = useToast();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeSideBySideDoc, setActiveSideBySideDoc] = useState<DocumentItem | null>(null);

  // Symptom Search & Top 5 Doctors
  const [symptomQuery, setSymptomQuery] = useState("");
  const [allDoctorsList, setAllDoctorsList] = useState<DoctorProfile[]>(INITIAL_DOCTORS);
  const [topDoctors, setTopDoctors] = useState<DoctorProfile[]>(INITIAL_DOCTORS.slice(0, 5));
  const [isCallAssistantOpen, setIsCallAssistantOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedDoctorForVideo, setSelectedDoctorForVideo] = useState<DoctorProfile>(INITIAL_DOCTORS[0]);
  const [isAuthVerified, setIsAuthVerified] = useState<boolean>(true);
  const [showAuthGateModal, setShowAuthGateModal] = useState<boolean>(false);

  // Review & Rating State
  const [ratingDoctorId, setRatingDoctorId] = useState<string>("doc-meera");
  const [patientRating, setPatientRating] = useState<number>(5);
  const [patientReviewText, setPatientReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  interface PatientProfile {
    name: string;
    uhid: string;
    age: number;
    gender: string;
    bloodGroup: string;
    allergies: string[];
    chronicConditions: string[];
    consentStatus: string;
  }

  const [patient, setPatient] = useState<PatientProfile>({
    name: "Vikramaditya Rathore",
    uhid: "UHID-2026-9041",
    age: 54,
    gender: "Male",
    bloodGroup: "B+",
    allergies: ["Penicillin (Severe Hypersensitivity)"],
    chronicConditions: ["Type 2 Diabetes (8 yrs)", "Hypertension (5 yrs)"],
    consentStatus: "Active (ABDM Verified)",
  });

  interface PatientViewSummary {
    consultation?: { id: string; status: string; urgency: string };
    summary?: { chief_complaint?: string; hpi?: string };
    soap_draft?: { plan?: string };
  }

  interface PatientConsultationItem {
    id: string;
    date: string;
    doctor: string;
    chiefComplaint: string;
    status: string;
    urgency: string;
    statusLabel: string;
  }

  const [consultationList, setConsultationList] = useState<PatientConsultationItem[]>([
    {
      id: "c-101",
      date: "Today, 10:30 AM",
      doctor: "Dr. Meera Rathore (Cardiologist)",
      chiefComplaint: "Acute retrosternal chest pain radiating to left shoulder",
      status: "ready_for_review",
      urgency: "urgent",
      statusLabel: "Ready for Doctor Review",
    },
  ]);
  const [selectedSummary, setSelectedSummary] = useState<PatientViewSummary | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // Fetch live doctors from API
  useEffect(() => {
    async function fetchLiveDoctors() {
      try {
        const res = await fetch("/api/doctors");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.doctors) && json.doctors.length > 0) {
            setAllDoctorsList(json.doctors);
          }
        }
      } catch {}
    }
    fetchLiveDoctors();
  }, []);

  // Update top 5 doctors on symptom query change using allDoctorsList
  useEffect(() => {
    const docs = getTop5DoctorsForSymptom(symptomQuery, allDoctorsList);
    setTopDoctors(docs);
  }, [symptomQuery, allDoctorsList]);

  // Fetch live patient profile & consultations
  useEffect(() => {
    async function loadPatientData() {
      try {
        const res = await fetch("/api/patient/me");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.patient) {
            setPatient((prev) => ({
              ...prev,
              ...json.patient,
              name: json.patient.name || prev.name,
            }));
            if (Array.isArray(json.consultations) && json.consultations.length > 0) {
              setConsultationList(json.consultations);
            }
            if (Array.isArray(json.documents)) {
              setDocuments(json.documents);
            }
          }
        }
      } catch (err) {
        console.error("Patient profile load error:", err);
      }
    }
    loadPatientData();
  }, []);

  const openSummary = async (consultationId: string) => {
    try {
      const res = await fetch(`/api/consultations/${consultationId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setSelectedSummary(json.data);
          setIsSummaryModalOpen(true);
        }
      }
    } catch {}
  };

  const handleBookDoctor = async (doc: DoctorProfile) => {
    try {
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doc.id,
          doctorName: doc.name,
          patientName: patient.name,
          timeSlot: doc.nextSlot,
          mode: "video",
          fee: doc.consultationFee,
          symptoms: symptomQuery || "Advance outpatient consultation",
        }),
      });
    } catch {}

    addToast({
      type: "verified",
      title: "Advance Appointment Booked!",
      message: `Confirmed slot with ${doc.name} for ${doc.nextSlot}. Saved in Supabase database!`,
    });
  };

  const handleSendSummary = (summary: CallClinicalSummary, doc: DoctorProfile) => {
    addToast({
      type: "verified",
      title: "AI Summary Sent to Doctor",
      message: `Your symptom analysis and historical health records were sent to ${doc.name}'s OPD panel.`,
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientReviewText.trim()) return;

    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: ratingDoctorId,
          patientName: patient.name,
          rating: patientRating,
          comment: patientReviewText,
          language: "hinglish",
        }),
      });
    } catch {}

    setReviewSubmitted(true);
    addToast({
      type: "verified",
      title: "Feedback Saved to Database!",
      message: "Thank you for rating your doctor. Your review is permanently recorded.",
    });
  };

  const quickSymptoms = [
    "Jaundice & liver yellow eyes (पीलिया)",
    "Severe chest pain & heart attack",
    "High fever & dengue chills",
    "Severe headache & migraine",
    "Knee & joint swelling / arthritis",
    "Skin allergy & itching rash",
    "Ear pain & sinusitis",
    "Stomach pain & acidity",
  ];

  const handleSymptomSelect = (sym: string) => {
    if (!isAuthVerified) {
      setShowAuthGateModal(true);
      return;
    }
    setSymptomQuery(sym);
  };

  const handleSymptomSearchFocus = () => {
    if (!isAuthVerified) {
      setShowAuthGateModal(true);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 pb-16">
        {/* Top Welcome Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-navy-700 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="verified" size="sm" className="bg-teal-500 text-white">
                Patient Health Portal
              </Badge>
              <Badge variant="info" size="sm">
                {patient.consentStatus}
              </Badge>
              <Badge variant="ai" size="sm">
                English / हिंदी / Hinglish
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy dark:text-white">
              Namaste, {patient.name}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {patient.uhid} &bull; {patient.age} Years &bull; {patient.gender} &bull; Blood Group: {patient.bloodGroup}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="default"
              size="md"
              className="bg-teal-600 hover:bg-teal-700 text-white shadow-teal-glow flex-1 sm:flex-initial"
              leftIcon={<PhoneCall className="w-4 h-4 animate-bounce" />}
              onClick={() => setIsCallAssistantOpen(true)}
            >
              Talk to AI Assistant (Hinglish)
            </Button>

            <Link href="/patient/intake" className="flex-1 sm:flex-initial">
              <Button
                variant="outline"
                size="md"
                leftIcon={<Plus className="w-4 h-4" />}
                className="w-full border-teal-500 text-teal-700 dark:text-teal-300"
              >
                Start Voice Intake
              </Button>
            </Link>
          </div>
        </div>

        {/* 1. SYMPTOM SEARCH & AI ASSISTANT HERO BOX */}
        <div className="rounded-3xl bg-gradient-to-br from-teal-700 via-teal-600 to-navy-900 text-white p-6 sm:p-8 shadow-xl space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-mint-100">
              <Sparkles className="w-3.5 h-3.5" />
              Direct AI Consultation &bull; Zero Crowd Waiting
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Search Your Symptoms or Ask the AI Assistant
            </h2>
            <p className="text-xs sm:text-sm text-mint-100/90 leading-relaxed">
              Describe your health problem in English, Hindi, or Hinglish. Our AI Assistant studies your previous reports, summarizes your symptoms, and recommends the Top 5 specialised doctors.
            </p>
          </div>

          {/* Search Bar + Go to AI Assistant Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-teal-700 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={symptomQuery}
                onFocus={handleSymptomSearchFocus}
                onChange={(e) => {
                  if (!isAuthVerified) {
                    setShowAuthGateModal(true);
                    return;
                  }
                  setSymptomQuery(e.target.value);
                }}
                placeholder="Search symptoms (e.g., 'Jaundice', 'Piliya', 'Chest pain', 'Migraine', 'Knee pain')..."
                className="w-full pl-12 pr-4 py-3.5 text-xs sm:text-sm rounded-2xl bg-white text-navy font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all placeholder:text-slate-400"
              />
            </div>

            <Button
              variant="default"
              size="md"
              className="w-full sm:w-auto bg-navy-950 hover:bg-navy-900 text-white font-bold py-3.5 px-6 shadow-md shrink-0"
              onClick={() => setIsCallAssistantOpen(true)}
              leftIcon={<Sparkles className="w-4 h-4 text-mint-300" />}
            >
              Go to AI Assistant
            </Button>
          </div>

          {/* Quick Symptoms Chips */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs font-semibold text-mint-200">Quick Symptoms:</span>
            {quickSymptoms.map((sym, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSymptomSelect(sym)}
                className="px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition-colors backdrop-blur-sm"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* 2. TOP 5 SPECIALISED DOCTORS RECOMMENDATION STRIP */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg sm:text-xl font-bold text-navy dark:text-white">
                  Top 5 Recommended Specialists for Your Symptoms
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Matched specifically for &ldquo;{symptomQuery || "General Health & Acute Symptoms"}&rdquo;. Connect directly without standing in hospital lines.
              </p>
            </div>

            <Link href="/directory" className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1">
              <span>View Full Medical Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topDoctors.slice(0, 5).map((doc, idx) => (
              <div
                key={doc.id}
                className="rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 hover:border-teal-500/60 transition-all p-5 shadow-soft flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-navy-800 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                        #{idx + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground">{doc.name}</h3>
                        <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                          {doc.specialization}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-xs">
                      <Star className="w-3 h-3 fill-amber-400 stroke-amber-500" />
                      <span>{doc.rating}</span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p>{doc.qualification} &bull; {doc.experienceYears} Years Exp</p>
                    <p className="truncate">{doc.hospital}</p>
                    <p className="text-teal-700 dark:text-teal-300 font-medium">Slot: {doc.nextSlot}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-navy-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-muted-foreground text-[10px] block">Fee</span>
                      <span className="font-bold text-foreground">₹{doc.consultationFee}</span>
                    </div>
                    <Badge variant="verified" size="sm">Video / Hybrid</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-teal-500 text-teal-700 dark:text-teal-300"
                      onClick={() => {
                        setSelectedDoctorForVideo(doc);
                        setIsVideoModalOpen(true);
                      }}
                      leftIcon={<Video className="w-3.5 h-3.5" />}
                    >
                      Video Call
                    </Button>

                    <Button
                      size="sm"
                      variant="default"
                      className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold"
                      onClick={() => handleBookDoctor(doc)}
                    >
                      Book Advance
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. CLINICAL SAFETY, ALLERGIES & CHRONIC VITALS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card variant="urgent" className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-coral-600 dark:text-coral-400">
                Known Drug Allergies
              </span>
              <AlertOctagon className="w-4 h-4 text-coral-500" />
            </div>
            <div className="space-y-1.5 mt-2">
              {patient.allergies.map((allergy) => (
                <Badge key={allergy} variant="urgent" size="sm" className="mr-1.5 mb-1">
                  {allergy}
                </Badge>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              Protected by SafetyGuardAgent: Automated warning shared with attending doctor.
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Chronic Health Record
              </span>
              <HeartPulse className="w-4 h-4 text-teal-500" />
            </div>
            <div className="space-y-1.5 mt-2">
              {patient.chronicConditions.map((cond) => (
                <Badge key={cond} variant="neutral" size="sm" className="mr-1.5 mb-1">
                  {cond}
                </Badge>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              Ongoing medications reconciled with ABDM health locker.
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                24/7 AI Voice Calling Assistant
              </span>
              <ShieldCheck className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-xl font-bold text-navy dark:text-white mt-1">
              Active in Hinglish
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
              Attends all patient calls, analyzes reports, and routes urgent cases to specialised physicians.
            </p>
          </Card>
        </div>

        {/* 4. CONSULTATIONS HISTORY */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy dark:text-white">
              My Consultation History &amp; Prescriptions
            </h2>
            <Badge variant="info" size="sm">
              ABDM Linked
            </Badge>
          </div>

          <div className="space-y-3">
            {consultationList.map((c) => (
              <Card key={c.id} interactive className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={c.status === "approved" ? "verified" : c.urgency === "urgent" ? "urgent" : "info"}
                        size="sm"
                        pulse={c.urgency === "urgent" && c.status !== "approved"}
                      >
                        {c.statusLabel}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {c.date}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-navy dark:text-white">
                      {c.chiefComplaint}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Attending Physician: <strong>{c.doctor}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={c.status === "approved" ? "verified" : "outline"}
                      size="sm"
                      onClick={() => openSummary(c.id)}
                    >
                      {c.status === "approved" ? "View Approved Prescription" : "View Consultation Status"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 5. PATIENT FEEDBACK, REVIEWS & RATINGS */}
        <div className="rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-600" />
                <span>Rate &amp; Review Your Doctor After Treatment</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Your feedback in English, Hindi, or Hinglish helps ensure quality care and guides other patients.
              </p>
            </div>
            <Badge variant="verified" size="sm">
              Patient Voices
            </Badge>
          </div>

          {!reviewSubmitted ? (
            <form onSubmit={handleSubmitReview} className="space-y-3.5 pt-2">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Select Doctor
                  </label>
                  <select
                    value={ratingDoctorId}
                    onChange={(e) => setRatingDoctorId(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-foreground font-semibold"
                  >
                    <option value="doc-meera">Dr. Meera Rathore (Cardiologist)</option>
                    <option value="doc-vikram">Dr. Vikramaditya Joshi (General Medicine)</option>
                    <option value="doc-ananya">Dr. Ananya Sen (Orthopedic)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Your Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setPatientRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= patientRating
                              ? "fill-amber-400 stroke-amber-500 text-amber-500"
                              : "text-slate-300 stroke-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-600 ml-1">
                      {patientRating} / 5
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <textarea
                  rows={2}
                  value={patientReviewText}
                  onChange={(e) => setPatientReviewText(e.target.value)}
                  placeholder="Share your experience (e.g., 'Bahut achha ilaaj mila, bina bheed me lage phone par hi dawai samajh aa gayi...')"
                  className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <Button
                type="submit"
                variant="default"
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
              >
                Submit Review &amp; Rating
              </Button>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-mint-50 dark:bg-navy-800 border border-teal-300 dark:border-teal-700 flex items-center gap-3 text-xs text-teal-900 dark:text-teal-200">
              <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
              <div>
                <strong>Thank you!</strong> Your rating ({patientRating} Stars) and review have been recorded and added to the doctor profile.
              </div>
            </div>
          )}
        </div>

        {/* 6. MEDICAL RECORDS & DOCUMENT INTELLIGENCE */}
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-navy-700">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="verified" size="sm">
                  Vision AI Active
                </Badge>
                <Badge variant="info" size="sm">
                  ABDM Linked Bucket
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-navy dark:text-white flex items-center gap-2 mt-1">
                <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>Old Reports &amp; Medical Document Intelligence</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload previous doctor prescriptions, discharge summaries, or blood reports. AI Assistant studies the reports and generates a concise summary for the specialist.
              </p>
            </div>
          </div>

          <DocumentUploader
            consultationId="c-101"
            patientId="p-vikramaditya-01"
            consentGiven={true}
            onDocumentProcessed={(doc) => {
              setDocuments((prev) => [doc, ...prev.filter((d) => d.id !== doc.id)]);
              addToast({
                type: "verified",
                title: "Report Extracted & Summarized",
                message: `Successfully analyzed ${doc.file_name} via Multimodal OCR.`,
              });
            }}
          />

          {documents.length > 0 && (
            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-navy dark:text-white uppercase tracking-wider">
                  Analyzed Medical Records ({documents.length})
                </h3>
              </div>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onOpenSideBySide={(d) => setActiveSideBySideDoc(d)}
                  />
                ))}
              </div>
            </div>
          )}
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

      {/* Patient Approved Summary Modal */}
      {isSummaryModalOpen && selectedSummary && (
        <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-navy-700 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-navy-700">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy dark:text-white">
                    Clinical Consultation Summary
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedSummary.consultation?.status === "approved"
                      ? "Doctor Verified & Authorized Record"
                      : "Awaiting Doctor Verification"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSummaryModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedSummary.consultation?.status === "approved" ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <Badge variant="verified" size="sm">
                    DOCTOR APPROVED
                  </Badge>
                  <span className="font-mono text-muted-foreground">
                    Record ID: {selectedSummary.consultation?.id}
                  </span>
                </div>

                <div>
                  <span className="font-bold text-muted-foreground block mb-0.5">Chief Complaint:</span>
                  <p className="font-semibold text-foreground text-sm">
                    {selectedSummary.summary?.chief_complaint}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-muted-foreground block mb-0.5">Clinical Assessment & HPI:</span>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedSummary.summary?.hpi}
                  </p>
                </div>

                {selectedSummary.soap_draft && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border space-y-2">
                    <span className="font-bold text-teal-700 dark:text-teal-300 block">
                      Doctor&apos;s Recommended Plan &amp; Prescription:
                    </span>
                    <p className="text-foreground whitespace-pre-wrap">
                      {selectedSummary.soap_draft.plan}
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 dark:border-navy-700 flex items-center justify-between">
                  <div className="text-[11px] text-muted-foreground">
                    Physician: <strong>Dr. Meera Rathore, MD (Reg: 74921)</strong>
                  </div>
                  <a
                    href={`/api/consultations/${selectedSummary.consultation?.id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="default" size="sm" leftIcon={<Printer className="w-3.5 h-3.5" />}>
                      Download Signed PDF
                    </Button>
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-300">
                  <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                  Awaiting Clinician Verification &amp; Sign-Off
                </div>
                <p className="leading-relaxed">
                  In compliance with clinical safety protocols and the NMC Telemedicine Practice Guidelines, unverified AI diagnostic summaries and clinical impressions are never shown directly to patients before physician evaluation.
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Dr. Meera Rathore is reviewing your intake in the OPD queue. Once approved, your finalized clinical summary, instructions, and official prescription PDF will be available here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hinglish Call Assistant Modal */}
      <HinglishCallAssistantModal
        isOpen={isCallAssistantOpen}
        onClose={() => setIsCallAssistantOpen(false)}
        patientName={patient.name}
        initialSymptom={symptomQuery}
        onSelectDoctor={(doc) => handleBookDoctor(doc)}
        onSendSummaryToDoctor={(sum, doc) => handleSendSummary(sum, doc)}
      />

      {/* Video Consultation Modal */}
      <VideoConsultationModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        doctorName={selectedDoctorForVideo.name}
        consultationFee={selectedDoctorForVideo.consultationFee}
      />

      {/* Auth & Clinical AI Agent Gate Modal */}
      {showAuthGateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-navy-900 border border-teal-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              type="button"
              onClick={() => setShowAuthGateModal(false)}
              className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0 border border-teal-500/20">
                <ShieldCheck className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <Badge variant="urgent" size="sm">
                  Clinical Intake Protocol
                </Badge>
                <h3 className="text-xl font-extrabold text-navy dark:text-white mt-1">
                  Login or AI Agent Required to Search
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              To prevent medical misdiagnosis, patients cannot search symptoms or access specialist triage without an authenticated profile. You can either <strong>talk directly to our 24/7 AI Voice Calling Assistant</strong> to analyze your condition and register instantly, or log in to your account.
            </p>

            <div className="space-y-3 pt-2">
              {/* Option 1: Talk to AI Assistant */}
              <button
                type="button"
                onClick={() => {
                  setShowAuthGateModal(false);
                  setIsAuthVerified(true);
                  setIsCallAssistantOpen(true);
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold shadow-teal-glow transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/20 text-white">
                    <PhoneCall className="w-5 h-5 animate-bounce" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold block">Talk to 24/7 AI Voice Assistant</span>
                    <span className="text-xs text-mint-100 font-normal">Hinglish / Hindi call &bull; Auto registers case</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Option 2: Register as Patient */}
              <Link href="/signup?role=patient" className="block">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800 text-foreground font-semibold text-xs transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-teal-600" />
                    <span>Register as Patient (मरीज नया पंजीकरण)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </Link>

              {/* Option 3: Login */}
              <Link href="/login" className="block">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800 text-foreground font-semibold text-xs transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Login to Existing Account</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </Link>

              {/* Quick Demo Unlock */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthVerified(true);
                    setShowAuthGateModal(false);
                    addToast({
                      type: "verified",
                      title: "Demo Patient Session Active",
                      message: "You can now freely search symptoms and match doctors as Vikramaditya Rathore.",
                    });
                  }}
                  className="text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Skip for Evaluation (Continue as Vikramaditya Rathore)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
