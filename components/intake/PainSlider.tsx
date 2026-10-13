"use client";

import React, { useState } from "react";
import { X, Check, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PainSliderProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSeverity: (score: number) => void;
  language: "en" | "hi" | "hinglish";
}

export function PainSlider({
  isOpen,
  onClose,
  onSelectSeverity,
  language,
}: PainSliderProps) {
  const [value, setValue] = useState<number>(7);
  const isHi = language === "hi";

  if (!isOpen) return null;

  const getSeverityLabel = (score: number) => {
    if (score <= 3) return { en: "Mild Discomfort (1-3)", hi: "हल्का दर्द (1-3)", color: "text-emerald-500" };
    if (score <= 6) return { en: "Moderate Pain (4-6)", hi: "मध्यम दर्द (4-6)", color: "text-amber-500" };
    return { en: "Severe / Acute Pain (7-10)", hi: "तीव्र / गंभीर दर्द (7-10)", color: "text-coral-500" };
  };

  const severity = getSeverityLabel(value);

  const handleConfirm = () => {
    onSelectSeverity(value);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pain-slider-title"
    >
      <div className="relative w-full max-w-sm bg-white dark:bg-navy-900 rounded-3xl p-6 shadow-2xl border border-teal-500/30 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-coral-500" />
            <h3 id="pain-slider-title" className="text-base font-bold text-navy dark:text-white">
              {isHi ? "दर्द की तीव्रता (1-10)" : "Pain Severity Scale (1-10)"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Number & Level Display */}
        <div className="text-center space-y-1">
          <div className="text-5xl font-extrabold text-navy dark:text-white tracking-tight">
            {value} <span className="text-xl font-normal text-muted-foreground">/ 10</span>
          </div>
          <div className={`text-sm font-bold ${severity.color}`}>
            {isHi ? severity.hi : severity.en}
          </div>
        </div>

        {/* Interactive Slider Input */}
        <div className="space-y-3 px-2">
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full h-3 bg-slate-200 dark:bg-navy-700 rounded-lg appearance-none cursor-pointer accent-teal-500 focus:outline-none"
            aria-label="Pain severity slider 1 to 10"
          />

          <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
            <span>1 (Mild)</span>
            <span>5 (Moderate)</span>
            <span>10 (Worst pain)</span>
          </div>
        </div>

        {/* Quick Number Buttons */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setValue(num)}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                value === num
                  ? "bg-teal-500 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-navy-800 text-muted-foreground hover:text-foreground"
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-navy-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {isHi ? "रद्द करें" : "Cancel"}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleConfirm}
            className="shadow-teal-glow"
            leftIcon={<Check className="w-4 h-4" />}
          >
            {isHi ? "तीव्रता जोड़ें" : "Add to Message"}
          </Button>
        </div>
      </div>
    </div>
  );
}
