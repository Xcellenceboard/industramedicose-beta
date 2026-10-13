"use client";

import React from "react";
import { FolderX, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderX,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-navy-700 bg-white/50 dark:bg-navy-900/40 backdrop-blur-sm",
        className
      )}
    >
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-2xl bg-mint-100 dark:bg-navy-800 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-soft">
          <Icon className="w-8 h-8" aria-hidden="true" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teal-500/20 blur-sm" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-navy dark:text-white tracking-tight mb-1.5">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && (
        <Button variant="default" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
