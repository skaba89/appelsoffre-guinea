"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from "recharts"
import {
  Target, Banknote, Clock, Swords, ShieldCheck, MapPin, Users, Trophy,
  AlertTriangle, Lightbulb, ChevronDown, ChevronUp, Shield, Zap, TrendingUp,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  motionVariants, transitions, chartColors,
} from "@/lib/design-tokens"
import {
  scoreTender,
  type ScoringResult,
  type TenderInput,
  type Recommendation,
  type RiskSeverity,
  severityLabel,
  recommendationLabel,
  confidenceLabel,
  riskCategoryLabel,
  priorityLabel,
} from "@/lib/scoring-engine"
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card"
import { GradientBadge } from "@/components/ui/gradient-badge"
import { ScoreGauge } from "@/components/ui/score-gauge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

// ===== Props =====

interface ScoringTabProps {
  /** Tender data to score */
  tender: TenderInput
}

// ===== Icon mapping =====

const criterionIcons: Record<string, React.ElementType> = {
  sector_alignment: Target,
  financial_capacity: Banknote,
  deadline_feasibility: Clock,
  competition_level: Swords,
  compliance_requirements: ShieldCheck,
  geographic_advantage: MapPin,
  team_expertise: Users,
  past_performance: Trophy,
}

// ===== Sub-components =====

/** Badge de recommandation GO/NO-GO */
function RecommendationBadge({ recommendation }: { recommendation: Recommendation }) {
  const config: Record<Recommendation, { variant: "success" | "warning" | "destructive"; icon: React.ElementType }> = {
    go: { variant: "success", icon: Zap },
    go_conditional: { variant: "warning", icon: TrendingUp },
    no_go: { variant: "destructive", icon: Shield },
  }

  const { variant, icon: Icon } = config[recommendation]

  return (
    <GradientBadge variant={variant} size="lg" animated pulse>
      <Icon className="w-4 h-4" />
      {recommendationLabel(recommendation)}
    </GradientBadge>
  )
}

