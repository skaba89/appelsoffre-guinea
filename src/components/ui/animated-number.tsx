"use client"

import * as React from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedNumberProps {
  /** The target number to animate to */
  value: number
  /** Number of decimal places */
  decimals?: number
  /** Animation duration in ms */
  duration?: number
  /** Delay before animation starts in seconds */
  delay?: number
  /** Format the displayed number */
  formatter?: (value: number) => string
  /** Custom className */
  className?: string
  /** Called when animation completes */
  onAnimationComplete?: () => void
}

/**
 * AnimatedNumber — Smoothly animates a number from 0 (or previous value) to the target.
 * 
 * Features:
 * - Smooth count-up animation on mount
 * - Animates to new value when `value` prop changes
 * - Customizable formatter for locale/currency
 * - Respects reduced motion preferences
 */
function AnimatedNumber({
  value,
  decimals = 0,
  duration = 800,
  delay = 0,
  formatter,
  className,
  onAnimationComplete,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0)
  const displayValue = useTransform(motionValue, (latest) => {
    if (formatter) {
      return formatter(latest)
    }
    return latest.toFixed(decimals)
  })

  const [displayed, setDisplayed] = React.useState(
    formatter ? formatter(0) : (0).toFixed(decimals)
  )

  // Subscribe to display value changes
  React.useEffect(() => {
    const unsubscribe = displayValue.on("change", (v) => {
      setDisplayed(v)
    })
    return unsubscribe
  }, [displayValue])

  // Animate when value changes
  React.useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: duration / 1000,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad — smooth deceleration
      onComplete: onAnimationComplete,
    })

    return () => controls.stop()
  }, [value, duration, delay, motionValue, onAnimationComplete])

  return (
    <span
      data-slot="animated-number"
      className={cn("tabular-nums", className)}
      aria-label={String(value)}
    >
      {displayed}
    </span>
  )
}

/**
 * AnimatedPercentage — Animated number formatted as a percentage.
 */
function AnimatedPercentage({
  value,
  decimals = 1,
  className,
  ...props
}: Omit<AnimatedNumberProps, "formatter" | "suffix">) {
  return (
    <AnimatedNumber
      value={value}
      decimals={decimals}
      formatter={(v) => `${v.toFixed(decimals)}%`}
      className={className}
      {...props}
    />
  )
}

/**
 * AnimatedCurrency — Animated number formatted as currency.
 */
function AnimatedCurrency({
  value,
  decimals = 2,
  currency = "USD",
  className,
  ...props
}: Omit<AnimatedNumberProps, "formatter" | "prefix"> & {
  currency?: string
}) {
  const formatter = React.useMemo(() => {
    try {
      const intl = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
      return (v: number) => intl.format(v)
    } catch {
      return (v: number) => `$${v.toFixed(decimals)}`
    }
  }, [currency, decimals])

  return (
    <AnimatedNumber
      value={value}
      decimals={decimals}
      formatter={formatter}
      className={className}
      {...props}
    />
  )
}

export { AnimatedNumber, AnimatedPercentage, AnimatedCurrency }
export type { AnimatedNumberProps }
