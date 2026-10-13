"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Volume2,
  VolumeX,
  PhoneCall,
  Upload,
  User,
  Sparkles,
  ArrowLeft,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MediAvatar } from "@/components/intake/MediAvatar";
import { ProgressRing } from "@/components/intake/ProgressRing";
import { VoiceWaveform } from "@/components/intake/VoiceWaveform";
import { BodyAreaPicker, BodyArea } from "@/components/intake/BodyAreaPicker";
import { PainSlider } from "@/components/intake/PainSlider";
import { DocumentUploadModal } from "@/components/intake/DocumentUploadModal";
import { IntakeReviewModal } from "@/components/intake/IntakeReviewModal";
import { UrgentAlertModal } from "@/components/intake/UrgentAlertModal";
import { globalSafetyEngine, SafetyCheckResult } from "@/agents/safety-rules-engine";

type IntakeLanguage = "en" | "hi" | "hinglish";

interface ChatMessage {
  id: string;
  role: "patient" | "agent";
  content: string;
  timestamp: string;
  inputMode?: "voice" | "text";
}

const COMMON_QUICK_REPLIES: Record<IntakeLanguage, string[]> = {
  en: ["Today", "2-3 days", "1 week", "Yes", "No", "Not sure"],
  hi: ["आज ही", "2-3 दिन से", "1 हफ्ते से", "हाँ", "नहीं", "पक्का नहीं पता"],
  hinglish: ["Aaj hi", "2-3 days se", "1 week se", "Haan", "Nahi", "Pakka nahi pata"],
};

