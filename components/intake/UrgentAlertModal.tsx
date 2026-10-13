"use client";

import React, { useState } from "react";
import {
  PhoneCall,
  BellRing,
  HeartHandshake,
  CheckCircle2,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SafetyCheckResult } from "@/agents/safety-rules-engine";

interface UrgentAlertModalProps {
  isOpen: boolean;
  onClose?: () => void;
  language: "en" | "hi" | "hinglish";
  safetyCheck?: SafetyCheckResult | null;
  consultationId?: string;
  onNotifyDoctor?: () => Promise<void> | void;
}

export function UrgentAlertModal({
  isOpen,
  language,
  safetyCheck,
  consultationId,
  onNotifyDoctor,
}: UrgentAlertModalProps) {
  const [doctorNotified, setDoctorNotified] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);

  if (!isOpen) return null;

  const isHi = language === "hi";
  const isHinglish = language === "hinglish";
  const isSuicide = safetyCheck?.is_suicide_ideation;

  const handleNotifyDoctor = async () => {
    setIsNotifying(true);
    try {
      if (onNotifyDoctor) {
        await onNotifyDoctor();
      }
      setDoctorNotified(true);
    } finally {
      setIsNotifying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-navy-950/95 backdrop-blur-xl overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="urgent-alert-title"
      aria-describedby="urgent-alert-description"
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-coral-500 space-y-6 text-center my-6">
        {/* Top Emergency Badge */}
        <div className="flex items-center justify-center gap-2">
          <Badge variant="urgent" size="md" pulse>
            {isHi ? "आपातकालीन चेतावनी (Red Alert)" : "CRITICAL SAFETY INTERRUPT"}
          </Badge>
          <span className="text-xs font-mono text-muted-foreground">
            {consultationId || "URGENT"}
          </span>
        </div>

        {/* Pulsing Emergency Icon */}
        <div className="w-20 h-20 rounded-3xl bg-coral-500/15 text-coral-600 dark:text-coral-400 flex items-center justify-center mx-auto shadow-lg animate-pulse">
          <PhoneCall className="w-10 h-10" />
        </div>

        {/* Calm, High-Contrast Message (Requirement 2) */}
        <div className="space-y-2">
          <h2
            id="urgent-alert-title"
            className="text-xl sm:text-2xl font-black text-coral-600 dark:text-coral-400 tracking-tight"
          >
            {isHi
              ? "आपके लक्षणों पर तत्काल चिकित्सकीय ध्यान देने की आवश्यकता है।"
              : isHinglish
              ? "Aapke lakshano ko tatkal doctori dekhbhal ki zaroorat hai."
              : "Your symptoms may need immediate medical attention."}
          </h2>

          <p
            id="urgent-alert-description"
            className="text-sm sm:text-base text-foreground font-semibold leading-relaxed max-w-md mx-auto"
          >
            {isHi
              ? "कृपया तुरंत 112 पर कॉल करें या नजदीकी आपातकालीन अस्पताल जाएं।"
              : isHinglish
              ? "Kripya turant 112 par call karein ya paas ke hospital emergency jayein."
              : "Please call 112 or go to the nearest emergency hospital immediately."}
          </p>
        </div>

        {/* Big Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Big Call 112 Button */}
          <a
            href="tel:112"
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-coral-600 hover:bg-coral-700 text-white font-black text-lg sm:text-xl shadow-lg shadow-coral-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Phone className="w-6 h-6 animate-bounce" />
            <span>{isHi ? "तुरंत 112 पर कॉल करें" : "Call 112 Now (Emergency)"}</span>
          </a>

          {/* Notify Doctor Button */}
          {!doctorNotified ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleNotifyDoctor}
              disabled={isNotifying}
              className="w-full border-coral-400 dark:border-coral-800 text-coral-700 dark:text-coral-300 hover:bg-coral-50 dark:hover:bg-navy-800 font-bold text-sm sm:text-base"
              leftIcon={<BellRing className="w-5 h-5" />}
            >
              {isNotifying
                ? isHi
                  ? "डॉक्टर को सूचित किया जा रहा है..."
                  : "Dispatching Priority Alert..."
                : isHi
                ? "मेरे डॉक्टर को सूचित करें (उच्च प्राथमिकता)"
                : "Notify My Doctor (High Priority Queue)"}
            </Button>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isHi
                  ? "डॉक्टर को सूचित कर दिया गया है। आपका सारांश ओपीडी में शीर्ष प्राथमिकता पर भेजा गया।"
                  : "Physician notified: Prioritized to the top of the clinician's triage queue."}
              </span>
            </div>
          )}
        </div>

        {/* Suicidal Thoughts Supportive Helpline Card (Requirement 3) */}
        {isSuicide && (
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-300 dark:border-purple-800 text-left space-y-2.5 animate-in fade-in">
            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-xs sm:text-sm">
              <HeartHandshake className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                {isHi ? "सहायता हमेशा उपलब्ध है (निःशुल्क एवं गोपनीय)" : "Support is Always Available (Free & 24/7)"}
              </span>
            </div>

            <p className="text-xs text-purple-800 dark:text-purple-300 leading-relaxed">
              {isHi
                ? "आप अकेले नहीं हैं। कठिन समय में बात करने के लिए भारत सरकार की राष्ट्रीय मानसिक स्वास्थ्य हेल्पलाइन पर तुरंत संपर्क करें:"
                : "You are not alone. Please reach out to certified crisis counselors right now:"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <a
                href="tel:14416"
                className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Tele-MANAS: 14416</span>
              </a>
              <a
                href="tel:18005990019"
                className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-purple-100 dark:hover:bg-navy-800 transition-all"
              >
                <span>KIRAN: 1800-599-0019</span>
              </a>
            </div>
          </div>
        )}

        {/* Triggered Symptoms Audit Snippet */}
        {safetyCheck?.matches && safetyCheck.matches.length > 0 && (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200 dark:border-navy-700 text-left space-y-1">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Triggered Safety Rules:
            </div>
            <div className="flex flex-wrap gap-1">
              {safetyCheck.matches.map((m, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-coral-100 dark:bg-coral-950 text-coral-800 dark:text-coral-300"
                >
                  {m.rule_name} (&ldquo;{m.matched_keyword}&rdquo;)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mandatory Safety Disclaimer Copy */}
        <div className="pt-2 border-t border-slate-200 dark:border-navy-800 text-[11px] text-muted-foreground flex items-center justify-center gap-1.5 leading-relaxed">
          <ShieldCheck className="w-3.5 h-3.5 text-coral-500 shrink-0" />
          <span>
            {isHi
              ? "इंडस्ट्रा मेडिकोज़ आपातकालीन देखभाल या डॉक्टर के स्थान पर काम नहीं करता है, केवल सहायता प्रदान करता है।"
              : "Industra Medicose supports, and does not replace, emergency care and clinicians."}
          </span>
        </div>
      </div>
    </div>
  );
}
