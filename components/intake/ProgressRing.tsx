"use client";

import React from "react";

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function ProgressRing({
  progress,
  size = 56,
  strokeWidth = 5,
  label,
}: ProgressRingProps) {
  const normalizedRadius = (size - strokeWidth * 2) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          height={size}
          width={size}
          className="transform -rotate-90 origin-center select-none"
        >
          {/* Background Track */}
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-navy-700"
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Active Progress */}
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            className="text-teal-500 transition-all duration-500 ease-out"
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>

        {/* Center Percentage */}
        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold font-mono text-navy dark:text-white">
          {Math.round(clampedProgress)}%
        </div>
      </div>

      {label && (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-navy dark:text-white leading-tight">
            {label}
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5">
            {clampedProgress >= 100 ? "Ready to review" : "Gathering details"}
          </span>
        </div>
      )}
    </div>
  );
}