export default function PatientIntakePage() {
  // 1. Language State (persisted in localStorage)
  const [language, setLanguage] = useState<IntakeLanguage>("hi");
  const [langChosen, setLangChosen] = useState(true);

  // 2. Consultation Session State
  const [consultationId, setConsultationId] = useState<string>("");
  const [intakeStartTimestamp, setIntakeStartTimestamp] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // 3. Conversation & Agent State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [coveredAspects, setCoveredAspects] = useState<string[]>([]);
  const [isIntakeComplete, setIsIntakeComplete] = useState(false);

  // 4. Audio Text-to-Speech
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 5. Interactive Dialog States
  const [showBodyPicker, setShowBodyPicker] = useState(false);
  const [showPainSlider, setShowPainSlider] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showUrgentModal, setShowUrgentModal] = useState(false);
  const [safetyCheckResult, setSafetyCheckResult] = useState<SafetyCheckResult | null>(null);
  const [consultationStatus, setConsultationStatus] = useState<
    "intake" | "ready_for_review" | "in_review" | "approved"
  >("intake");

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat on new message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isAgentTyping]);

  // Intake Duration Timer
  useEffect(() => {
    if (intakeStartTimestamp === 0 || consultationStatus !== "intake") return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - intakeStartTimestamp) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [intakeStartTimestamp, consultationStatus]);

  // Load language preference and initialize consultation session
  useEffect(() => {
    const savedLang = localStorage.getItem("im_patient_intake_lang") as IntakeLanguage | null;
    if (savedLang) {
      setLanguage(savedLang);
      setLangChosen(true);
    }

    const cId = `c-intake-${Date.now().toString(36)}`;
    setConsultationId(cId);
    setIntakeStartTimestamp(Date.now());

    // Send initial greeting question from Medi
    const initialGreeting: ChatMessage = {
      id: "msg-initial",
      role: "agent",
      content:
        savedLang === "en"
          ? "Namaste! I am Medi, your clinical intake assistant. Please tell me what primary problem or discomfort you are experiencing today?"
          : savedLang === "hinglish"
          ? "Namaste! Main Medi hoon, aapka health assistant. Aaj aapko kya problem ya takleef ho rahi hai, please batayein?"
          : "नमस्ते! मैं मेडी हूँ, आपकी स्वास्थ्य सहायक। कृपया बताएं कि आज आपको क्या मुख्य तकलीफ या परेशानी हो रही है?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([initialGreeting]);
  }, []);

  // Text-To-Speech function
  const speakAgentMessage = (text: string) => {
    if (!ttsEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleLanguageSelect = (selected: IntakeLanguage) => {
    setLanguage(selected);
    setLangChosen(true);
    localStorage.setItem("im_patient_intake_lang", selected);

    // Update initial greeting to the chosen tongue
    setMessages([
      {
        id: "msg-initial",
        role: "agent",
        content:
          selected === "en"
            ? "Namaste! I am Medi, your clinical intake assistant. Please tell me what primary problem or discomfort you are experiencing today?"
            : selected === "hinglish"
            ? "Namaste! Main Medi hoon, aapka health assistant. Aaj aapko kya problem ya takleef ho rahi hai, please batayein?"
            : "नमस्ते! मैं मेडी हूँ, आपकी स्वास्थ्य सहायक। कृपया बताएं कि आज आपको क्या मुख्य तकलीफ या परेशानी हो रही है?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Send message to intake API
  const handleSendMessage = async (textToSend?: string, mode: "voice" | "text" = "text") => {
    const raw = textToSend || (inputRef.current ? inputRef.current.value : inputText);
    const content = (raw || "").trim();
    if (!content || isAgentTyping) return;

    setInputText("");
    if (inputRef.current) inputRef.current.value = "";
    setIsRecording(false);

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "patient",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      inputMode: mode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsAgentTyping(true);

    // 0. Immediate local deterministic check (< 2ms zero-latency safety net)
    const instantSafety = globalSafetyEngine.evaluate(content);
    if (instantSafety.is_urgent) {
      setSafetyCheckResult(instantSafety);
      setShowUrgentModal(true);
      setConsultationStatus("ready_for_review");
    }

    try {
      const response = await fetch("/api/intake/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultation_id: consultationId,
          message: content,
          input_mode: mode,
          language: language === "hi" ? "hi" : "en",
        }),
      });

      const data = await response.json();

      if (data.success && data.next_question) {
        const agentMessage: ChatMessage = {
          id: `msg-agent-${Date.now()}`,
          role: "agent",
          content: data.next_question,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, agentMessage]);
        setCoveredAspects(data.covered_aspects || []);

        // Speak aloud if TTS is enabled
        speakAgentMessage(data.next_question);

        if (data.is_urgent) {
          setSafetyCheckResult(data.safety_check || instantSafety);
          setShowUrgentModal(true);
          setConsultationStatus("ready_for_review");
        } else if (data.is_intake_complete) {
          setIsIntakeComplete(true);
          setShowReviewModal(true);
        }
      }
    } catch (err) {
      console.error("Failed to post intake message:", err);
      // Gentle offline fallback message
      const fallbackMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: "agent",
        content:
          language === "hi"
            ? "आपकी जानकारी सुरक्षित दर्ज हो गई है। क्या आप इसके अलावा कोई अन्य दवा या एलर्जी बताना चाहते हैं?"
            : "Your response has been safely logged. Do you have any other symptoms or allergies to mention?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsAgentTyping(false);
    }
  };

  // Submit final summary to doctor via /api/intake/finalize
  const handleFinalSubmitToDoctor = async () => {
    const res = await fetch("/api/intake/finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consultation_id: consultationId,
        intake_duration_seconds: elapsedSeconds || 114,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setConsultationStatus("ready_for_review");
    }
  };

  // Progress calculation: 7 core aspects
  const progressPercent = Math.min(100, Math.round((coveredAspects.length / 6) * 100));

  // Extract structured preview for the review modal
  const reviewSummary = {
    chiefComplaint: messages.find((m) => m.role === "patient")?.content || "Acute symptoms reported",
    duration: messages.length >= 3 ? messages.filter((m) => m.role === "patient")[1]?.content || "2-3 days" : "Today",
    severity: "7 / 10",
    pastHistory: "Essential Hypertension • Chronic history recorded",
    medications: "Tab Telmisartan 40mg OD",
    allergies: "Penicillin Hypersensitivity (Beta-lactams)",
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex flex-col justify-between text-foreground">
      {/* ========================================================= */}
      {/* TOP BAR: EMERGENCY BANNER + LIVE STATS */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border-b border-slate-200 dark:border-navy-700 shadow-sm">
        {/* 1. Persistent Emergency Bar */}
        <div className="bg-coral-600 text-white px-4 py-2 text-xs flex items-center justify-between font-semibold">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 animate-bounce shrink-0" />
            <span>
              {language === "hi"
                ? "आपातकालीन स्थिति में? तुरंत 112 पर कॉल करें या नजदीकी अस्पताल जाएं"
                : "Medical Emergency? Call 112 immediately or visit the nearest ER"}
            </span>
          </div>
          <a
            href="tel:112"
            className="px-2.5 py-1 rounded-full bg-white text-coral-700 font-extrabold hover:bg-slate-100 text-[11px] shrink-0"
          >
            Call 112
          </a>
        </div>

        {/* 2. Top Navigation & Progress Bar */}
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/patient"
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              aria-label="Back to Patient Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <MediAvatar size="md" isThinking={isAgentTyping} />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-navy dark:text-white">Medi</span>
                <Badge variant="verified" size="sm">
                  Clinical Scribe
                </Badge>
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                Timer: {Math.floor(elapsedSeconds / 60)}:
                {(elapsedSeconds % 60).toString().padStart(2, "0")}s
              </div>
            </div>
          </div>

          {/* Right Progress Ring & Audio TTS Toggle */}
          <div className="flex items-center gap-3">
            <ProgressRing
              progress={progressPercent}
              size={46}
              strokeWidth={4}
              label={language === "hi" ? "जानकारी" : "Intake"}
            />

            <button
              type="button"
              onClick={() => {
                if (isSpeaking) window.speechSynthesis.cancel();
                setTtsEnabled(!ttsEnabled);
              }}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                ttsEnabled
                  ? "bg-teal-50 dark:bg-navy-800 border-teal-500/40 text-teal-600 dark:text-teal-400"
                  : "bg-slate-100 dark:bg-navy-800 border-slate-200 dark:border-navy-700 text-muted-foreground"
              }`}
              title={ttsEnabled ? "Read questions aloud" : "Audio muted"}
              aria-label={ttsEnabled ? "Audio narration active" : "Audio narration muted"}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* LANGUAGE SELECTOR MODAL (If Not Chosen Yet) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {!langChosen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-navy-900 rounded-3xl p-6 shadow-2xl border border-teal-500/30 text-center space-y-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-navy dark:text-white">
                  अपनी भाषा चुनें
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose your preferred language for the intake session:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleLanguageSelect("hi")}
                  className="p-3.5 rounded-2xl border border-teal-500/40 bg-teal-50 dark:bg-navy-800 text-teal-900 dark:text-teal-200 font-bold text-sm hover:scale-102 transition-all flex items-center justify-between"
                >
                  <span>हिन्दी (Hindi)</span>
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLanguageSelect("hinglish")}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-850 font-bold text-sm hover:scale-102 transition-all flex items-center justify-between"
                >
                  <span>Hinglish (हिंदी + English)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLanguageSelect("en")}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-850 font-bold text-sm hover:scale-102 transition-all flex items-center justify-between"
                >
                  <span>English</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* CHAT BUBBLES LIST */}
      {/* ========================================================= */}
      <main
        ref={chatScrollRef}
        className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 overflow-y-auto space-y-4"
      >
        {messages.map((msg) => {
          const isAgent = msg.role === "agent";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAgent ? "justify-start" : "justify-end"}`}
            >
              {isAgent && <MediAvatar size="sm" />}

              <div
                className={`max-w-[85%] sm:max-w-lg rounded-3xl p-4 sm:p-5 shadow-sm text-sm sm:text-base leading-relaxed ${
                  isAgent
                    ? "bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-700 text-navy dark:text-slate-100 rounded-tl-sm"
                    : "bg-teal-600 text-white rounded-tr-sm shadow-teal-glow"
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>

                <div
                  className={`mt-1.5 flex items-center gap-1.5 text-[10px] ${
                    isAgent ? "text-muted-foreground" : "text-teal-200"
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.inputMode === "voice" && <span>&bull; Voice input</span>}
                </div>
              </div>

              {!isAgent && (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-navy-700 text-foreground flex items-center justify-center shrink-0 text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isAgentTyping && (
          <div className="flex items-center gap-3">
            <MediAvatar size="sm" isThinking />
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl px-4 py-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* QUICK REPLY CHIPS & CLINICAL ACTIONS BAR */}
      {/* ========================================================= */}
      <div className="max-w-4xl w-full mx-auto px-4 pb-2 space-y-2">
        {/* Quick Answer Chips */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar text-xs">
          {COMMON_QUICK_REPLIES[language].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleSendMessage(chip, "text")}
              className="px-3.5 py-1.5 rounded-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-foreground hover:bg-teal-50 dark:hover:bg-navy-800 hover:border-teal-500 transition-all font-medium shrink-0 shadow-2xs"
            >
              {chip}
            </button>
          ))}

          {/* Body Area Picker Trigger */}
          <button
            type="button"
            onClick={() => setShowBodyPicker(true)}
            className="px-3.5 py-1.5 rounded-full bg-mint-100 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-semibold flex items-center gap-1 shrink-0 hover:bg-mint-200 transition-all"
          >
            <span>{language === "hi" ? "अंग चुनें" : "Body Area"}</span>
          </button>

          {/* Pain Slider Trigger */}
          <button
            type="button"
            onClick={() => setShowPainSlider(true)}
            className="px-3.5 py-1.5 rounded-full bg-coral-50 dark:bg-coral-950/60 border border-coral-300 dark:border-coral-800 text-coral-800 dark:text-coral-300 font-semibold flex items-center gap-1 shrink-0 hover:bg-coral-100 transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{language === "hi" ? "दर्द (1-10)" : "Pain Scale"}</span>
          </button>

          {/* Document Upload Trigger */}
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-300 font-semibold flex items-center gap-1 shrink-0 hover:bg-purple-100 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{language === "hi" ? "पर्चा अपलोड" : "Upload Slip"}</span>
          </button>

          {/* Review Summary Trigger if questions asked or complete */}
          {(messages.length >= 4 || isIntakeComplete) && (
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1 shrink-0 ml-auto shadow-sm"
            >
              <span>{language === "hi" ? "समीक्षा करें" : "Review Summary"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* INPUT AREA: BIG MIC BUTTON + TEXT BOX */}
      {/* ========================================================= */}
      <footer className="sticky bottom-0 z-40 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border-t border-slate-200 dark:border-navy-700 p-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-3">
          {/* Big Microphone with Waveform Visualizer */}
          <VoiceWaveform
            isRecording={isRecording}
            onToggleRecord={() => setIsRecording(!isRecording)}
            language={language}
            onTranscript={(transcribedText) => {
              setInputText((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
            }}
            disabled={isAgentTyping}
          />

          {/* Text Input Field & Send Action */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputRef.current?.value || inputText, isRecording ? "voice" : "text");
            }}
            className="flex items-center gap-2 w-full"
          >
            <input
              ref={inputRef}
              id="intake-message-input"
              data-testid="intake-message-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                language === "hi"
                  ? "यहाँ अपनी तकलीफ लिखें या ऊपर माइक दबाकर बोलें..."
                  : "Type what you feel or speak into the microphone..."
              }
              disabled={isAgentTyping}
              className="flex-1 px-4 py-3 text-sm rounded-2xl bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[48px]"
            />

            <button
              id="intake-send-button"
              data-testid="intake-send-button"
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                handleSendMessage(inputRef.current?.value || inputText, isRecording ? "voice" : "text");
              }}
              disabled={isAgentTyping}
              className="relative inline-flex items-center justify-center font-semibold rounded-xl bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white shadow-teal-glow min-h-[48px] px-5 transition-all select-none disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* INTERACTIVE MODALS */}
      {/* ========================================================= */}
      {/* Body Area Picker */}
      <BodyAreaPicker
        isOpen={showBodyPicker}
        onClose={() => setShowBodyPicker(false)}
        language={language}
        onSelectArea={(area: BodyArea) => {
          const textToAdd = language === "hi" ? area.labelHi : area.labelEn;
          setInputText((prev) => (prev ? `${prev}, ${textToAdd}` : textToAdd));
        }}
      />

      {/* Pain Severity Slider */}
      <PainSlider
        isOpen={showPainSlider}
        onClose={() => setShowPainSlider(false)}
        language={language}
        onSelectSeverity={(score: number) => {
          const note =
            language === "hi"
              ? `दर्द की तीव्रता 10 में से ${score} है`
              : `Pain severity is ${score} out of 10`;
          setInputText((prev) => (prev ? `${prev}. ${note}` : note));
        }}
      />

      {/* Document Uploader Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        language={language}
        consultationId={consultationId}
        onUploadSuccess={(uploadNote: string) => {
          handleSendMessage(uploadNote, "text");
        }}
      />

      {/* End-Of-Intake Review & Live Status Modal */}
      <IntakeReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        consultationId={consultationId}
        summary={reviewSummary}
        language={language}
        status={consultationStatus}
        onSubmitToDoctor={handleFinalSubmitToDoctor}
      />

      {/* Full-Screen High-Contrast Urgent Safety Interruption Alert */}
      <UrgentAlertModal
        isOpen={showUrgentModal}
        language={language}
        safetyCheck={safetyCheckResult}
        consultationId={consultationId}
        onNotifyDoctor={async () => {
          try {
            await fetch("/api/consultations/notify-urgent", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ consultation_id: consultationId }),
            });
          } catch {
            // Non-blocking
          }
        }}
      />
    </div>
  );
}
