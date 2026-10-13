"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Stethoscope,
  User,
  Shield,
  Send,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PortalRole = "doctor" | "patient" | "admin";

interface RoleMetadata {
  role: PortalRole;
  title: string;
  badgeText: string;
  destinationPath: string;
  description: string;
  demoEmail: string;
  demoName: string;
  icon: typeof Stethoscope;
}

const ROLE_CONFIGS: Record<PortalRole, RoleMetadata> = {
  doctor: {
    role: "doctor",
    title: "Doctor OPD Portal",
    badgeText: "Clinician Workspace",
    destinationPath: "/doctor",
    description: "Ambient OPD Voice Scribe, Live Triage Queue, AI Rx Studio & Clinical History",
    demoEmail: "dr.mehta@hospital.in",
    demoName: "Dr. Aarav Mehta",
    icon: Stethoscope,
  },
  patient: {
    role: "patient",
    title: "Patient Health Portal",
    badgeText: "Patient Workspace",
    destinationPath: "/patient",
    description: "Self Health Records, ABDM Link, Consent Governance & Voice Intake Scribe",
    demoEmail: "patient@industramedicose.in",
    demoName: "Aarav Sharma",
    icon: User,
  },
  admin: {
    role: "admin",
    title: "Hospital Admin Console",
    badgeText: "Admin Workspace",
    destinationPath: "/admin",
    description: "OPD Telemetry, Clinical Audit Logs, Multi-Agent Governance & System Health",
    demoEmail: "admin@hospital.in",
    demoName: "System Administrator",
    icon: Shield,
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [selectedRole, setSelectedRole] = useState<PortalRole>("doctor");
  const [authMode, setAuthMode] = useState<"password" | "magic-link">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  const activeConfig = ROLE_CONFIGS[selectedRole];

  // Standard Login (Email + Password)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          rolePreference: selectedRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Login failed. Please verify credentials.");
        return;
      }

      addToast({
        type: "verified",
        title: "Welcome back",
        message: `Signed in as ${data.user.fullName} (${data.user.role}). Redirecting to ${data.redirectPath}...`,
      });

      router.push(data.redirectPath || activeConfig.destinationPath);
      router.refresh();
    } catch {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Magic Link Login
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to send magic link.");
        return;
      }

      setMagicSent(true);
      addToast({
        type: "info",
        title: "Magic Link Dispatched",
        message: data.message,
      });
    } catch {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // One-Click Demo Login to the selected role
  const handleDemoLogin = async (role: PortalRole) => {
    setErrorMsg(null);
    setDemoLoading(role);

    try {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Demo login failed. Check backend configuration.");
        return;
      }

      addToast({
        type: "verified",
        title: `Dashboard Ready: ${role.toUpperCase()}`,
        message: `Opening ${data.redirectPath} for ${data.user.fullName}.`,
      });

      router.push(data.redirectPath);
      router.refresh();
    } catch {
      setErrorMsg("Failed to initiate demo session.");
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <AuthLayout
      title="Industra Medicose Portal"
      subtitle="Select which dashboard you wish to access, or launch directly using 1-click test personas."
    >
      <div className="space-y-6">
        {/* Error Alert Banner */}
        {errorMsg && (
          <div
            role="alert"
            className="p-4 rounded-xl border border-coral-300 dark:border-coral-800 bg-coral-50/90 dark:bg-coral-950/80 text-coral-900 dark:text-coral-200 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in"
          >
            <AlertCircle className="w-5 h-5 text-coral-600 dark:text-coral-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* Step 1: Explicit Role & Dashboard Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Step 1: Choose Your Dashboard</span>
            <span className="text-[11px] font-normal lowercase">Each role has its own portal</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {(Object.keys(ROLE_CONFIGS) as PortalRole[]).map((roleKey) => {
              const cfg = ROLE_CONFIGS[roleKey];
              const Icon = cfg.icon;
              const isSelected = selectedRole === roleKey;

              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => {
                    setSelectedRole(roleKey);
                    setErrorMsg(null);
                    if (!email || email.includes("hospital.in") || email.includes("industramedicose.in")) {
                      setEmail(cfg.demoEmail);
                    }
                  }}
                  className={cn(
                    "p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 relative group",
                    isSelected
                      ? "border-teal-500 bg-teal-50/60 dark:bg-navy-800/90 shadow-md ring-2 ring-teal-500/20"
                      : "border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900/60 hover:border-slate-300 dark:hover:border-navy-600"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                        isSelected
                          ? "bg-teal-600 text-white"
                          : "bg-slate-100 dark:bg-navy-800 text-slate-500 group-hover:text-teal-600"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <Badge variant="verified" size="sm">
                        Selected
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-navy dark:text-white leading-tight">
                      {cfg.title}
                    </h3>
                    <code className="text-[10px] text-teal-600 dark:text-teal-400 font-mono font-semibold block mt-0.5">
                      {cfg.destinationPath}
                    </code>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Selected Dashboard Confirmation & Fast 1-Click Entry */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-mint-50 via-white to-mint-50 dark:from-navy-800/80 dark:via-navy-900 dark:to-navy-800/80 border border-teal-500/30 space-y-3 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-500" />
              Direct Entry to {activeConfig.title}
            </span>
            <Badge variant="ai" size="sm">
              Opens {activeConfig.destinationPath}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {activeConfig.description}
          </p>

          <Button
            type="button"
            variant="default"
            size="md"
            isLoading={demoLoading === selectedRole}
            onClick={() => handleDemoLogin(selectedRole)}
            leftIcon={<activeConfig.icon className="w-4 h-4" />}
            rightIcon={<ExternalLink className="w-4 h-4 opacity-70" />}
            className="w-full shadow-teal-glow font-bold text-xs sm:text-sm"
          >
            Launch {activeConfig.title} ({activeConfig.destinationPath})
          </Button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-navy-700" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
            <span className="bg-background px-3 text-muted-foreground font-semibold">
              Or Sign In With Credentials
            </span>
          </div>
        </div>

        {/* Auth Mode Toggle (Password vs Magic Link) */}
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs">
          <button
            type="button"
            onClick={() => {
              setAuthMode("password");
              setMagicSent(false);
            }}
            className={cn(
              "flex-1 py-2 font-semibold rounded-lg transition-all min-h-[36px]",
              authMode === "password"
                ? "bg-white dark:bg-navy-700 text-navy dark:text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Password Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("magic-link")}
            className={cn(
              "flex-1 py-2 font-semibold rounded-lg transition-all min-h-[36px]",
              authMode === "magic-link"
                ? "bg-white dark:bg-navy-700 text-navy dark:text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Magic Link OTP
          </button>
        </div>

        {/* Password Login Form */}
        {authMode === "password" ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span>Email Address</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(activeConfig.demoEmail);
                    setPassword("DemoDoctor2026!");
                  }}
                  className="text-[11px] text-teal-600 dark:text-teal-400 font-medium hover:underline"
                >
                  Use sample {selectedRole} email
                </button>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeConfig.demoEmail}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="login-password" className="font-semibold text-foreground">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px] transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="default"
              size="md"
              className="w-full shadow-teal-glow mt-2 font-bold"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to {activeConfig.title} ({activeConfig.destinationPath})
            </Button>
          </form>
        ) : (
          /* Magic Link Form */
          <form onSubmit={handleMagicLink} className="space-y-4">
            {magicSent ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Check your inbox</p>
                  <p className="text-xs opacity-90">
                    We sent a secure login link to <strong>{email}</strong>. Click the link to complete sign-in.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="magic-email" className="text-xs font-semibold text-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="magic-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={activeConfig.demoEmail}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px] transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  size="md"
                  className="w-full shadow-teal-glow"
                  isLoading={loading}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Send Magic Link
                </Button>
              </>
            )}
          </form>
        )}

        {/* Footer Link to Signup */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-slate-100 dark:border-navy-800">
          <span>Don&apos;t have an account yet? </span>
          <Link
            href="/signup"
            className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
