"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/components/providers/I18nProvider";
import {
  ShieldCheck,
  FileText,
  Sparkles,
  Stethoscope,
  Database,
  AlertOctagon,
  ArrowRight,
  Info,
} from "lucide-react";

export default function ConsentPage() {
  const router = useRouter();
  const { locale } = useI18n();
  const { addToast } = useToast();

  const [understoodAi, setUnderstoodAi] = useState(false);
  const [understoodDoctorReview, setUnderstoodDoctorReview] = useState(false);
  const [understoodSynthetic, setUnderstoodSynthetic] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isHindi = locale === "hi";

  const handleConsentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!understoodAi || !understoodDoctorReview || !understoodSynthetic || !consentGiven) {
      setErrorMsg(
        isHindi
          ? "आगे बढ़ने से पहले कृपया सभी सहमति बिंदुओं को पढ़ें और स्वीकार करें।"
          : "Please acknowledge all consent terms before proceeding to clinical intake."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          understoodAi,
          understoodDoctorReview,
          understoodSynthetic,
          consentGiven,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to record clinical consent.");
        return;
      }

      addToast({
        type: "verified",
        title: isHindi ? "सहमति दर्ज की गई" : "Consent Acknowledged",
        message: isHindi
          ? "आपकी सहमति सुरक्षित रूप से दर्ज कर ली गई है। आपका स्वागत है।"
          : "Your intake consent has been recorded under ABDM privacy standards.",
      });

      router.push(data.redirectPath || "/patient");
      router.refresh();
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      {/* Header Bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-200 dark:border-navy-700">
        <Logo size="md" showTagline />
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Consent Card */}
      <main className="max-w-4xl w-full mx-auto my-8 space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="verified" size="md" className="mx-auto">
            <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
            {isHindi ? "डिजिटल स्वास्थ्य सहमति (ABDM अनुरूप)" : "Informed Clinical Consent (ABDM Aligned)"}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy dark:text-white">
            {isHindi ? "क्लिनिकल परामर्श एवं एआई उपयोग सहमति" : "Patient Clinical Intake & AI Copilot Consent"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isHindi
              ? "परामर्श शुरू करने से पहले यह समझना आवश्यक है कि आपकी जानकारी कैसे सुरक्षित रखी जाती है और एआई आपकी कैसे मदद करता है।"
              : "Before beginning your consultation, please review how your health information is processed, safeguarded, and reviewed by licensed clinicians."}
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="p-4 rounded-xl border border-coral-300 dark:border-coral-800 bg-coral-50/90 dark:bg-coral-950/80 text-coral-900 dark:text-coral-200 text-xs sm:text-sm flex items-start gap-2.5"
          >
            <AlertOctagon className="w-5 h-5 text-coral-600 dark:text-coral-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* 5 Plain-Language Explanations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. What Data is Collected */}
          <Card className="p-5 space-y-2 border-slate-200 dark:border-navy-700">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-navy dark:text-white">
              {isHindi ? "1. क्या डेटा एकत्र किया जाता है?" : "1. What data is collected?"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isHindi
                ? "आपकी मुख्य शिकायतें, लक्षणों की अवधि, पुरानी बीमारियां, दवाओं से एलर्जी, जीवन शैली और यदि आप वॉयस इनपुट चुनते हैं तो बातचीत की ऑडियो रिकॉर्डिंग।"
                : "Your symptoms, chief complaint, medical history, vital signs, medication allergies, and voice dictation transcripts if voice input is enabled."}
            </p>
          </Card>

          {/* 2. How AI is Used */}
          <Card className="p-5 space-y-2 border-slate-200 dark:border-navy-700">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-navy dark:text-white">
              {isHindi ? "2. एआई का उपयोग कैसे किया जाता है?" : "2. How is AI utilized?"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isHindi
                ? "हमारा बहु-एजेंट सिस्टम बातचीत को टेक्स्ट में बदलता है, क्लिनिकल सारांश (SOAP नोट) तैयार करता है और दवाओं के संभावित परस्पर विरोध की जांच करता है।"
                : "Autonomous multi-agent intelligence transcribes speech, extracts clinical entities, drafts structured SOAP notes, and screens for medication contraindications."}
            </p>
          </Card>

          {/* 3. Doctor Decides */}
          <Card className="p-5 space-y-2 border-slate-200 dark:border-navy-700">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-navy dark:text-white">
              {isHindi ? "3. डॉक्टर का निर्णय अंतिम है" : "3. The doctor decides & reviews"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isHindi
                ? "एआई कभी भी स्वयं नुस्खा या निदान तय नहीं करता। आपके डॉक्टर हर एक विवरण की समीक्षा करते हैं, आवश्यक बदलाव करते हैं और स्वयं हस्ताक्षर करते हैं।"
                : "AI never acts autonomously. A licensed physician evaluates every draft, edits the clinical note, confirms diagnoses, and signs the final prescription."}
            </p>
          </Card>

          {/* 4. Prototype & Synthetic Safeguards */}
          <Card className="p-5 space-y-2 border-slate-200 dark:border-navy-700">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-navy dark:text-white">
              {isHindi ? "4. प्रोटोटाइप और सिंथेटिक डेटा" : "4. Prototype & synthetic data"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isHindi
                ? "यह AAYU 2026 हैकाथॉन का प्रदर्शन प्रोटोटाइप है। डेमो खाते पूरी तरह से सिंथेटिक डेटा का उपयोग करते हैं और रोगी गोपनीयता नियमों से बंधे हैं।"
                : "This system is a prototype built for the AAYU 2026 hackathon. Demonstrated clinical records utilize synthetic cohort datasets to ensure complete privacy."}
            </p>
          </Card>
        </div>

        {/* 5. Withdrawal Rights Banner */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-navy-800/80 border border-slate-200 dark:border-navy-700 flex items-start gap-3 text-xs text-muted-foreground">
          <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground block font-semibold mb-0.5">
              {isHindi ? "5. सहमति वापस लेने का अधिकार" : "5. Right to withdraw consent"}
            </strong>
            {isHindi
              ? "आप किसी भी समय परामर्श रद्द करके या खाता सेटिंग्स में जाकर अपनी सहमति वापस ले सकते हैं। सहमति के बिना कोई भी परामर्श आगे नहीं बढ़ाया जा सकता।"
              : "You may withdraw your consent at any time prior to doctor approval. No clinical intake can proceed without active consent."}
          </div>
        </div>

        {/* Interactive Agreement Form */}
        <form onSubmit={handleConsentSubmit} className="space-y-6 pt-4 border-t border-slate-200 dark:border-navy-700">
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={understoodAi}
                onChange={(e) => setUnderstoodAi(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
              />
              <span className="text-xs leading-relaxed text-foreground">
                {isHindi
                  ? "मैं समझता/समझती हूं कि मेरे लक्षणों को नोट करने के लिए एआई तकनीक की सहायता ली जाएगी।"
                  : "I understand that AI agents will assist in ambient transcribing and summarizing my consultation."}
              </span>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={understoodDoctorReview}
                onChange={(e) => setUnderstoodDoctorReview(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
              />
              <span className="text-xs leading-relaxed text-foreground">
                {isHindi
                  ? "मैं समझता/समझती हूं कि सभी निर्णय, दवाएं और जांचें मेरे डॉक्टर द्वारा व्यक्तिगत रूप से जांची और स्वीकृत की जाएंगी।"
                  : "I understand that a qualified medical doctor reviews, verifies, and retains complete decision-making authority over all treatment plans."}
              </span>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={understoodSynthetic}
                onChange={(e) => setUnderstoodSynthetic(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
              />
              <span className="text-xs leading-relaxed text-foreground">
                {isHindi
                  ? "मैं समझता/समझती हूं कि यह प्रोटोटाइप मूल्यांकन हेतु सिंथेटिक डेटा सुरक्षा सिद्धांतों पर संचालित है।"
                  : "I acknowledge that this system is an innovation prototype using synthetic safety benchmarks."}
              </span>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-teal-500/50 bg-mint-50/60 dark:bg-navy-800/80 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 h-5 w-5 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
              />
              <span className="text-xs font-semibold leading-relaxed text-teal-950 dark:text-teal-100">
                {isHindi
                  ? "मैं स्वेच्छा से क्लिनिकल इनटेक और एआई सहायता प्राप्त परामर्श के लिए अपनी स्पष्ट सहमति प्रदान करता/करती हूं।"
                  : "I hereby voluntarily provide informed consent to proceed with clinical AI-assisted intake."}
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto"
            >
              {isHindi ? "रद्द करें और बाहर निकलें" : "Decline & Sign Out"}
            </Button>

            <Button
              type="submit"
              variant="default"
              size="md"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-teal-glow"
            >
              {isHindi ? "सहमति स्वीकारें और आगे बढ़ें" : "Accept Consent & Begin Intake"}
            </Button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground pt-6 border-t border-slate-200 dark:border-navy-700 max-w-4xl w-full mx-auto">
        <p>&copy; 2026 Industra Medicose. Digital Consent Audit Trail Recorded.</p>
      </footer>
    </div>
  );
}
