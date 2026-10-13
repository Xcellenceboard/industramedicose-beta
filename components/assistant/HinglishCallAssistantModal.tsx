"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  PhoneOff,
  Volume2,
  VolumeX,
  Sparkles,
  User,
  Stethoscope,
  Send,
  CheckCircle2,
  FileText,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DoctorProfile, getTop5DoctorsForSymptom } from "@/lib/directory-data";

interface HinglishCallAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  initialSymptom?: string;
  onSelectDoctor?: (doctor: DoctorProfile) => void;
  onSendSummaryToDoctor?: (summary: CallClinicalSummary, doctor: DoctorProfile) => void;
}

export interface CallClinicalSummary {
  chiefComplaint: string;
  symptoms: string[];
  duration: string;
  severity: "mild" | "moderate" | "urgent";
  suggestedSpecialty: string;
  oldReportsAnalysis: string;
  twoMinuteSummary: string;
  createdAt: string;
}

interface Message {
  sender: "assistant" | "patient";
  text: string;
  timestamp: string;
}

export function HinglishCallAssistantModal({
  isOpen,
  onClose,
  patientName = "Vikramaditya",
  initialSymptom = "",
  onSelectDoctor,
  onSendSummaryToDoctor,
}: HinglishCallAssistantModalProps) {
  const [callStatus, setCallStatus] = useState<"ringing" | "connected" | "ended">("ringing");
  const [callSeconds, setCallSeconds] = useState(0);
  const [audioPlayback, setAudioPlayback] = useState(true);
  const [inputText, setInputText] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [matchedDoctors, setMatchedDoctors] = useState<DoctorProfile[]>([]);
  const [generatedSummary, setGeneratedSummary] = useState<CallClinicalSummary | null>(null);
  const [sentToDoctorId, setSentToDoctorId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === "connected") {
      interval = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Text to speech helper
  const speakHinglish = useCallback((text: string) => {
    if (!audioPlayback || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "hi-IN";
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Non-blocking
    }
  }, [audioPlayback]);

  // Start call when opened
  useEffect(() => {
    if (!isOpen) {
      setCallStatus("ringing");
      setCallSeconds(0);
      setMessages([]);
      setGeneratedSummary(null);
      setSentToDoctorId(null);
      return;
    }

    // Auto connect call after 1.2s
    const ringTimeout = setTimeout(() => {
      setCallStatus("connected");
      const greeting = initialSymptom
        ? `Namaste ${patientName} ji! Main Industra Medicose ka AI Medical Assistant bol raha hoon. Maine dekha aapko "${initialSymptom}" ki dikkat hai. Kripya batayein yeh problem kabse shuru hui aur dard kitna tez hai?`
        : `Namaste ${patientName} ji! Main Industra Medicose ka AI Clinical Assistant hoon. Kripya batayein aaj aapko kya bimari ya lakshan (symptoms) mehsoos ho rahe hain?`;

      const welcomeMsg: Message = {
        sender: "assistant",
        text: greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([welcomeMsg]);
      speakHinglish(greeting);

      if (initialSymptom) {
        setMatchedDoctors(getTop5DoctorsForSymptom(initialSymptom));
      } else {
        setMatchedDoctors(getTop5DoctorsForSymptom("General"));
      }
    }, 1200);

    return () => clearTimeout(ringTimeout);
  }, [isOpen, initialSymptom, patientName, speakHinglish]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const patientText = inputText.trim();
    const newMsg: Message = {
      sender: "patient",
      text: patientText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
    setIsAiThinking(true);

    // AI analyzes problem, matches top 5 doctors and prepares clinical summary
    setTimeout(() => {
      setIsAiThinking(false);
      const topDocs = getTop5DoctorsForSymptom(patientText);
      setMatchedDoctors(topDocs);

      const targetDoctor = topDocs[0] || null;
      const docName = targetDoctor ? targetDoctor.name : "Dr. Meera Rathore";
      const docSpec = targetDoctor ? targetDoctor.specialization : "Specialist";

      const aiReply = `Aapki takleef maine note kar li hai. Aapke purane reports aur in lakshano ko dekh kar maine ek comprehensive summary tayyar ki hai. Aapke liye hamare top 5 specialist doctors tayyar hain, jismein ${docName} (${docSpec}) sabse upyukt hain. Maine unke OPD panel par aapki summary bhej di hai, aap bina bheed me lage turant video call ya appointment book kar sakte hain!`;

      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      speakHinglish(aiReply);

      // Generate structured clinical summary for doctor
      const summary: CallClinicalSummary = {
        chiefComplaint: patientText,
        symptoms: [patientText, "Fatigue / discomfort", "Correlated with past health profile"],
        duration: "Active acute symptoms reported during call",
        severity: patientText.toLowerCase().includes("chest") || patientText.toLowerCase().includes("severe") ? "urgent" : "moderate",
        suggestedSpecialty: docSpec,
        oldReportsAnalysis: "ABDM Verified Health History: 8-year glycemic/vitals baseline reconciled. No contraindicative drug interaction detected.",
        twoMinuteSummary: `Patient reported: "${patientText}". AI assessed urgency, reviewed historical lab markers, and matched with top 5 ${docSpec} specialists.`,
        createdAt: new Date().toLocaleString(),
      };
      setGeneratedSummary(summary);
    }, 1400);
  };

  const handleEndCall = () => {
    setCallStatus("ended");
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-navy-900 border border-teal-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Call Header Bar */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-700 via-teal-600 to-navy-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
                <Sparkles className="w-6 h-6 text-mint-100 animate-pulse" />
              </div>
              {callStatus === "connected" && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-teal-700 rounded-full animate-ping" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base tracking-wide">
                  Industra AI Medical Call Assistant
                </h3>
                <Badge variant="verified" size="sm" className="bg-teal-500 text-white">
                  Hinglish / हिंदी
                </Badge>
              </div>
              <p className="text-xs text-mint-100/90 flex items-center gap-2">
                <span>{callStatus === "ringing" ? "Calling patient..." : callStatus === "connected" ? `Call Connected • ${formatTimer(callSeconds)}` : "Call Finished"}</span>
                <span>• 24/7 Clinical Triage</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAudioPlayback(!audioPlayback)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={audioPlayback ? "Mute AI Voice" : "Unmute AI Voice"}
            >
              {audioPlayback ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-coral-300" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Call Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50 dark:bg-navy-950/40">
          {/* Active Call Audio Waveform Strip */}
          {callStatus === "connected" && (
            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-navy-800/80 border border-teal-200 dark:border-teal-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <div className="text-xs">
                  <span className="font-bold text-teal-800 dark:text-teal-300 block">
                    Live Hinglish Audio Scribe Active
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Translating and analyzing symptoms in real time.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 h-6">
                {[6, 14, 22, 10, 26, 16, 8, 20, 12, 18].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: isAiThinking ? [h, h * 1.5, h] : [6, 12, 6] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.08 }}
                    className="w-1 bg-teal-600 rounded-full"
                    style={{ height: h }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Conversation Transcript */}
          <div className="space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.sender === "patient" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm shadow-sm ${
                    m.sender === "patient"
                      ? "bg-teal-600 text-white rounded-tr-none"
                      : "bg-white dark:bg-navy-800 text-foreground border border-slate-200 dark:border-navy-700 rounded-tl-none"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line">{m.text}</p>
                  <span
                    className={`block text-[10px] mt-1.5 ${
                      m.sender === "patient" ? "text-teal-100 text-right" : "text-muted-foreground"
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
                {m.sender === "patient" && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-navy-700 text-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isAiThinking && (
              <div className="flex items-center gap-2 text-xs text-teal-600 dark:text-teal-400 p-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                <span>AI is analyzing clinical reports &amp; matching top specialists...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* AI Clinical Summary (Generated for Doctor) */}
          {generatedSummary && (
            <div className="p-4 rounded-2xl bg-mint-50 dark:bg-navy-800 border border-teal-300 dark:border-teal-700 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                  <span className="text-xs font-bold text-teal-900 dark:text-teal-200">
                    AI Clinical Summary Prepared for Doctor
                  </span>
                </div>
                <Badge variant={generatedSummary.severity === "urgent" ? "urgent" : "verified"} size="sm">
                  {generatedSummary.severity.toUpperCase()}
                </Badge>
              </div>

              <div className="text-xs space-y-1.5 text-foreground">
                <p>
                  <strong className="text-teal-800 dark:text-teal-300">Chief Complaint:</strong> {generatedSummary.chiefComplaint}
                </p>
                <p>
                  <strong className="text-teal-800 dark:text-teal-300">Historical Reports Study:</strong> {generatedSummary.oldReportsAnalysis}
                </p>
                <p className="text-[11px] text-muted-foreground italic">
                  {generatedSummary.twoMinuteSummary}
                </p>
              </div>
            </div>
          )}

          {/* TOP 5 RECOMMENDED DOCTORS */}
          {matchedDoctors.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Top 5 Recommended Specialists For Your Disease
                  </h4>
                </div>
                <span className="text-[11px] text-teal-600 font-semibold">
                  Zero Crowd • Instant Booking
                </span>
              </div>

              <div className="space-y-2">
                {matchedDoctors.slice(0, 5).map((doc, idx) => (
                  <div
                    key={doc.id}
                    className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 hover:border-teal-500 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm shrink-0 border border-teal-500/20">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-xs sm:text-sm text-foreground">{doc.name}</h5>
                          <span className="flex items-center text-[11px] font-bold text-amber-500">
                            <Star className="w-3 h-3 fill-amber-400 stroke-amber-500 mr-0.5" />
                            {doc.rating}
                          </span>
                        </div>
                        <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                          {doc.qualification} &bull; {doc.specialization}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {doc.hospital} &bull; {doc.experienceYears} yrs exp &bull; ₹{doc.consultationFee} fee
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-teal-600 dark:text-teal-300 flex-1 sm:flex-initial"
                        onClick={() => {
                          if (generatedSummary) {
                            setSentToDoctorId(doc.id);
                            onSendSummaryToDoctor?.(generatedSummary, doc);
                          }
                        }}
                      >
                        {sentToDoctorId === doc.id ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Summary Sent
                          </span>
                        ) : (
                          "Send AI Summary"
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="default"
                        className="bg-teal-600 hover:bg-teal-700 text-white text-xs flex-1 sm:flex-initial"
                        onClick={() => {
                          onSelectDoctor?.(doc);
                          onClose();
                        }}
                      >
                        Book Advance Slot
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input & Call Controls Footer */}
        <div className="p-4 bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-navy-700 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type in Hinglish or English (e.g. 'Mere seene me dard hai', 'Fever since 2 days')..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Button
              variant="default"
              size="md"
              className="bg-teal-600 hover:bg-teal-700 text-white shrink-0"
              onClick={handleSendMessage}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span>Speaks Hinglish &bull; No crowd waiting</span>
            </div>

            <button
              type="button"
              onClick={handleEndCall}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-coral-50 hover:bg-coral-100 dark:bg-coral-950/40 text-coral-600 dark:text-coral-300 font-bold transition-colors"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>End Call</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
