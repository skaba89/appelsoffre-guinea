"use client";

import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, Target, DollarSign,
  BarChart3, PieChart as PieIcon, Activity, ArrowUpRight,
  Brain, Sparkles, Shield, AlertTriangle, Zap, Info,
  ChevronUp, ChevronDown, Minus, Eye,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { Progress } from "@/components/ui/progress";
import { motionVariants } from "@/lib/design-tokens";
import { generatePrediction, type WinProbability, type TenderForecast, type OptimalPricing, type EmergingOpportunity, type CompetitorThreat } from "@/lib/prediction-engine";
import { mockTenders } from "@/lib/mock-data";

// ===== ANALYTICS DATA =====
const monthlyRevenue = [
  { month: "Oct", revenus: 320, couts: 180, marge: 140 },
  { month: "Nov", revenus: 450, couts: 210, marge: 240 },
  { month: "Déc", revenus: 280, couts: 160, marge: 120 },
  { month: "Jan", revenus: 520, couts: 230, marge: 290 },
  { month: "Fév", revenus: 680, couts: 270, marge: 410 },
  { month: "Mar", revenus: 740, couts: 290, marge: 450 },
];

const sectorPerformance = [
  { sector: "BTP", soumissions: 28, tauxReussite: 72, revenu: 1.2 },
  { sector: "IT", soumissions: 22, tauxReussite: 68, revenu: 0.8 },
  { sector: "Mines", soumissions: 15, tauxReussite: 53, revenu: 0.6 },
  { sector: "Santé", soumissions: 12, tauxReussite: 75, revenu: 0.4 },
  { sector: "Éducation", soumissions: 8, tauxReussite: 62, revenu: 0.2 },
  { sector: "Transport", soumissions: 5, tauxReussite: 40, revenu: 0.1 },
];

const radarData = [
  { subject: "Compétitivité", A: 78, fullMark: 100 },
  { subject: "Qualité rédaction", A: 85, fullMark: 100 },
  { subject: "Délais respectés", A: 92, fullMark: 100 },
  { subject: "Conformité", A: 88, fullMark: 100 },
  { subject: "Prix compétitif", A: 65, fullMark: 100 },
  { subject: "Innovation", A: 72, fullMark: 100 },
];

const benchmarkData = [
  { metric: "Taux soumission", nous: 68, marche: 55 },
  { metric: "Délai réponse (j)", nous: 4.2, marche: 6.8 },
  { metric: "Score moyen", nous: 76, marche: 62 },
  { metric: "Taux conformité", nous: 94, marche: 78 },
];

const roiData = [
  { mois: "T1", investissement: 120, retour: 340, roi: 183 },
  { mois: "T2", investissement: 140, retour: 480, roi: 243 },
  { mois: "T3", investissement: 130, retour: 560, roi: 331 },
  { mois: "T4", investissement: 150, retour: 720, roi: 380 },
];

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
};

// ===== PREDICTION DATA =====
const predictionResult = generatePrediction(mockTenders);

// ===== SUB-COMPONENTS =====

