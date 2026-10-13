"use client";

import React from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <div
      role="group"
      aria-label="Language selection"
      className={cn(
        "inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 min-h-[44px]",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={cn(
          "relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] min-w-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
          locale === "en"
            ? "bg-white dark:bg-navy-700 text-teal-600 dark:text-teal-400 shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLocale("hi")}
        aria-pressed={locale === "hi"}
        className={cn(
          "relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] min-w-[40px] flex items-center justify-center font-hindi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
          locale === "hi"
            ? "bg-white dark:bg-navy-700 text-teal-600 dark:text-teal-400 shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        हिं
      </button>
    </div>
  );
}
