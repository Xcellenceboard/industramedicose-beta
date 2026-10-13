"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLMotionProps<"div"> {
  glass?: boolean;
  interactive?: boolean;
  variant?: "default" | "accent" | "urgent" | "verified";
  children: React.ReactNode;
}

export function Card({
  className,
  glass = false,
  interactive = false,
  variant = "default",
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    default:
      "bg-card text-card-foreground border border-slate-200/90 dark:border-navy-700 shadow-soft",
    accent:
      "bg-card text-card-foreground border-2 border-teal-500/40 dark:border-teal-400/40 shadow-soft-lg",
    urgent:
      "bg-card text-card-foreground border-2 border-coral-400/50 dark:border-coral-500/50 shadow-soft",
    verified:
      "bg-card text-card-foreground border-2 border-emerald-400/50 dark:border-emerald-500/50 shadow-soft",
  };

  const glassStyle = glass
    ? "glassmorphism backdrop-blur-xl"
    : "";

  return (
    <motion.div
      whileHover={interactive ? { y: -3, transition: { duration: 0.2 } } : undefined}
      className={cn(
        "rounded-2xl overflow-hidden transition-colors",
        glassStyle,
        variantStyles[variant],
        interactive && "cursor-pointer hover:shadow-soft-lg",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-6 pb-3 flex flex-col space-y-1.5", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-lg sm:text-xl font-bold tracking-tight text-navy dark:text-white",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs sm:text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "p-6 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-navy-700/60 mt-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
