"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Scan,
  ShieldAlert,
  Stethoscope,
  CheckCircle2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Activity,
  AlertOctagon,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/components/providers/I18nProvider";

interface PresentationSlide {
  id: string;
  stepNumber: number;
  icon: React.ElementType;
  tabLabelEn: string;
  tabLabelHi: string;
  titleEn: string;
  titleHi: string;
  taglineEn: string;
  taglineHi: string;
  latencyBadge: string;
  descriptionEn: string;
  descriptionHi: string;
  clinicalHighlights: string[];
  demoLink: string;
  demoLinkText: string;
  mockupTitle: string;
  mockupBadge: string;
  renderMockup: () => React.ReactNode;
}

export function InteractivePresentation() {
  const { locale } = useI18n();
  const isHi = locale === "hi";

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const SLIDE_DURATION_MS = 6000;
  const TICK_INTERVAL_MS = 60;

  const slides: PresentationSlide[] = [
    {
      id: "slide-intake",
      stepNumber: 1,
      icon: Mic,
      tabLabelEn: "1. Ambient Intake",
      tabLabelHi: "1. वॉइस इंटेक",
      titleEn: "Patient Speaks in Hindi or English (Zero Typing)",
      titleHi: "मरीज़ हिंदी या अंग्रेजी में बोलते हैं (शून्य टाइपिंग)",
      taglineEn: "Vernacular speech captured in waiting halls while patient waits",
      taglineHi: "वेटिंग हॉल में ही सामान्य बोलचाल में लक्षण दर्ज किए जाते हैं",
      latencyBadge: "Latency: < 350ms • Web Speech Scribe",
      descriptionEn:
        "The patient opens their phone or uses the OPD kiosk microphone. They speak naturally in Hindi, English, or conversational Hinglish. Ambient agents filter clinic background noise, capture onset and severity, and map colloquial words directly to clinical entities.",
      descriptionHi:
        "मरीज़ फोन या क्लिनिक कियोस्क पर स्वाभाविक रूप से हिंदी या अंग्रेजी में बोलते हैं। एआई क्लिनिक के शोर को हटाकर मुख्य लक्षणों, अवधि और गंभीरता को सीधे क्लिनिकल डेटा में बदल देता है।",
      clinicalHighlights: [
        "Hindi + English Speech",
        "Zero Patient Typing",
        "ABDM Explicit Consent",
      ],
      demoLink: "/patient/intake",
      demoLinkText: "Try Voice Intake Demo",
      mockupTitle: "Ambient Scribe Voice Console",
      mockupBadge: "Listening...",
      renderMockup: () => (
        <div className="space-y-3 font-mono text-xs">
          {/* Audio Waveform Simulation */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-[11px] text-teal-300 font-bold uppercase font-sans">
                Mic Active &bull; hi-IN / en-IN
              </span>
            </div>
            {/* Waveform Bars */}
            <div className="flex items-center gap-1">
              {[40, 75, 90, 50, 85, 100, 60, 45, 95, 70, 30].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-teal-400 rounded-full transition-all duration-150"
                  style={{ height: `${Math.max(8, (h / 100) * 24)}px` }}
                />
              ))}
            </div>
          </div>

          {/* Live Transcribed Speech */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
              Live Patient Vernacular Audio
            </span>
            <p className="text-slate-200 text-xs font-medium italic leading-relaxed">
              &ldquo;पिछले 3 दिन से बहुत तेज खांसी और सीने में हल्का दर्द है, सांस लेने में भी तकलीफ हो रही है...&rdquo;
            </p>
          </div>

          {/* Extracted Clinical Entities */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <span className="text-[10px] text-teal-400 uppercase tracking-wider block font-sans font-bold">
              Autonomous Entities Extracted
            </span>
            <div className="flex flex-wrap gap-1.5 font-sans">
              <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold">
                Chief Complaint: Dry Cough x 3d
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                Severity: 7/10 Mod-Severe
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                Associated: Dyspnea
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "slide-ocr",
      stepNumber: 2,
      icon: Scan,
      tabLabelEn: "2. Document OCR",
      tabLabelHi: "2. दस्तावेज़ ओसीआर",
      titleEn: "Multi-Modal OCR Parses Old Prescriptions & Lab Slips",
      titleHi: "पुरानी पर्चियों और लैब रिपोर्ट का मल्टी-मॉडल ओसीआर",
      taglineEn: "Handwritten physical slips digitized with confidence scores",
      taglineHi: "हाथ से लिखी पुरानी पर्चियां स्वतः संगठित डेटा में बदल जाती हैं",
      latencyBadge: "Latency: < 680ms • Multimodal Gemini OCR",
      descriptionEn:
        "Patients upload physical prescription photos or lab report PDFs. The Document Intelligence Agent performs multi-modal optical character recognition, decoding doctor handwriting, active generic drug names, and abnormal lab biomarkers.",
      descriptionHi:
        "मरीज़ पुरानी पर्चियों या लैब रिपोर्ट की फोटो अपलोड करते हैं। डॉक्यूमेंट इंटेलिजेंस एजेंट हाथ की लिखाई को पढ़कर दवाइयों के नाम और असामान्य जांच रिपोर्ट को तुरंत निकाल लेता है।",
      clinicalHighlights: [
        "Handwritten Rx Digitization",
        "Abnormal Biomarker Flags",
        "Chronological Medical Timeline",
      ],
      demoLink: "/patient",
      demoLinkText: "Explore Report Scanner",
      mockupTitle: "Optical Document Intelligence Stream",
      mockupBadge: "OCR Processed",
      renderMockup: () => (
        <div className="space-y-3 font-mono text-xs">
          {/* Document Source */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between font-sans">
            <div className="flex items-center gap-2">
              <Scan className="w-4 h-4 text-teal-400" />
              <span className="text-xs text-slate-200 font-bold truncate max-w-[180px] sm:max-w-none">
                OPD_Prescription_Slip.jpg (3.2 MB)
              </span>
            </div>
            <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-1.5 py-0.5 rounded font-bold">
              96.2% Confidence
            </span>
          </div>

          {/* Extracted Active Medications */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[10px] text-teal-400 uppercase tracking-wider block font-sans font-bold">
              Extracted Chronic Medications
            </span>
            <div className="space-y-1 text-[11px] text-slate-300">
              <div className="flex items-center justify-between">
                <span>&bull; Tab Telmisartan 40mg OD</span>
                <span className="text-[10px] text-teal-300 font-sans">Antihypertensive</span>
              </div>
              <div className="flex items-center justify-between">
                <span>&bull; Tab Atorvastatin 10mg HS</span>
                <span className="text-[10px] text-teal-300 font-sans">Lipid-lowering</span>
              </div>
            </div>
          </div>

          {/* Lab Biomarker Highlight */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-sans font-bold">
              Extracted Lab Biomarkers
            </span>
            <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
              <span className="text-slate-200">HbA1c (Glycated Hb)</span>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 font-bold">8.4%</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-sans font-bold">
                  ELEVATED
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "slide-safety",
      stepNumber: 3,
      icon: ShieldAlert,
      tabLabelEn: "3. Safety & Collisions",
      tabLabelHi: "3. सेफ्टी व एलर्जी जांच",
      titleEn: "Deterministic Emergency Gate & Drug Collision Alert",
      titleHi: "तत्काल आपातकालीन गेट एवं ड्रग टकराव चेतावनी",
      taglineEn: "Sub-2ms regex safety interception with zero LLM latency",
      taglineHi: "बिना किसी देरी के 2 मिलीसेकंड में गंभीर लक्षणों की पहचान",
      latencyBadge: "Latency: < 2ms • Deterministic Layer 1",
      descriptionEn:
        "Before the patient enters the cabin, our two-tier safety architecture runs continuously. Deterministic Layer 1 catches acute emergencies like ACS or stroke in under 2ms. Clinical Safety Agent cross-references known allergies (like Penicillin) and blocks contra-indicated prescriptions.",
      descriptionHi:
        "केबिन में जाने से पहले हमारी दोहरी सुरक्षा प्रणाली लगातार चलती है। लेयर 1 सीने में दर्द जैसे गंभीर लक्षणों को 2 मिलीसेकंड में पहचान लेती है। सेफ्टी गार्ड एजेंट ज्ञात एलर्जी (जैसे पेनिसिलिन) की जांच कर गलत दवाइयों को ब्लॉक करता है।",
      clinicalHighlights: [
        "< 2ms Deterministic Gate",
        "Penicillin Collision Blocker",
        "Mandatory Doctor Override Log",
      ],
      demoLink: "/doctor/guide",
      demoLinkText: "View Clinical Safety Guard",
      mockupTitle: "Real-Time Clinical Safety Interceptor",
      mockupBadge: "Safety Guard Active",
      renderMockup: () => (
        <div className="space-y-3 font-mono text-xs">
          {/* Urgent Emergency Interception */}
          <div className="p-3 rounded-xl bg-coral-950/70 border border-coral-500/50 text-coral-200 space-y-1 font-sans">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-coral-400 animate-pulse shrink-0" />
              <strong className="text-xs text-coral-300">
                ACS RED FLAG DETECTED (0.17 ms)
              </strong>
            </div>
            <p className="text-[11px] text-coral-200/90 leading-tight">
              &ldquo;severe chest pain radiating to left jaw&rdquo; &rarr; Auto-promoted to Top of Doctor OPD Queue.
            </p>
          </div>

          {/* Allergy Collision Warning */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 font-sans">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
              Drug Allergy Collision Blocker
            </span>
            <div className="p-2 rounded bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-200 flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0" />
              <div>
                <strong>Blocked: Amoxicillin / Beta-Lactam</strong>
                <p className="text-[10px] text-amber-300/80 mt-0.5">
                  Patient profile has Penicillin Hypersensitivity. Requires written justification to override.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "slide-doctor",
      stepNumber: 4,
      icon: Stethoscope,
      tabLabelEn: "4. Two-Minute Doctor",
      tabLabelHi: "4. 2-मिनट डॉक्टर रिव्यू",
      titleEn: "Attending Doctor Reviews the 8 Critical Facts in 120s",
      titleHi: "डॉक्टर 120 सेकंड में 8 महत्वपूर्ण बिंदुओं की समीक्षा करते हैं",
      taglineEn: "Pre-populated SOAP note ready for physical exam and inline editing",
      taglineHi: "तैयार SOAP नोट के साथ शारीरिक जांच और एक-क्लिक संपादन",
      latencyBadge: "Velocity: < 120s Target Turnaround",
      descriptionEn:
        "The doctor opens the patient file. Instead of spending 8 minutes typing, they glance at the Two-Minute View (8 Critical Facts). The doctor performs physical examination, makes inline edits (turning AI purple badges into blue Verified badges), and enters private clinical observations.",
      descriptionHi:
        "डॉक्टर फाइल खोलते ही 8 मुख्य बिंदुओं पर एक नज़र डालते हैं। 8 मिनट की टाइपिंग के बजाय डॉक्टर सीधे मरीज़ की जांच करते हैं, ज़रूरत पड़ने पर बदलाव करते हैं और अपना नोट जोड़ते हैं।",
      clinicalHighlights: [
        "Two-Minute View (8 Critical Facts)",
        "Inline Editing with AI Badges",
        "Stopwatch Speed Tracker",
      ],
      demoLink: "/doctor",
      demoLinkText: "Open Doctor Queue Demo",
      mockupTitle: "High-Throughput Clinical Summary Pod",
      mockupBadge: "Review: 01:14",
      renderMockup: () => (
        <div className="space-y-2.5 font-mono text-xs">
          {/* Header Status Bar */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 font-sans">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              Vikramaditya Rathore (54M)
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-bold">
                Stopwatch: 01:14
              </span>
              <span className="text-[10px] bg-coral-500/20 text-coral-300 px-1.5 py-0.5 rounded font-bold">
                Urgent
              </span>
            </div>
          </div>

          {/* 8 Critical Facts Grid */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-[9px] text-teal-400 block font-sans font-bold">Complaint</span>
              <span className="text-slate-200">Retrosternal chest pain x 2h</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-[9px] text-teal-400 block font-sans font-bold">Vitals</span>
              <span className="text-slate-200">BP 168/104 | HR 108</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-[9px] text-teal-400 block font-sans font-bold">Red Flag</span>
              <span className="text-coral-400 font-bold">Suspected ACS</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-[9px] text-teal-400 block font-sans font-bold">Status</span>
              <span className="text-teal-300 font-bold font-sans">✓ Physician Verified</span>
            </div>
          </div>

          {/* Inline Edit Feedback */}
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-sans text-slate-300 flex items-center justify-between">
            <span>Inline Edit: &ldquo;Diaphoresis confirmed on exam&rdquo;</span>
            <span className="text-teal-400 font-bold">Saved &amp; Stamped</span>
          </div>
        </div>
      ),
    },
    {
      id: "slide-abdm",
      stepNumber: 5,
      icon: CheckCircle2,
      tabLabelEn: "5. ABDM Sign-off",
      tabLabelHi: "5. डिजिटल हस्ताक्षर",
      titleEn: "1-Click Verification & Cryptographic ABDM M2 Export",
      titleHi: "एक-क्लिक सत्यापन और एबीडीएम M2 डिजिटल हस्ताक्षर",
      taglineEn: "Unverified AI barrier guarantees patients only receive doctor-signed records",
      taglineHi: "अपुष्ट एआई अवरोधक: मरीज़ को केवल डॉक्टर द्वारा हस्ताक्षरित पर्चा मिलता है",
      latencyBadge: "Security: SHA-256 Immutable Audit Hash",
      descriptionEn:
        "The doctor clicks 'Approve Record'. The summary is stamped with the physician's registration number and sealed with an immutable SHA-256 cryptographic hash. The patient portal unlocks the verified Hindi/English e-prescription and discharge PDF.",
      descriptionHi:
        "डॉक्टर 'अनुमोदित करें' पर क्लिक करते हैं। पर्चे पर डॉक्टर का मेडिकल रजिस्ट्रेशन नंबर और डिजिटल सुरक्षा सील लग जाती है। इसके बाद मरीज़ अपने फोन पर सत्यापित ई-पर्चा तुरंत डाउनलोड कर सकते हैं।",
      clinicalHighlights: [
        "Unverified AI Barrier",
        "SHA-256 Cryptographic Audit",
        "FHIR M2 Healthcare Locker Sync",
      ],
      demoLink: "/doctor/consultation/c-101",
      demoLinkText: "View Consultation Room",
      mockupTitle: "ABDM Verified Digital Record & Discharge",
      mockupBadge: "Physician Signed",
      renderMockup: () => (
        <div className="space-y-3 font-mono text-xs">
          {/* Certificate Badge */}
          <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-500/50 text-teal-200 font-sans space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                ABDM Compliant E-Prescription
              </span>
              <span className="text-[10px] bg-teal-500/30 text-teal-200 px-2 py-0.5 rounded font-bold">
                APPROVED
              </span>
            </div>
            <p className="text-[11px] text-teal-200/90">
              Digitally signed by <strong>Dr. Aarav Mehta</strong> (Reg: RJ-MED-2016-8921)
            </p>
          </div>

          {/* Audit Hash Stream */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-[11px]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
              Immutable Audit Hash (SHA-256)
            </span>
            <span className="text-teal-400 font-mono break-all text-[10px]">
              9f83ac01b7e4128...c38d401e_abdm_m2
            </span>
          </div>

          {/* Patient Export Ready */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between font-sans">
            <span className="text-xs text-slate-200">Patient PDF Ready</span>
            <span className="text-xs font-bold text-teal-400 hover:underline">
              Download PDF &rarr;
            </span>
          </div>
        </div>
      ),
    },
  ];

  const currentSlide = slides[currentSlideIndex];

  // Auto-play progress loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalTime = TICK_INTERVAL_MS;
    const increment = (intervalTime / SLIDE_DURATION_MS) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentSlideIndex((s) => (s + 1) % slides.length);
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
    setProgress(0);
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <section
      id="presentation"
      aria-labelledby="presentation-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
    >
      {/* Header and Presentation Badge */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Interactive Product Presentation</span>
        </div>
        <h2
          id="presentation-heading"
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-navy dark:text-white"
        >
          {isHi
            ? "इंडस्ट्रा मेडिकोज़ कैसे काम करता है: इंटरएक्टिव प्रस्तुति"
            : "How Industra Medicose Works in Action"}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {isHi
            ? "मरीज़ के हिंदी/अंग्रेजी बोलने से लेकर 120 सेकंड में डॉक्टर के डिजिटल हस्ताक्षर तक, प्रत्येक चरण का सीधा दृश्य अनुभव।"
            : "Step-by-step interactive showcase demonstrating how autonomous agents synthesize voice, OCR, and safety checks in under 120 seconds."}
        </p>
      </div>

      {/* Swipeable Tabs Bar (Mobile Responsive with overflow-x-auto) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
        {slides.map((slide, idx) => {
          const isActive = idx === currentSlideIndex;
          const Icon = slide.icon;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => goToSlide(idx)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all min-h-[44px] shrink-0 ${
                isActive
                  ? "bg-teal-500 text-white shadow-teal-glow scale-102"
                  : "bg-slate-100 dark:bg-navy-800 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{isHi ? slide.tabLabelHi : slide.tabLabelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage Container */}
      <Card className="overflow-hidden border border-slate-200/80 dark:border-navy-700 bg-white/80 dark:bg-navy-900/90 shadow-soft-lg p-5 sm:p-8 lg:p-10 relative">
        {/* Animated Progress Bar Across Top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 dark:bg-navy-800">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-ai-500 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stage Content Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Left Column: Narrative & Insights */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-teal-500 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
                  {currentSlide.stepNumber}
                </span>
                <Badge variant="verified" size="sm">
                  Step {currentSlide.stepNumber} of {slides.length}
                </Badge>
                <span className="text-[11px] font-mono text-teal-600 dark:text-teal-400 font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20">
                  {currentSlide.latencyBadge}
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-navy dark:text-white tracking-tight leading-snug">
                  {isHi ? currentSlide.titleHi : currentSlide.titleEn}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-teal-600 dark:text-teal-400 mt-1">
                  {isHi ? currentSlide.taglineHi : currentSlide.taglineEn}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal">
                {isHi ? currentSlide.descriptionHi : currentSlide.descriptionEn}
              </p>

              {/* Highlights Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {currentSlide.clinicalHighlights.map((chip) => (
                  <span
                    key={chip}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60"
                  >
                    ✓ {chip}
                  </span>
                ))}
              </div>

              {/* Deep Link to feature */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link href={currentSlide.demoLink}>
                  <Button
                    variant="default"
                    size="sm"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="shadow-teal-glow"
                  >
                    {currentSlide.demoLinkText}
                  </Button>
                </Link>

                <Link href="/doctor/guide">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<BookOpen className="w-4 h-4" />}
                    className="text-xs"
                  >
                    Doctor Tutorial Book
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Realistic Dark-Glass Clinical Mockup */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-slate-900 border border-slate-800 text-white p-5 shadow-2xl space-y-4">
                {/* Mockup Header Window */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="text-xs text-slate-400 font-mono ml-2 truncate max-w-[140px] sm:max-w-none">
                      {currentSlide.mockupTitle}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/40 font-mono">
                    {currentSlide.mockupBadge}
                  </span>
                </div>

                {/* Simulated Clinical UI */}
                {currentSlide.renderMockup()}

                {/* Mockup Footer Telemetry */}
                <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 font-mono">
                  <span>AAYU 2026 Engine</span>
                  <span className="text-teal-400 font-semibold font-sans">
                    120s Doctor Verified
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Playback Controls Footer Bar */}
        <div className="pt-6 mt-6 border-t border-slate-200/80 dark:border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Step Indicator & Player Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous presentation slide"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause automated presentation" : "Play automated presentation"}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs font-bold text-foreground hover:bg-slate-100 flex items-center gap-2 min-h-[44px] transition-all"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 text-amber-500" />
                  <span>Pause Demo</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-teal-500 fill-teal-500" />
                  <span>Auto Play</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next presentation slide"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2.5 rounded-full transition-all min-h-[10px] ${
                  i === currentSlideIndex
                    ? "w-8 bg-teal-500"
                    : "w-2.5 bg-slate-200 dark:bg-navy-700 hover:bg-slate-300"
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground font-mono ml-2">
              {currentSlideIndex + 1} / {slides.length}
            </span>
          </div>
        </div>
      </Card>
    </section>
  );
}
