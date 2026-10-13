"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Info,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "urgent" | "verified" | "warning" | "info" | "ai";

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, message, type = "info", duration = 4000 }: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastCard key={toast.id} toast={toast} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

export function ToastCard({
  toast,
  onDismiss,
  className,
}: {
  toast: ToastItem;
  onDismiss?: (id: string) => void;
  className?: string;
}) {
  const icons: Record<ToastType, React.ReactNode> = {
    urgent: <AlertOctagon className="w-5 h-5 text-coral-500 shrink-0" />,
    verified: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-teal-500 shrink-0" />,
    ai: <Sparkles className="w-5 h-5 text-purple-500 shrink-0" />,
  };

  const borders: Record<ToastType, string> = {
    urgent: "border-coral-400/50 bg-coral-50/95 dark:bg-coral-950/80 text-coral-950 dark:text-coral-100",
    verified: "border-emerald-400/50 bg-emerald-50/95 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-100",
    warning: "border-amber-400/50 bg-amber-50/95 dark:bg-amber-950/80 text-amber-950 dark:text-amber-100",
    info: "border-teal-400/50 bg-mint-50/95 dark:bg-navy-800/90 text-navy dark:text-teal-100",
    ai: "border-purple-400/50 bg-purple-50/95 dark:bg-purple-950/80 text-purple-950 dark:text-purple-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-soft-lg backdrop-blur-md",
        borders[toast.type || "info"],
        className
      )}
      role="alert"
    >
      <div className="mt-0.5">{icons[toast.type || "info"]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold tracking-tight leading-snug">{toast.title}</h4>
        {toast.message && (
          <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4 opacity-70 hover:opacity-100" />
        </button>
      )}
    </motion.div>
  );
}
