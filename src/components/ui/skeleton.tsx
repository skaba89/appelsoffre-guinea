"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Premium Skeleton component with shimmer animation.
 * 
 * Supports two variants:
 * - "pulse": Traditional pulse animation (default shadcn style)
 * - "shimmer": Premium shimmer sweep animation
 */
function Skeleton({
  className,
  variant = "shimmer",
  ...props
}: React.ComponentProps<"div"> & {
  /** Animation variant: "shimmer" for sweep effect, "pulse" for simple pulse */
  variant?: "shimmer" | "pulse"
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-md",
        variant === "shimmer" && "shimmer",
        variant === "pulse" && "bg-accent animate-pulse",
        className
      )}
      {...props}
    />
  )
}

/**
 * Skeleton circle — for avatar placeholders.
 */
function SkeletonCircle({
  className,
  size = "md",
  variant = "shimmer",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "shimmer" | "pulse"
  size?: "sm" | "md" | "lg" | "xl"
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }

  return (
    <Skeleton
      variant={variant}
      className={cn("rounded-full", sizeClasses[size], className)}
      {...props}
    />
  )
}

/**
 * Skeleton text — for line placeholders.
 */
function SkeletonText({
  className,
  lines = 3,
  variant = "shimmer",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "shimmer" | "pulse"
  /** Number of lines to render */
  lines?: number
}) {
  return (
    <div
      data-slot="skeleton-text"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant={variant}
          className={cn(
            "h-3.5",
            i === lines - 1 && "w-3/4",
            i !== lines - 1 && "w-full"
          )}
        />
      ))}
    </div>
  )
}

/**
 * Skeleton card — full card placeholder with header, content, and footer.
 */
function SkeletonCard({
  className,
  variant = "shimmer",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "shimmer" | "pulse"
}) {
  return (
    <div
      data-slot="skeleton-card"
      className={cn(
        "rounded-xl border bg-card p-6 shadow-premium-sm",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3 mb-4">
        <SkeletonCircle size="sm" variant={variant} />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton variant={variant} className="h-4 w-1/3" />
          <Skeleton variant={variant} className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonText lines={3} variant={variant} />
      <div className="flex gap-2 mt-4">
        <Skeleton variant={variant} className="h-8 w-20 rounded-md" />
        <Skeleton variant={variant} className="h-8 w-20 rounded-md" />
      </div>
    </div>
  )
}

export { Skeleton, SkeletonCircle, SkeletonText, SkeletonCard }
