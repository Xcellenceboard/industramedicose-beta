"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  Clock,
  CheckCircle2,
  FileText,
  Smartphone,
  Search,
  BookOpen,
  ArrowLeft,
  ChevronDown,
  Sparkles,
  AlertOctagon,
  Copy,
  Check,
  Zap,
  Volume2,
  Lock,
  Layers,
  HeartPulse,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/components/providers/I18nProvider";

interface Chapter {
  id: string;
  category: "workflow" | "triage" | "soap" | "safety" | "documents" | "abdm" | "mobile" | "shortcuts";
  titleEn: string;
  titleHi: string;
  badge: string;
  readTime: string;
  summaryEn: string;
  summaryHi: string;
  contentEn: React.ReactNode;
  contentHi: React.ReactNode;
}

const CATEGORIES = [
  { id: "all", labelEn: "All Chapters", labelHi: "सभी अध्याय" },
  { id: "workflow", labelEn: "120s Workflow", labelHi: "120s कार्यप्रवाह" },
  { id: "triage", labelEn: "OPD Triage", labelHi: "ओपीडी ट्राइएज" },
  { id: "soap", labelEn: "SOAP & Two-Minute View", labelHi: "SOAP व 2-मिनट व्यू" },
  { id: "safety", labelEn: "Safety & Collisions", labelHi: "सुरक्षा व ड्रग टकराव" },
  { id: "documents", labelEn: "Document OCR", labelHi: "दस्तावेज़ ओसीआर" },
  { id: "abdm", labelEn: "ABDM Signing", labelHi: "एबीडीएम सत्यापन" },
  { id: "mobile", labelEn: "Mobile OPD Rounds", labelHi: "मोबाइल ओपीडी" },
  { id: "shortcuts", labelEn: "Hotkeys", labelHi: "शॉर्टकट" },
] as const;

