import React from "react";
import Link from "next/link";
import { Stethoscope, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto border border-teal-500/20">
          <Stethoscope className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold tracking-widest text-teal-400 uppercase">
            404 Error &bull; Route Not Found
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Clinical Pathway Not Found
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The requested consultation, dashboard, or endpoint does not exist or has been archived under DPDP retention policies.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button
              variant="default"
              size="sm"
              leftIcon={<Home className="w-4 h-4" />}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold"
            >
              Return to Landing
            </Button>
          </Link>

          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
