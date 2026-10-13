"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Stethoscope,
  Clock,
  ShieldCheck,
  Languages,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Mic,
  FileText,
  Scan,
  ShieldAlert,
  GitBranch,
  Layers,
  HeartPulse,
  Activity,
  Menu,
  User,
  ChevronDown,
  X,
  UserCheck,
  Lock,
  Database,
  Building2,
  Calendar,
  HelpCircle,
  Play,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useI18n } from "@/components/providers/I18nProvider";
import { InteractivePresentation } from "@/components/landing/InteractivePresentation";

const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4IDUiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjUiIGZpbGw9IiMwZDE3MjYiLz48L3N2Zz4=";

export default function LandingPage() {
  const { locale } = useI18n();
  const isHi = locale === "hi";

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [registerDropdownOpen, setRegisterDropdownOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<"patient" | "doctor">("doctor");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-teal-500 selection:text-white">
      {/* ========================================================= */}
      {/* 1. STICKY NAVBAR */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 w-full bg-white/85 dark:bg-navy-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-navy-700/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Logo size="md" showTagline />

          {/* Desktop Nav Anchors */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-muted-foreground" aria-label="Landing Navigation">
            <Link href="/directory" className="text-teal-600 dark:text-teal-400 hover:text-teal-700 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isHi ? "चिकित्सा निर्देशिका" : "Medical Directory"}</span>
            </Link>
            <a href="#problem" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              {isHi ? "समस्या" : "The Problem"}
            </a>
            <a href="#how-it-works" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              {isHi ? "कार्यप्रणाली" : "How It Works"}
            </a>
            <a href="#agents" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              {isHi ? "एजेंट्स" : "Meet The Agents"}
            </a>
            <a href="#preview" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              {isHi ? "डेमो पूर्वावलोकन" : "Live Preview"}
            </a>
            <Link href="/guide" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{isHi ? "उपयोग मार्गदर्शिका" : "Guide"}</span>
            </Link>
          </nav>

          {/* Right Actions: Register Dropdown, Language Toggle & Start Demo */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Register as Doctor / Patient Dropdown Tab */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRegisterDropdownOpen(!registerDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-navy-800 border border-teal-500/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100/60 transition-colors font-bold text-xs sm:text-sm min-h-[38px]"
              >
                <User className="w-3.5 h-3.5" />
                <span>{isHi ? "पंजीकरण (Doctor/Patient)" : "Register as Doctor / Patient"}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <AnimatePresence>
                {registerDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-xl p-2 z-50 space-y-1"
                  >
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-slate-100 dark:border-navy-800">
                      {isHi ? "भूमिका का चयन करें" : "Select Registration Role"}
                    </div>

                    <Link
                      href="/signup?role=patient"
                      onClick={() => setRegisterDropdownOpen(false)}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-teal-50 dark:hover:bg-navy-800 transition-colors text-left"
                    >
                      <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-foreground block">
                          Register as Patient (मरीज पंजीकरण)
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Health profile, Vitals &amp; AI Triage
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/signup?role=doctor"
                      onClick={() => setRegisterDropdownOpen(false)}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-teal-50 dark:hover:bg-navy-800 transition-colors text-left"
                    >
                      <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 shrink-0">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-foreground block">
                          Register as Doctor (डॉक्टर पंजीकरण)
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Credentials, Telemedicine &amp; Scribe
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <LanguageToggle />
            <ThemeToggle />

            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-semibold text-xs sm:text-sm">
                {isHi ? "लॉगिन करें" : "Login"}
              </Button>
            </Link>

            <Link href="/login">
              <Button
                variant="default"
                size="sm"
                className="shadow-teal-glow font-semibold text-xs sm:text-sm bg-teal-600 hover:bg-teal-700 text-white"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {isHi ? "डेमो शुरू करें" : "Start Demo"}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <LanguageToggle />
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="p-2 rounded-xl text-foreground hover:bg-slate-100 dark:hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-b border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-6 py-5 space-y-4 shadow-xl overflow-hidden"
            >
              <div className="flex flex-col space-y-3 font-medium text-sm">
                <a
                  href="#problem"
                  onClick={() => setMobileNavOpen(false)}
                  className="py-1.5 hover:text-teal-600 transition-colors"
                >
                  {isHi ? "समस्या" : "The Problem"}
                </a>
                <a
                  href="#presentation"
                  onClick={() => setMobileNavOpen(false)}
                  className="py-1.5 hover:text-teal-600 transition-colors flex items-center gap-1.5 font-bold text-teal-600 dark:text-teal-400"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isHi ? "इंटरएक्टिव प्रस्तुति" : "Presentation & Walkthrough"}</span>
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileNavOpen(false)}
                  className="py-1.5 hover:text-teal-600 transition-colors"
                >
                  {isHi ? "कार्यप्रणाली" : "How It Works"}
                </a>
                <a
                  href="#agents"
                  onClick={() => setMobileNavOpen(false)}
                  className="py-1.5 hover:text-teal-600 transition-colors"
                >
                  {isHi ? "एजेंट्स" : "Meet The Agents"}
                </a>
                <a
                  href="#preview"
                  onClick={() => setMobileNavOpen(false)}
                  className="py-1.5 hover:text-teal-600 transition-colors"
                >
                  {isHi ? "डेमो पूर्वावलोकन" : "Live Preview"}
                </a>
                <a
                  href="#safety"
                  onClick={() => setMobileNavOpen(false)}
                  className="py-1.5 hover:text-teal-600 transition-colors"
                >
                  {isHi ? "सुरक्षा एवं एआई" : "Safety"}
                </a>
                <a
                  href="#roadmap"
                  onClick={() => setMobileNavOpen(false)}
                  className="py-1.5 hover:text-teal-600 transition-colors"
                >
                  {isHi ? "रोडमैप" : "Roadmap"}
                </a>
                <Link
                  href="/guide"
                  onClick={() => setMobileNavOpen(false)}
                  className="py-1.5 hover:text-teal-600 transition-colors flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-bold"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>{isHi ? "विस्तृत उपयोग मार्गदर्शिका (/guide)" : "How-To-Use Guide (/guide)"}</span>
                </Link>
                <Link
                  href="/directory"
                  onClick={() => setMobileNavOpen(false)}
                  className="py-1.5 hover:text-teal-600 transition-colors flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-bold"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isHi ? "चिकित्सा निर्देशिका (Google for Medical)" : "Medical Directory"}</span>
                </Link>
                <div className="grid grid-cols-2 gap-2 pt-1 pb-1">
                  <Link
                    href="/signup?role=patient"
                    onClick={() => setMobileNavOpen(false)}
                    className="p-2.5 rounded-xl border border-teal-500/30 bg-teal-50/50 dark:bg-navy-800 text-teal-700 dark:text-teal-300 text-xs font-bold text-center block"
                  >
                    + Register Patient
                  </Link>
                  <Link
                    href="/signup?role=doctor"
                    onClick={() => setMobileNavOpen(false)}
                    className="p-2.5 rounded-xl border border-teal-500/30 bg-teal-50/50 dark:bg-navy-800 text-teal-700 dark:text-teal-300 text-xs font-bold text-center block"
                  >
                    + Register Doctor
                  </Link>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between gap-3">
                <ThemeToggle />
                <div className="flex items-center gap-2">
                  <Link href="/login" onClick={() => setMobileNavOpen(false)}>
                    <Button variant="outline" size="sm">
                      {isHi ? "लॉगिन" : "Login"}
                    </Button>
                  </Link>
                  <Link href="/login" onClick={() => setMobileNavOpen(false)}>
                    <Button variant="default" size="sm" className="shadow-teal-glow">
                      {isHi ? "डेमो शुरू करें" : "Start Demo"}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 space-y-20 sm:space-y-28 lg:space-y-36 pb-20">
        {/* ========================================================= */}
        {/* 2. HERO SECTION */}
        {/* ========================================================= */}
        <section className="relative pt-8 sm:pt-16 pb-12 overflow-hidden">
          {/* Subtle background glow orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-teal-500/15 via-ai-500/10 to-teal-400/5 blur-3xl rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Headlines & CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-7 space-y-6 sm:space-y-7"
              >
                {/* Hackathon Badge */}
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>AAYU 2026 Hackathon • Problem T01: The Two-Minute Doctor</span>
                </div>

                {/* Primary Headline */}
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-navy dark:text-white leading-[1.12]">
                    Less Documentation. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-teal-500 to-ai-500 dark:from-teal-400 dark:to-teal-200">
                      More Care.
                    </span>
                  </h1>
                  <p className="mt-4 sm:mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl font-normal">
                    {isHi
                      ? "मरीज़ के केबिन में प्रवेश करने से पहले ही दो मिनट का संपूर्ण प्री-कंसल्टेशन सारांश तैयार। हमारा बहु-एजेंट सिस्टम 75% कागज़ी समय बचाकर डॉक्टरों को केवल मरीज़ की देखभाल पर ध्यान केंद्रित करने में सक्षम बनाता है।"
                      : "A two-minute clinical pre-consultation summary prepared before the patient steps into the OPD cabin. Autonomous multi-agent intelligence captures ambient symptoms, parses old prescriptions, and flags allergy risks."}
                  </p>
                </div>

                {/* Animated Stat Chips */}
                <div className="flex flex-wrap items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-navy-800/90 border border-slate-200/80 dark:border-navy-700 shadow-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                    <span className="text-xs font-bold text-navy dark:text-white">
                      2 min to summary
                    </span>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-navy-800/90 border border-slate-200/80 dark:border-navy-700 shadow-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <Languages className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-navy dark:text-white">
                      Hindi + English
                    </span>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-navy-800/90 border border-slate-200/80 dark:border-navy-700 shadow-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-navy dark:text-white">
                      Doctor-approved
                    </span>
                  </motion.div>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link href="/login">
                    <Button
                      variant="default"
                      size="lg"
                      className="shadow-teal-glow font-bold text-sm sm:text-base px-6 h-12"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      {isHi ? "डेमो आज़माएँ (Try Demo)" : "Try the Demo"}
                    </Button>
                  </Link>

                  <a href="#presentation">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="font-semibold text-sm sm:text-base px-6 h-12"
                      leftIcon={<Play className="w-4 h-4 fill-current text-teal-600 dark:text-teal-400" />}
                    >
                      {isHi ? "इंटरएक्टिव प्रस्तुति देखें" : "Watch Interactive Presentation"}
                    </Button>
                  </a>
                </div>

                {/* Compliance footnote */}
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                  <Lock className="w-3.5 h-3.5 text-teal-600" />
                  <span>
                    {isHi
                      ? "सिंथेटिक डेटा प्रोटोटाइप • एबीडीएम M2 अनुपालन • कोई स्वायत्त निदान नहीं"
                      : "Synthetic test data • ABDM M2 FHIR compliant • Human in the loop"}
                  </span>
                </p>
              </motion.div>

              {/* Right Column: Hero Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="lg:col-span-5 relative"
              >
                <div className="relative rounded-3xl overflow-hidden border border-teal-500/30 shadow-2xl bg-navy-950 group">
                  <div className="relative aspect-[16/10] w-full">
                    <Image
                      src="/images/hero-doctor-ai.webp"
                      alt="Doctor reviewing a holographic patient summary in a teal and navy clinical palette"
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
                      className="object-cover group-hover:scale-102 transition-transform duration-700"
                    />
                  </div>

                  {/* Gradient Overlay & Live Badge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-80 pointer-events-none" />

                  <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-navy-900/90 backdrop-blur-md border border-teal-500/20 text-white flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold flex items-center gap-1.5 text-teal-300">
                        <Activity className="w-3.5 h-3.5" />
                        Live OPD Scribe Session
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Vikramaditya R. • Suspected ACS flagged in 114s
                      </div>
                    </div>
                    <Badge variant="urgent" size="sm" pulse>
                      120s Target Met
                    </Badge>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. THE PROBLEM SECTION */}
        {/* ========================================================= */}
        <section id="problem" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
            <Badge variant="urgent" size="sm">
              {isHi ? "वास्तविक चुनौती" : "The Core Bottleneck"}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-navy dark:text-white">
              {isHi
                ? "भारतीय ओपीडी में 120 सेकंड का संकट"
                : "The High-Throughput Indian OPD Crisis"}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {isHi
                ? "भीड़भाड़ वाले क्लिनिक में डॉक्टर एक मरीज़ को केवल 2 से 3 मिनट दे पाते हैं, जिसमें से अधिकांश समय लिखने में बीत जाता है।"
                : "With 80+ patients per shift, physicians spend over 60% of their critical consultation minutes deciphering paper slips and typing notes."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1: Limited Consult Time */}
            <Card variant="urgent" className="p-7 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-coral-500/10 text-coral-600 dark:text-coral-400 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-navy dark:text-white">
                  {isHi ? "1. सीमित परामर्श समय" : "1. Limited Consult Time"}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {isHi
                    ? "भारत के व्यस्त सरकारी व निजी ओपीडी में औसतन प्रति मरीज़ केवल 2-3 मिनट मिलते हैं। हाथ से लिखने में 80% समय नष्ट होता है।"
                    : "The average Indian outpatient encounter lasts barely 2.5 minutes. Physicians are forced to prioritize rapid scribbling over deep diagnostic listening."}
                </p>
              </div>
              <div className="pt-4 border-t border-coral-200/40 dark:border-coral-800/40 text-[11px] font-mono text-coral-600 dark:text-coral-400 font-semibold">
                Impact: 75% clinician burnout & missed subtleties
              </div>
            </Card>

            {/* Card 2: Unstructured History */}
            <Card className="p-7 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-navy dark:text-white">
                  {isHi ? "2. बिखरा हुआ मेडिकल इतिहास" : "2. Unstructured History"}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {isHi
                    ? "मरीज़ों के पास फटी पुरानी पर्चियां, अस्पष्ट हस्तलिखित दवाएं और अलग-अलग अस्पतालों की रिपोर्टें होती हैं जिनका कोई कालक्रम नहीं होता।"
                    : "Previous prescriptions exist as faded paper slips, wrinkled laboratory prints, and fragmented WhatsApp photos with zero chronology or searchable index."}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-navy-800 text-[11px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                Impact: Redundant tests & repeated examinations
              </div>
            </Card>

            {/* Card 3: Language Barriers */}
            <Card className="p-7 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Languages className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-navy dark:text-white">
                  {isHi ? "3. भाषा और शब्दावली का अंतर" : "3. Language Barriers"}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {isHi
                    ? "ग्रामीण मरीज़ अपनी बोली (हिंदी, मारवाड़ी) में लक्षण बताते हैं, जबकि डॉक्टर को अंग्रेजी मेडिकल टर्मिनोलॉजी (ICD-10) में रिकॉर्ड करना होता है।"
                    : "Patients describe symptoms using colloquial rural Hindi idioms. Bridging vernacular speech into formal SNOMED CT and ICD-10 notes in real time creates friction."}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-navy-800 text-[11px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
                Impact: Miscommunicated dosages & lost symptoms
              </div>
            </Card>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3.5. INTERACTIVE PRODUCT PRESENTATION SHOWCASE */}
        {/* ========================================================= */}
        <InteractivePresentation />

        {/* ========================================================= */}
        {/* 4. HOW IT WORKS (5-STEP ANIMATED TIMELINE) */}
        {/* ========================================================= */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
            <Badge variant="verified" size="sm">
              {isHi ? "5-चरणीय प्रवाह" : "The 120-Second Pipeline"}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-navy dark:text-white">
              {isHi ? "इंडस्ट्रा मेडिकोज़ कैसे काम करता है" : "How Industra Medicose Works"}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {isHi
                ? "मरीज़ के बोलने से लेकर डॉक्टर के अंतिम हस्ताक्षर तक, एक निर्बाध मल्टी-एजेंट प्रक्रिया।"
                : "From patient vernacular speech to a signed, verified ABDM electronic health record in five synchronized steps."}
            </p>
          </div>

          {/* Timeline Grid */}
          <div className="space-y-6">
            {[
              {
                step: 1,
                titleEn: "Patient Speaks in Hindi or English",
                titleHi: "मरीज़ हिंदी या अंग्रेजी में बोलते हैं",
                descEn:
                  "While waiting in the queue, the patient speaks into their phone or the clinic kiosk microphone. Colloquial descriptions are captured without requiring complex medical vocabulary.",
                descHi:
                  "कतार में खड़े होकर मरीज़ अपने फोन या क्लिनिक कियोस्क में बोलते हैं। रोज़मर्रा की बोलचाल में अपनी परेशानी बताते हैं।",
                icon: Mic,
                image: "/images/patient-voice.webp",
                imageAlt: "A rural Indian patient speaking to a phone",
                tag: "Whisper Ambient Intake",
              },
              {
                step: 2,
                titleEn: "Autonomous Agents Structure Clinical Entities",
                titleHi: "एजेंट्स क्लिनिकल जानकारी को व्यवस्थित करते हैं",
                descEn:
                  "Our Clinical History and Intake agents organize the conversation into onset, duration, severity, and associated symptoms, mapping them to formal ICD-10 & SNOMED CT codes.",
                descHi:
                  "हमारे एजेंट बातचीत को लक्षण, अवधि और तीव्रता के अनुसार क्रमबद्ध कर ICD-10 कोड में बदल देते हैं।",
                icon: GitBranch,
                image: null,
                imageAlt: null,
                tag: "LLM Entity Extraction",
              },
              {
                step: 3,
                titleEn: "Previous Reports & Prescriptions Are Read",
                titleHi: "पुरानी पर्चियां और रिपोर्ट स्कैन होती हैं",
                descEn:
                  "The Document Intelligence Agent performs multi-modal OCR on old handwritten slips and laboratory test photos, extracting active drugs and abnormal biomarkers.",
                descHi:
                  "डॉक्यूमेंट इंटेलिजेंस एजेंट पुरानी पर्चियों और रिपोर्ट की फोटो को पढ़कर पुरानी दवाओं और जांचों को निकालता है।",
                icon: Scan,
                image: "/images/reports-scan.webp",
                imageAlt: "Prescription being scanned by Document Intelligence agent",
                tag: "Multi-Modal OCR",
              },
              {
                step: 4,
                titleEn: "Clinical Safety Check Runs in Real-Time",
                titleHi: "क्लिनिकल सेफ्टी चेक रियल-टाइम में चलता है",
                descEn:
                  "Safety Guard Agent checks for beta-lactam/penicillin allergies, potential drug-drug collisions, and urgent red flags like acute chest pain or stroke symptoms.",
                descHi:
                  "सेफ्टी गार्ड एजेंट ज्ञात एलर्जी, दवाओं के टकराव और सीने में दर्द जैसे गंभीर रेड फ्लैग्स की तत्काल जांच करता है।",
                icon: ShieldAlert,
                image: null,
                imageAlt: null,
                tag: "Contraindication Engine",
              },
              {
                step: 5,
                titleEn: "Doctor Reviews, Edits, and Approves",
                titleHi: "डॉक्टर समीक्षा करते हैं और अनुमोदित करते हैं",
                descEn:
                  "When the patient enters the cabin, the doctor sees a pre-populated, verified SOAP note. In less than 120 seconds, the doctor performs physical exam, verifies, and signs.",
                descHi:
                  "केबिन में आने पर डॉक्टर को तैयार SOAP नोट मिलता है। 2 मिनट में डॉक्टर जांच कर डिजिटल हस्ताक्षर करते हैं।",
                icon: UserCheck,
                image: null,
                imageAlt: null,
                tag: "ABDM M2 Verified",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="rounded-3xl border border-slate-200/80 dark:border-navy-700 bg-white/70 dark:bg-navy-800/60 p-6 sm:p-8 backdrop-blur-sm hover:shadow-soft-md transition-all"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Step Number & Text */}
                    <div className={item.image ? "lg:col-span-8 space-y-3" : "lg:col-span-12 space-y-3"}>
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-2xl bg-teal-500 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
                          {item.step}
                        </span>
                        <div className="w-9 h-9 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <Badge variant="verified" size="sm">
                          {item.tag}
                        </Badge>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-navy dark:text-white">
                        {isHi ? item.titleHi : item.titleEn}
                      </h3>

                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {isHi ? item.descHi : item.descEn}
                      </p>
                    </div>

                    {/* Step Image Thumbnail if present */}
                    {item.image && (
                      <div className="lg:col-span-4">
                        <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-teal-500/20 shadow-md">
                          <Image
                            src={item.image}
                            alt={item.imageAlt || item.titleEn}
                            fill
                            sizes="(max-width: 768px) 100vw, 30vw"
                            placeholder="blur"
                            blurDataURL={BLUR_PLACEHOLDER}
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. MEET THE AGENTS (6 AGENT CARDS) */}
        {/* ========================================================= */}
        <section id="agents" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
            <Badge variant="ai" size="sm" pulse>
              {isHi ? "स्वायत्त आर्किटेक्चर" : "Agentic Multi-Role Framework"}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-navy dark:text-white">
              {isHi ? "मिलिए हमारे 6 क्लिनिकल एजेंट्स से" : "Meet the Autonomous Agents"}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {isHi
                ? "प्रत्येक एजेंट एक समर्पित क्लिनिकल भूमिका निभाता है और एक दूसरे के साथ मिलकर 120 सेकंड की गति सुनिश्चित करता है।"
                : "Six specialized agents coordinating synchronously to complete the pre-consultation intake before the doctor opens the door."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Agent 1 */}
            <Card className="p-6 space-y-4 hover:border-teal-500/50 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Mic className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-navy dark:text-white">
                    Patient Interaction
                  </h3>
                  <Badge variant="ai" size="sm">
                    Latency &lt; 350ms
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Guides patient voice conversation with empathy in Hindi or English, clarifying onset and pain severity.
                </p>
              </div>
              <div className="text-[11px] font-mono text-teal-600 dark:text-teal-400 font-semibold pt-3 border-t border-slate-100 dark:border-navy-800">
                Role: Conversational Scribe & Intake
              </div>
            </Card>

            {/* Agent 2 */}
            <Card className="p-6 space-y-4 hover:border-teal-500/50 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-navy dark:text-white">
                    Clinical History
                  </h3>
                  <Badge variant="info" size="sm">
                    SNOMED CT
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Synthesizes chronic comorbidities, prior surgical history, and family health indicators into an indexed chronology.
                </p>
              </div>
              <div className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-semibold pt-3 border-t border-slate-100 dark:border-navy-800">
                Role: Chronological History Structuring
              </div>
            </Card>

            {/* Agent 3 */}
            <Card className="p-6 space-y-4 hover:border-teal-500/50 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Scan className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-navy dark:text-white">
                    Document Intelligence
                  </h3>
                  <Badge variant="verified" size="sm">
                    Vision OCR
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Scans handwritten prescriptions and laboratory slips, extracting active medications, dosages, and abnormal biomarkers.
                </p>
              </div>
              <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold pt-3 border-t border-slate-100 dark:border-navy-800">
                Role: Physical Records Digitizer
              </div>
            </Card>

            {/* Agent 4 */}
            <Card variant="urgent" className="p-6 space-y-4 hover:border-coral-500 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-coral-500/10 text-coral-600 dark:text-coral-400 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-coral-700 dark:text-coral-300">
                    Clinical Safety
                  </h3>
                  <Badge variant="urgent" size="sm" pulse>
                    Zero Miss
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Screening for drug-drug interactions, penicillin and beta-lactam allergies, and urgent red flags like chest pain or stroke.
                </p>
              </div>
              <div className="text-[11px] font-mono text-coral-600 dark:text-coral-400 font-semibold pt-3 border-t border-coral-200/40 dark:border-coral-800/40">
                Role: Real-Time Contraindication Guard
              </div>
            </Card>

            {/* Agent 5 */}
            <Card className="p-6 space-y-4 hover:border-teal-500/50 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-navy dark:text-white">
                    Clinical Documentation
                  </h3>
                  <Badge variant="info" size="sm">
                    ICD-10 Mapped
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Drafts high-density structured SOAP notes ready for doctor sign-off, saving over 4 minutes of typing per consult.
                </p>
              </div>
              <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold pt-3 border-t border-slate-100 dark:border-navy-800">
                Role: Automated SOAP Note Synthesis
              </div>
            </Card>

            {/* Agent 6 */}
            <Card className="p-6 space-y-4 hover:border-teal-500/50 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-navy dark:text-white">
                    Workflow Coordination
                  </h3>
                  <Badge variant="verified" size="sm">
                    FHIR M2
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Orchestrates the 120-second timeline, prioritizes queue triage by acuity, and binds outputs into ABDM FHIR bundles.
                </p>
              </div>
              <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-semibold pt-3 border-t border-slate-100 dark:border-navy-800">
                Role: OPD Triage & ABDM Dispatch
              </div>
            </Card>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 6. LIVE PRODUCT PREVIEW (TABBED PATIENT / DOCTOR VIEW) */}
        {/* ========================================================= */}
        <section id="preview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
            <Badge variant="info" size="sm">
              {isHi ? "इंटरएक्टिव इंटरफ़ेस" : "Product Demonstration"}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-navy dark:text-white">
              {isHi ? "लाइव प्रोडक्ट पूर्वावलोकन" : "Live Product Preview"}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {isHi
                ? "देखें कि मरीज़ और डॉक्टर दोनों के लिए इंटरफ़ेस कितना सहज और त्वरित है।"
                : "Switch between the Patient Intake view and the Doctor Verification Console."}
            </p>
          </div>

          {/* Persona Tabs */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <button
              type="button"
              onClick={() => setActivePreviewTab("doctor")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                activePreviewTab === "doctor"
                  ? "bg-teal-500 text-white shadow-teal-glow"
                  : "bg-slate-100 dark:bg-navy-800 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctor Verification View</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePreviewTab("patient")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                activePreviewTab === "patient"
                  ? "bg-teal-500 text-white shadow-teal-glow"
                  : "bg-slate-100 dark:bg-navy-800 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Patient Voice Intake View</span>
            </button>
          </div>

          {/* Interactive Preview Frame */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-navy-700 bg-navy-950 p-2 sm:p-4 shadow-2xl">
            {/* Top Window Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-navy-800 text-slate-400 text-xs font-mono mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-slate-300">
                  {activePreviewTab === "doctor" ? "app.industramedicose.in/doctor" : "app.industramedicose.in/patient"}
                </span>
              </div>
              <Badge variant="verified" size="sm">
                ABDM Sandbox Connected
              </Badge>
            </div>

            {/* Dashboard Preview Image */}
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-navy-800">
              <Image
                src="/images/dashboard-preview.webp"
                alt="Industra Medicose clean dashboard mockup with doctor triage queue and clinical summary"
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
                className="object-cover"
              />

              {/* Overlay Annotations for Doctor or Patient */}
              {activePreviewTab === "doctor" ? (
                <div className="absolute inset-0 bg-navy-950/40 p-4 sm:p-6 flex flex-col justify-end pointer-events-none">
                  <div className="max-w-xl p-4 sm:p-5 rounded-2xl bg-navy-900/90 backdrop-blur-md border border-teal-500/30 text-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        Dr. Aarav Mehta • OPD General Medicine
                      </span>
                      <Badge variant="urgent" size="sm">
                        Red Flag ACS
                      </Badge>
                    </div>
                    <div className="text-sm font-semibold">
                      Vikramaditya Rathore (54M) • 114s Intake Duration
                    </div>
                    <p className="text-xs text-slate-300">
                      Pre-populated SOAP note prepared with ICD-10 I20.0 (Unstable Angina). Penicillin allergy auto-flagged. One-click verify ready.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-navy-950/40 p-4 sm:p-6 flex flex-col justify-end pointer-events-none">
                  <div className="max-w-xl p-4 sm:p-5 rounded-2xl bg-navy-900/90 backdrop-blur-md border border-purple-500/30 text-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5" />
                        Patient Voice Intake (हिंदी + English)
                      </span>
                      <Badge variant="verified" size="sm">
                        Consent Active
                      </Badge>
                    </div>
                    <div className="text-sm font-semibold">
                      Ambient Scribe Listening: &ldquo;3 दिन से सीने में भारीपन...&rdquo;
                    </div>
                    <p className="text-xs text-slate-300">
                      Natural speech automatically transcribed into structured symptoms. Uploaded prescription slip scanned and attached.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 7. SAFETY AND RESPONSIBLE AI */}
        {/* ========================================================= */}
        <section id="safety" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
            <Badge variant="urgent" size="sm">
              {isHi ? "क्लिनिकल सुरक्षा" : "Responsible AI Guardrails"}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-navy dark:text-white">
              {isHi ? "सुरक्षा और नैतिक एआई सिद्धांत" : "Safety and Responsible AI"}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {isHi
                ? "एआई केवल सहायता करता है, अंतिम निर्णय डॉक्टर का है। हमारे 6 अपरिवर्तनीय सुरक्षा स्तंभ।"
                : "Industra Medicose never replaces the physician. Built with stringent ethical boundaries, cryptographic audits, and zero autonomous authority."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3 border-teal-500/30">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy dark:text-white">
                No Autonomous Diagnosis
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                The copilot synthesizes clinical history and highlights ICD-10 suggestions, but never renders an autonomous medical diagnosis.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border-teal-500/30">
              <div className="w-10 h-10 rounded-xl bg-coral-500/10 text-coral-600 dark:text-coral-400 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy dark:text-white">
                No Autonomous Prescription
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Zero medications or dosages can be dispatched without the physical review and digital cryptographic signature of the registered physician.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border-teal-500/30">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy dark:text-white">
                Human In The Loop
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Every draft entity, timeline event, and safety warning is fully editable. The doctor retains complete override authority over all data.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border-teal-500/30">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy dark:text-white">
                Synthetic Data Benchmark
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                This prototype evaluates on realistic synthetic de-identified clinical cohorts. Zero real patient Personally Identifiable Information (PII) is exposed.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border-teal-500/30">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy dark:text-white">
                Explicit Patient Consent
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                No intake discourse or optical scan can begin without explicit consent presented in simple vernacular Hindi or English, revokable at any time.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border-teal-500/30">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy dark:text-white">
                Cryptographic Audit Trail
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                All AI suggestions, physician alterations, and allergy alerts are stamped into an immutable audit log conforming to ABDM M2 milestone guidelines.
              </p>
            </Card>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 8. ROADMAP & REGIONAL CONTEXT */}
        {/* ========================================================= */}
        <section id="roadmap" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Visual: Jodhpur Mehrangarh Clinic */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl">
                <Image
                  src="/images/jodhpur-clinic.webp"
                  alt="Clinic with Mehrangarh-inspired warm tones in Jodhpur Rajasthan"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-navy-900/90 backdrop-blur-md border border-amber-500/20 text-white text-xs">
                  <span className="font-bold text-amber-300">Western Rajasthan Clinical Context</span>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Designed for rural-to-urban OPD influx in Jodhpur & high-density tertiary medical centers.
                  </p>
                </div>
              </div>
            </div>

            {/* Roadmap Content */}
            <div className="lg:col-span-7 space-y-6">
              <Badge variant="verified" size="sm">
                Strategic Roadmap
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-navy dark:text-white">
                {isHi ? "भविष्य का रोडमैप: मारवाड़ी भाषा व अस्पताल एकीकरण" : "Roadmap: Regional Dialects & Hospital Scale"}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Expanding our clinical copilot across the rural-urban continuum to ensure no patient is left behind due to dialect or paper friction.
              </p>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200/80 dark:border-navy-700 space-y-1">
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-sm font-bold text-navy dark:text-white">
                      1. Marwari & Regional Dialect Speech Models
                    </span>
                    <Badge variant="ai" size="sm">
                      Q2 2026
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">
                    Fine-tuned Whisper models on 5,000+ hours of Marwari, Mewari, and Shekhawati conversational medical speech.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200/80 dark:border-navy-700 space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-bold text-navy dark:text-white">
                      2. Direct Hospital EMR & ABDM M2 Integrations
                    </span>
                    <Badge variant="verified" size="sm">
                      Q3 2026
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">
                    Bi-directional FHIR bundles connecting directly with NIC e-Hospital, Ayush portals, and major private hospital HMIS.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200/80 dark:border-navy-700 space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-bold text-navy dark:text-white">
                      3. WhatsApp & SMS Automated Follow-Up Reminders
                    </span>
                    <Badge variant="info" size="sm">
                      Q4 2026
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">
                    Vernacular audio voice notes sent directly to patient phones reminding them of medication dosages and follow-up OPD dates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 9. TEAM SECTION & CALL TO ACTION */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-navy via-navy-800 to-navy-900 text-white p-8 sm:p-12 lg:p-16 border border-teal-500/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              {/* Left Column: Team Details */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge variant="ai" size="sm" pulse>
                    Team HPKGSAVV
                  </Badge>
                  <span className="text-xs text-teal-300 font-medium px-3 py-0.5 rounded-full bg-teal-950/80 border border-teal-500/30">
                    AAYU 2026 Hackathon Finalists
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Crafted with Empathy & Clinical Precision
                </h2>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  Built by engineering and clinical enthusiasts passionate about transforming high-throughput healthcare delivery across India.
                </p>

                {/* Team Members List */}
                <div className="pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-3">
                    Core Engineering & Product Team
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { name: "Harshvardhan Purohit", role: "AI & Fullstack" },
                      { name: "Kanika Gehlot", role: "Clinical Systems" },
                      { name: "Shefali Agarwal", role: "Product & UI" },
                      { name: "Vanshika Verma", role: "ML & Verification" },
                    ].map((member) => (
                      <div
                        key={member.name}
                        className="p-3 rounded-2xl bg-navy-950/70 border border-teal-500/20 text-left space-y-0.5"
                      >
                        <div className="text-xs font-bold text-white leading-snug">
                          {member.name}
                        </div>
                        <div className="text-[11px] text-teal-300">
                          {member.role}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Link href="/login">
                    <Button
                      variant="default"
                      size="lg"
                      className="shadow-teal-glow font-bold"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      {isHi ? "लाइव प्रोटोटाइप आज़माएँ" : "Launch Live Prototype"}
                    </Button>
                  </Link>

                  <Link href="/guide">
                    <Button
                      variant="secondary"
                      size="lg"
                      leftIcon={<HelpCircle className="w-5 h-5" />}
                    >
                      {isHi ? "मार्गदर्शिका पढ़ें" : "Read How-To-Use Guide"}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column: Team Collab Photo */}
              <div className="lg:col-span-5">
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-teal-500/30 shadow-2xl">
                  <Image
                    src="/images/team-collab.webp"
                    alt="Team HPKGSAVV collaborating on Industra Medicose clinical AI"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    placeholder="blur"
                    blurDataURL={BLUR_PLACEHOLDER}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 text-center text-xs text-slate-300 font-mono">
                    Team HPKGSAVV • SIN Education and Technology Pvt. Ltd.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}
      <footer className="border-t border-slate-200/80 dark:border-navy-800 bg-white/50 dark:bg-navy-950/50 py-12 px-4 sm:px-6 lg:px-8 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-200/80 dark:border-navy-800">
            <div className="space-y-2">
              <Logo size="md" showTagline />
              <p className="text-xs text-muted-foreground max-w-md">
                Empowering doctors with agentic-AI pre-consultation summaries. Built for the AAYU 2026 hackathon challenge T01 &ldquo;The Two-Minute Doctor&rdquo;.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-semibold text-foreground/80">
              <a href="#problem" className="hover:text-teal-600 transition-colors">
                The Problem
              </a>
              <a href="#presentation" className="hover:text-teal-600 transition-colors text-teal-600 dark:text-teal-400">
                Presentation
              </a>
              <a href="#how-it-works" className="hover:text-teal-600 transition-colors">
                How It Works
              </a>
              <a href="#agents" className="hover:text-teal-600 transition-colors">
                Agents
              </a>
              <a href="#preview" className="hover:text-teal-600 transition-colors">
                Live Demo
              </a>
              <a href="#safety" className="hover:text-teal-600 transition-colors">
                Safety & Ethics
              </a>
              <Link href="/guide" className="hover:text-teal-600 transition-colors text-teal-600 dark:text-teal-400">
                User Guide (/guide)
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="font-medium text-foreground">
                &copy; 2026 SIN Education and Technology Pvt. Ltd. All rights reserved.
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                AI assists, the doctor decides. Prototype built using synthetic de-identified healthcare data.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="verified" size="sm">
                ABDM FHIR M2
              </Badge>
              <Badge variant="ai" size="sm">
                Team HPKGSAVV
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
