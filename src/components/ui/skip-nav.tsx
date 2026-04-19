"use client";

import { cn } from "@/lib/utils";

/**
 * SkipNav — Skip navigation link for keyboard accessibility.
 * 
 * Hidden by default, visible on focus. Allows keyboard users
 * to skip directly to the main content area.
 * 
 * Links to #main-content which must be set on the main content area.
 */
export function SkipNav({ className }: { className?: string }) {
  return (
    <a
      href="#main-content"
      className={cn(
        "sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999]",
        "focus:px-4 focus:py-2 focus:rounded-lg",
        "focus:bg-primary focus:text-primary-foreground",
        "focus:text-sm focus:font-medium",
        "focus:shadow-lg focus:outline-none",
        "focus:ring-2 focus:ring-primary focus:ring-offset-2",
        "transition-all duration-200",
        className
      )}
    >
      Aller au contenu principal
    </a>
  );
}
