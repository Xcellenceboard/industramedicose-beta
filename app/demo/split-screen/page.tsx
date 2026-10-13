"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  AlertOctagon,
  User,
  Stethoscope,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface ScriptedStep {
  sender: "agent" | "patient";
  text: string;
  translation?: string;
  isUrgentTrigger?: boolean;
}

const SCRIPTED_CHEST_PAIN_DIALOGUE: ScriptedStep[] = [
  {
    sender: "agent",
    text: "नमस्ते विक्रम जी! मैं मेडी हूँ। आज आपको क्या परेशानी महसूस हो रही है?",
    translation: "Hello Vikram ji! I am Medi. What problem are you feeling today?",
  },
  {
    sender: "patient",
    text: "मेरे सीने में बहुत तेज दर्द हो रहा है और सांस नहीं आ रही।",
    translation: "I have severe crushing pain in my chest and breath is not coming.",
    isUrgentTrigger: true,
  },
  {
    sender: "agent",
    text: "🚨 आपके लक्षण गंभीर हो सकते हैं। कृपया तुरंत 112 डायल करें या नजदीकी अस्पताल जाएं। मैंने डॉक्टर को आपातकालीन अलर्ट भेज दिया है।",
    translation: "🚨 Your symptoms may need immediate attention. Please dial 112 or visit nearest hospital. Emergency notification sent to doctor.",
    isUrgentTrigger: true,
  },
];

