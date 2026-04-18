"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  motionVariants,
  transitions,
  type duration,
} from "@/lib/design-tokens"

type TransitionVariant = "fadeInUp" | "fadeInScale" | "slideInLeft" | "slideInRight" | "none"

interface PageTransitionProps {
  /** Transition animation variant */
  variant?: TransitionVariant
  /** Animation duration in ms — maps to design token durations */
  durationMs?: (typeof duration)[keyof typeof duration]
  /** Delay before animation starts in seconds */
  delay?: number
  /** Enable staggered children animation */
  stagger?: boolean
  /** Stagger delay between children in seconds */
  staggerDelay?: number
  /** Custom className */
  className?: string
  /** Content to animate */
  children: React.ReactNode
}

/**
 * PageTransition — Framer Motion page transition wrapper.
 * 
 * Features:
 * - Multiple transition variants (fade, scale, slide)
 * - Configurable duration and delay
 * - Staggered children animation support
 * - Smooth mount/unmount with AnimatePresence
 */
function PageTransition({
  variant = "fadeInUp",
  durationMs = 300,
  delay = 0,
  stagger = false,
  staggerDelay = 0.06,
  className,
  children,
}: PageTransitionProps) {
  const durationSec = durationMs / 1000

  if (variant === "none") {
    return <div className={className}>{children}</div>
  }

  // When stagger is enabled, wrap children in a motion container
  if (stagger) {
    return (
      <motion.div
        data-slot="page-transition"
        className={cn("w-full", className)}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: staggerDelay,
              delayChildren: delay,
            },
          },
        }}
      >
        {React.Children.map(children, (child) => (
          <motion.div
            variants={motionVariants.staggerItem}
            transition={{
              duration: durationSec,
              ease: transitions.normal.ease as number[],
            }}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    )
  }

  // Standard single-element transition
  const selectedVariant = motionVariants[variant] ?? motionVariants.fadeInUp

  return (
    <motion.div
      data-slot="page-transition"
      className={cn("w-full", className)}
      initial="hidden"
      animate="visible"
      variants={selectedVariant}
      transition={{
        duration: durationSec,
        delay,
        ease: transitions.normal.ease as number[],
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * PageTransitionPresence — Wraps content with AnimatePresence for mount/unmount transitions.
 * Use this when you need content to animate out before being removed from the DOM.
 */
function PageTransitionPresence({
  children,
  mode = "wait",
}: {
  children: React.ReactNode
  /** AnimatePresence mode */
  mode?: "sync" | "wait" | "popLayout"
}) {
  return <AnimatePresence mode={mode}>{children}</AnimatePresence>
}

export { PageTransition, PageTransitionPresence }
export type { PageTransitionProps, TransitionVariant }
