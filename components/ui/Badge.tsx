"use client";

import React from "react";
import { Sparkles, CheckCircle2, AlertOctagon, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "ai"
  | "verified"
  | "urgent"
  | "warning"
  | "info"
  | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  showIcon?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
}

export function Badge({
  className,
  variant = "neutral",
  size = "md",
  showIcon = true,
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    ai: "bg-purple-100 text-purple-700 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
    verified: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    urgent: "bg-coral-50 text-coral-700 border-coral-200/80 dark:bg-coral-950/60 dark:text-coral-300 dark:border-coral-800",
    warning: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    info: "bg-mint-100 text-teal-800 border-teal-200/80 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800",
    neutral: "bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-navy-800 dark:text-slate-300 dark:border-navy-600",
  };

  const icons: Record<BadgeVariant, React.ReactNode> = {
    ai: <Sparkles className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" aria-hidden="true" />,
    verified: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" aria-hidden="true" />,
    urgent: <AlertOctagon className="w-3.5 h-3.5 text-coral-500 dark:text-coral-400" aria-hidden="true" />,
    warning: <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" aria-hidden="true" />,
    info: <Info className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" aria-hidden="true" />,
    neutral: null,
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border tracking-tight transition-colors select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2 mr-0.5">
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              variant === "urgent" && "bg-coral-400",
              variant === "ai" && "bg-purple-400",
              variant === "verified" && "bg-emerald-400",
              variant === "warning" && "bg-amber-400",
              variant === "info" && "bg-teal-400",
              variant === "neutral" && "bg-slate-400"
            )}
          />
          <span
            className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              variant === "urgent" && "bg-coral-500",
              variant === "ai" && "bg-purple-500",
              variant === "verified" && "bg-emerald-500",
              variant === "warning" && "bg-amber-500",
              variant === "info" && "bg-teal-500",
              variant === "neutral" && "bg-slate-500"
            )}
          />
        </span>
      )}
      {showIcon && icons[variant]}
      {children}
    </span>
  );
}
