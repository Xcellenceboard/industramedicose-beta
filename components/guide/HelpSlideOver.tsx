"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  X,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  BookOpen,
  Compass,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useI18n } from "@/components/providers/I18nProvider";

export interface FAQItem {
  id: string;
  question: string;
  questionHi: string;
  answer: string;
  answerHi: string;
}

export const FAQS: FAQItem[] = [
  {
    id: "faq-1",
    question: "Is this an autonomous medical diagnosis?",
    questionHi: "क्या यह कोई स्वचालित चिकित्सीय निदान (Diagnosis) है?",
    answer:
      "No. Industra Medicose is an agentic clinical copilot designed for pre-consultation intake, documentation, and safety checks. It never makes clinical diagnoses or prescribes drugs autonomously. Every summary and prescription recommendation must be verified and signed by a licensed physician.",
    answerHi:
      "नहीं। इंडस्ट्रा मेडिकोज़ केवल एक क्लिनिकल कोपायलट है जो इतिहास दर्ज करने, दस्तावेज़ पढ़ने और सुरक्षा जांच में सहायता करता है। यह कभी भी स्वचालित रूप से दवाइयाँ या अंतिम बीमारी तय नहीं करता। केवल लाइसेंस प्राप्त डॉक्टर ही इसे सत्यापित व हस्ताक्षरित करते हैं।",
  },
  {
    id: "faq-2",
    question: "Who can see my clinical data?",
    questionHi: "मेरा स्वास्थ्य डेटा कौन देख सकता है?",
    answer:
      "Only you and your assigned attending physician. In this hackathon build, all patient data is synthetic and de-identified. Our architecture adheres strictly to ABDM (Ayushman Bharat Digital Mission) M2 milestone guidelines with patient-driven consent.",
    answerHi:
      "केवल आप और आपके डॉक्टर। इस हैकाथॉन प्रोटोटाइप में सभी डेटा सिंथेटिक (काल्पनिक) और सुरक्षित हैं। हमारा आर्किटेक्चर एबीडीएम (ABDM) के दिशानिर्देशों और आपकी सहमति के अनुसार संचालित होता है।",
  },
  {
    id: "faq-3",
    question: "How does the two-minute pre-consultation summary work?",
    questionHi: "दो मिनट का प्री-कंसल्टेशन सारांश कैसे काम करता है?",
    answer:
      "Before or while entering the clinic, patients can speak their complaints or upload previous prescriptions. Multi-agent AI transcribes the conversation, categorizes symptoms into a structured SOAP note, and highlights allergies and red flags in under 120 seconds.",
    answerHi:
      "मरीज़ अपने लक्षण बोलकर या पुरानी पर्ची की फोटो खींचकर दे सकते हैं। हमारे मल्टी-एजेंट सिस्टम 120 सेकंड के भीतर बातचीत का विश्लेषण कर डॉक्टर के लिए एक सुव्यवस्थित क्लिनिकल सारांश (SOAP नोट) तैयार कर देते हैं।",
  },
  {
    id: "faq-4",
    question: "Can I upload physical handwritten prescriptions and lab reports?",
    questionHi: "क्या मैं हाथ से लिखी पुरानी पर्चियां और लैब रिपोर्ट अपलोड कर सकता हूँ?",
    answer:
      "Yes. The Document Intelligence Agent performs multi-modal OCR on uploaded prescription photos and lab reports, extracts drug names, dosages, and abnormal lab biomarkers, and attaches them to the patient's chronological timeline.",
    answerHi:
      "हाँ। हमारा डॉक्यूमेंट इंटेलिजेंस एजेंट पुरानी पर्चियों और लैब रिपोर्ट की फोटो से दवाइयों के नाम, खुराक और जांच परिणामों को स्वतः पहचानकर इतिहास में जोड़ देता है।",
  },
  {
    id: "faq-5",
    question: "Which languages and dialects are supported?",
    questionHi: "किन भाषाओं और बोलियों का समर्थन है?",
    answer:
      "English and Hindi are fully supported for both voice intake and user interface. Regional dialect integration (starting with Marwari and Rajasthani rural vocabularies) is currently on our active development roadmap.",
    answerHi:
      "वॉइस इनपुट और इंटरफ़ेस दोनों के लिए अंग्रेजी और हिंदी पूरी तरह समर्थित हैं। क्षेत्रीय बोलियों (जैसे मारवाड़ी) का समर्थन सक्रिय रूप से विकसित किया जा रहा है।",
  },
];

interface HelpSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour?: () => void;
}

