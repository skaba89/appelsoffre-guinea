"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { AnimatedNumber } from "@/components/ui/animated-number"

// ===== Types =====

type ScoreGaugeSize = "sm" | "md" | "lg"

interface ScoreGaugeProps {
  /** Score value (0-100) */
  value: number
  /** Size variant */
  size?: ScoreGaugeSize
  /** Suffix text after the number (e.g., "/100", "%") */
  suffix?: string
  /** Label text displayed below the gauge */
  label?: string
  /** Additional CSS class */
  className?: string
  /** Animation delay in seconds */
  delay?: number
  /** Whether to show the score number */
  showValue?: boolean
  /** Custom color override (CSS color value) */
  colorOverride?: string
}

// ===== Size configurations =====

const sizeConfig: Record<ScoreGaugeSize, {
  width: number
  height: number
  strokeWidth: number
  fontSize: string
  labelFontSize: string
  suffixFontSize: string
}> = {
  sm: {
    width: 80,
    height: 80,
    strokeWidth: 6,
    fontSize: "text-lg",
    labelFontSize: "text-[10px]",
    suffixFontSize: "text-[10px]",
  },
  md: {
    width: 140,
    height: 140,
    strokeWidth: 10,
    fontSize: "text-3xl",
    labelFontSize: "text-xs",
    suffixFontSize: "text-sm",
  },
  lg: {
    width: 200,
    height: 200,
    strokeWidth: 14,
    fontSize: "text-5xl",
    labelFontSize: "text-sm",
    suffixFontSize: "text-lg",
  },
}

// ===== Color logic =====

function getScoreColor(score: number): { stroke: string; bg: string; text: string } {
  if (score >= 70) {
    return {
      stroke: "oklch(0.596 0.145 163.225)", // success green
      bg: "oklch(0.596 0.145 163.225 / 0.12)",
      text: "text-emerald-600 dark:text-emerald-400",
    }
  }
  if (score >= 40) {
    return {
      stroke: "oklch(0.769 0.188 70.08)", // warning amber
      bg: "oklch(0.769 0.188 70.08 / 0.12)",
      text: "text-amber-600 dark:text-amber-400",
    }
  }
  return {
    stroke: "oklch(0.577 0.245 27.325)", // destructive red
    bg: "oklch(0.577 0.245 27.325 / 0.12)",
    text: "text-red-600 dark:text-red-400",
  }
}

// ===== Component =====

/**
 * ScoreGauge — Animated circular progress indicator for score visualization.
 *
 * Features:
 * - SVG-based circular progress with animated fill
 * - Framer Motion animation on mount and value change
 * - Color changes based on score thresholds (green ≥ 70, amber ≥ 40, red < 40)
 * - Animated number display in center
 * - Three size variants: sm, md, lg
 * - Optional label text below
 * - Optional suffix text after number
 */
function ScoreGauge({
  value,
  size = "md",
  suffix = "/100",
  label,
  className,
  delay = 0.3,
  showValue = true,
  colorOverride,
}: ScoreGaugeProps) {
  const config = sizeConfig[size]
  const colors = getScoreColor(value)

  // SVG arc calculations
  const radius = (Math.min(config.width, config.height) / 2) - config.strokeWidth
  const circumference = 2 * Math.PI * radius
  const center = config.width / 2
  const progress = Math.max(0, Math.min(100, value)) / 100
  const strokeDashoffset = circumference * (1 - progress)

  const strokeColor = colorOverride || colors.stroke

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        className="relative"
        style={{ width: config.width, height: config.height }}
      >
        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            className="text-muted/30"
          />

          {/* Progress arc */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{
              duration: 1.5,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay,
            }}
          />

          {/* Glow effect for high scores */}
          {value >= 70 && (
            <motion.circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth={config.strokeWidth + 4}
              strokeLinecap="round"
              strokeDasharray={circumference}
              opacity={0.15}
              filter="blur(4px)"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{
                duration: 1.5,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay,
              }}
            />
          )}
        </svg>

        {/* Center text */}
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex items-baseline gap-0.5">
              <AnimatedNumber
                value={Math.round(value)}
                decimals={0}
                duration={1200}
                delay={delay}
                className={cn(
                  "font-bold tabular-nums",
                  config.fontSize,
                  colors.text
                )}
              />
              {suffix && (
                <span
                  className={cn(
                    "text-muted-foreground font-medium",
                    config.suffixFontSize
                  )}
                >
                  {suffix}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Label below */}
      {label && (
        <motion.span
          className={cn(
            "text-muted-foreground font-medium text-center leading-tight",
            config.labelFontSize
          )}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: delay + 0.5 }}
        >
          {label}
        </motion.span>
      )}
    </div>
  )
}

export { ScoreGauge }
export type { ScoreGaugeProps, ScoreGaugeSize }