/** Carte de probabilité de gain pour un tender */
function WinProbabilityCard({ wp, index }: { wp: WinProbability; index: number }) {
  const colorClass =
    wp.winPercent >= 65
      ? "text-emerald-600 dark:text-emerald-400"
      : wp.winPercent >= 45
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  const bgColorClass =
    wp.winPercent >= 65
      ? "bg-emerald-500/5 border-emerald-500/20"
      : wp.winPercent >= 45
        ? "bg-amber-500/5 border-amber-500/20"
        : "bg-red-500/5 border-red-500/20";

  const progressBgClass =
    wp.winPercent >= 65
      ? "bg-emerald-500"
      : wp.winPercent >= 45
        ? "bg-amber-500"
        : "bg-red-500";

  const confidenceLabel =
    wp.confidence === "high" ? "Élevée" : wp.confidence === "medium" ? "Moyenne" : "Faible";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.4 }}
      className={`rounded-xl border p-4 ${bgColorClass} space-y-3`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{wp.sector}</p>
          <p className="text-sm font-semibold text-foreground truncate" title={wp.tenderTitle}>
            {wp.tenderTitle}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-2xl font-bold ${colorClass}`}>{wp.winPercent}%</p>
          <p className="text-[10px] text-muted-foreground">
            [{wp.confidenceLow}–{wp.confidenceHigh}]
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 w-full rounded-full bg-muted/50">
        <div
          className={`absolute top-0 left-0 h-2 rounded-full ${progressBgClass} transition-all duration-700`}
          style={{ width: `${wp.winPercent}%` }}
        />
      </div>

      {/* Key factors */}
      <div className="flex flex-wrap gap-1">
        {wp.keyFactors.slice(0, 2).map((factor, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {factor}
          </span>
        ))}
      </div>

      {/* Confidence badge */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">Confiance : {confidenceLabel}</span>
        <GradientBadge
          variant={wp.winPercent >= 65 ? "success" : wp.winPercent >= 45 ? "warning" : "destructive"}
          size="sm"
        >
          {wp.winPercent >= 65 ? "Favorable" : wp.winPercent >= 45 ? "Conditionnel" : "Risqué"}
        </GradientBadge>
      </div>
    </motion.div>
  );
}

/** Carte de prix optimal */
function OptimalPricingCard({ pricing, index }: { pricing: OptimalPricing; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.4 }}
      className="rounded-xl border bg-card p-4 space-y-3 hover:shadow-premium-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">{pricing.sector}</h4>
        <GradientBadge
          variant={pricing.competitivenessScore >= 75 ? "success" : pricing.competitivenessScore >= 55 ? "info" : "warning"}
          size="sm"
        >
          {pricing.competitivenessScore}% compétitif
        </GradientBadge>
      </div>

      {/* Price range */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Plancher</span>
          <span className="font-medium text-foreground">{pricing.priceFloor} M GNF</span>
        </div>
        <div className="relative h-3 w-full rounded-full bg-muted/40">
          {/* Full range */}
          <div className="absolute h-3 rounded-full bg-primary/20"
            style={{
              left: `${((pricing.priceFloor - pricing.priceFloor) / (pricing.priceCeiling - pricing.priceFloor)) * 100}%`,
              right: `${100 - ((pricing.priceCeiling - pricing.priceFloor) / (pricing.priceCeiling - pricing.priceFloor)) * 100}%`,
            }}
          />
          {/* Optimal marker */}
          <div
            className="absolute top-0 h-3 w-1 rounded-full bg-primary"
            style={{
              left: `${((pricing.priceOptimal - pricing.priceFloor) / (pricing.priceCeiling - pricing.priceFloor)) * 100}%`,
            }}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Plafond</span>
          <span className="font-medium text-foreground">{pricing.priceCeiling} M GNF</span>
        </div>
      </div>

      {/* Optimal price highlight */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/10">
        <span className="text-xs text-primary font-medium">Prix optimal</span>
        <span className="text-sm font-bold text-primary">{pricing.priceOptimal} M GNF</span>
      </div>

      {/* Margin */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Marge estimée</span>
        <span className="font-semibold text-emerald-600">+{pricing.estimatedMargin}%</span>
      </div>

      {/* Advice */}
      <p className="text-[11px] text-muted-foreground leading-relaxed">{pricing.advice}</p>
    </motion.div>
  );
}

/** Indicateur de menace concurrentielle */
function CompetitorThreatCard({ threat, index }: { threat: CompetitorThreat; index: number }) {
  const levelColors: Record<string, { bg: string; text: string; border: string }> = {
    "critique": { bg: "bg-red-500/5", text: "text-red-600", border: "border-red-500/20" },
    "élevé": { bg: "bg-amber-500/5", text: "text-amber-600", border: "border-amber-500/20" },
    "modéré": { bg: "bg-blue-500/5", text: "text-blue-600", border: "border-blue-500/20" },
    "faible": { bg: "bg-emerald-500/5", text: "text-emerald-600", border: "border-emerald-500/20" },
  };

  const colors = levelColors[threat.threatLevel] || levelColors["modéré"];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
      className={`rounded-xl border p-4 ${colors.bg} ${colors.border} space-y-3`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{threat.competitor}</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">Secteurs : {threat.sector}</p>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-lg font-bold ${colors.text}`}>{threat.threatScore}</div>
          <GradientBadge
            variant={
              threat.threatLevel === "critique" ? "destructive" :
              threat.threatLevel === "élevé" ? "warning" :
              threat.threatLevel === "modéré" ? "info" : "success"
            }
            size="sm"
          >
            {threat.threatLevel.charAt(0).toUpperCase() + threat.threatLevel.slice(1)}
          </GradientBadge>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center p-2 rounded-lg bg-muted/30">
          <p className="text-xs text-muted-foreground">Part de marché</p>
          <p className="text-sm font-bold text-foreground">{threat.marketShare}%</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/30">
          <p className="text-xs text-muted-foreground">Soumissions actives</p>
          <p className="text-sm font-bold text-foreground">{threat.activeBids}</p>
        </div>
      </div>

      {/* Vulnerabilities (compact) */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Vulnérabilités</p>
        <ul className="space-y-0.5">
          {threat.vulnerabilities.slice(0, 2).map((v, i) => (
            <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1">
              <span className="mt-1 h-1 w-1 rounded-full bg-amber-400 shrink-0" />
              {v}
            </li>
          ))}
        </ul>
      </div>

      {/* Counter strategy */}
      <div className="pt-2 border-t border-border/50">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Contre-mesure</p>
        <p className="text-[11px] text-foreground leading-relaxed">{threat.counterStrategy}</p>
      </div>
    </motion.div>
  );
}

