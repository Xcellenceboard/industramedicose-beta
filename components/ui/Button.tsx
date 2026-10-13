"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "default"
  | "navy"
  | "secondary"
  | "outline"
  | "ghost"
  | "coral"
  | "verified"
  | "warning";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]";

    const variantStyles: Record<ButtonVariant, string> = {
      default:
        "bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white shadow-sm hover:shadow-teal-glow focus-visible:ring-teal-500 dark:focus-visible:ring-offset-navy",
      navy:
        "bg-navy hover:bg-navy-700 text-white shadow-soft focus-visible:ring-navy dark:bg-navy-700 dark:hover:bg-navy-600 dark:focus-visible:ring-offset-background",
      secondary:
        "bg-mint-100 text-teal-800 hover:bg-mint-200 border border-teal-200/50 dark:bg-navy-800 dark:text-teal-300 dark:border-teal-800 focus-visible:ring-teal-400",
      outline:
        "border border-slate-300 dark:border-navy-600 bg-transparent hover:bg-slate-100 dark:hover:bg-navy-800 text-foreground focus-visible:ring-teal-500",
      ghost:
        "bg-transparent hover:bg-slate-100 dark:hover:bg-navy-800 text-foreground focus-visible:ring-teal-500",
      coral:
        "bg-coral-500 hover:bg-coral-600 text-white shadow-sm hover:shadow-coral-glow focus-visible:ring-coral-500",
      verified:
        "bg-green-500 hover:bg-green-600 text-white shadow-sm focus-visible:ring-green-500",
      warning:
        "bg-amber-500 hover:bg-amber-600 text-white shadow-sm focus-visible:ring-amber-500",
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: "h-10 px-3.5 text-xs gap-1.5 min-h-[40px] sm:min-h-[44px]",
      md: "h-11 px-5 text-sm gap-2 min-h-[44px]",
      lg: "h-13 px-7 text-base gap-2.5 min-h-[50px] rounded-2xl",
      icon: "h-11 w-11 min-h-[44px] min-w-[44px] p-0 flex items-center justify-center",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0 mr-2" aria-hidden="true" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