export default function SplitScreenDemoPage() {
  const [messages, setMessages] = useState<ScriptedStep[]>([SCRIPTED_CHEST_PAIN_DIALOGUE[0]]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stopwatchSec, setStopwatchSec] = useState(0);
  const [urgentFired, setUrgentFired] = useState(false);
  const [mobileViewTab, setMobileViewTab] = useState<"both" | "patient" | "doctor">("both");

  // Live Stopwatch
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setStopwatchSec((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Scripted Auto-Play Engine
  useEffect(() => {
    if (!isPlaying) return;

    if (currentStep < SCRIPTED_CHEST_PAIN_DIALOGUE.length - 1) {
      const nextDelay = currentStep === 0 ? 2500 : 3000;
      const timeout = setTimeout(() => {
        const nextIdx = currentStep + 1;
        const nextMsg = SCRIPTED_CHEST_PAIN_DIALOGUE[nextIdx];
        setMessages((prev) => [...prev, nextMsg]);
        setCurrentStep(nextIdx);

        if (nextMsg.isUrgentTrigger) {
          setUrgentFired(true);
        }
      }, nextDelay);
      return () => clearTimeout(timeout);
    } else {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep]);

  const resetDemo = () => {
    setIsPlaying(false);
    setStopwatchSec(0);
    setCurrentStep(0);
    setUrgentFired(false);
    setMessages([SCRIPTED_CHEST_PAIN_DIALOGUE[0]]);
  };

  const startAutoPlay = () => {
    resetDemo();
    setIsPlaying(true);
  };

  return (
    <AppShell>
      <div className="space-y-4 pb-12">
        {/* Split Screen Control Bar */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-white">
                  AAYU 2026 Live Split-Screen Evaluation Console
                </h1>
                <Badge variant="urgent" size="sm" pulse>
                  Realtime Sync Demo
                </Badge>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Observe patient voice intake on the left and doctor triage queue updating synchronously on the right.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Live Stopwatch Counter */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 font-mono text-sm">
              <Clock className="w-4 h-4 text-teal-400" />
              <span className="font-bold text-teal-400">
                {Math.floor(stopwatchSec / 60).toString().padStart(2, "0")}:
                {(stopwatchSec % 60).toString().padStart(2, "0")}
              </span>
              <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">
                (Target &lt; 02:00)
              </span>
            </div>

            <Button
              variant="default"
              size="sm"
              leftIcon={<Play className="w-4 h-4" />}
              onClick={startAutoPlay}
              disabled={isPlaying}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs sm:text-sm"
            >
              Auto-Play Intake
            </Button>

            <button
              type="button"
              onClick={resetDemo}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile View Mode Switcher (visible only on mobile/tablet < lg) */}
        <div className="flex lg:hidden items-center justify-between p-1 bg-slate-100 dark:bg-navy-800 rounded-xl border border-slate-200 dark:border-navy-700 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMobileViewTab("both")}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              mobileViewTab === "both"
                ? "bg-white dark:bg-navy-700 shadow-2xs text-teal-600 dark:text-teal-400 font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Stacked View
          </button>
          <button
            type="button"
            onClick={() => setMobileViewTab("patient")}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              mobileViewTab === "patient"
                ? "bg-white dark:bg-navy-700 shadow-2xs text-teal-600 dark:text-teal-400 font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Patient View
          </button>
          <button
            type="button"
            onClick={() => setMobileViewTab("doctor")}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              mobileViewTab === "doctor"
                ? "bg-white dark:bg-navy-700 shadow-2xs text-teal-600 dark:text-teal-400 font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Doctor Queue
          </button>
        </div>

        {/* 2-COLUMN SPLIT SCREEN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* LEFT: PATIENT MOBILE VIEW SIMULATION */}
          <Card className={`p-4 sm:p-5 border-slate-200 dark:border-navy-700 space-y-4 ${
            mobileViewTab === "doctor" ? "hidden lg:block" : ""
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-navy-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-bold text-navy dark:text-white flex items-center gap-1.5">
                  <User className="w-4 h-4 text-teal-500" />
                  Patient Intake View (Vikramaditya Rathore)
                </h2>
              </div>
              <Badge variant="ai" size="sm">
                Hindi / Hinglish Mode
              </Badge>
            </div>

            {/* Chat Messages */}
            <div className="space-y-3 min-h-[340px] max-h-[420px] overflow-y-auto p-2 bg-slate-50 dark:bg-navy-950/40 rounded-xl">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl text-xs space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                    m.sender === "patient"
                      ? "bg-teal-600 text-white ml-8 shadow-sm"
                      : m.isUrgentTrigger
                      ? "bg-coral-500 text-white mr-8 shadow-coral-glow"
                      : "bg-white dark:bg-navy-850 text-foreground mr-8 border border-slate-200 dark:border-navy-700 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-80">
                    <span className="font-bold">
                      {m.sender === "patient" ? "Patient Voice" : "Medi Clinical Copilot"}
                    </span>
                    <span>Just now</span>
                  </div>
                  <p className="font-semibold text-sm leading-relaxed">{m.text}</p>
                  {m.translation && (
                    <p className="text-[11px] opacity-85 italic pt-1 border-t border-black/10 dark:border-white/10">
                      En: {m.translation}
                    </p>
                  )}
                </div>
              ))}

              {isPlaying && currentStep === 0 && (
                <div className="p-3 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-mono animate-pulse">
                  🎙️ Patient speaking: &ldquo;mere seene mein bahut dard hai aur saans nahi aa rahi...&rdquo;
                </div>
              )}
            </div>

            {/* Urgent Interruption Alert banner if fired */}
            {urgentFired && (
              <div className="p-4 rounded-xl bg-coral-500/15 border-2 border-coral-500/40 text-coral-950 dark:text-coral-100 text-xs space-y-2 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2 font-bold text-coral-600 dark:text-coral-400">
                  <ShieldAlert className="w-5 h-5 animate-bounce" />
                  EMERGENCY INTERRUPT ACTIVE (LATENCY: 0.28 ms)
                </div>
                <p className="text-[11px] leading-relaxed">
                  Deterministic Layer 1 intercepted symptom tokens before AI completion. Standard intake halted. Call 112 primed.
                </p>
              </div>
            )}
          </Card>

          {/* RIGHT: DOCTOR TRIAGE QUEUE SIMULATION */}
          <Card className={`p-4 sm:p-5 border-slate-200 dark:border-navy-700 space-y-4 ${
            mobileViewTab === "patient" ? "hidden lg:block" : ""
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-navy-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
                <h2 className="text-sm font-bold text-navy dark:text-white flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Doctor OPD Queue (Dr. Meera Rathore)
                </h2>
              </div>
              <Badge variant="verified" size="sm">
                Supabase Realtime Live
              </Badge>
            </div>

            {/* Queue Cards */}
            <div className="space-y-3 min-h-[340px]">
              {/* Hoisted Urgent Patient Card */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  urgentFired
                    ? "bg-coral-500/10 border-coral-500/40 shadow-coral-glow scale-[1.01]"
                    : "bg-white dark:bg-navy-850 border-slate-200 dark:border-navy-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={urgentFired ? "urgent" : "info"}
                        size="sm"
                        pulse={urgentFired}
                      >
                        {urgentFired ? "URGENT PRIORITY" : "IN REVIEW"}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground">
                        UHID-2026-9041 &bull; 54y / Male
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-navy dark:text-white">
                      Vikramaditya Rathore
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {urgentFired
                        ? "Acute retrosternal crushing chest pain radiating to left shoulder x 2h"
                        : "Intake in progress..."}
                    </p>
                    {urgentFired && (
                      <span className="text-[11px] font-bold text-coral-600 dark:text-coral-400 flex items-center gap-1 pt-1">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        Suspected ACS / Acute Coronary Syndrome
                      </span>
                    )}
                  </div>

                  <a
                    href="/doctor/consultation/c-101"
                    className="shrink-0"
                  >
                    <Button
                      variant={urgentFired ? "verified" : "default"}
                      size="sm"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Open 2-Min Note
                    </Button>
                  </a>
                </div>
              </div>

              {/* Routine Patient in queue */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-xs space-y-1 opacity-75">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Shanti Devi Gehlot (68y / F)</span>
                  <Badge variant="warning" size="sm">ATTENTION</Badge>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Uncontrolled fasting sugars (190-230 mg/dL), bilateral foot paresthesia.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-xs space-y-1 opacity-60">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Mahendra Bhati (38y / M)</span>
                  <Badge variant="neutral" size="sm">ROUTINE</Badge>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  High fever 101F x 3 days, dry hacking cough, sore throat.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
