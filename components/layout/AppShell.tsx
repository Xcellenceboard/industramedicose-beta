"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Mic,
  Pill,
  BarChart3,
  Layers,
  Menu,
  X,
  Search,
  ChevronRight,
  Stethoscope,
  LogOut,
  User,
  Shield,
  ChevronDown,
  FileCheck,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { HelpSlideOver } from "@/components/guide/HelpSlideOver";
import { ProductTour } from "@/components/guide/ProductTour";
import { useI18n } from "@/components/providers/I18nProvider";
import { DemoControlWidget } from "@/components/demo/DemoControlWidget";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export interface AppShellProps {
  children: React.ReactNode;
}

interface UserSession {
  id: string;
  email?: string;
  fullName: string;
  role: "patient" | "doctor" | "admin";
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { t } = useI18n();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [registerDropdownOpen, setRegisterDropdownOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const registerMenuRef = useRef<HTMLDivElement>(null);

  // Derive contextual role immediately from route pathname
  const initialRole: "patient" | "doctor" | "admin" = pathname.startsWith("/patient")
    ? "patient"
    : pathname.startsWith("/admin")
    ? "admin"
    : pathname.startsWith("/doctor")
    ? "doctor"
    : "doctor";

  const [user, setUser] = useState<UserSession>({
    id: "active-session",
    fullName:
      initialRole === "patient"
        ? "Aarav Sharma"
        : initialRole === "admin"
        ? "System Administrator"
        : "Dr. Aarav Mehta",
    email:
      initialRole === "patient"
        ? "patient@industramedicose.in"
        : initialRole === "admin"
        ? "admin@hospital.in"
        : "dr.mehta@hospital.in",
    role: initialRole,
  });

  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      return match ? decodeURIComponent(match[2]) : null;
    };

    const cookieRole = getCookie("im_demo_role") as "patient" | "doctor" | "admin" | null;
    const cookieName = getCookie("im_user_name");
    const cookieEmail = getCookie("im_user_email");

    // Route path is strict source of truth for the active portal
    const effectiveRole: "patient" | "doctor" | "admin" = pathname.startsWith("/patient")
      ? "patient"
      : pathname.startsWith("/admin")
      ? "admin"
      : pathname.startsWith("/doctor")
      ? "doctor"
      : cookieRole || "doctor";

    const defaultName =
      effectiveRole === "patient"
        ? "Aarav Sharma"
        : effectiveRole === "admin"
        ? "System Administrator"
        : "Dr. Aarav Mehta";

    const defaultEmail =
      effectiveRole === "patient"
        ? "patient@industramedicose.in"
        : effectiveRole === "admin"
        ? "admin@hospital.in"
        : "dr.mehta@hospital.in";