/** Badge de sévérité de risque */
function SeverityBadge({ severity }: { severity: RiskSeverity }) {
  const config: Record<RiskSeverity, { variant: "destructive" | "warning" | "info" | "primary"; className: string }> = {
    critical: { variant: "destructive", className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
    high: { variant: "destructive", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300" },
    medium: { variant: "warning", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
    low: { variant: "primary", className: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" },
  }

  const { className } = config[severity]

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider", className)}>
      {severityLabel(severity)}
    </span>
  )
}

/** Ligne de critère avec barre de progression */
function CriterionRow({ criterion, index }: { criterion: ScoringResult["criteria"][0]; index: number }) {
  const [expanded, setExpanded] = React.useState(false)
  const Icon = criterionIcons[criterion.id] || Target

  const scoreColor = criterion.score >= 70
    ? "text-emerald-600 dark:text-emerald-400"
    : criterion.score >= 40
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400"

  const progressColor = criterion.score >= 70
    ? "[&>div]:bg-emerald-500"
    : criterion.score >= 40
      ? "[&>div]:bg-amber-500"
      : "[&>div]:bg-red-500"

  return (
    <motion.div
      variants={motionVariants.staggerItem}
      className="group"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="flex items-center gap-3 py-2.5">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
            criterion.score >= 70 ? "bg-emerald-100 dark:bg-emerald-900/30" :
            criterion.score >= 40 ? "bg-amber-100 dark:bg-amber-900/30" :
            "bg-red-100 dark:bg-red-900/30"
          )}>
            <Icon className={cn("w-4 h-4", scoreColor)} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground truncate">
                {criterion.label}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground">
                  Poids {Math.round(criterion.weight * 100)}%
                </span>
                <span className={cn("text-sm font-bold tabular-nums", scoreColor)}>
                  {criterion.score.toFixed(0)}
                </span>
              </div>
            </div>
            <Progress
              value={criterion.score}
              className={cn("h-1.5", progressColor)}
            />
          </div>

          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 text-muted-foreground"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: expanded ? "auto" : 0,
          opacity: expanded ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="overflow-hidden"
      >
        <p className="text-xs text-muted-foreground leading-relaxed pl-11 pr-6 pb-3">
          {criterion.explanation}
        </p>
      </motion.div>
    </motion.div>
  )
}

// ===== Main Component =====

/**
 * ScoringTab — Premium scoring visualization for tender evaluation.
 *
 * Features:
 * - Radar chart of 8 scoring criteria
 * - Animated circular gauge for composite score
 * - GO/NO-GO recommendation badge
 * - Expandable criterion rows with progress bars
 * - Risk factors with severity badges
 * - Strategic recommendations
 * - Staggered Framer Motion animations
 */
export function ScoringTab({ tender }: ScoringTabProps) {
  const [result] = React.useState<ScoringResult>(() => scoreTender(tender))

  // Radar chart data
  const radarData = result.criteria.map(c => ({
    criterion: c.label,
    score: c.score,
    fullMark: 100,
  }))

  return (
    <motion.div
      className="space-y-6"
      variants={motionVariants.staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* ── Row 1 : Gauge + Radar ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Composite Score Card */}
        <motion.div variants={motionVariants.staggerItem}>
          <AnimatedCard variant="elevated" hoverLift={false} tapScale={false} className="relative overflow-hidden">
            {/* Subtle background gradient */}
            <div className={cn(
              "absolute inset-0 opacity-[0.04]",
              result.recommendation === "go" ? "bg-gradient-to-br from-emerald-500 to-emerald-700" :
              result.recommendation === "go_conditional" ? "bg-gradient-to-br from-amber-500 to-amber-700" :
              "bg-gradient-to-br from-red-500 to-red-700"
            )} />

            <AnimatedCardHeader className="relative">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">Score composite</h3>
                <RecommendationBadge recommendation={result.recommendation} />
              </div>
            </AnimatedCardHeader>

            <AnimatedCardContent className="relative flex flex-col items-center gap-4">
              <ScoreGauge
                value={result.compositeScore}
                size="lg"
                suffix="/100"
                label="Score global pondéré"
                delay={0.2}
              />

              {/* Confidence indicator */}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">Confiance :</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map(level => (
                    <motion.div
                      key={level}
                      className={cn(
                        "w-2 h-2 rounded-full",
                        result.confidence === "high" ? "bg-emerald-500" :
                        result.confidence === "medium" && level <= 2 ? "bg-amber-500" :
                        result.confidence === "low" && level === 1 ? "bg-red-500" :
                        "bg-muted-foreground/20"
                      )}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + level * 0.1, type: "spring" }}
                    />
                  ))}
                  <span className={cn(
                    "text-xs font-medium ml-1",
                    result.confidence === "high" ? "text-emerald-600 dark:text-emerald-400" :
                    result.confidence === "medium" ? "text-amber-600 dark:text-amber-400" :
                    "text-red-600 dark:text-red-400"
                  )}>
                    {confidenceLabel(result.confidence)}
                  </span>
                </div>
              </div>

              {/* Summary */}
              <p className="text-xs text-muted-foreground leading-relaxed text-center max-w-md">
                {result.summary}
              </p>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>

        {/* Radar Chart Card */}
        <motion.div variants={motionVariants.staggerItem}>
          <AnimatedCard variant="elevated" hoverLift={false} tapScale={false}>
            <AnimatedCardHeader>
              <h3 className="text-base font-semibold text-foreground">Profil multi-critères</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Visualisation radar des 8 axes d'évaluation
              </p>
            </AnimatedCardHeader>

            <AnimatedCardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={radarData}
                    cx="50%"
                    cy="50%"
                    outerRadius="72%"
                  >
                    <PolarGrid
                      stroke="hsl(var(--border))"
                      strokeDasharray="3 3"
                    />
                    <PolarAngleAxis
                      dataKey="criterion"
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 9,
                      }}
                      tickCount={5}
                    />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke={chartColors.status.positive}
                      fill={chartColors.status.positive}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [`${value.toFixed(0)}/100`, "Score"]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>
      </div>

      {/* ── Row 2 : Criteria Detail ───────────────────────────────── */}
      <motion.div variants={motionVariants.staggerItem}>
        <AnimatedCard variant="default" hoverLift={false} tapScale={false}>
          <AnimatedCardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Détail des critères</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cliquez sur un critère pour voir l'explication détaillée
            </p>
          </AnimatedCardHeader>

          <AnimatedCardContent>
            <div className="divide-y divide-border">
              {result.criteria.map((criterion, index) => (
                <CriterionRow key={criterion.id} criterion={criterion} index={index} />
              ))}
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>

      {/* ── Row 3 : Risks + Recommendations ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Factors Card */}
        <motion.div variants={motionVariants.staggerItem}>
          <AnimatedCard variant="elevated" hoverLift={false} tapScale={false}>
            <AnimatedCardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-semibold text-foreground">Facteurs de risque</h3>
              </div>
              {result.riskFactors.length > 0 && (
                <GradientBadge variant="warning" size="sm">
                  {result.riskFactors.length} risque{result.riskFactors.length > 1 ? "s" : ""}
                </GradientBadge>
              )}
            </AnimatedCardHeader>

            <AnimatedCardContent>
              {result.riskFactors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ShieldCheck className="w-10 h-10 text-emerald-500/40" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Aucun risque majeur identifié
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {result.riskFactors.map((risk, i) => (
                    <motion.div
                      key={risk.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.08, ...transitions.normal }}
                      className={cn(
                        "p-3 rounded-lg border",
                        risk.severity === "critical" ? "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20" :
                        risk.severity === "high" ? "border-orange-200 bg-orange-50/50 dark:border-orange-900/50 dark:bg-orange-950/20" :
                        risk.severity === "medium" ? "border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20" :
                        "border-sky-200 bg-sky-50/50 dark:border-sky-900/50 dark:bg-sky-950/20"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug">
                            {risk.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <SeverityBadge severity={risk.severity} />
                            <span className="text-[10px] text-muted-foreground">
                              {riskCategoryLabel(risk.category)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Impact : {risk.impact}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>

        {/* Strategic Recommendations Card */}
        <motion.div variants={motionVariants.staggerItem}>
          <AnimatedCard variant="elevated" hoverLift={false} tapScale={false}>
            <AnimatedCardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                <h3 className="text-base font-semibold text-foreground">Recommandations stratégiques</h3>
              </div>
              {result.strategicRecommendations.length > 0 && (
                <GradientBadge variant="primary" size="sm">
                  {result.strategicRecommendations.length} action{result.strategicRecommendations.length > 1 ? "s" : ""}
                </GradientBadge>
              )}
            </AnimatedCardHeader>

            <AnimatedCardContent>
              {result.strategicRecommendations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Trophy className="w-10 h-10 text-emerald-500/40" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Aucune action corrective urgente requise
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {result.strategicRecommendations.map((rec, i) => {
                    const priorityConfig = {
                      immediate: { icon: Zap, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30", border: "border-red-200 dark:border-red-900/50" },
                      short_term: { icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-200 dark:border-amber-900/50" },
                      medium_term: { icon: Clock, color: "text-sky-500", bg: "bg-sky-100 dark:bg-sky-900/30", border: "border-sky-200 dark:border-sky-900/50" },
                    }
                    const { icon: PriorityIcon, color, bg, border } = priorityConfig[rec.priority]

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + i * 0.08, ...transitions.normal }}
                        className={cn("p-3 rounded-lg border", bg, border)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("w-7 h-7 rounded flex items-center justify-center shrink-0", bg)}>
                            <PriorityIcon className={cn("w-3.5 h-3.5", color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-foreground">
                              {rec.title}
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                              {rec.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={cn("text-[10px] font-semibold uppercase tracking-wider", color)}>
                                {priorityLabel(rec.priority)}
                              </span>
                              <Separator orientation="vertical" className="h-3" />
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                +{rec.expectedImpact} pts attendus
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>
      </div>

      {/* ── Row 4 : Methodology Note ─────────────────────────────── */}
      <motion.div variants={motionVariants.staggerItem}>
        <div className="text-center py-4">
          <p className="text-[10px] text-muted-foreground/60">
            Évaluation générée par le moteur de scoring ML TenderFlow • {new Date(result.evaluatedAt).toLocaleString("fr-FR")}
          </p>
          <p className="text-[10px] text-muted-foreground/40 mt-1">
            Les scores sont calculés à partir de données sectorielles guinéennes et de modèles prédictifs. Ils constituent une aide à la décision et ne remplacent pas le jugement humain.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
