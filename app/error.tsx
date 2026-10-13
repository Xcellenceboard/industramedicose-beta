"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw, Home, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Clinical boundary error caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-coral-500/20 text-coral-400 flex items-center justify-center mx-auto border border-coral-500/30">
          <AlertOctagon className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-white">
            System Service Disruption
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Industra Medicose encountered an unexpected runtime exception. The deterministic patient safety gate remains operational.
          </p>
        </div>

        {/* Emergency Medical Care Banner */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1 text-left">
          <span className="font-bold text-coral-400 flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5" /> Emergency Support:
          </span>
          <p className="text-[11px] text-slate-400">
            If you are experiencing a medical emergency, please dial <strong>112</strong> immediately or visit your nearest emergency room.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="default"
            size="sm"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={() => reset()}
            className="bg-teal-500 hover:bg-teal-600 text-white font-bold"
          >
            Retry Application
          </Button>

          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Home className="w-4 h-4" />}
            >
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