    setUser({
      id: "active-session",
      role: effectiveRole,
      fullName: (cookieRole === effectiveRole && cookieName) ? cookieName : defaultName,
      email: (cookieRole === effectiveRole && cookieEmail) ? cookieEmail : defaultEmail,
    });

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        const metadata = data.user.user_metadata;
        const metaRole = (metadata?.role as "patient" | "doctor" | "admin") || effectiveRole;
        if (metaRole === effectiveRole) {
          setUser({
            id: data.user.id,
            email: data.user.email || defaultEmail,
            fullName: metadata?.full_name || data.user.email?.split("@")[0] || defaultName,
            role: effectiveRole,
          });
        }
      }
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (registerMenuRef.current && !registerMenuRef.current.contains(event.target as Node)) {
        setRegisterDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }

    // Force clear client cookies
    const cookieNames = [
      "im_demo_role",
      "im_user_name",
      "im_user_email",
      "im_auth_state",
      "sb-access-token",
      "sb-refresh-token",
      "supabase-auth-token",
    ];
    cookieNames.forEach((name) => {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    });
    try {
      document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.startsWith("sb-") || name.startsWith("im_") || name.startsWith("supabase")) {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
        }
      });
    } catch {
      // ignore
    }

    // Hard navigate to login to flush all memory and router caches
    window.location.href = "/login?logged_out=1";
  };

  const switchWorkspace = (targetRole: "patient" | "doctor" | "admin") => {
    const meta = {
      patient: { path: "/patient", name: "Aarav Sharma", email: "patient@industramedicose.in" },
      doctor: { path: "/doctor", name: "Dr. Aarav Mehta", email: "dr.mehta@hospital.in" },
      admin: { path: "/admin", name: "System Administrator", email: "admin@hospital.in" },
    }[targetRole];

    document.cookie = `im_demo_role=${targetRole}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `im_user_name=${encodeURIComponent(meta.name)}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `im_user_email=${encodeURIComponent(meta.email)}; path=/; max-age=604800; SameSite=Lax`;
    setProfileMenuOpen(false);
    window.location.href = meta.path;
  };

  // Active role takes strict precedence from route, fallback to user.role
  const effectiveRole: "patient" | "doctor" | "admin" = pathname.startsWith("/patient")
    ? "patient"
    : pathname.startsWith("/admin")
    ? "admin"
    : pathname.startsWith("/doctor")
    ? "doctor"
    : user.role;

  const isPatient = effectiveRole === "patient";
  const isDoctor = effectiveRole === "doctor";
  const isAdmin = effectiveRole === "admin";

  const displayName = isPatient
    ? (user.role === "patient" && !user.fullName.toLowerCase().includes("dr.") ? user.fullName : "Aarav Sharma")
    : isAdmin
    ? (user.role === "admin" ? user.fullName : "System Administrator")
    : (user.role === "doctor" ? user.fullName : "Dr. Aarav Mehta");

  const displayEmail = isPatient
    ? (user.role === "patient" ? user.email : "patient@industramedicose.in")
    : isAdmin
    ? (user.role === "admin" ? user.email : "admin@hospital.in")
    : (user.role === "doctor" ? user.email : "dr.mehta@hospital.in");

  const navItems = [
    {
      href: isDoctor ? "/doctor" : isAdmin ? "/admin" : "/patient",
      label:
        isDoctor
          ? "Doctor Triage"
          : isAdmin
          ? "Admin Console"
          : "Patient Portal",
      icon: isDoctor ? Stethoscope : isAdmin ? Shield : User,
    },
    {
      href: "/directory",
      label: "Medical Directory",
      icon: Search,
      highlight: true,
    },
    {
      href: "/",
      label: t("navDashboard"),
      icon: LayoutDashboard,
    },
    // Component Gallery is excluded from Patient Dashboard
    ...(!isPatient
      ? [
          {
            href: "/dev/components",
            label: t("navDevComponents"),
            icon: Layers,
            highlight: true,
          },
        ]
      : []),
    {
      href: "/patient/intake",
      label: isPatient ? "Voice AI Intake" : t("navConsultations"), // Live Scribe
      icon: Mic,
      highlight: true,
    },
    {
      href: isDoctor ? "/doctor/consultation/c-101" : "/patient",
      label: isPatient ? "My Prescriptions" : t("navPrescriptions"), // Rx Studio
      icon: Pill,
    },
    ...(!isPatient
      ? [
          {
            href: isAdmin ? "/admin" : "/doctor#analytics",
            label: t("navAnalytics"), // Throughput Analytics
            icon: BarChart3,
          },
        ]
      : []),
    ...(isDoctor
      ? [
          {
            href: "/doctor/guide",
            label: "Doctor Guidebook",
            icon: BookOpen,
            highlight: true,
          },
        ]
      : []),
    {
      href: "/guide",
      label: "Platform Guide & FAQs",
      icon: HelpCircle,
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Synthetic Prototype Notice Ribbon */}
      <div className="w-full bg-slate-900 border-b border-slate-800 text-slate-300 px-4 py-1.5 text-center text-[11px] font-medium flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
        <span>
          <strong>Synthetic Data Prototype:</strong> Built for AAYU 2026 Hackathon (Problem T01 &bull; &ldquo;The Two-Minute Doctor&rdquo;). All clinical data is simulated.
        </span>
        <a href="/privacy" className="text-teal-400 font-bold hover:underline ml-1">
          Privacy &amp; Compliance &rarr;
        </a>
      </div>

      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 border-r border-slate-200/80 dark:border-navy-700/80 bg-white/70 dark:bg-navy-900/60 backdrop-blur-xl shrink-0 p-5 sticky top-0 h-screen overflow-y-auto">
          {/* Logo Header */}
          <div className="pb-6 border-b border-slate-100 dark:border-navy-800">
            <Logo size="md" showTagline />
          </div>

          {/* Quick Action Button */}
          <div className="py-4">
            <Button
              variant="default"
              size="md"
              className="w-full justify-between shadow-teal-glow group"
              leftIcon={isPatient ? <Mic className="w-4 h-4" /> : isDoctor ? <Stethoscope className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              rightIcon={<ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
              onClick={() => {
                if (isPatient) router.push("/patient/intake");
                else if (isAdmin) router.push("/admin");
                else router.push("/doctor");
              }}
            >
              <span>
                {isPatient
                  ? "Start Voice AI Intake"
                  : isAdmin
                  ? "Admin Console"
                  : t("startConsultation")}
              </span>
            </Button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 space-y-1.5 py-2" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all min-h-[44px] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                    isActive
                      ? "bg-teal-500 text-white font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-navy-800/80"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-slate-400 dark:text-slate-500 group-hover:text-teal-600 dark:group-hover:text-teal-400"
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate flex-1">{item.label}</span>
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Active Copilot Engine Status Pod */}
          <div className="p-3.5 rounded-2xl bg-mint-50/70 dark:bg-navy-800/80 border border-teal-200/40 dark:border-teal-800/40 space-y-2 mt-auto">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 tracking-wide uppercase">
                Copilot Engine
              </span>
              <Badge variant="ai" size="sm" pulse>
                Active
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              T01 Multi-Agent: Whisper Scribe + Gemini Clinical Guard
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 bg-white/80 dark:bg-navy-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-navy-700/80 px-4 sm:px-6 lg:px-8 h-18 min-h-[64px] flex items-center justify-between gap-4">
            {/* Mobile Hamburger & Logo */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-xl text-foreground hover:bg-slate-100 dark:hover:bg-navy-800 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-500"
                aria-label="Open mobile menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <Logo size="sm" showTagline={false} />
            </div>

            {/* Desktop Search Field */}
            <div className="hidden md:flex items-center flex-1 max-w-md">
              <div className="relative w-full">
                <Search
                  className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  aria-label={t("searchPlaceholder")}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-100/90 dark:bg-navy-800 border border-slate-200/80 dark:border-navy-700 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px] transition-all"
                />
                <kbd className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white dark:bg-navy-700 border border-slate-200 dark:border-navy-600 text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Top Bar Actions & Interactive Profile Menu */}
            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                aria-label="Open clinical help and FAQs"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-500/30 text-teal-700 dark:text-teal-300 bg-teal-50/50 dark:bg-navy-800 hover:bg-teal-100/60 dark:hover:bg-teal-950/40 text-xs font-semibold min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <HelpCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="hidden sm:inline">Help</span>
              </button>
              {/* Register as Doctor / Patient Dropdown Tab */}
              <div className="relative" ref={registerMenuRef}>
                <button
                  type="button"
                  onClick={() => setRegisterDropdownOpen(!registerDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-teal-glow transition-all min-h-[44px]"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Register as Doctor / Patient</span>
                  <span className="sm:hidden">Register</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                <AnimatePresence>
                  {registerDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-xl p-2 z-50 space-y-1"
                    >
                      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-slate-100 dark:border-navy-800">
                        Select Registration Role
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
                            Register as Patient
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            मरीज पंजीकरण &bull; Profile &amp; AI Triage
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
                            Register as Doctor
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            डॉक्टर पंजीकरण &bull; Video OPD &amp; Scribe
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <LanguageToggle />
              <ThemeToggle />

              {/* Profile Dropdown Container */}
              <div className="relative pl-2 sm:pl-3 border-l border-slate-200 dark:border-navy-700" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  aria-expanded={profileMenuOpen}
                  aria-label="User profile and session menu"
                  className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 min-h-[44px]"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-600 to-navy text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {getInitials(displayName)}
                    </div>
                    <span
                      className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-navy-900"
                      title="Session Active"
                    />
                  </div>
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-bold leading-none text-navy dark:text-white">
                      {displayName}
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                      {isPatient ? "Patient Portal" : isAdmin ? "Admin Console" : "Doctor Portal"}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                </button>

                {/* Profile Popover Menu */}
                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-4 z-50 space-y-3"
                    >
                      <div className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-navy-800">
                        <div className="w-11 h-11 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
                          {getInitials(displayName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-navy dark:text-white truncate">
                            {displayName}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                          <Badge
                            variant={isDoctor ? "verified" : isAdmin ? "ai" : "info"}
                            size="sm"
                            className="mt-1"
                          >
                            {effectiveRole.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      {/* 1-Click Role Switcher */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2">
                          Switch Dashboard
                        </span>

                        <button
                          type="button"
                          onClick={() => switchWorkspace("doctor")}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left min-h-[38px]",
                            isDoctor
                              ? "bg-teal-50 dark:bg-navy-800 text-teal-700 dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-800"
                              : "text-foreground hover:bg-slate-100 dark:hover:bg-navy-800"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Stethoscope className="w-4 h-4 text-teal-600" />
                            <span>Doctor OPD Workspace</span>
                          </div>
                          {isDoctor && <Badge variant="verified" size="sm">Active</Badge>}
                        </button>

                        <button
                          type="button"
                          onClick={() => switchWorkspace("patient")}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left min-h-[38px]",
                            isPatient
                              ? "bg-teal-50 dark:bg-navy-800 text-teal-700 dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-800"
                              : "text-foreground hover:bg-slate-100 dark:hover:bg-navy-800"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <User className="w-4 h-4 text-teal-600" />
                            <span>Patient Health Portal</span>
                          </div>
                          {isPatient && <Badge variant="verified" size="sm">Active</Badge>}
                        </button>

                        <button
                          type="button"
                          onClick={() => switchWorkspace("admin")}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left min-h-[38px]",
                            isAdmin
                              ? "bg-teal-50 dark:bg-navy-800 text-teal-700 dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-800"
                              : "text-foreground hover:bg-slate-100 dark:hover:bg-navy-800"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Shield className="w-4 h-4 text-purple-600" />
                            <span>Hospital Admin Console</span>
                          </div>
                          {isAdmin && <Badge variant="verified" size="sm">Active</Badge>}
                        </button>

                        {isPatient && (
                          <Link
                            href="/consent"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors min-h-[38px]"
                          >
                            <FileCheck className="w-4 h-4 text-teal-600" />
                            <span>Clinical Consent Terms</span>
                          </Link>
                        )}
                      </div>

                      {/* Sign Out Button */}
                      <div className="pt-2 border-t border-slate-100 dark:border-navy-800">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleLogout}
                          leftIcon={<LogOut className="w-4 h-4 text-coral-500" />}
                          className="w-full justify-start text-xs text-coral-600 dark:text-coral-400 hover:bg-coral-50 dark:hover:bg-coral-950/40"
                        >
                          Sign Out of Session
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Main Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>

          {/* Accessible Footer */}
          <footer className="border-t border-slate-200/80 dark:border-navy-800 py-6 px-4 sm:px-8 text-center text-xs text-muted-foreground bg-white/40 dark:bg-navy-950/40">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <p>{t("footerCopy")}</p>
              <div className="flex items-center gap-2">
                <Badge variant="verified" size="sm">
                  {t("hackathonTag")}
                </Badge>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed top-0 bottom-0 left-0 w-4/5 max-w-xs bg-white dark:bg-navy-900 p-5 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-navy-800">
                <Logo size="sm" showTagline />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-navy-800 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-500"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User session banner in mobile drawer */}
              <div className="py-3 px-3 rounded-xl bg-slate-50 dark:bg-navy-800 my-2 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold block">{displayName}</span>
                  <span className="text-[11px] text-muted-foreground capitalize">
                    {isPatient ? "Patient Portal" : isAdmin ? "Admin Console" : "Doctor Portal"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="h-8 px-2 text-coral-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>

              <div className="py-2">
                <Button
                  variant="default"
                  size="md"
                  className="w-full justify-center shadow-teal-glow"
                  leftIcon={isPatient ? <Mic className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (isPatient) router.push("/patient/intake");
                    else if (isAdmin) router.push("/admin");
                    else router.push("/doctor");
                  }}
                >
                  {isPatient
                    ? "Start Voice AI Intake"
                    : isAdmin
                    ? "Admin Console"
                    : t("startConsultation")}
                </Button>
              </div>

              <nav className="flex-1 space-y-1.5 overflow-y-auto py-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all min-h-[44px]",
                        isActive
                          ? "bg-teal-500 text-white font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-navy-800"
                      )}
                    >
                      <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-200 dark:border-navy-800 flex items-center justify-between">
                <LanguageToggle />
                <ThemeToggle />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Persistent Help Button */}
      <button
        type="button"
        onClick={() => setHelpOpen(true)}
        aria-label="Open Help & Quick Start Guide"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-600/30 font-semibold text-xs transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500"
      >
        <HelpCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Help & FAQs</span>
      </button>

      {/* Slide-over Help & Quick Start */}
      <HelpSlideOver
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        onStartTour={() => setTourOpen(true)}
      />

      {/* Interactive Guided Product Tour */}
      <ProductTour
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
      />

      {/* Floating Demo Control Center for Hackathon Judges */}
      <DemoControlWidget />
    </div>
  );
}
