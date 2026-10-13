"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ShieldAlert, LogOut, Home } from "lucide-react";

export default function ForbiddenPage() {
  const searchParams = useSearchParams();
  const currentRole = searchParams.get("role") || "patient";
  const requiredRole = searchParams.get("required") || "authorized clinical staff";
  const requestedPath = searchParams.get("from") || "";

  const roleHome =
    currentRole === "doctor" ? "/doctor" : currentRole === "admin" ? "/admin" : "/patient";

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-6 sm:p-12">
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-200 dark:border-navy-700">
        <Logo size="md" />
        <Badge variant="urgent" size="sm" pulse>
          HTTP 403 &bullet; Restricted Access
        </Badge>
      </header>

      <main className="max-w-lg w-full mx-auto my-auto text-center space-y-6">
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-coral-50 dark:bg-coral-950/60 border border-coral-200 dark:border-coral-800 text-coral-600 dark:text-coral-400 flex items-center justify-center shadow-soft">
          <ShieldAlert className="w-10 h-10" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-coral-500/20 blur-sm" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy dark:text-white">
            Clinical Area Restricted
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Your current account role (<strong>{currentRole}</strong>) does not have authorization to view{" "}
            {requestedPath ? <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-xs">{requestedPath}</code> : "this area"}
            , which is restricted to <strong>{requiredRole}</strong> accounts.
          </p>
        </div>

        <Card className="p-4 text-xs text-left bg-slate-50/80 dark:bg-navy-800/60 border-slate-200 dark:border-navy-700 space-y-1.5">
          <span className="font-semibold text-foreground block">
            Why am I seeing this?
          </span>
          <p className="text-muted-foreground">
            Industra Medicose enforces strict healthcare privacy segregation. Patient records, doctor triage queues, and administrative audit logs are separated by Row-Level Security.
          </p>
        </Card>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href={roleHome} className="w-full sm:w-auto">
            <Button
              variant="default"
              size="md"
              leftIcon={<Home className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-teal-glow"
            >
              Return to My {currentRole.toUpperCase()} Portal
            </Button>
          </Link>

          <Button
            variant="outline"
            size="md"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Switch Account
          </Button>
        </div>
      </main>

      <footer className="text-center text-xs text-muted-foreground pt-6 border-t border-slate-200 dark:border-navy-700 max-w-4xl w-full mx-auto">
        <p>&copy; 2026 Industra Medicose &bull; Role-Based Access Control</p>
      </footer>
    </div>
  );
}
