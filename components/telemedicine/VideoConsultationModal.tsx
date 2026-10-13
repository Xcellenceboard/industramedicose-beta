"use client";

import React, { useState, useEffect } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  User,
  Sparkles,
  Calendar,
  Pill,
  CheckCircle2,
  IndianRupee,
  Heart,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

interface VideoConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  patientAgeGender?: string;
  doctorName?: string;
  consultationFee?: number;
  chiefComplaint?: string;
  aiSummary?: string;
  onCompletePrescription?: (prescription: {
    medicines: string;
    advice: string;
    nextAppointment: string;
  }) => void;
}

export function VideoConsultationModal({
  isOpen,
  onClose,
  patientName = "Vikramaditya Rathore",
  patientAgeGender = "54M",
  doctorName = "Dr. Meera Rathore",
  consultationFee = 700,
  chiefComplaint = "Crushing chest pain radiating to left arm x 2 hours",
  aiSummary = "Reconciled with ABDM health records: Diabetic (8y), Hypertensive (5y). ECG confirms STEMI alert.",
  onCompletePrescription,
}: VideoConsultationModalProps) {
  const { addToast } = useToast();

  const [callDuration, setCallDuration] = useState(0);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "prescription">("prescription");

  // Doctor prescription drafting state
  const [medicines, setMedicines] = useState(
    "1. Tab Ecosprin 75mg - 1 OD (Post lunch)\n2. Tab Atorvastatin 40mg - 1 HS\n3. Tab Telmisartan 40mg - 1 OD (Morning)"
  );
  const [clinicalAdvice, setClinicalAdvice] = useState(
    "Immediate bed rest. Avoid sudden exertion. Follow low sodium, low carbohydrate diet. Check BP daily."
  );
  const [nextAppointmentDate, setNextAppointmentDate] = useState("2026-10-20");
  const [isFinalizing, setIsFinalizing] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSignPrescription = () => {
    setIsFinalizing(true);
    setTimeout(() => {
      setIsFinalizing(false);
      addToast({
        type: "verified",
        title: "Prescription Signed & Processed",
        message: `Digital Rx generated for ${patientName}. Follow-up scheduled for ${nextAppointmentDate}. Fee ₹${consultationFee} logged.`,
      });
      onCompletePrescription?.({
        medicines,
        advice: clinicalAdvice,
        nextAppointment: nextAppointmentDate,
      });
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-navy-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-5xl rounded-3xl bg-white dark:bg-navy-900 border border-teal-500/30 shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Telemedicine Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-teal-800 to-navy-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-ping" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">
                  Live Telemedicine Video Consultation
                </h3>
                <Badge variant="verified" size="sm" className="bg-teal-500 text-white">
                  Hybrid Room
                </Badge>
              </div>
              <p className="text-xs text-mint-100/80 flex items-center gap-2">
                <span>{doctorName} &bull; {patientName} ({patientAgeGender})</span>
                <span>&bull; Duration: {formatTimer(callDuration)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-xs font-semibold">
              <IndianRupee className="w-3.5 h-3.5 text-teal-300" />
              <span>Consultancy Fee: ₹{consultationFee}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Area + Doctor Workbench Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-900">
          {/* Main Video Stream Window (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between p-4 relative bg-gradient-to-b from-navy-950 to-slate-900 border-r border-slate-800">
            {/* Top Overlay: Patient Info & Vitals */}
            <div className="flex items-center justify-between z-10">
              <div className="px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md text-white text-xs flex items-center gap-2 border border-white/10">
                <User className="w-3.5 h-3.5 text-teal-400" />
                <span className="font-bold">{patientName}</span>
                <span className="text-slate-400">({patientAgeGender})</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-xl bg-red-900/60 border border-red-500/40 text-red-200 text-[11px] font-bold flex items-center gap-1.5">
                  <Heart className="w-3 h-3 text-red-400 animate-pulse" />
                  <span>HR: 84 bpm</span>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-teal-900/60 border border-teal-500/40 text-teal-200 text-[11px] font-bold">
                  BP: 130/85
                </div>
              </div>
            </div>

            {/* Central Simulated Patient Video Feed */}
            <div className="my-auto flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="relative">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-teal-600 via-teal-700 to-navy-800 border-4 border-teal-400/40 shadow-2xl flex items-center justify-center text-white text-4xl font-extrabold animate-pulse">
                  {patientName.substring(0, 2).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 bg-teal-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full border border-teal-300">
                  Patient Live Video
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-white font-bold text-sm">
                  Connected via Encrypted ABDM Video Gateway
                </p>
                <p className="text-xs text-slate-400">
                  Audio: HD Spatial &bull; Video: 1080p 60fps &bull; Latency: 18ms
                </p>
              </div>
            </div>

            {/* Picture-in-Picture: Doctor Feed (bottom-right) */}
            <div className="absolute bottom-16 right-4 w-28 h-24 sm:w-36 sm:h-28 rounded-2xl bg-slate-800/90 border border-white/20 overflow-hidden shadow-2xl flex flex-col items-center justify-center p-2 text-white">
              <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center font-bold text-xs">
                DOC
              </div>
              <span className="text-[10px] font-bold mt-1 text-teal-300 truncate w-full text-center">
                {doctorName}
              </span>
              <span className="text-[9px] text-slate-400">Doctor (You)</span>
            </div>

            {/* Video Controls Bar */}
            <div className="flex items-center justify-center gap-3 pt-2 z-10">
              <button
                type="button"
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-3 rounded-2xl transition-all ${
                  audioEnabled
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : "bg-red-600 text-white shadow-lg"
                }`}
                title={audioEnabled ? "Mute Microphone" : "Unmute Microphone"}
              >
                {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`p-3 rounded-2xl transition-all ${
                  videoEnabled
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : "bg-red-600 text-white shadow-lg"
                }`}
                title={videoEnabled ? "Turn Off Camera" : "Turn On Camera"}
              >
                {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>
          </div>

          {/* Doctor Clinical Workspace & Prescription Pad (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-navy-900 flex flex-col h-full overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Tab switch between AI Summary & Prescription */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-navy-800 p-1 border border-slate-200 dark:border-navy-700">
              <button
                type="button"
                onClick={() => setActiveTab("prescription")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "prescription"
                    ? "bg-white dark:bg-navy-900 text-teal-700 dark:text-teal-300 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                <span>Prescription Pad</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("summary")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "summary"
                    ? "bg-white dark:bg-navy-900 text-teal-700 dark:text-teal-300 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Clinical Summary</span>
              </button>
            </div>

            {/* AI Summary Tab View */}
            {activeTab === "summary" && (
              <div className="space-y-3 animate-in fade-in text-xs">
                <div className="p-3.5 rounded-2xl bg-mint-50 dark:bg-navy-800 border border-teal-200 dark:border-teal-800 space-y-2">
                  <span className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>AI Synthesized Symptoms &amp; Old Reports</span>
                  </span>
                  <p className="text-foreground leading-relaxed">
                    <strong>Chief Complaint:</strong> {chiefComplaint}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>AI Analysis:</strong> {aiSummary}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200 dark:border-navy-700 space-y-1.5">
                  <span className="font-bold text-foreground">Verified Vitals:</span>
                  <p className="text-muted-foreground">Blood Pressure: 130/85 mmHg &bull; SpO2: 98% &bull; Pulse: 84 bpm</p>
                  <p className="text-muted-foreground">Allergies: Penicillin (Severe) &bull; Mode: Hybrid Telemedicine</p>
                </div>
              </div>
            )}

            {/* Prescription Pad Tab View */}
            {activeTab === "prescription" && (
              <div className="space-y-3.5 animate-in fade-in flex-1 flex flex-col">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-teal-600" />
                    <span>Recommend Medicines &amp; Dosages</span>
                  </label>
                  <textarea
                    rows={4}
                    value={medicines}
                    onChange={(e) => setMedicines(e.target.value)}
                    placeholder="E.g., 1. Tab Paracetamol 650mg TDS x 3 days..."
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">
                    Doctor Advice &amp; Lifestyle Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={clinicalAdvice}
                    onChange={(e) => setClinicalAdvice(e.target.value)}
                    placeholder="Dietary instructions, rest, precautions..."
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>Schedule Next Follow-Up Appointment</span>
                  </label>
                  <input
                    type="date"
                    value={nextAppointmentDate}
                    onChange={(e) => setNextAppointmentDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="mt-auto pt-3 space-y-2">
                  <Button
                    type="button"
                    variant="default"
                    size="md"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 shadow-teal-glow"
                    isLoading={isFinalizing}
                    onClick={handleSignPrescription}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    AI Process &amp; Sign Digital Prescription
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground">
                    Instantly sent to patient dashboard &bull; ABDM compliant digital signature
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
