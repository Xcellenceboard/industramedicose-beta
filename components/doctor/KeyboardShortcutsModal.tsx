"use client";

import React from "react";
import { X, Command, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "J", desc: "Select next patient card in queue", context: "Queue" },
    { key: "K", desc: "Select previous patient card in queue", context: "Queue" },
    { key: "Enter / O", desc: "Open selected patient consultation", context: "Queue" },
    { key: "2", desc: "Toggle Two-Minute View (8 Critical Facts)", context: "Consultation" },
    { key: "A", desc: "Approve and digitally sign final clinical record", context: "Consultation" },
    { key: "V", desc: "Mark all extracted AI fields as verified", context: "Consultation" },
    { key: "D", desc: "Switch to Medical Documents panel", context: "Consultation" },
    { key: "T", desc: "Switch to Hindi-English Intake Transcript", context: "Consultation" },
    { key: "Esc", desc: "Close modal / return to queue", context: "Global" },
    { key: "?", desc: "Open this keyboard shortcuts cheat-sheet", context: "Global" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-navy-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200 dark:border-navy-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Command className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy dark:text-white">
                Keyboard Shortcuts
              </h3>
              <p className="text-xs text-muted-foreground">
                Optimized for ultra-fast Two-Minute Doctor workflow
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-foreground font-medium">{sc.desc}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant="neutral" size="sm" className="text-[10px]">
                  {sc.context}
                </Badge>
                <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-navy-800 border border-slate-300 dark:border-navy-600 font-mono font-bold text-foreground text-[11px] shadow-2xs">
                  {sc.key}
                </kbd>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-navy-850 border-t border-slate-200 dark:border-navy-700 text-center">
          <span className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            Press <kbd className="font-mono font-bold px-1 bg-white dark:bg-navy-800 border rounded">?</kbd> anywhere to toggle this panel
          </span>
        </div>
      </div>
    </div>
  );
}