export function HelpSlideOver({
  isOpen,
  onClose,
  onStartTour,
}: HelpSlideOverProps) {
  const { locale } = useI18n();
  const isHi = locale === "hi";
  const [expandedFaq, setExpandedFaq] = useState<string | null>("faq-1");

  const toggleFaq = (id: string) => {
    setExpandedFaq((prev) => (prev === id ? null : id));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-drawer-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-white dark:bg-navy-900 border-l border-slate-200 dark:border-navy-700 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2
                      id="help-drawer-title"
                      className="text-lg font-bold text-navy dark:text-white"
                    >
                      {isHi ? "सहायता एवं त्वरित मार्गदर्शिका" : "Help & Quick Guide"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Industra Medicose Copilot
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  aria-label="Close help drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Interactive Tour CTA */}
                {onStartTour && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/15 via-teal-500/5 to-ai-500/10 border border-teal-500/30 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                        <Compass className="w-4 h-4" />
                        {isHi ? "इंटरएक्टिव टूर" : "Guided Product Tour"}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {isHi
                          ? "सिस्टम के मुख्य फीचर्स का 4-चरणीय डेमो देखें।"
                          : "Explore key copilot controls in 4 quick steps."}
                      </p>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onStartTour();
                      }}
                      className="shadow-teal-glow text-xs shrink-0"
                    >
                      {isHi ? "टूर शुरू करें" : "Start Tour"}
                    </Button>
                  </div>
                )}

                {/* 3-Step Quick Start */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {isHi ? "3-चरणीय त्वरित शुरुआत" : "3-Step Quick Start"}
                    </h3>
                    <Badge variant="verified" size="sm">
                      120s Scribe
                    </Badge>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200/80 dark:border-navy-700 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-teal-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                          1
                        </span>
                        <span className="text-xs font-bold text-navy dark:text-white">
                          {isHi ? "मरीज़ वॉइस या पर्चा इनपुट" : "Patient Voice or Rx Intake"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground pl-7">
                        {isHi
                          ? "मरीज़ हिंदी या अंग्रेजी में बोलते हैं अथवा पुरानी पर्ची अपलोड करते हैं।"
                          : "Patient describes symptoms in Hindi/English or uploads prior prescriptions."}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200/80 dark:border-navy-700 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                          2
                        </span>
                        <span className="text-xs font-bold text-navy dark:text-white">
                          {isHi ? "एजेंटिक सारांश और सेफ्टी जांच" : "Multi-Agent Synthesis & Safety"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground pl-7">
                        {isHi
                          ? "एजेंट लक्षण व्यवस्थित करते हैं, दवाओं की जांच करते हैं और रेड फ्लैग्स चिह्नित करते हैं।"
                          : "Autonomous agents structure SOAP notes, detect allergies, and flag red alerts."}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200/80 dark:border-navy-700 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                          3
                        </span>
                        <span className="text-xs font-bold text-navy dark:text-white">
                          {isHi ? "डॉक्टर सत्यापन और हस्ताक्षर" : "Doctor Review & Signature"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground pl-7">
                        {isHi
                          ? "डॉक्टर 2 मिनट में पूरा केस देखकर अंतिम पर्चा अनुमोदित और डिजिटल साइन करते हैं।"
                          : "Attending physician reviews pre-populated note and verifies prescription in minutes."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {isHi ? "अक्सर पूछे जाने वाले सवाल (FAQs)" : "Frequently Asked Questions"}
                    </h3>
                    <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                  </div>

                  <div className="space-y-2">
                    {FAQS.map((faq) => {
                      const isExpanded = expandedFaq === faq.id;
                      return (
                        <div
                          key={faq.id}
                          className="rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800/60 overflow-hidden transition-all"
                        >
                          <button
                            type="button"
                            onClick={() => toggleFaq(faq.id)}
                            className="w-full p-3.5 text-left flex items-center justify-between gap-2.5 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                            aria-expanded={isExpanded}
                          >
                            <span className="text-xs font-bold text-navy dark:text-white leading-snug">
                              {isHi ? faq.questionHi : faq.question}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                                isExpanded ? "rotate-180 text-teal-500" : ""
                              }`}
                            />
                          </button>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="p-3.5 pt-0 text-[11px] text-muted-foreground leading-relaxed border-t border-slate-100 dark:border-navy-700/60">
                                  {isHi ? faq.answerHi : faq.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Detailed Guide Links */}
                <div className="pt-2 space-y-2">
                  <Link href="/doctor/guide" onClick={onClose} className="block">
                    <Button
                      variant="default"
                      size="md"
                      className="w-full justify-between group shadow-teal-glow bg-teal-500 hover:bg-teal-600 text-white font-bold"
                      leftIcon={<Stethoscope className="w-4 h-4 text-white" />}
                      rightIcon={
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      }
                    >
                      <span>
                        {isHi
                          ? "डॉक्टर गाइडबुक व ट्यूटोरियल (/doctor/guide)"
                          : "Doctor Tutorial Book (/doctor/guide)"}
                      </span>
                    </Button>
                  </Link>

                  <Link href="/guide" onClick={onClose} className="block">
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full justify-between group"
                      leftIcon={<BookOpen className="w-4 h-4 text-teal-600" />}
                      rightIcon={
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      }
                    >
                      <span>
                        {isHi
                          ? "विस्तृत उपयोगकर्ता मार्गदर्शिका खोलें (/guide)"
                          : "Open Full Platform Guide (/guide)"}
                      </span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-950/50 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Responsible AI • Human in the Loop
                </span>
                <span className="font-mono">v1.0 AAYU 2026</span>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
