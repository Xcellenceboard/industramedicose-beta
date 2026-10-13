import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-slate-200/80 dark:bg-navy-800/80 relative overflow-hidden",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.5s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/20 dark:after:via-white/5 after:to-transparent",
        className
      )}
      {...props}
    />
  );
}

export function PatientCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-navy-700 bg-card space-y-4 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-20 h-3" />
          </div>
        </div>
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
      </div>
    </div>
  );
}

export function ConsultationNoteSkeleton() {
  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-navy-700 bg-card space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-48 h-5" />
        <Skeleton className="w-24 h-6 rounded-full" />
      </div>
      <Skeleton className="w-full h-16 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="w-3/4 h-4" />
        <Skeleton className="w-5/6 h-4" />
        <Skeleton className="w-2/3 h-4" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="w-28 h-9 rounded-xl" />
        <Skeleton className="w-28 h-9 rounded-xl" />
      </div>
    </div>
  );
}
