"use client";

import React, { useState } from "react";
import { ShieldAlert, X } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";

export function DisclaimerBanner() {
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside
      aria-label="Clinical AI Disclaimer"
      className="relative z-50 bg-gradient-to-r from-navy via-navy-800 to-navy text-white px-4 py-2.5 text-xs sm:text-sm border-b border-teal-500/30 transition-all shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1 rounded-md bg-teal-500/20 text-teal-300 shrink-0">
            <ShieldAlert className="w-4 h-4 text-teal-400" aria-hidden="true" />
          </div>
          <p className="font-medium tracking-wide truncate sm:whitespace-normal">
            <strong className="text-teal-300 font-semibold uppercase tracking-wider text-[11px] mr-1.5 px-1.5 py-0.5 rounded bg-teal-950/60 border border-teal-500/30">
              CLINICAL GOVERNANCE
            </strong>
            {t("disclaimer")}
          </p>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400 min-h-[32px] min-w-[32px] flex items-center justify-center"
          aria-label={t("dismiss")}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
