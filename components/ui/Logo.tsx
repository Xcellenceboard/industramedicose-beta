"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/I18nProvider";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  showTagline?: boolean;
  href?: string | false | null;
}

export function Logo({
  className,
  size = "md",
  showText = true,
  showTagline = false,
  href = "/",
}: LogoProps) {
  const { t } = useI18n();

  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const imagePx = {
    sm: 32,
    md: 40,
    lg: 48,
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 group select-none", className)}>
      {/* Official Industra Medicose Emblem */}
      <div className={cn("relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-sm border border-teal-500/20 bg-white dark:bg-navy-800 p-0.5 group-hover:shadow-teal-glow transition-all", iconSizes[size])}>
        <Image
          src="/logo.png"
          alt="Industra Medicose Logo"
          width={imagePx[size]}
          height={imagePx[size]}
          className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={cn(
                "font-extrabold tracking-tight text-navy dark:text-white transition-colors",
                textSizes[size]
              )}
            >
              Industra
            </span>
            <span
              className={cn(
                "font-extrabold tracking-tight text-teal-600 dark:text-teal-400 transition-colors",
                textSizes[size]
              )}
            >
              Medicose
            </span>
          </div>
          {showTagline && (
            <span className="text-[11px] font-medium text-muted-foreground mt-0.5 tracking-tight">
              {t("tagline")}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href && typeof href === "string" && href.trim().length > 0) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}
