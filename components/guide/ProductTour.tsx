"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Stethoscope,
  ShieldAlert,
  Languages,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useI18n } from "@/components/providers/I18nProvider";

export interface TourStep {
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  icon: React.ElementType;
  badge: string;
  badgeHi: string;
  hint: string;
  hintHi: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to Industra Medicose",
    titleHi: "इंडस्ट्रा मेडिकोज़ में आपका स्वागत है",
    description:
      "Your Agentic-AI Clinical Copilot engineered for the 'Two-Minute Doctor' challenge. Prepare comprehensive pre-consultation summaries before the patient enters the OPD cabin.",
    descriptionHi:
      "आपका एजेंटिक एआई क्लिनिकल कोपायलट जो ओपीडी परामर्श को तीव्र और सटीक बनाता है। डॉक्टर के केबिन में आने से पहले मरीज़ का संक्षिप्त सारांश तैयार करें।",
    icon: Sparkles,
    badge: "Step 1 of 4 • Overview",
    badgeHi: "चरण 1 / 4 • परिचय",
    hint: "Less Documentation. More Care. Smarter Healthcare.",
    hintHi: "कम दस्तावेज़ीकरण। अधिक देखभाल। स्मार्ट स्वास्थ्य सेवा।",
  },
  {
    title: "120-Second Pre-Consultation Summary",
    titleHi: "120-सेकंड प्री-कंसल्टेशन सारांश",
    description:
      "While the patient speaks in Hindi or English, autonomous intake agents capture symptoms, convert colloquial phrases to ICD-10/SNOMED CT, and scan uploaded lab slips.",
    descriptionHi:
      "मरीज़ जब हिंदी या अंग्रेजी में बोलते हैं, तो एजेंट बातचीत से मुख्य लक्षण पहचानते हैं और पुरानी पर्चियों को स्कैन करके संगठित इतिहास बनाते हैं।",
    icon: Stethoscope,
    badge: "Step 2 of 4 • Multi-Agent Intake",
    badgeHi: "चरण 2 / 4 • मल्टी-एजेंट इंटेक",
    hint: "Cuts routine history-taking time by 75% without compromising detail.",
    hintHi: "इतिहास दर्ज करने का समय 75% तक कम करता है बिना किसी विवरण को छोड़े।",
  },
  {
    title: "Clinical Safety Guard & Red Flags",
    titleHi: "क्लिनिकल सेफ्टी गार्ड और चेतावनी",
    description:
      "Our Safety Guard Agent constantly screens for drug-drug interactions, penicillin/beta-lactam allergies, and urgent red flags like chest pain or stroke symptoms.",
    descriptionHi:
      "हमारा सेफ्टी गार्ड एजेंट दवाओं के परस्पर टकराव, एलर्जी और गंभीर लक्षणों (जैसे सीने में दर्द) पर तुरंत चेतावनी देता है।",
    icon: ShieldAlert,
    badge: "Step 3 of 4 • Safety First",
    badgeHi: "चरण 3 / 4 • सुरक्षा सर्वोपरि",
    hint: "Zero autonomous prescribing: Every recommendation requires physician verification.",
    hintHi: "शून्य स्वायत्त नुस्खा: प्रत्येक सलाह के लिए डॉक्टर का अनुमोदन अनिवार्य है।",
  },
  {
    title: "Dual Language & ABDM M2 Verification",
    titleHi: "द्विभाषी सहायता एवं एबीडीएम सत्यापन",
    description:
      "Switch between English and Hindi with one click. Once the attending doctor reviews and signs, records sync to ABDM FHIR M2 compliant healthcare lockers.",
    descriptionHi:
      "एक क्लिक में अंग्रेजी और हिंदी में बदलें। डॉक्टर द्वारा सत्यापित करने के बाद रिकॉर्ड सीधे एबीडीएम मानकों के अनुसार सुरक्षित हो जाते हैं।",
    icon: Languages,
    badge: "Step 4 of 4 • Ready to Start",
    badgeHi: "चरण 4 / 4 • शुरू करने के लिए तैयार",
    hint: "You are all set! Use the navigation bar or quick actions to explore.",
    hintHi: "आप पूरी तरह तैयार हैं! नेविगेशन से अपनी भूमिका चुनकर शुरुआत करें।",
  },
];

interface ProductTourProps {
  isOpen?: boolean;
  onClose?: () => void;
  storageKey?: string;
}

export function ProductTour({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  storageKey = "im_tour_completed_v1",
}: ProductTourProps) {
  const { locale } = useI18n();
  const isHi = locale === "hi";
  const [internalOpen, setInternalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const isControlled = controlledIsOpen !== undefined;
  const showModal = isControlled ? controlledIsOpen : internalOpen;

  useEffect(() => {
    if (!isControlled) {
      const alreadyCompleted = localStorage.getItem(storageKey);
      if (!alreadyCompleted) {
        // Small delay so page loads smoothly before tour opens
        const timer = setTimeout(() => setInternalOpen(true), 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [isControlled, storageKey]);

  const handleClose = () => {
    try {
      localStorage.setItem(storageKey, "true");
    } catch {
      // localStorage may fail in private mode
    }
    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalOpen(false);
    }
    setCurrentStep(0);
  };

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  if (!showModal) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-dialog-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
          className="relative z-10 w-full max-w-lg rounded-3xl bg-white dark:bg-navy-900 border border-teal-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden"
        >
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 rounded-full bg-ai-500/15 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            aria-label="Close interactive tour"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-sm">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <Badge variant="ai" size="sm" pulse>
                  {isHi ? step.badgeHi : step.badge}
                </Badge>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Industra Medicose Copilot
                </div>
              </div>
            </div>

            <div>
              <h3
                id="tour-dialog-title"
                className="text-xl sm:text-2xl font-extrabold text-navy dark:text-white tracking-tight"
              >
                {isHi ? step.titleHi : step.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mt-2.5 leading-relaxed">
                {isHi ? step.descriptionHi : step.description}
              </p>
            </div>

            {/* Hint Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200/70 dark:border-navy-700 text-xs text-foreground font-medium flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
              <span>{isHi ? step.hintHi : step.hint}</span>
            </div>

            {/* Progress Dots */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {TOUR_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? "w-8 bg-teal-500"
                      : "w-2 bg-slate-300 dark:bg-navy-700 hover:bg-slate-400"
                  }`}
                  aria-label={`Jump to tour step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-navy-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-xs text-muted-foreground"
              >
                {isHi ? "छोड़ें (Skip)" : "Skip Tour"}
              </Button>

              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                  >
                    {isHi ? "पीछे" : "Back"}
                  </Button>
                )}

                <Button
                  variant="default"
                  size="sm"
                  rightIcon={
                    isLast ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )
                  }
                  onClick={() => {
                    if (isLast) {
                      handleClose();
                    } else {
                      setCurrentStep((prev) => prev + 1);
                    }
                  }}
                  className="shadow-teal-glow"
                >
                  {isLast
                    ? isHi
                      ? "समाप्त करें"
                      : "Get Started"
                    : isHi
                    ? "आगे"
                    : "Next"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
