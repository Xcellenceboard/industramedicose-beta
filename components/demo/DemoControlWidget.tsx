"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  Play,
  RotateCcw,
  SplitSquareVertical,
  X,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function DemoControlWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);

  // Stopwatch counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stopwatchRunning]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const scenarios = [
    {
      id: "acs",
      title: "Acute Chest Pain (URGENT)",
      category: "Cardiac / ACS",
      urgency: "urgent",
      targetUrl: "/doctor/consultation/c-101",
      desc: "54y Male, crushing retrosternal pain radiating to left arm x 2h with diaphoresis.",
      intakeDuration: "114s",
    },
    {
      id: "diabetes",
      title: "Uncontrolled Diabetes (ATTENTION)",
      category: "Endocrinology",
      urgency: "attention",
      targetUrl: "/doctor/consultation/c-102",
      desc: "68y Female, sugars 190-230 mg/dL, bilateral burning foot paresthesias.",
      intakeDuration: "98s",
    },
    {
      id: "fever",
      title: "Viral Fever & Sore Throat (ROUTINE)",
      category: "Infectious",
      urgency: "routine",
      targetUrl: "/doctor",
      desc: "38y Male, fever 101F x 3 days, dry hacking cough, sore throat.",
      intakeDuration: "82s",
    },
    {
      id: "pediatric",
      title: "Child Dehydration (URGENT)",
      category: "Pediatric Sepsis",
      urgency: "urgent",
      targetUrl: "/doctor",
      desc: "4y Male, intractable vomiting x 7 episodes, unable to retain oral fluids.",
      intakeDuration: "105s",
    },
  ];

  return (
    <>
      {/* Floating Demo Launcher Pill */}
      <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-full bg-slate-900 text-white border border-slate-700 shadow-xl hover:bg-slate-800 transition-all hover:scale-105 group font-sans text-xs"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          <span className="font-extrabold tracking-wide hidden sm:inline">AAYU 2026 Demo Control</span>
          <span className="font-extrabold tracking-wide sm:hidden">Demo Control</span>
        </button>
      </div>

      {/* Floating Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-navy-700 shadow-2xl p-4 sm:p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[88vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-navy-700">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-navy dark:text-white">
                    AAYU 2026 Judge Demo Control Center
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Problem T01: &ldquo;The Two-Minute Doctor&rdquo; Co-Pilot Sandbox
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Stopwatch Tool */}
            <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Two-Minute Intake Timer
                  </span>
                  <div className="text-xl font-mono font-extrabold text-teal-400">
                    {formatTime(stopwatchSeconds)}
                    <span className="text-xs text-slate-400 font-sans font-normal ml-2">
                      (Target &lt; 02:00)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setStopwatchRunning(!stopwatchRunning)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    stopwatchRunning ? "bg-amber-500 text-black" : "bg-teal-500 text-white"
                  }`}
                >
                  {stopwatchRunning ? "Pause" : "Start"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStopwatchRunning(false);
                    setStopwatchSeconds(0);
                  }}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Actions (Split-Screen & Live Intake) */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/demo/split-screen");
                }}
                className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-left hover:scale-[1.02] transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <SplitSquareVertical className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <Badge variant="verified" size="sm">Live</Badge>
                </div>
                <div className="font-bold text-navy dark:text-white">
                  Split-Screen View
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Patient on left, Doctor on right updating simultaneously.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/patient/intake");
                }}
                className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-left hover:scale-[1.02] transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <Play className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <Badge variant="ai" size="sm">Voice AI</Badge>
                </div>
                <div className="font-bold text-navy dark:text-white">
                  Live Patient Intake
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Bilingual speech recognition & body-area selector.
                </p>
              </button>
            </div>

            {/* Synthetic Scenarios Selector */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Load Preset Synthetic Clinical Scenario:
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {scenarios.map((sc) => (
                  <div
                    key={sc.id}
                    onClick={() => {
                      setIsOpen(false);
                      router.push(sc.targetUrl);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 hover:border-teal-500 bg-white dark:bg-navy-800 cursor-pointer transition-all flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground">{sc.title}</span>
                        <Badge
                          variant={sc.urgency === "urgent" ? "urgent" : sc.urgency === "attention" ? "warning" : "info"}
                          size="sm"
                        >
                          {sc.category}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {sc.desc}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-teal-600 dark:text-teal-400 shrink-0 ml-2">
                      ⏱️ {sc.intakeDuration}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-200 dark:border-navy-700 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>All patient data is synthetic & anonymized for AAYU 2026.</span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/guide");
                }}
                className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
              >
                Architecture Guide &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