export default function DoctorGuidePage() {
  const { locale } = useI18n();
  const isHi = locale === "hi";

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedChapter, setExpandedChapter] = useState<string | null>("ch-workflow");
  const [copiedShortcut, setCopiedShortcut] = useState<string | null>(null);

  // Interactive Checklist State (persisted in component state)
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    step1: true,
    step2: false,
    step3: false,
    step4: false,
    step5: false,
    step6: false,
  });

  // Interactive Simulator States
  const [simTwoMinuteView, setSimTwoMinuteView] = useState(true);
  const [simEditedField, setSimEditedField] = useState(false);
  const [simSelectedDrug, setSimSelectedDrug] = useState<string>("Amoxicillin");
  const [simSoundPlaying, setSimSoundPlaying] = useState(false);

  const toggleChecklist = (key: string) => {
    setCompletedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 6) * 100);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedShortcut(text);
    setTimeout(() => setCopiedShortcut(null), 2000);
  };

  const playDemoChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
      setSimSoundPlaying(true);
      setTimeout(() => setSimSoundPlaying(false), 500);
    } catch {
      // AudioContext fallback
    }
  };

  const chapters: Chapter[] = useMemo(
    () => [
      {
        id: "ch-workflow",
        category: "workflow",
        titleEn: "Chapter 1: The 120-Second Clinical Workflow",
        titleHi: "अध्याय 1: 120-सेकंड क्लिनिकल कार्यप्रणाली",
        badge: "Core Methodology",
        readTime: "2 min read",
        summaryEn:
          "How Industra Medicose compresses routine pre-consultation documentation from 10 minutes to under 120 seconds while retaining full clinical depth.",
        summaryHi:
          "इंडस्ट्रा मेडिकोज़ कैसे 10 मिनट के पारंपरिक दस्तावेज़ीकरण को बिना किसी क्लिनिकल चूक के 120 सेकंड में समेट देता है।",
        contentEn: (
          <div className="space-y-4 text-sm text-foreground/90">
            <p>
              In busy Indian OPDs (such as AIIMS or district hospitals), a physician sees between 60 to 100 patients every morning. Spending 7 to 10 minutes on history taking and typing into legacy EHR systems leaves less than 2 minutes for actual patient interaction.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
              <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-navy-800 border border-teal-200/60 dark:border-navy-700">
                <span className="text-xs font-bold text-teal-700 dark:text-teal-300 block mb-1">
                  Step 1 &bull; Autonomous Intake
                </span>
                <p className="text-xs text-muted-foreground">
                  Patient speaks in Hindi or English in the waiting area. Voice agents extract complaints, onset, duration, and pain severity.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-navy-800 border border-teal-200/60 dark:border-navy-700">
                <span className="text-xs font-bold text-teal-700 dark:text-teal-300 block mb-1">
                  Step 2 &bull; Instant Synthesis
                </span>
                <p className="text-xs text-muted-foreground">
                  The Multi-Agent engine categorizes symptoms into SOAP notes, checks drug allergies, and flags acute red flags.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-navy-800 border border-teal-200/60 dark:border-navy-700">
                <span className="text-xs font-bold text-teal-700 dark:text-teal-300 block mb-1">
                  Step 3 &bull; Physician Sign-off
                </span>
                <p className="text-xs text-muted-foreground">
                  Doctor enters cabin, glances at the 8 Critical Facts, conducts examination, edits if needed, and signs in 1 click.
                </p>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-mint-50/80 dark:bg-navy-800/80 border border-teal-200/60 dark:border-teal-800/50 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-teal-900 dark:text-teal-200">The 120-Second Rule:</strong> Every consultation screen features an active stopwatch. Our telemetry tracks your review speed to maintain high-throughput clinic velocity without cognitive overload.
              </div>
            </div>
          </div>
        ),
        contentHi: (
          <div className="space-y-4 text-sm text-foreground/90">
            <p>
              भारतीय सरकारी व निजी ओपीडी में एक डॉक्टर सुबह 60 से 100 मरीज़ देखता है। पुराने सॉफ़्टवेयर में टाइपिंग में 8-10 मिनट चले जाते हैं।
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
              <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-navy-800 border border-teal-200/60 dark:border-navy-700">
                <span className="text-xs font-bold text-teal-700 dark:text-teal-300 block mb-1">
                  चरण 1 &bull; वॉइस इंटेक
                </span>
                <p className="text-xs text-muted-foreground">
                  मरीज़ वेटिंग रूम में ही बोलकर अपने लक्षण दर्ज करता है। एआई एजेंट मुख्य तकलीफ को पहचानते हैं।
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-navy-800 border border-teal-200/60 dark:border-navy-700">
                <span className="text-xs font-bold text-teal-700 dark:text-teal-300 block mb-1">
                  चरण 2 &bull; तात्कालिक संश्लेषण
                </span>
                <p className="text-xs text-muted-foreground">
                  मल्टी-एजेंट इंजन तुरंत SOAP नोट बनाता है और दवाइयों की एलर्जी व आपातकालीन संकेतों की जांच करता है।
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-navy-800 border border-teal-200/60 dark:border-navy-700">
                <span className="text-xs font-bold text-teal-700 dark:text-teal-300 block mb-1">
                  चरण 3 &bull; डॉक्टर सत्यापन
                </span>
                <p className="text-xs text-muted-foreground">
                  डॉक्टर 8 प्रमुख बिंदुओं को 30 सेकंड में देखकर शारीरिक जांच करते हैं और एक क्लिक में डिजिटल साइन करते हैं।
                </p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "ch-triage",
        category: "triage",
        titleEn: "Chapter 2: OPD Triage Console Mastery",
        titleHi: "अध्याय 2: ओपीडी ट्राइएज कंसोल का उपयोग",
        badge: "Queue Prioritization",
        readTime: "3 min read",
        summaryEn:
          "Realtime patient queue sorted urgent-first, visual urgency tier indicators, audio chime notifications, and rapid filtering.",
        summaryHi:
          "वास्तविक समय कतार जो आपातकालीन मामलों को सबसे ऊपर रखती है, रंगीन ट्राइएज बैज, ऑडियो अलर्ट व त्वरित फ़िल्टर।",
        contentEn: (
          <div className="space-y-4 text-sm text-foreground/90">
            <p>
              The OPD Queue at <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-navy-800 font-mono text-xs">/doctor</code> is connected directly to Supabase Realtime via WebSockets. When a new patient finishes their intake, their card lands on your screen with zero page refresh.
            </p>
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl border border-coral-200 dark:border-coral-900/60 bg-coral-50/50 dark:bg-coral-950/20 flex items-start gap-3">
                <span className="w-3 h-3 rounded-full bg-coral-500 mt-1 shrink-0 animate-ping" />
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-coral-800 dark:text-coral-300 text-xs">Urgent Priority (Red)</strong>
                    <span className="text-[10px] bg-coral-500 text-white font-bold px-1.5 rounded">Top of Queue</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Suspected ACS (chest pain + diaphoresis), acute respiratory distress (SpO2 &lt; 92%), stroke signs, intractable pediatric vomiting. Always sorted ahead of routine visits regardless of waiting time.
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 flex items-start gap-3">
                <span className="w-3 h-3 rounded-full bg-amber-500 mt-1 shrink-0" />
                <div>
                  <strong className="text-amber-800 dark:text-amber-300 text-xs">Attention Required (Yellow)</strong>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Uncontrolled chronic diseases (HbA1c &gt; 9%, blood sugar &gt; 220 mg/dL, Stage 2 Hypertension), or severe drug-drug collision warnings.
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/20 flex items-start gap-3">
                <span className="w-3 h-3 rounded-full bg-teal-500 mt-1 shrink-0" />
                <div>
                  <strong className="text-teal-800 dark:text-teal-300 text-xs">Routine Queue (Green)</strong>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Acute uncomplicated viral pharyngitis, mild seasonal allergies, prescription refill requests.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-white border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-teal-400" />
                <span>Urgent Audio Alert Chime</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-slate-700 text-white hover:bg-slate-800"
                onClick={playDemoChime}
              >
                {simSoundPlaying ? "Playing..." : "Test Chime"}
              </Button>
            </div>
          </div>
        ),
        contentHi: (
          <div className="space-y-4 text-sm text-foreground/90">
            <p>
              ओपीडी कतार सीधे सुपरबेस रियलटाइम से जुड़ी है। नया मरीज़ आते ही स्क्रीन बिना रिफ्रेश हुए तुरंत अपडेट होती है।
            </p>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-coral-50/40 dark:bg-coral-950/20 border border-coral-200">
                <strong className="text-coral-700 dark:text-coral-300 text-xs">तत्काल प्राथमिकता (लाल):</strong>
                <p className="text-xs text-muted-foreground">सीने में दर्द, सांस फूलना, स्ट्रोक के लक्षण। ये हमेशा सबसे पहले दिखते हैं।</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200">
                <strong className="text-amber-700 dark:text-amber-300 text-xs">विशेष ध्यान (पीला):</strong>
                <p className="text-xs text-muted-foreground">अनियंत्रित शुगर (200+ mg/dL) या उच्च रक्तचाप।</p>
              </div>
              <div className="p-3 rounded-xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200">
                <strong className="text-teal-700 dark:text-teal-300 text-xs">सामान्य कतार (हरा):</strong>
                <p className="text-xs text-muted-foreground">मौसमी सर्दी, खांसी या दवा की नियमित पर्ची।</p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "ch-soap",
        category: "soap",
        titleEn: "Chapter 3: Two-Minute View vs Full SOAP Summary",
        titleHi: "अध्याय 3: 2-मिनट व्यू बनाम पूर्ण SOAP सारांश",
        badge: "Interactive Feature",
        readTime: "3 min read",
        summaryEn:
          "The heart of the consultation room: toggle between 8 Critical Facts and the expanded SOAP note, inline-editing with visual AI verification badges.",
        summaryHi:
          "परामर्श कक्ष का मुख्य केंद्र: 8 प्रमुख तथ्यों और विस्तृत SOAP नोट में स्विच करें, इन-लाइन संपादन और एआई सत्यापन बैज।",
        contentEn: (
          <div className="space-y-4 text-sm text-foreground/90">
            <p>
              When evaluating a patient at <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-navy-800 font-mono text-xs">/doctor/consultation/[id]</code>, doctors have two visual modes:
            </p>
            
            {/* Live Interactive Simulator in Guide */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  Interactive Simulator &bull; Try Switching Modes
                </span>
                <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setSimTwoMinuteView(true)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      simTwoMinuteView ? "bg-teal-500 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Two-Minute View (8 Facts)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimTwoMinuteView(false)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      !simTwoMinuteView ? "bg-teal-500 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Full SOAP Note
                  </button>
                </div>
              </div>

              {simTwoMinuteView ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-teal-400 block font-sans font-bold">1. Complaint</span>
                    <span className="text-slate-200">Retrosternal chest pain x 2h</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-teal-400 block font-sans font-bold">2. Severity</span>
                    <span className="text-coral-400 font-bold">8 / 10 Crushing</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-teal-400 block font-sans font-bold">3. Vitals</span>
                    <span className="text-slate-200">BP 168/104 | HR 108</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-teal-400 block font-sans font-bold">4. Red Flag</span>
                    <span className="text-coral-400 font-bold">ACS / Unstable Angina</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-teal-400 block font-sans font-bold">5. Allergies</span>
                    <span className="text-coral-300">Penicillin (Severe)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-teal-400 block font-sans font-bold">6. Active Rx</span>
                    <span className="text-slate-200">Telmisartan 40mg</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-teal-400 block font-sans font-bold">7. Duration</span>
                    <span className="text-slate-200">Acute onset 2 hours</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-teal-400 block font-sans font-bold">8. Intake Scribe</span>
                    <span className="text-teal-300">Verified (114s)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-teal-400">Subjective (Patient Reported):</span>
                      <button
                        type="button"
                        onClick={() => setSimEditedField(!simEditedField)}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold transition-all ${
                          simEditedField
                            ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                            : "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                        }`}
                      >
                        {simEditedField ? "✓ Physician Verified" : "✦ AI-Generated (Click to Edit)"}
                      </button>
                    </div>
                    <p className="text-slate-300 font-mono text-[11px]">
                      {simEditedField
                        ? "Patient reports 2-hour crushing chest pain radiating to left jaw & diaphoresis. Confirmed on physical exam."
                        : "Acute retrosternal crushing chest pain radiating to left shoulder x 2 hours accompanied by diaphoresis."}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="font-bold text-teal-400 block mb-1">Assessment & ICD-10:</span>
                    <span className="text-slate-300 font-mono text-[11px]">
                      I20.0 Unstable Angina / Acute Coronary Syndrome (High Urgency)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              <strong>Inline Editing Rule:</strong> Every field generated by AI has a purple badge. As soon as you click into the field and edit or approve it, the badge turns into a blue/teal &ldquo;Physician Verified&rdquo; badge. Raw AI text is never locked.
            </p>
          </div>
        ),
        contentHi: (
          <div className="space-y-4 text-sm text-foreground/90">
            <p>
              परामर्श पृष्ठ पर डॉक्टर दो मोड में काम कर सकते हैं:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
              <li><strong>2-मिनट व्यू:</strong> केवल 8 सबसे महत्वपूर्ण क्लिनिकल बिंदु (लक्षण, गंभीरता, वाइटल्स, रेड फ्लैग, एलर्जी आदि)।</li>
              <li><strong>विस्तृत SOAP नोट:</strong> सब्जेक्टिव, ऑब्जेक्टिव, असेसमेंट और प्लान का पूरा विवरण।</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              एआई द्वारा लिखे गए हर वाक्य के साथ बैंगनी रंग का बैज होता है। जैसे ही डॉक्टर उसमें बदलाव करते हैं, वह &ldquo;डॉक्टर द्वारा सत्यापित&rdquo; बन जाता है।
            </p>
          </div>
        ),
      },
      {
        id: "ch-safety",
        category: "safety",
        titleEn: "Chapter 4: Clinical Safety Guard & Collision Engine",
        titleHi: "अध्याय 4: क्लिनिकल सेफ्टी गार्ड व ड्रग टकराव इंजन",
        badge: "Zero-Miss Policy",
        readTime: "3 min read",
        summaryEn:
          "Two-tier defense: sub-2ms deterministic regex gate plus AI clinical reasoning. Real-time penicillin allergy blocking and mandatory override justifications.",
        summaryHi:
          "दो स्तरीय सुरक्षा: 2 मिलीसेकंड से तेज़ डिटरमिनिस्टिक गेट और एआई क्लिनिकल तर्क। पेनिसिलिन एलर्जी ब्लॉकिंग और अनिवार्य ओवरराइड कारण।",
        contentEn: (
          <div className="space-y-4 text-sm text-foreground/90">
            <p>
              Patient safety is our non-negotiable priority. Industra Medicose implements a strictly layered two-tier safety architecture:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700">
                <span className="text-xs font-bold text-coral-600 dark:text-coral-400 flex items-center gap-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5" /> Layer 1 &bull; Deterministic Match (&lt; 2ms)
                </span>
                <p className="text-xs text-muted-foreground">
                  Zero LLM latency. Instant regex scanning across Hindi, English, and Hinglish for 40+ high-risk clinical triggers (e.g. chest pain, slurred speech, infant fever). Operates even during API outages.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> Layer 2 &bull; Clinical Reasoning Agent
                </span>
                <p className="text-xs text-muted-foreground">
                  Gemini multimodal evaluation detects nuanced inconsistencies between patient-reported symptoms and scanned lab values. Crucial rule: AI can only RAISE urgency, never lower it.
                </p>
              </div>
            </div>

            {/* Interactive Allergy Collision Test */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block">
                Simulator &bull; Allergy Collision Detection
              </span>
              <p className="text-xs text-slate-300">
                Patient has documented <strong className="text-coral-400">Penicillin Hypersensitivity</strong>. Select a drug to prescribe:
              </p>
              <div className="flex flex-wrap gap-2">
                {["Amoxicillin", "Augmentin (Co-amoxiclav)", "Azithromycin", "Ceftriaxone"].map((drug) => (
                  <button
                    key={drug}
                    type="button"
                    onClick={() => setSimSelectedDrug(drug)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      simSelectedDrug === drug
                        ? "bg-teal-500 text-white"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {drug}
                  </button>
                ))}
              </div>

              {simSelectedDrug.includes("Amox") || simSelectedDrug.includes("Augmentin") ? (
                <div className="p-3 rounded-xl bg-coral-950/60 border border-coral-500/50 text-coral-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertOctagon className="w-4 h-4 text-coral-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-coral-300">COLLISION BLOCKED: Beta-Lactam Class Contraindication</strong>
                    <span>{simSelectedDrug} shares cross-reactivity with Penicillin. Requires documented clinical override rationale before signing.</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-500/50 text-teal-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-teal-300">Clear: No Cross-Reactivity Collision</strong>
                    <span>{simSelectedDrug} is safe to prescribe with standard adult dosing parameters.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ),
        contentHi: (
          <div className="space-y-4 text-sm text-foreground/90">
            <p>
              मरीज़ों की सुरक्षा हमारे सिस्टम की पहली प्राथमिकता है। इसके लिए दोहरी सुरक्षा प्रणाली बनाई गई है:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
              <li><strong>लेयर 1 (2 मिलीसेकंड):</strong> हिंदी और अंग्रेजी के 40 से अधिक आपातकालीन शब्दों की त्वरित पहचान।</li>
              <li><strong>लेयर 2 (एआई रीजनिंग):</strong> पुरानी पर्चियों और दवाओं के टकराव की जांच। एआई केवल आपातकाल का स्तर बढ़ा सकता है, घटा नहीं सकता।</li>
            </ul>
          </div>
        ),
      },
      {
        id: "ch-documents",
        category: "documents",
        titleEn: "Chapter 5: Medical Document Intelligence",
        titleHi: "अध्याय 5: मेडिकल दस्तावेज़ इंटेलिजेंस",
        badge: "Multimodal OCR",
        readTime: "2 min read",
        summaryEn:
          "Automatic parsing of physical doctor slips and lab PDF reports into structured JSON, highlighting elevated biomarkers and active medications.",
        summaryHi:
          "हाथ से लिखी पर्चियों और लैब रिपोर्ट का स्वतः विश्लेषण, असामान्य बायोमार्कर व पुरानी दवाओं की पहचान।",
        contentEn: (
          <div className="space-y-4 text-sm text-foreground/90">
            <p>
              Patients often bring crumpled paper slips from private dispensaries or lab tests from local centers. Our Document Intelligence Agent uses Gemini multimodal input to extract:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700">
                <span className="font-bold text-navy dark:text-white block mb-1">
                  1. Handwritten Prescription Extraction
                </span>
                <p className="text-muted-foreground">
                  Identifies drug names, dosages (e.g. 40mg, 500mg), frequency (OD, BD, TDS), and intended indication, even from cursive handwriting.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700">
                <span className="font-bold text-navy dark:text-white block mb-1">
                  2. Abnormal Lab Biomarkers
                </span>
                <p className="text-muted-foreground">
                  Flags biomarkers outside reference ranges (e.g. Fasting Glucose 210 mg/dL, HbA1c 8.4%, Creatinine 1.8 mg/dL) with color-coded status pills.
                </p>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs space-y-2">
              <span className="text-teal-400 font-bold block text-[11px] uppercase tracking-wider font-sans">
                Sample Extracted Biomarker Stream
              </span>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span>HbA1c (Glycated Hemoglobin)</span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">8.4%</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-sans font-bold">HIGH</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span>Serum Creatinine</span>
                <div className="flex items-center gap-2">
                  <span className="text-teal-400 font-bold">0.9 mg/dL</span>
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-sans font-bold">NORMAL</span>
                </div>
              </div>
            </div>
          </div>
        ),
        contentHi: (
          <div className="space-y-4 text-sm text-foreground/90">
            <p>
              मरीज़ अक्सर पुरानी पर्चियां लेकर आते हैं। हमारा सिस्टम हाथ की लिखाई और जांच रिपोर्ट को सीधे पढ़कर दवाओं और जांच परिणामों की सूची बना देता है।
            </p>
          </div>
        ),
      },
      {
        id: "ch-abdm",
        category: "abdm",
        titleEn: "Chapter 6: ABDM M2 Digital Signing & Patient Protection",
        titleHi: "अध्याय 6: एबीडीएम M2 डिजिटल हस्ताक्षर व मरीज़ सुरक्षा",
        badge: "Compliance & Ethics",
        readTime: "2 min read",
        summaryEn:
          "The unverified AI disclosure barrier: raw AI drafts are never exposed to patients before physician sign-off. Instant FHIR bundle generation and PDF download.",
        summaryHi:
          "अपुष्ट एआई अवरोधक: डॉक्टर के साइन करने से पहले मरीज़ को कोई कच्चा एआई ड्राफ्ट नहीं दिखता। तत्काल एबीडीएम एफएचआईआर व पीडीएफ निर्माण।",
        contentEn: (
          <div className="space-y-4 text-sm text-foreground/90">
            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>The Unverified AI Disclosure Barrier:</strong> Under Indian healthcare regulations and ethical guidelines, raw AI summaries are strictly hidden from patients. The patient portal only displays verified records stamped with status: <code>approved</code>.
              </div>
            </div>
            <p>
              When you click <strong className="text-teal-600 dark:text-teal-400">&ldquo;Approve &amp; Sign&rdquo;</strong> at the top of the consultation page:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-muted-foreground">
              <li>Your Medical Council Registration number is stamped onto the record.</li>
              <li>A SHA-256 cryptographic audit hash is generated and logged to the immutable audit table.</li>
              <li>Standard FHIR bundles (Encounter, Condition, MedicationRequest) are compiled.</li>
              <li>The patient is immediately notified that their digital prescription is ready for download in English or Hindi.</li>
            </ol>
          </div>
        ),
        contentHi: (
          <div className="space-y-4 text-sm text-foreground/90">
            <p>
              भारतीय स्वास्थ्य नियमों के अनुसार कच्चा एआई ड्राफ्ट कभी भी सीधे मरीज़ को नहीं दिखाया जाता। डॉक्टर द्वारा &ldquo;स्वीकृत एवं हस्ताक्षरित&rdquo; करने के बाद ही मरीज़ पर्चा डाउनलोड कर सकता है।
            </p>
          </div>
        ),
      },
      {
        id: "ch-mobile",
        category: "mobile",
        titleEn: "Chapter 7: Mobile OPD Doctor Experience (On-the-Go Rounds)",
        titleHi: "अध्याय 7: मोबाइल ओपीडी डॉक्टर अनुभव (वार्ड राउंड्स)",
        badge: "Thumb-Friendly UI",
        readTime: "2 min read",
        summaryEn:
          "Conducting OPD rounds on a smartphone or tablet: 48px touch targets, collapsible 3-column consultation views, and swipeable triage filters.",
        summaryHi:
          "स्मार्टफोन या टैबलेट पर ओपीडी व वार्ड राउंड्स: 48px बड़े टच बटन, समेटने योग्य 3-कॉलम व्यू और स्वाइप करने योग्य फ़िल्टर।",
        contentEn: (
          <div className="space-y-4 text-sm text-foreground/90">
            <p>
              Physicians don&apos;t always sit in front of a desktop workstation. Industra Medicose is 100% responsive and tested on modern mobile viewports (down to 360px width):
            </p>
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 flex items-start gap-2.5 text-xs">
                <Smartphone className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-navy dark:text-white">Responsive 3-Column Collapse:</strong>
                  <p className="text-muted-foreground mt-0.5">
                    On mobile, the 3-column consultation room stacks cleanly: Left patient profile snaps into a top accordion card, while the Center SOAP editor occupies the full screen width with 48px thumb buttons.
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 flex items-start gap-2.5 text-xs">
                <Layers className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-navy dark:text-white">Swipeable Filter Pills:</strong>
                  <p className="text-muted-foreground mt-0.5">
                    The Triage Queue filter bar scrolls smoothly with touch gestures without horizontal scrollbar clutter (<code className="font-mono">overflow-x-auto no-scrollbar</code>).
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 flex items-start gap-2.5 text-xs">
                <Zap className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-navy dark:text-white">Touch-Safe Sticky Action Bar:</strong>
                  <p className="text-muted-foreground mt-0.5">
                    The review stopwatch, Two-Minute view toggle, and &ldquo;Approve &amp; Sign&rdquo; button remain comfortably within reach of your thumb.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ),
        contentHi: (
          <div className="space-y-4 text-sm text-foreground/90">
            <p>
              अस्पताल के राउंड्स के दौरान डॉक्टर फोन या टैबलेट पर भी आसानी से काम कर सकते हैं। सभी बटन अंगूठे से दबाने के लिए पर्याप्त बड़े (44-48px) हैं।
            </p>
          </div>
        ),
      },
      {
        id: "ch-shortcuts",
        category: "shortcuts",
        titleEn: "Chapter 8: Power Clinician Keyboard Shortcuts",
        titleHi: "अध्याय 8: त्वरित कीबोर्ड शॉर्टकट्स",
        badge: "Speed Hacks",
        readTime: "1 min read",
        summaryEn:
          "Master desktop hotkeys to navigate the entire OPD triage queue and sign consultations without ever lifting your hands to touch a mouse.",
        summaryHi:
          "बिना माउस छुए पूरी ओपीडी कतार नेविगेट करने और पर्चे साइन करने के आसान कीबोर्ड शॉर्टकट।",
        contentEn: (
          <div className="space-y-4 text-sm text-foreground/90">
            <p>
              For maximum clinic velocity, our application supports global single-key shortcuts:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { key: "J", desc: "Select next patient down in queue", context: "Queue" },
                { key: "K", desc: "Select previous patient up in queue", context: "Queue" },
                { key: "Enter / O", desc: "Open selected patient consultation", context: "Queue" },
                { key: "2", desc: "Toggle Two-Minute View (8 Critical Facts)", context: "Consultation" },
                { key: "A", desc: "Approve & digitally sign consultation", context: "Consultation" },
                { key: "V", desc: "Mark all extracted AI fields verified", context: "Consultation" },
                { key: "D", desc: "Switch to Medical Documents panel", context: "Consultation" },
                { key: "T", desc: "Switch to Hindi-English Transcript", context: "Consultation" },
                { key: "?", desc: "Open Keyboard Shortcuts reference modal", context: "Global" },
                { key: "Esc", desc: "Close open modal or return to queue", context: "Global" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700"
                >
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 rounded bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-600 font-mono font-bold text-teal-600 dark:text-teal-400 text-xs shadow-2xs">
                      {item.key}
                    </kbd>
                    <span className="text-foreground/90">{item.desc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.key)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground"
                    title="Copy key"
                  >
                    {copiedShortcut === item.key ? (
                      <Check className="w-3.5 h-3.5 text-teal-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ),
        contentHi: (
          <div className="space-y-4 text-sm text-foreground/90">
            <p>
              तेज़ काम करने के लिए कीबोर्ड से सीधे कमांड दें:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
              <li><strong>J / K:</strong> कतार में अगले/पिछले मरीज़ पर जाएं।</li>
              <li><strong>Enter:</strong> चुने हुए मरीज़ का परामर्श खोलें।</li>
              <li><strong>2:</strong> 2-मिनट व्यू चालू/बंद करें।</li>
              <li><strong>A:</strong> डिजिटल हस्ताक्षर करें।</li>
            </ul>
          </div>
        ),
      },
    ],
    [simTwoMinuteView, simEditedField, simSelectedDrug, simSoundPlaying, copiedShortcut]
  );

  // Filtered Chapters based on search and category
  const filteredChapters = useMemo(() => {
    return chapters.filter((ch) => {
      const matchesCategory =
        activeCategory === "all" || ch.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        ch.titleEn.toLowerCase().includes(query) ||
        ch.titleHi.toLowerCase().includes(query) ||
        ch.summaryEn.toLowerCase().includes(query) ||
        ch.summaryHi.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [chapters, activeCategory, searchQuery]);

  return (
    <AppShell>
      <div className="space-y-8 pb-16">
        {/* Top Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-navy-800 to-navy-900 text-white p-6 sm:p-10 border border-teal-500/20 shadow-soft-lg">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-4xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/doctor">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-7 text-xs"
                  leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                >
                  {isHi ? "वापस ओपीडी कतार में" : "Back to Doctor Queue"}
                </Button>
              </Link>
              <Badge variant="verified" size="sm">
                Clinician Edition &bull; Two-Minute Doctor
              </Badge>
              <span className="text-xs text-teal-300 font-mono">AAYU 2026 Problem T01</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {isHi
                  ? "डॉक्टर गाइडबुक एवं क्लिनिकल ट्यूटोरियल"
                  : "Doctor Guidebook & Clinical Tutorial"}
              </h1>
              <p className="text-xs sm:text-base text-slate-300 mt-2 max-w-2xl leading-relaxed">
                {isHi
                  ? "हाई-थ्रूपुट ओपीडी ट्राइएज, 120-सेकंड प्री-कंसल्टेशन सारांश, दवाइयों की एलर्जी व ड्रग टकराव, और एबीडीएम M2 डिजिटल सत्यापन के लिए संपूर्ण मार्गदर्शिका।"
                  : "The comprehensive handbook for high-throughput OPD triage, 120-second clinical summaries, allergy collision guards, and ABDM M2 compliant verification."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/doctor">
                <Button
                  variant="default"
                  size="md"
                  leftIcon={<Stethoscope className="w-4 h-4" />}
                  className="shadow-teal-glow"
                >
                  {isHi ? "लाइव ओपीडी खोलें" : "Open Live Doctor OPD"}
                </Button>
              </Link>
              <Link href="/guide">
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<BookOpen className="w-4 h-4" />}
                >
                  {isHi ? "मरीज़ व एडमिन गाइड" : "Full Platform Guide"}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Interactive Clinician Onboarding Checklist */}
        <section aria-labelledby="checklist-heading" className="space-y-4">
          <Card className="p-5 sm:p-6 border border-slate-200/80 dark:border-navy-700 bg-gradient-to-r from-teal-50/50 via-white to-mint-50/30 dark:from-navy-900 dark:via-navy-800/80 dark:to-navy-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-navy-700">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="checklist-heading" className="text-base sm:text-lg font-bold text-navy dark:text-white">
                    {isHi ? "इंटरएक्टिव ऑनबोर्डिंग चेकलिस्ट" : "Doctor Quick-Start Onboarding Checklist"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isHi
                      ? "सिस्टम की सभी 6 मुख्य क्षमताओं का अभ्यास करें:"
                      : "Master all 6 clinical competencies to unlock peak OPD velocity:"}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-3 sm:w-64">
                <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-navy-700 overflow-hidden">
                  <div
                    className="h-full bg-teal-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 whitespace-nowrap">
                  {completedCount}/6 ({progressPercent}%)
                </span>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
              {[
                { key: "step1", text: "Identify Urgent Red Flag card in OPD Triage Queue" },
                { key: "step2", text: "Toggle Two-Minute View (8 Critical Facts snapshot)" },
                { key: "step3", text: "In-line edit Subjective AI draft & observe Verified chip" },
                { key: "step4", text: "Inspect extracted Lab Biomarkers & handwriting OCR" },
                { key: "step5", text: "Simulate Penicillin Allergy collision & override rationale" },
                { key: "step6", text: "1-Click Verify & Sign (generates ABDM FHIR record)" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleChecklist(item.key)}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all min-h-[44px] ${
                    completedSteps[item.key]
                      ? "bg-teal-500/10 border-teal-500/30 text-navy dark:text-white"
                      : "bg-white/80 dark:bg-navy-800/80 border-slate-200/80 dark:border-navy-700 text-muted-foreground hover:border-slate-300"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                      completedSteps[item.key]
                        ? "bg-teal-500 border-teal-500 text-white"
                        : "border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900"
                    }`}
                  >
                    {completedSteps[item.key] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </span>
                  <span className="text-xs font-medium leading-snug">
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </section>

        {/* Filter and Search Bar */}
        <section aria-labelledby="chapters-search-heading" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h2 id="chapters-search-heading" className="text-xl font-bold text-navy dark:text-white">
                {isHi ? "हैंडबुक अध्याय एवं गाइड" : "Handbook Chapters & Interactive Guides"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isHi ? "विशिष्ट विषय खोजें या श्रेणी चुनें" : "Search topics or filter by category"}
              </p>
            </div>

            {/* Search Input */}
            <div className="relative sm:w-80">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isHi ? "खोजें: SOAP, एलर्जी, शॉर्टकट..." : "Search: SOAP, allergy, shortcuts..."}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px]"
              />
            </div>
          </div>

          {/* Swipeable Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[44px] flex items-center justify-center ${
                    isActive
                      ? "bg-teal-500 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-navy-800 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isHi ? cat.labelHi : cat.labelEn}
                </button>
              );
            })}
          </div>

          {/* Chapters Accordion / Card List */}
          <div className="space-y-4">
            {filteredChapters.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground text-xs">
                No tutorial chapters match &ldquo;{searchQuery}&rdquo;. Try clearing your search query.
              </Card>
            ) : (
              filteredChapters.map((chapter) => {
                const isExpanded = expandedChapter === chapter.id;
                return (
                  <Card
                    key={chapter.id}
                    className="overflow-hidden border border-slate-200/80 dark:border-navy-700 transition-all hover:shadow-soft-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)}
                      className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-navy-800/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 min-h-[48px]"
                      aria-expanded={isExpanded}
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                            {chapter.badge}
                          </span>
                          <span className="text-muted-foreground text-xs">&bull;</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {chapter.readTime}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-navy dark:text-white">
                          {isHi ? chapter.titleHi : chapter.titleEn}
                        </h3>
                        <p className="text-xs text-muted-foreground max-w-3xl">
                          {isHi ? chapter.summaryHi : chapter.summaryEn}
                        </p>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-navy-800 text-muted-foreground shrink-0 mt-1">
                        <ChevronDown
                          className={`w-5 h-5 transition-transform duration-200 ${
                            isExpanded ? "rotate-180 text-teal-500" : ""
                          }`}
                        />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-5 pt-2 border-t border-slate-100 dark:border-navy-800 space-y-4">
                            {isHi ? chapter.contentHi : chapter.contentEn}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })
            )}
          </div>
        </section>

        {/* Pocket Clinician Quick-Reference Card */}
        <section aria-labelledby="pocket-guide-heading" className="space-y-3">
          <Card className="p-6 border border-teal-500/30 bg-gradient-to-r from-teal-500/10 via-mint-500/5 to-teal-500/10 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <h3 id="pocket-guide-heading" className="text-base font-bold text-navy dark:text-white">
                    {isHi ? "क्लिनिशियन पॉकेट चीट-शीट" : "Pocket Clinician Reference (Printable & Rounds Ready)"}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isHi
                    ? "ओपीडी डेस्क अथवा राउंड्स के दौरान त्वरित संदर्भ के लिए संक्षिप्त सारांश।"
                    : "Key rules for quick bedside reference: red flags, collision protocols, and 120s targets."}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => window.print()}
                  leftIcon={<FileText className="w-4 h-4" />}
                >
                  {isHi ? "प्रिंट / पीडीएफ सुरक्षित करें" : "Print Pocket Sheet"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-teal-500/20 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-white/80 dark:bg-navy-900/80 border border-teal-200/50 dark:border-navy-700">
                <strong className="text-coral-600 dark:text-coral-400 block mb-1">
                  1. Red Flags (Immediate Action)
                </strong>
                <p className="text-muted-foreground text-[11px]">
                  Chest pain + sweating, acute focal neurological deficit, SpO2 &lt; 92%, severe anaphylaxis. Auto-sorted to top of queue.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/80 dark:bg-navy-900/80 border border-teal-200/50 dark:border-navy-700">
                <strong className="text-amber-600 dark:text-amber-400 block mb-1">
                  2. Beta-Lactam Collision Rule
                </strong>
                <p className="text-muted-foreground text-[11px]">
                  Penicillin allergy blocks Amox/Augmentin. Require documented override rationale before digitally signing Rx.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/80 dark:bg-navy-900/80 border border-teal-200/50 dark:border-navy-700">
                <strong className="text-teal-600 dark:text-teal-400 block mb-1">
                  3. Key Hotkeys For Velocity
                </strong>
                <p className="text-muted-foreground text-[11px]">
                  <code>J</code> / <code>K</code> = Next / Prev patient &bull; <code>2</code> = Two-Min View &bull; <code>A</code> = Approve &amp; Sign &bull; <code>?</code> = Help.
                </p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
