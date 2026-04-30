"use client"

import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { transitions } from "@/lib/design-tokens"

/**
 * AnimatedCard — A premium card with hover lift animation using Framer Motion.
 * 
 * Features:
 * - Smooth hover lift effect with shadow escalation
 * - Optional glass morphism background
 * - Configurable animation intensity
 * - Tap/press animation for interactive feel
 */
function AnimatedCard({
  className,
  variant = "default",
  hoverLift = true,
  tapScale = true,
  glass = false,
  as = "div",
  children,
  ...props
}: HTMLMotionProps<"div"> & {
  /** Visual variant */
  variant?: "default" | "elevated" | "outline"
  /** Enable hover lift animation */
  hoverLift?: boolean
  /** Enable tap scale-down animation */
  tapScale?: boolean
  /** Enable glass morphism background */
  glass?: boolean
  /** HTML element to render as */
  as?: "div" | "article" | "section"
}) {
  const baseClasses = {
    default: "bg-card text-card-foreground border shadow-premium-sm",
    elevated: "bg-card text-card-foreground border shadow-premium-md",
    outline: "bg-transparent text-card-foreground border shadow-none",
  }

  const hoverShadow = {
    default: "shadow-premium-lg",
    elevated: "shadow-premium-xl",
    outline: "shadow-premium-md",
  }

  return (
    <motion.div
      data-slot="animated-card"
      className={cn(
        "rounded-xl flex flex-col gap-6 py-6 transition-[border-color] duration-300",
        baseClasses[variant],
        glass && "glass",
        className
      )}
      initial={false}
      whileHover={
        hoverLift
          ? {
              y: -2,
              transition: {
                ...transitions.normal,
                type: "tween",
              },
            }
          : undefined
      }
      whileTap={
        tapScale
          ? {
              scale: 0.985,
              transition: { duration: 0.1 },
            }
          : undefined
      }
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * AnimatedCardHeader — Header section for AnimatedCard.
 */
function AnimatedCardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="animated-card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

/**
 * AnimatedCardContent — Content section for AnimatedCard.
 */
function AnimatedCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="animated-card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

/**
 * AnimatedCardFooter — Footer section for AnimatedCard.
 */
function AnimatedCardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="animated-card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  AnimatedCard,
  AnimatedCardHeader,
  AnimatedCardContent,
  AnimatedCardFooter,
}
