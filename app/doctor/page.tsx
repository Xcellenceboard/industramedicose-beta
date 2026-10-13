"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { KeyboardShortcutsModal } from "@/components/doctor/KeyboardShortcutsModal";
import { VideoConsultationModal } from "@/components/telemedicine/VideoConsultationModal";
import {
  Clock,
  AlertOctagon,
  ArrowRight,
  Search,
  Volume2,
  VolumeX,
  Video,
  Bell,
  IndianRupee,
  User,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface QueueItem {
  id: string;
  uhid: string;
  patient: string;
  ageGender: string;
  bloodGroup?: string;
  chiefComplaint: string;
  aiSummaryReport?: string;
  vitals: string;
  urgency: "urgent" | "attention" | "routine";
  status: "intake" | "ready_for_review" | "in_review" | "approved" | "closed";
  intakeSeconds: number;
  documentsCount: number;
  allergies: string[];
  redFlag: string | null;
  startedAt: string;
  consultationFee?: number;
  appointmentMode?: "video" | "clinic" | "hybrid";
}

const INITIAL_QUEUE: QueueItem[] = [
  {
    id: "c-101",
    uhid: "UHID-2026-9041",
    patient: "Vikramaditya Rathore",
    ageGender: "54M",
    bloodGroup: "B+",
    chiefComplaint: "Acute retrosternal crushing chest pain radiating to left arm x 2 hours",
    aiSummaryReport: "AI Report Synthesis: Reconciled with ABDM health locker. Diabetic (8y), Hypertensive (5y). ECG confirms acute STEMI marker. Penicillin allergy flagged.",
    vitals: "BP: 130/85 | HR: 84 | SpO2: 98%",
    urgency: "urgent",
    status: "ready_for_review",
    intakeSeconds: 114,
    documentsCount: 2,
    allergies: ["Penicillin (Severe Hypersensitivity)"],
    redFlag: "Suspected Acute Coronary Syndrome (ACS) / STEMI Alert",
    startedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    consultationFee: 700,
    appointmentMode: "video",
  },
  {
    id: "c-102",
    uhid: "UHID-2026-1022",
    patient: "Aarav Sharma",
    ageGender: "45M",
    bloodGroup: "O+",
    chiefComplaint: "High grade intermittent fever with chills & body ache x 3 days",
    aiSummaryReport: "AI Report Synthesis: Seasonal viral profile. CBC shows normal platelets (210k). Routine antipyretic & hydration regimen advised.",
    vitals: "BP: 118/76 | HR: 90 | Temp: 101.4°F",
    urgency: "attention",
    status: "ready_for_review",
    intakeSeconds: 98,
    documentsCount: 1,
    allergies: [],
    redFlag: null,
    startedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    consultationFee: 500,
    appointmentMode: "hybrid",
  },
  {
    id: "c-103",
    uhid: "UHID-2026-3391",
    patient: "Sunita Devi",
    ageGender: "49F",
    bloodGroup: "A+",
    chiefComplaint: "Severe right knee joint pain and morning stiffness x 2 weeks",
    aiSummaryReport: "AI Report Synthesis: Grade 2 osteoarthritis markers on bilateral knee X-Ray. Recommends calcium & physiotherapy.",
    vitals: "BP: 125/80 | SpO2: 99%",
    urgency: "routine",
    status: "approved",
    intakeSeconds: 85,
    documentsCount: 1,
    allergies: [],
    redFlag: null,
    startedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    consultationFee: 650,
    appointmentMode: "clinic",
  },
];

// Web Audio API emergency chime
function playUrgentNotificationSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {}
}

