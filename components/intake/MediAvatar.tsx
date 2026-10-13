"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, Bot } from "lucide-react";

interface MediAvatarProps {
  size?: "sm" | "md" | "lg";
  isThinking?: boolean;
}

export function MediAvatar({ size = "md", isThinking = false }: MediAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const dimensionClasses = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-16 h-16",
  };

  const imageSizes = {
    sm: 32,
    md: 44,
    lg: 64,
  };

  return (
    <div className={`relative ${dimensionClasses[size]} shrink-0`}>
      <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-tr from-teal-500 to-navy-700 shadow-sm border border-teal-500/20 flex items-center justify-center">
        {!imageError ? (
          <Image
            src="/images/medi-avatar.webp"
            alt="Medi - Clinical AI Assistant"
            width={imageSizes[size]}
            height={imageSizes[size]}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white flex items-center justify-center">
            <Bot className={size === "sm" ? "w-4 h-4" : size === "md" ? "w-6 h-6" : "w-8 h-8"} />
          </div>
        )}
      </div>

      {/* Thinking sparkle badge */}
      {isThinking && (
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-ai-500 flex items-center justify-center text-white text-[8px] animate-pulse">
          <Sparkles className="w-2.5 h-2.5" />
        </span>
      )}
    </div>
  );
}
