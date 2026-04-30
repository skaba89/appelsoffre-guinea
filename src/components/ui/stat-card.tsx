"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react"
import { Area, AreaChart } from "recharts"
import { cn } from "@/lib/utils"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { transitions, chartColors } from "@/lib/design-tokens"

type TrendDirection = "up" | "down" | "neutral"

interface StatCardProps {
  /** Title label for the stat */
  title: string
  /** The numeric value to display */
  value: number
  /** Optional prefix (e.g., "$") */
  prefix?: string
  /** Optional suffix (e.g., "%", " users") */
  suffix?: string
  /** Trend direction and value */
  trend?: {
    direction: TrendDirection
    /** Display label (e.g., "+12.5%", "3 new") */
    label: string
  }
  /** Sparkline data points — array of numbers */
  sparklineData?: number[]
  /** Icon to display in the top-right corner */
  icon?: LucideIcon
  /** Enable glass morphism background */
  glass?: boolean
  /** Custom className */
  className?: string
  /** Animation delay in seconds */
  delay?: number
  /** Number of decimal places for the value */
  decimals?: number
}

const trendConfig: Record<
  TrendDirection,
  { icon: LucideIcon; colorClass: string; bgClass: string }
> = {
  up: {
    icon: TrendingUp,
    colorClass: "text-success",
    bgClass: "bg-success/10",
  },
  down: {
    icon: TrendingDown,
    colorClass: "text-destructive",
    bgClass: "bg-destructive/10",
  },
  neutral: {
    icon: Minus,
    colorClass: "text-muted-foreground",
    bgClass: "bg-muted",
  },
}

/**
 * StatCard — Premium stat card with animated counter, trend indicator,
 * sparkline mini chart, and optional glass morphism background.
 */
function StatCard({
  title,
  value,
  prefix,
  suffix,
  trend,
  sparklineData,
  icon: Icon,
  glass = false,
  className,
  delay = 0,
  decimals = 0,
}: StatCardProps) {
  const trendInfo = trend ? trendConfig[trend.direction] : null
  const TrendIcon = trendInfo?.icon

  // Transform sparkline data into recharts format
  const chartData = React.useMemo(() => {
    if (!sparklineData) return []
    return sparklineData.map((v, i) => ({ value: v, index: i }))
  }, [sparklineData])

  const isPositiveTrend = trend?.direction === "up"
  const isNegativeTrend = trend?.direction === "down"
  const sparklineColor = isPositiveTrend
    ? chartColors.status.positive
    : isNegativeTrend
      ? chartColors.status.negative
      : chartColors.status.info

  return (
    <motion.div
      data-slot="stat-card"
      className={cn(
        "rounded-xl border p-6 shadow-premium-sm transition-[border-color,box-shadow] duration-300",
        "hover:shadow-premium-md",
        glass && "glass",
        !glass && "bg-card text-card-foreground",
        className
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        ...transitions.normal,
        delay,
        type: "tween",
      }}
      whileHover={{ y: -1, transition: { duration: 0.2 } }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-sm font-medium text-muted-foreground truncate">
          {title}
        </p>
        {Icon && (
          <div className={cn(
            "flex items-center justify-center rounded-lg p-2 shrink-0",
            glass ? "bg-primary/10" : "bg-muted"
          )}>
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </div>

      {/* Value row */}
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-0.5">
            {prefix && (
              <span className="text-lg font-semibold text-muted-foreground">
                {prefix}
              </span>
            )}
            <AnimatedNumber
              value={value}
              decimals={decimals}
              className="text-2xl font-bold tracking-tight"
            />
            {suffix && (
              <span className="text-sm font-medium text-muted-foreground ml-1">
                {suffix}
              </span>
            )}
          </div>

          {/* Trend indicator */}
          {trend && TrendIcon && trendInfo && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium",
                  trendInfo.bgClass,
                  trendInfo.colorClass
                )}
              >
                <TrendIcon className="h-3 w-3" />
                {trend.label}
              </span>
            </div>
          )}
        </div>

        {/* Sparkline mini chart */}
        {chartData.length > 1 && (
          <div className="w-20 h-10 shrink-0">
            <AreaChart
              width={80}
              height={40}
              data={chartData}
              margin={{ top: 2, right: 0, left: 0, bottom: 2 }}
            >
              <defs>
                <linearGradient id={`sparkFill-${title.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sparklineColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={sparklineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={sparklineColor}
                strokeWidth={1.5}
                fill={`url(#sparkFill-${title.replace(/\s/g, "")})`}
                dot={false}
                isAnimationActive={true}
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </AreaChart>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export { StatCard }
export type { StatCardProps, TrendDirection }
