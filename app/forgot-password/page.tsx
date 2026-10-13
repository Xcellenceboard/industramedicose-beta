"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Mock reset delivery for demo prototype
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your verified clinical or patient email to receive reset instructions."
    >
      <div className="space-y-6">
        {errorMsg && (
          <div
            role="alert"
            className="p-4 rounded-xl border border-coral-300 dark:border-coral-800 bg-coral-50/90 dark:bg-coral-950/80 text-coral-900 dark:text-coral-200 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in"
          >
            <AlertCircle className="w-5 h-5 text-coral-600 dark:text-coral-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {submitted ? (
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-sm">Reset Link Dispatched</h3>
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              If an account exists for <strong>{email}</strong>, you will receive password reset instructions shortly.
            </p>
            <Link href="/login">
              <Button variant="secondary" size="sm" className="w-full mt-2">
                Return to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="reset-email" className="text-xs font-semibold text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email..."
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
              Send Password Reset Link
            </Button>

            <div className="text-center pt-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
