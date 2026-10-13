"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Logo } from "@/components/ui/Logo";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, HeartPulse } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background">
      {/* Left Side: Illustrated Hero Visual */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative flex-col justify-between p-12 bg-gradient-to-br from-navy via-navy-800 to-navy-950 text-white overflow-hidden border-r border-teal-500/20">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 rounded-full bg-ai-500/15 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Logo size="md" showTagline />
          <Badge variant="ai" size="sm" pulse>
            AAYU 2026 Trial
          </Badge>
        </div>

        {/* Center Illustration Hero */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto py-8">
          <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border border-teal-500/30 bg-navy-900/60 backdrop-blur-md">
            {!imageError ? (
              <Image
                src="/images/auth-hero.webp"
                alt="Empathetic consultation between doctor and patient with AI clinical copilot waveform"
                fill
                priority
                className="object-cover object-center"
                onError={() => setImageError(true)}
              />
            ) : (
              /* Inline SVG Fallback */
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-navy-800 to-navy text-center">
                <div className="w-20 h-20 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center mb-4">
                  <HeartPulse className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Industra Medicose</h3>
                <p className="text-xs text-slate-300 max-w-xs">
                  Agentic-AI Clinical Copilot for high-throughput OPD environments.
                </p>
              </div>
            )}

            {/* Floating feature pills on the illustration */}
            <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-navy-950/80 backdrop-blur-md border border-teal-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">The Two-Minute Doctor</span>
                  <span className="text-[11px] text-teal-300">Intake Scribe &bullet; Safety Guard</span>
                </div>
              </div>
              <Badge variant="verified" size="sm">
                100% ABDM
              </Badge>
            </div>
          </div>

          <div className="text-center mt-6 max-w-md">
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
              Less Documentation. More Care.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Empowering clinicians and patients with dual-lingual AI scribing, instant SOAP extraction, and real-time contraindication safeguards.
            </p>
          </div>
        </div>

        {/* Bottom Clinical Governance Notice */}
        <div className="relative z-10 pt-6 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
          <span>&copy; 2026 Industra Medicose</span>
          <span className="text-[11px] text-teal-300">Prototype for AAYU 2026 Hackathon</span>
        </div>
      </div>

      {/* Right Side: Form Card Container */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto">
        {/* Top Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* Center Card Content */}
        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy dark:text-white">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        {/* Bottom Legal / Accessibility Note */}
        <div className="pt-8 text-center text-xs text-muted-foreground mt-auto">
          <p>
            AI assists, the doctor decides. Securely protected by Supabase Row-Level Security.
          </p>
        </div>
      </div>
    </div>
  );
}