export default function DoctorPortalPage() {
  const { addToast } = useToast();

  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterUrgency, setFilterUrgency] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [selectedIndex] = useState(0);

  // Video Consultation Modal
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedPatientForVideo, setSelectedPatientForVideo] = useState<QueueItem>(INITIAL_QUEUE[0]);

  // Appointment Reminder State
  const [activeReminder, setActiveReminder] = useState<{
    patient: string;
    time: string;
    type: string;
    symptoms: string;
  } | null>({
    patient: "Vikramaditya Rathore",
    time: "In 8 minutes (4:30 PM)",
    type: "Telemedicine Video Call",
    symptoms: "Acute retrosternal chest pain (ACS Alert)",
  });

  const prevUrgentCountRef = useRef(
    INITIAL_QUEUE.filter((q) => q.urgency === "urgent").length
  );

  // Poll & fetch live consultations
  const fetchLiveConsultations = useCallback(async () => {
    try {
      const res = await fetch("/api/consultations/live");
      if (!res.ok) return;
      const data = await res.json();
      if (!data.consultations || !Array.isArray(data.consultations)) return;

      const liveItems: QueueItem[] = data.consultations.map((c: Record<string, unknown>) => ({
        id: (c.id as string) || "c-live",
        uhid: (c.uhid as string) || `UHID-2026-${String(c.id || "").slice(0, 4).toUpperCase()}`,
        patient: (c.patient_name as string) || "Emergency Patient",
        ageGender: (c.age_gender as string) || "Adult",
        bloodGroup: (c.blood_group as string) || "O+",
        chiefComplaint: (c.chief_complaint as string) || "Patient intake evaluation reported",
        aiSummaryReport:
          "AI Report Synthesis: Multi-agent clinical summary extracted from intake chat and historical health files.",
        vitals: (c.vitals as string) || "BP: 120/80 | SpO2: 98%",
        urgency: ((c.urgency as string) || "routine") as QueueItem["urgency"],
        status: ((c.status as string) || "ready_for_review") as QueueItem["status"],
        intakeSeconds: (c.intake_duration_seconds as number) || 60,
        documentsCount: (c.documents_count as number) || 0,
        allergies: (c.allergies as string[]) || [],
        redFlag: (c.red_flag as string | null) || null,
        startedAt: (c.created_at as string) || new Date().toISOString(),
        consultationFee: 700,
        appointmentMode: "video",
      }));

      setQueue((prev) => {
        const prevIds = new Set(prev.map((p) => p.id));
        const hasNewUrgent = liveItems.some((n) => !prevIds.has(n.id) && n.urgency === "urgent");
        if (hasNewUrgent && soundEnabled && prev.length > 0) {
          playUrgentNotificationSound();
          addToast({
            type: "urgent",
            title: "🚨 New Urgent Patient In Queue",
            message: "Emergency patient arrived with critical symptom triage.",
          });
        }
        return liveItems.length > 0 ? liveItems : prev;
      });
    } catch {}
  }, [addToast, soundEnabled]);

  useEffect(() => {
    fetchLiveConsultations();
    const interval = setInterval(fetchLiveConsultations, 6000);
    return () => clearInterval(interval);
  }, [fetchLiveConsultations]);

  // Load upcoming appointment reminders dynamically from Supabase
  useEffect(() => {
    async function loadDoctorAppointments() {
      try {
        const res = await fetch("/api/appointments?doctorId=doc-meera");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.appointments) && data.appointments.length > 0) {
            const firstApt = data.appointments[0];
            setActiveReminder({
              patient: firstApt.patient_name || "Patient",
              time: firstApt.time_slot || "Upcoming",
              type: firstApt.mode === "video" ? "Telemedicine Video Call" : "OPD Clinic",
              symptoms: firstApt.symptoms || "Scheduled intake consultation",
            });
          }
        }
      } catch {}
    }
    loadDoctorAppointments();
  }, []);

  // Audio chime when urgent count changes
  useEffect(() => {
    const urgentCount = queue.filter((q) => q.urgency === "urgent").length;
    if (urgentCount > prevUrgentCountRef.current && soundEnabled) {
      playUrgentNotificationSound();
    }
    prevUrgentCountRef.current = urgentCount;
  }, [queue, soundEnabled]);

  // Sorting: Urgent first
  const sortedQueue = [...queue].sort((a, b) => {
    if (a.urgency === "urgent" && b.urgency !== "urgent") return -1;
    if (b.urgency === "urgent" && a.urgency !== "urgent") return 1;
    if (a.urgency === "attention" && b.urgency === "routine") return -1;
    if (b.urgency === "attention" && a.urgency === "routine") return 1;
    return new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
  });

  const filteredQueue = sortedQueue.filter((item) => {
    const matchesSearch =
      item.patient.toLowerCase().includes(search.toLowerCase()) ||
      item.uhid.toLowerCase().includes(search.toLowerCase()) ||
      item.chiefComplaint.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    const matchesUrgency = filterUrgency === "all" || item.urgency === filterUrgency;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  // Calculate earnings from fees
  const totalFeesEarned = queue.reduce((acc, curr) => acc + (curr.consultationFee || 700), 12500);

  const startVideoCall = (item: QueueItem) => {
    setSelectedPatientForVideo(item);
    setIsVideoModalOpen(true);
  };

  const urgentCount = queue.filter((c) => c.urgency === "urgent").length;
  const waitingCount = queue.filter((c) => c.status === "ready_for_review" || c.status === "in_review").length;
  const approvedCount = queue.filter((c) => c.status === "approved").length;

  return (
    <AppShell>
      <div className="space-y-6 pb-16">
        {/* Clinician Duty Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-navy-700 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="verified" size="sm" className="bg-teal-500 text-white">
                Doctor On Duty &bull; Hybrid Telemedicine &amp; OPD
              </Badge>
              <Badge variant="ai" size="sm" pulse>
                AI Scribe &amp; Appointment Agent: Active
              </Badge>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? "Mute urgent alert chime" : "Enable urgent alert chime"}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors ml-1"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy dark:text-white">
              Dr. Meera Rathore, MD (Cardiology)
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              AIIMS Jodhpur OPD &bull; Reg: RJ-MED-2016-8921 &bull; Consultation Fee: ₹700 &bull; Work Mode: Hybrid
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Quick Switch to Patient Panel */}
            <Link href="/patient">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-500 text-teal-700 dark:text-teal-300 bg-teal-50/80 dark:bg-navy-800 text-xs font-bold hover:bg-teal-100 transition-all shadow-sm min-h-[36px]"
              >
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span>View Patient Panel</span>
              </button>
            </Link>

            <Link href="/directory">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs font-semibold text-muted-foreground hover:text-foreground shadow-sm transition-all min-h-[36px]"
              >
                <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
                <span>Medical Directory</span>
              </button>
            </Link>

            <Button
              variant="default"
              size="sm"
              leftIcon={<Video className="w-4 h-4" />}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-teal-glow min-h-[36px]"
              onClick={() => startVideoCall(queue[0])}
            >
              Start Video Consultation
            </Button>
          </div>
        </div>

        {/* 1. UPCOMING APPOINTMENT REMINDER WIDGET (Saves Doctor's Time) */}
        {activeReminder && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-navy-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 text-white">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-mint-200">
                    AI Appointment Reminder &bull; Doctor Time Saver
                  </span>
                  <Badge variant="verified" size="sm" className="bg-amber-400 text-navy font-bold">
                    {activeReminder.time}
                  </Badge>
                </div>
                <h3 className="font-extrabold text-base text-white">
                  Upcoming Appointment: {activeReminder.patient} ({activeReminder.type})
                </h3>
                <p className="text-xs text-mint-100/90 leading-tight">
                  {activeReminder.symptoms} &bull; AI summary and historical reports pre-loaded for 2-minute review.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <Button
                variant="default"
                size="sm"
                className="bg-white hover:bg-slate-100 text-teal-800 font-bold text-xs flex-1 md:flex-initial shadow-md"
                onClick={() => startVideoCall(queue[0])}
                leftIcon={<Video className="w-4 h-4 text-teal-600" />}
              >
                Join Video Call Now
              </Button>

              <button
                type="button"
                onClick={() => setActiveReminder(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Doctor Earnings & Velocity Analytics Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 space-y-1 shadow-soft">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Consultancy Fees Earned
            </span>
            <div className="text-2xl font-extrabold text-teal-600 flex items-center gap-1">
              <IndianRupee className="w-5 h-5" />
              <span>{totalFeesEarned.toLocaleString()}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Hybrid &amp; Telemedicine billing</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 space-y-1 shadow-soft">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Patients In Queue
            </span>
            <div className="text-2xl font-extrabold text-foreground">{queue.length}</div>
            <p className="text-[11px] text-muted-foreground">{waitingCount} ready for doctor review</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 space-y-1 shadow-soft">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Urgent Triages
            </span>
            <div className="text-2xl font-extrabold text-coral-600">{urgentCount}</div>
            <p className="text-[11px] text-muted-foreground">Critical red flag alerts</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 space-y-1 shadow-soft">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Prescriptions Signed
            </span>
            <div className="text-2xl font-extrabold text-emerald-600">{approvedCount}</div>
            <p className="text-[11px] text-muted-foreground">Avg review time: 1.8 mins</p>
          </div>
        </div>

        {/* Live Counter & Queue Status Banner */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-sm font-bold tracking-tight text-white">
                Live OPD &amp; Telemedicine Queue
              </span>
            </div>
            <span className="text-slate-400 text-xs font-medium">|</span>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-white">{waitingCount} Waiting</span>
              <span className="text-slate-400">&bull;</span>
              <span className="font-extrabold text-coral-400 flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 animate-pulse" />
                {urgentCount} Urgent Priority
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">Sitting at home &bull; Hybrid OPD</span>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, UHID, or chief complaint..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 text-xs overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shrink-0">
              {[
                { id: "all", label: "All" },
                { id: "ready_for_review", label: "Ready to Review" },
                { id: "approved", label: "Approved" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setFilterStatus(st.id)}
                  className={`px-2.5 py-1 rounded text-xs transition-all whitespace-nowrap ${
                    filterStatus === st.id
                      ? "bg-white dark:bg-navy-700 font-bold text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shrink-0">
              {[
                { id: "all", label: "All Urgency" },
                { id: "urgent", label: "Urgent" },
              ].map((ug) => (
                <button
                  key={ug.id}
                  type="button"
                  onClick={() => setFilterUrgency(ug.id)}
                  className={`px-2.5 py-1 rounded text-xs transition-all whitespace-nowrap ${
                    filterUrgency === ug.id
                      ? ug.id === "urgent"
                        ? "bg-coral-500 text-white font-bold shadow-2xs"
                        : "bg-white dark:bg-navy-700 font-bold text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {ug.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. PATIENT QUEUE CARDS WITH AI REPORT SUMMARY */}
        <div className="space-y-3.5">
          {filteredQueue.map((item, index) => {
            const isSelected = index === selectedIndex;
            const isUrgent = item.urgency === "urgent";

            return (
              <Card
                key={item.id}
                variant={isUrgent ? "urgent" : "default"}
                className={`p-5 transition-all relative ${
                  isSelected ? "ring-2 ring-teal-500 shadow-md" : "hover:border-teal-400/50"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={isUrgent ? "urgent" : item.urgency === "attention" ? "warning" : "info"}
                        size="sm"
                        pulse={isUrgent}
                      >
                        {item.urgency.toUpperCase()}
                      </Badge>

                      <Badge
                        variant={
                          item.status === "approved"
                            ? "verified"
                            : item.status === "ready_for_review"
                            ? "ai"
                            : "neutral"
                        }
                        size="sm"
                      >
                        {item.status.replace(/_/g, " ").toUpperCase()}
                      </Badge>

                      <span className="text-xs font-mono font-semibold text-foreground">
                        {item.uhid}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        &bull; {item.ageGender} {item.bloodGroup ? `(${item.bloodGroup})` : ""}
                      </span>

                      <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        Intake: {item.intakeSeconds}s
                      </span>

                      <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                        Fee: ₹{item.consultationFee || 700}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-navy dark:text-white">
                        {item.patient}
                      </h2>
                      {item.allergies.length > 0 && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-coral-500/10 text-coral-600 dark:text-coral-400 border border-coral-500/20">
                          ⚠️ Allergy: {item.allergies.join(", ")}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-foreground leading-relaxed">
                      <strong>Chief Complaint:</strong> {item.chiefComplaint}
                    </p>

                    {/* AI Short Summary of Reports */}
                    {item.aiSummaryReport && (
                      <div className="p-2.5 rounded-xl bg-mint-50 dark:bg-navy-800/80 border border-teal-200 dark:border-teal-800/60 text-xs text-teal-900 dark:text-teal-200">
                        <span className="font-bold flex items-center gap-1 text-[11px] text-teal-800 dark:text-teal-300 mb-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                          AI Synthesized Patient Summary &amp; Old Reports:
                        </span>
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                          {item.aiSummaryReport}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      <span className="font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-muted-foreground">
                        {item.vitals}
                      </span>

                      {item.redFlag && (
                        <span className="font-bold text-coral-600 dark:text-coral-400 flex items-center gap-1 bg-coral-50 dark:bg-coral-950/40 px-2 py-0.5 rounded border border-coral-200 dark:border-coral-800/50">
                          <AlertOctagon className="w-3.5 h-3.5" />
                          {item.redFlag}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Doctor Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-teal-500 text-teal-700 dark:text-teal-300 font-bold text-xs w-full sm:w-auto"
                      onClick={() => startVideoCall(item)}
                      leftIcon={<Video className="w-3.5 h-3.5 text-teal-600" />}
                    >
                      Treat via Video Call
                    </Button>

                    <Link href={`/doctor/consultation/${item.id}`} className="w-full sm:w-auto">
                      <Button
                        variant={item.status === "approved" ? "verified" : "default"}
                        size="sm"
                        className={`w-full sm:w-auto ${
                          isUrgent ? "bg-coral-500 hover:bg-coral-600 text-white font-bold" : "bg-teal-600 hover:bg-teal-700 text-white"
                        }`}
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        {item.status === "approved" ? "View Note" : "Review & Prescribe"}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Video Consultation Modal */}
      <VideoConsultationModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        patientName={selectedPatientForVideo.patient}
        patientAgeGender={selectedPatientForVideo.ageGender}
        doctorName="Dr. Meera Rathore"
        consultationFee={selectedPatientForVideo.consultationFee || 700}
        chiefComplaint={selectedPatientForVideo.chiefComplaint}
        aiSummary={selectedPatientForVideo.aiSummaryReport}
        onCompletePrescription={() => {
          setQueue((prev) =>
            prev.map((q) =>
              q.id === selectedPatientForVideo.id ? { ...q, status: "approved" } : q
            )
          );
        }}
      />

      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
    </AppShell>
  );
}
