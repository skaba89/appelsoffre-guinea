"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { transitions } from "@/lib/design-tokens"

type GradientBadgeVariant =
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info"

interface GradientBadgeProps extends React.ComponentProps<"span"> {
  /** Gradient color variant */
  variant?: GradientBadgeVariant
  /** Enable animated gradient shift */
  animated?: boolean
  /** Enable subtle pulse glow */
  pulse?: boolean
  /** Badge size */
  size?: "sm" | "md" | "lg"
}

const variantClasses: Record<GradientBadgeVariant, string> = {
  primary:
    "bg-gradient-to-r from-primary to-blue-700 text-primary-foreground",
  success:
    "bg-gradient-to-r from-success to-emerald-500 text-success-foreground",
  warning:
    "bg-gradient-to-r from-warning to-amber-400 text-warning-foreground",
  destructive:
    "bg-gradient-to-r from-destructive to-red-500 text-white",
  info:
    "bg-gradient-to-r from-info to-blue-500 text-info-foreground",
}

const sizeClasses = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2 py-0.5 text-xs",
  lg: "px-2.5 py-1 text-sm",
}

/**
 * GradientBadge — An animated gradient badge with optional pulse glow.
 * 
 * Features:
 * - Smooth animated gradient shift on hover or always-on
 * - Subtle pulse glow animation
 * - Multiple semantic color variants
 * - Multiple sizes
 */
function GradientBadge({
  className,
  variant = "primary",
  animated = false,
  pulse = false,
  size = "md",
  children,
  ...props
}: GradientBadgeProps) {
  return (
    <motion.span
      data-slot="gradient-badge"
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium whitespace-nowrap shrink-0 gap-1",
        "transition-shadow duration-300",
        variantClasses[variant],
        sizeClasses[size],
        animated && "animate-gradient",
        pulse && "animate-pulse-glow",
        className
      )}
      whileHover={{
        scale: 1.04,
        transition: transitions.fast,
      }}
      {...props}
    >
      {children}
    </motion.span>
  )
}

export { GradientBadge }
export type { GradientBadgeProps, GradientBadgeVariant }