// ===== MAIN PAGE =====

export default function AnalyticsPage() {
  // Prepare forecast chart data (aggregate all sectors for next quarter)
  const forecastChartData = predictionResult.sectorForecasts
    .slice(0, 6)
    .flatMap(sf => sf.monthlyData.map(md => ({
      ...md,
      sector: sf.sector,
    })));

  // Aggregate forecast by month for the main chart
  const aggregatedForecast = ["Avr", "Mai", "Jun"].map(month => {
    const monthEntries = forecastChartData.filter(d => d.month === month);
    return {
      month,
      predicted: monthEntries.reduce((s, d) => s + d.predicted, 0),
      low: monthEntries.reduce((s, d) => s + d.low, 0),
      high: monthEntries.reduce((s, d) => s + d.high, 0),
    };
  });

  // Emerging opportunities radar data
  const opportunityRadarData = predictionResult.emergingOpportunities.map(opp => ({
    subject: opp.sector.length > 10 ? opp.sector.slice(0, 9) + "." : opp.sector,
    score: opp.opportunityScore,
    compatibilité: opp.compatibilityScore,
    fullMark: 100,
  }));

  return (
    <motion.div
      className="space-y-6"
      variants={motionVariants.staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={motionVariants.staggerItem}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics & Performance</h1>
            <p className="text-sm text-muted-foreground mt-1">Décision pilotée par les données</p>
          </div>
          <GradientBadge variant="primary" size="md" animated>Temps réel</GradientBadge>
        </div>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="ROI Moyen"
          value={284}
          suffix="%"
          icon={TrendingUp}
          trend={{ direction: "up", label: "+38%" }}
          sparklineData={[183, 243, 331, 380]}
          delay={0}
        />
        <StatCard
          title="Coût / Soumission"
          value={12.5}
          suffix="K GNF"
          icon={DollarSign}
          trend={{ direction: "down", label: "-15%" }}
          sparklineData={[18, 16, 14, 12.5]}
          delay={0.06}
          decimals={1}
        />
        <StatCard
          title="Score compétitif"
          value={78}
          suffix="/100"
          icon={Target}
          trend={{ direction: "up", label: "+12pts" }}
          sparklineData={[62, 68, 74, 78]}
          delay={0.12}
        />
        <StatCard
          title="Marché capturé"
          value={14.2}
          suffix="%"
          icon={BarChart3}
          trend={{ direction: "up", label: "+3.1%" }}
          sparklineData={[8.5, 10.2, 12.8, 14.2]}
          delay={0.18}
          decimals={1}
        />
      </div>

      {/* Revenue & Margin Chart */}
      <motion.div variants={motionVariants.staggerItem}>
        <AnimatedCard hoverLift={false} className="p-0">
          <AnimatedCardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Revenus & Marges</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Évolution sur 6 mois (en millions GNF)</p>
              </div>
            </div>
          </AnimatedCardHeader>
          <AnimatedCardContent className="pt-0">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMarge" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Area type="monotone" dataKey="revenus" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRevenus)" name="Revenus" />
                  <Area type="monotone" dataKey="marge" stroke="#10b981" strokeWidth={2} fill="url(#colorMarge)" name="Marge" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>

      {/* Middle Row - Sector Performance + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sector Performance */}
        <motion.div variants={motionVariants.staggerItem}>
          <AnimatedCard hoverLift={false} className="p-0">
            <AnimatedCardHeader className="pb-2">
              <h3 className="text-sm font-semibold text-foreground">Performance par secteur</h3>
            </AnimatedCardHeader>
            <AnimatedCardContent className="pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorPerformance} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="sector" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="tauxReussite" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Taux réussite %" />
                    <Bar dataKey="soumissions" fill="#10b981" radius={[4, 4, 0, 0]} name="Soumissions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>

        {/* Competency Radar */}
        <motion.div variants={motionVariants.staggerItem}>
          <AnimatedCard hoverLift={false} className="p-0">
            <AnimatedCardHeader className="pb-2">
              <h3 className="text-sm font-semibold text-foreground">Profil de compétitivité</h3>
            </AnimatedCardHeader>
            <AnimatedCardContent className="pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <PolarRadiusAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                    <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>
      </div>

      {/* Benchmarking & ROI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Market Benchmark */}
        <motion.div variants={motionVariants.staggerItem}>
          <AnimatedCard hoverLift={false} className="p-0">
            <AnimatedCardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Benchmarking marché</h3>
                <GradientBadge variant="info" size="sm">vs Marché</GradientBadge>
              </div>
            </AnimatedCardHeader>
            <AnimatedCardContent className="pt-0">
              <div className="space-y-4">
                {benchmarkData.map((item, i) => {
                  const advantage = item.nous > item.marche;
                  return (
                    <motion.div
                      key={item.metric}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground font-medium">{item.metric}</span>
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-bold ${advantage ? "text-emerald-600" : "text-amber-600"}`}>
                            {item.nous}
                          </span>
                          <span className="text-[10px] text-muted-foreground">vs {item.marche}</span>
                          {advantage && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
                        </div>
                      </div>
                      <div className="relative">
                        <Progress value={(item.marche / Math.max(item.nous, item.marche)) * 100} className="h-2 bg-muted" />
                        <div
                          className="absolute top-0 left-0 h-2 rounded-full bg-primary"
                          style={{ width: `${(item.nous / Math.max(item.nous, item.marche)) * 100}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>

        {/* ROI Tracker */}
        <motion.div variants={motionVariants.staggerItem}>
          <AnimatedCard hoverLift={false} className="p-0">
            <AnimatedCardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">ROI Tracker</h3>
                <GradientBadge variant="success" size="sm">+380% T4</GradientBadge>
              </div>
            </AnimatedCardHeader>
            <AnimatedCardContent className="pt-0">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={roiData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="mois" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line type="monotone" dataKey="investissement" stroke="#ef4444" strokeWidth={2} name="Investissement (K)" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="retour" stroke="#10b981" strokeWidth={2} name="Retour (K)" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {roiData.map((item) => (
                  <div key={item.mois} className="text-center p-2 rounded-lg bg-muted/30">
                    <p className="text-[10px] text-muted-foreground">{item.mois}</p>
                    <p className="text-sm font-bold text-emerald-600">+{item.roi}%</p>
                  </div>
                ))}
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PRÉDICTIONS IA — Section complète */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <motion.div variants={motionVariants.staggerItem}>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Prédictions IA</h2>
            <p className="text-xs text-muted-foreground">Modèle prédictif adapté au marché guinéen</p>
          </div>
          <GradientBadge variant="primary" size="md" animated pulse>
            <Sparkles className="h-3 w-3 mr-1" />
            IA Active
          </GradientBadge>
        </div>
      </motion.div>

      {/* Win Probability Cards */}
      <motion.div variants={motionVariants.staggerItem}>
        <AnimatedCard hoverLift={false} className="p-0">
          <AnimatedCardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Probabilité de gain — 5 prochains tenders</h3>
              </div>
              <GradientBadge variant="info" size="sm">Prédiction</GradientBadge>
            </div>
          </AnimatedCardHeader>
          <AnimatedCardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {predictionResult.winProbabilities.map((wp, i) => (
                <WinProbabilityCard key={wp.tenderId} wp={wp} index={i} />
              ))}
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>

      {/* Sector Forecast Chart + Emerging Opportunities Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sector Forecast with Confidence Bands */}
        <motion.div variants={motionVariants.staggerItem}>
          <AnimatedCard hoverLift={false} className="p-0">
            <AnimatedCardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Prévision sectorielle — T2 2026</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Volume prédit avec intervalles de confiance</p>
                </div>
                <GradientBadge variant="success" size="sm">+18% vs T1</GradientBadge>
              </div>
            </AnimatedCardHeader>
            <AnimatedCardContent className="pt-0">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={aggregatedForecast} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    {/* Confidence band (area between low and high) */}
                    <Area type="monotone" dataKey="high" stroke="none" fill="url(#forecastBand)" name="Borne haute" />
                    <Area type="monotone" dataKey="low" stroke="none" fill="var(--card)" name="Borne basse" />
                    {/* Main prediction line */}
                    <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: "#10b981" }} name="Volume prédit" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Sector forecast table */}
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {predictionResult.sectorForecasts
                  .sort((a, b) => b.predictedVolume - a.predictedVolume)
                  .slice(0, 6)
                  .map((sf) => (
                    <div key={sf.sector} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        {sf.trend === "rising" ? (
                          <ChevronUp className="h-3.5 w-3.5 text-emerald-500" />
                        ) : sf.trend === "declining" ? (
                          <ChevronDown className="h-3.5 w-3.5 text-red-500" />
                        ) : (
                          <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span className="text-xs font-medium text-foreground">{sf.sector}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{sf.predictedVolume} AO</span>
                        <span className="text-xs font-semibold text-foreground">{sf.predictedValueBn} Mrd GNF</span>
                        <GradientBadge
                          variant={sf.trend === "rising" ? "success" : sf.trend === "declining" ? "destructive" : "info"}
                          size="sm"
                        >
                          {sf.trendPercent > 0 ? "+" : ""}{sf.trendPercent}%
                        </GradientBadge>
                      </div>
                    </div>
                  ))}
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>

        {/* Emerging Opportunities Radar */}
        <motion.div variants={motionVariants.staggerItem}>
          <AnimatedCard hoverLift={false} className="p-0">
            <AnimatedCardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-foreground">Opportunités émergentes</h3>
                </div>
                <GradientBadge variant="warning" size="sm">Croissance</GradientBadge>
              </div>
            </AnimatedCardHeader>
            <AnimatedCardContent className="pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={opportunityRadarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                    <PolarRadiusAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" domain={[0, 100]} />
                    <Radar name="Score opportunité" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                    <Radar name="Compatibilité" dataKey="compatibilité" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Opportunity details */}
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {predictionResult.emergingOpportunities.map((opp, i) => (
                  <motion.div
                    key={opp.sector}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        opp.trend === "rising" ? "bg-emerald-500" : opp.trend === "declining" ? "bg-red-500" : "bg-muted-foreground"
                      }`} />
                      <span className="text-xs font-medium text-foreground">{opp.sector}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground">
                        {opp.preparationLevel === "immédiat" ? "⚡ Immédiat" : opp.preparationLevel === "court_terme" ? "📅 Court terme" : "📆 Moyen terme"}
                      </span>
                      <span className="text-xs font-bold text-foreground">{opp.opportunityScore}/100</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>
      </div>

      {/* Optimal Pricing Cards */}
      <motion.div variants={motionVariants.staggerItem}>
        <AnimatedCard hoverLift={false} className="p-0">
          <AnimatedCardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Prix optimal par secteur</h3>
              </div>
              <GradientBadge variant="info" size="sm">Recommandation</GradientBadge>
            </div>
          </AnimatedCardHeader>
          <AnimatedCardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto custom-scrollbar">
              {predictionResult.optimalPricings.map((pricing, i) => (
                <OptimalPricingCard key={pricing.sector} pricing={pricing} index={i} />
              ))}
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>

      {/* Competitor Threat Analysis */}
      <motion.div variants={motionVariants.staggerItem}>
        <AnimatedCard hoverLift={false} className="p-0">
          <AnimatedCardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Analyse des menaces concurrentielles</h3>
              </div>
              <GradientBadge variant="destructive" size="sm">Surveillance</GradientBadge>
            </div>
          </AnimatedCardHeader>
          <AnimatedCardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {predictionResult.competitorThreats.map((threat, i) => (
                <CompetitorThreatCard key={threat.competitor} threat={threat} index={i} />
              ))}
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>

      {/* AI Model Info Card */}
      <motion.div variants={motionVariants.staggerItem}>
        <AnimatedCard hoverLift={false} className="p-0">
          <AnimatedCardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Modèle prédictif</h3>
            </div>
          </AnimatedCardHeader>
          <AnimatedCardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Methodology */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">Méthodologie</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Le moteur de prédiction TenderFlow combine une régression linéaire sur les séries temporelles historiques avec des heuristiques adaptées au marché guinéen. Les probabilités de gain sont calculées via un modèle multi-critères pondéré (alignement sectoriel, concurrence, capacité financière, expertise, performance passée, faisabilité).
                </p>
              </div>

              {/* Data sources */}
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-600">Sources de données</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Les prédictions s&apos;appuient sur les données historiques des appels d&apos;offres guinéens (4 trimestres), les profils sectoriels du marché (BTP, Mines, IT, Santé, Énergie...), les données de performance passée par secteur, et l&apos;analyse des acteurs concurrentiels présents en Guinée.
                </p>
              </div>

              {/* Limitations */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-600">Limites & Précision</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Les intervalles de confiance reflètent l&apos;incertitude inhérente aux prédictions. Le modèle est optimisé pour le contexte guinéen et peut sous-estimer les chocs exogènes (changements réglementaires, crises économiques). Score global actuel : <span className="font-bold text-foreground">{predictionResult.overallPredictionScore}/100</span>.
                </p>
              </div>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>

      {/* Predictive Insights (original) */}
      <motion.div variants={motionVariants.staggerItem}>
        <AnimatedCard hoverLift={false} className="p-0">
          <AnimatedCardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Insights prédictifs</h3>
            </div>
          </AnimatedCardHeader>
          <AnimatedCardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-600">Opportunité</span>
                </div>
                <p className="text-sm text-foreground">Le secteur BTP prévoit +25% d&apos;appels d&apos;offres au T2 2026. Recommandation : renforcer l&apos;équipe rédaction.</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-600">Attention</span>
                </div>
                <p className="text-sm text-foreground">Le taux de réussite Mines a chuté de 15%. Cause probable : concurrence accrue des entreprises chinoises.</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-600">Recommandation</span>
                </div>
                <p className="text-sm text-foreground">3 appels d&apos;offres IT avec deadline dans 15 jours correspondent à 90%+ à votre profil. Action prioritaire.</p>
              </div>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>
    </motion.div>
  );
}
