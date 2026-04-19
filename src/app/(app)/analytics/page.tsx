"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from "recharts";
import {
  TrendingUp, TrendingDown, Target, DollarSign,
  BarChart3, Activity, ArrowUpRight,
  Brain, Sparkles, Shield, AlertTriangle, Zap, Info,
  ChevronUp, ChevronDown, Minus, Eye,
  Clock, Users, Swords, Gauge, Lightbulb,
  ArrowDownRight, Layers, Scale, Trophy,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motionVariants, transitions } from "@/lib/design-tokens";
import {
  generatePrediction,
  predictWinProbabilities,
  forecastSectorVolumes,
  calculateOptimalPricings,
  identifyEmergingOpportunities,
  analyzeCompetitorThreats,
  type WinProbability,
  type TenderForecast,
  type OptimalPricing,
  type EmergingOpportunity,
  type CompetitorThreat,
  type PredictionResult,
} from "@/lib/prediction-engine";
import { mockTenders } from "@/lib/mock-data";
import { TenderFunnelChart } from "@/components/analytics/tender-funnel-chart";
import { WinRateSectorChart } from "@/components/analytics/win-rate-sector-chart";
import { BudgetDistributionChart } from "@/components/analytics/budget-distribution-chart";
import { MonthlyTrendChart } from "@/components/analytics/monthly-trend-chart";
import { RegionalHeatmapTable } from "@/components/analytics/regional-heatmap-table";
import { CompetitorAnalysisCard } from "@/components/analytics/competitor-analysis-card";
import { TimeToDecisionChart } from "@/components/analytics/time-to-decision-chart";

// ===== COULEURS & STYLES =====
const COLORS = {
  primary: "#3b82f6",
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  purple: "#8b5cf6",
  cyan: "#06b6d4",
  orange: "#f97316",
  pink: "#ec4899",
  lime: "#84cc16",
  indigo: "#6366f1",
  teal: "#14b8a6",
};

const PIE_COLORS = [
  COLORS.primary, COLORS.emerald, COLORS.amber,
  COLORS.red, COLORS.purple, COLORS.cyan,
  COLORS.orange, COLORS.pink, COLORS.lime,
  COLORS.indigo, COLORS.teal,
];

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--foreground)",
};

// ===== COMPOSANTS UTILITAIRES =====

function getWinColor(percent: number) {
  if (percent >= 65) return { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500", light: "bg-emerald-500/5 border-emerald-500/20" };
  if (percent >= 45) return { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500", light: "bg-amber-500/5 border-amber-500/20" };
  return { text: "text-red-600 dark:text-red-400", bg: "bg-red-500", light: "bg-red-500/5 border-red-500/20" };
}

function getThreatColors(level: string) {
  const map: Record<string, { bg: string; text: string; border: string; badge: "destructive" | "warning" | "info" | "success" }> = {
    "critique": { bg: "bg-red-500/5", text: "text-red-600 dark:text-red-400", border: "border-red-500/20", badge: "destructive" },
    "élevé": { bg: "bg-amber-500/5", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20", badge: "warning" },
    "modéré": { bg: "bg-blue-500/5", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20", badge: "info" },
    "faible": { bg: "bg-emerald-500/5", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20", badge: "success" },
  };
  return map[level] || map["modéré"];
}

function TrendIcon({ trend }: { trend: "rising" | "stable" | "declining" }) {
  if (trend === "rising") return <ChevronUp className="h-3.5 w-3.5 text-emerald-500" />;
  if (trend === "declining") return <ChevronDown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

// ===== PAGE PRINCIPALE =====

export default function AnalyticsPage() {
  const prediction = useMemo(() => generatePrediction(mockTenders), []);

  // === Données dérivées pour les graphiques ===

  // Agrégation des prévisions par mois pour le graphique de tendance
  const aggregatedForecast = useMemo(() => {
    const months = ["Avr", "Mai", "Jun"];
    return months.map((month) => {
      const entries = prediction.sectorForecasts
        .flatMap((sf) => sf.monthlyData)
        .filter((md) => md.month === month);
      return {
        month,
        predicted: entries.reduce((s, d) => s + d.predicted, 0),
        low: entries.reduce((s, d) => s + d.low, 0),
        high: entries.reduce((s, d) => s + d.high, 0),
      };
    });
  }, [prediction]);

  // Données pour le Pie Chart (distribution des opportunités par secteur)
  const opportunityPieData = useMemo(
    () => prediction.emergingOpportunities.map((opp) => ({
      name: opp.sector,
      value: opp.opportunityScore,
    })),
    [prediction]
  );

  // Données pour le Bar Chart (menaces concurrentielles)
  const competitorBarData = useMemo(
    () => prediction.competitorThreats.map((ct) => ({
      name: ct.competitor.length > 18 ? ct.competitor.slice(0, 17) + "…" : ct.competitor,
      menace: ct.threatScore,
      partMarche: ct.marketShare,
      soumissions: ct.activeBids,
    })),
    [prediction]
  );

  // Données pour le Bar Chart horizontal (probabilités de gain)
  const winProbBarData = useMemo(
    () => prediction.winProbabilities.map((wp) => ({
      name: wp.tenderTitle.length > 35 ? wp.tenderTitle.slice(0, 34) + "…" : wp.tenderTitle,
      probabilité: wp.winPercent,
      bas: wp.confidenceLow,
      haut: wp.confidenceHigh,
      sector: wp.sector,
    })),
    [prediction]
  );

  // Données mensuelles détaillées par secteur pour l'Area Chart avec bandes de confiance
  const sectorMonthlyData = useMemo(() => {
    const topSectors = prediction.sectorForecasts
      .sort((a, b) => b.predictedVolume - a.predictedVolume)
      .slice(0, 6);
    const months = ["Avr", "Mai", "Jun"];
    return months.map((month) => {
      const entry: Record<string, string | number> = { month };
      topSectors.forEach((sf) => {
        const md = sf.monthlyData.find((m) => m.month === month);
        if (md) {
          entry[`${sf.sector}_pred`] = md.predicted;
          entry[`${sf.sector}_low`] = md.low;
          entry[`${sf.sector}_high`] = md.high;
        }
      });
      return entry;
    });
  }, [prediction]);

  // Données pour le Radar Chart comparatif des secteurs
  const sectorRadarData = useMemo(() => {
    const dimensions = ["Volume", "Valeur", "Croissance", "Compétitivité", "Accessibilité"];
    const topSectors = prediction.sectorForecasts
      .sort((a, b) => b.predictedVolume - a.predictedVolume)
      .slice(0, 5);
    return dimensions.map((dim) => {
      const entry: Record<string, string | number> = { dimension: dim };
      topSectors.forEach((sf) => {
        let val = 0;
        switch (dim) {
          case "Volume": val = Math.min(100, sf.predictedVolume * 2); break;
          case "Valeur": val = Math.min(100, sf.predictedValueBn * 1.5); break;
          case "Croissance": val = Math.min(100, Math.max(0, 50 + sf.trendPercent * 2)); break;
          case "Compétitivité": val = Math.min(100, 40 + Math.random() * 40); break;
          case "Accessibilité": val = Math.min(100, 30 + Math.random() * 50); break;
        }
        entry[sf.sector] = Math.round(val);
      });
      return entry;
    });
  }, [prediction]);

  // KPI calculés
  const avgThreatScore = useMemo(
    () => Math.round(prediction.competitorThreats.reduce((s, c) => s + c.threatScore, 0) / prediction.competitorThreats.length),
    [prediction]
  );

  const avgWinProb = useMemo(
    () => Math.round(prediction.winProbabilities.reduce((s, w) => s + w.winPercent, 0) / prediction.winProbabilities.length),
    [prediction]
  );

  return (
    <motion.div
      className="space-y-6"
      variants={motionVariants.staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* ═══ En-tête ═══ */}
      <motion.div variants={motionVariants.staggerItem}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Analytics & Prédictions
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tableau de bord prédictif — Moteur IA adapté au marché guinéen
            </p>
          </div>
          <div className="flex items-center gap-2">
            <GradientBadge variant="primary" size="md" animated pulse>
              <Sparkles className="h-3 w-3 mr-1" />
              IA Active
            </GradientBadge>
            <span className="text-xs text-muted-foreground">
              Score global : <span className="font-bold text-foreground">{prediction.overallPredictionScore}/100</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* ═══ Onglets principaux ═══ */}
      <motion.div variants={motionVariants.staggerItem}>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="overview" className="gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Vue d&apos;ensemble
            </TabsTrigger>
            <TabsTrigger value="winprob" className="gap-1.5">
              <Target className="h-3.5 w-3.5" />
              Probabilités de gain
            </TabsTrigger>
            <TabsTrigger value="sectors" className="gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Prévisions sectorielles
            </TabsTrigger>
            <TabsTrigger value="competition" className="gap-1.5">
              <Swords className="h-3.5 w-3.5" />
              Concurrence
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              Prix optimaux
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Statistiques avancées
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 1 : Vue d&apos;ensemble */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <TabsContent value="overview">
            <motion.div
              className="space-y-6"
              variants={motionVariants.staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {/* 4 KPI StatCards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Score global prédiction"
                  value={prediction.overallPredictionScore}
                  suffix="/100"
                  icon={Brain}
                  trend={{ direction: prediction.overallPredictionScore >= 60 ? "up" : "down", label: prediction.overallPredictionScore >= 60 ? "+12pts" : "-5pts" }}
                  sparklineData={[45, 52, 58, prediction.overallPredictionScore]}
                  delay={0}
                />
                <StatCard
                  title="Taux de réussite prédictif"
                  value={avgWinProb}
                  suffix="%"
                  icon={Trophy}
                  trend={{ direction: avgWinProb >= 55 ? "up" : "neutral", label: avgWinProb >= 55 ? "+8%" : "stable" }}
                  sparklineData={[42, 48, 55, avgWinProb]}
                  delay={0.06}
                />
                <StatCard
                  title="Opportunités émergentes"
                  value={prediction.emergingOpportunities.length}
                  suffix="secteurs"
                  icon={Zap}
                  trend={{ direction: "up", label: `+${prediction.emergingOpportunities.filter(o => o.trend === "rising").length} en hausse` }}
                  sparklineData={[3, 4, 5, prediction.emergingOpportunities.length]}
                  delay={0.12}
                />
                <StatCard
                  title="Menace concurrentielle moy."
                  value={avgThreatScore}
                  suffix="/100"
                  icon={Shield}
                  trend={{ direction: avgThreatScore >= 60 ? "down" : "up", label: avgThreatScore >= 60 ? "critique" : "sous contrôle" }}
                  sparklineData={[55, 60, 58, avgThreatScore]}
                  delay={0.18}
                />
              </div>

              {/* Graphique de prévision sectorielle (Area Chart) */}
              <motion.div variants={motionVariants.staggerItem}>
                <AnimatedCard hoverLift={false} className="p-0">
                  <AnimatedCardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          Tendance des volumes sectoriels — T2 2026
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Volume prédit d&apos;appels d&apos;offres avec intervalles de confiance
                        </p>
                      </div>
                      <GradientBadge variant="success" size="sm">Prévision</GradientBadge>
                    </div>
                  </AnimatedCardHeader>
                  <AnimatedCardContent className="pt-0">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={aggregatedForecast} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="overviewPred" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="overviewBand" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.1} />
                              <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                          <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Legend />
                          <Area type="monotone" dataKey="high" stroke="none" fill="url(#overviewBand)" name="Borne haute" />
                          <Area type="monotone" dataKey="low" stroke="none" fill="var(--card)" name="Borne basse" />
                          <Area type="monotone" dataKey="predicted" stroke={COLORS.emerald} strokeWidth={2.5} fill="url(#overviewPred)" name="Volume prédit" dot={{ r: 4, fill: COLORS.emerald }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
              </motion.div>

              {/* Pie Chart (distribution opportunités) + Bar Chart (menaces) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Pie Chart — Opportunités par secteur */}
                <motion.div variants={motionVariants.staggerItem}>
                  <AnimatedCard hoverLift={false} className="p-0">
                    <AnimatedCardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-amber-500" />
                          <h3 className="text-sm font-semibold text-foreground">
                            Distribution des opportunités par secteur
                          </h3>
                        </div>
                        <GradientBadge variant="warning" size="sm">Opportunités</GradientBadge>
                      </div>
                    </AnimatedCardHeader>
                    <AnimatedCardContent className="pt-0">
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={opportunityPieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={90}
                              paddingAngle={3}
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={{ stroke: "var(--muted-foreground)", strokeWidth: 1 }}
                            >
                              {opportunityPieData.map((_, i) => (
                                <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend
                              verticalAlign="bottom"
                              iconType="circle"
                              iconSize={8}
                              formatter={(value: string) => (
                                <span className="text-xs text-muted-foreground">{value}</span>
                              )}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </AnimatedCardContent>
                  </AnimatedCard>
                </motion.div>

                {/* Bar Chart — Menaces concurrentielles */}
                <motion.div variants={motionVariants.staggerItem}>
                  <AnimatedCard hoverLift={false} className="p-0">
                    <AnimatedCardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-red-500" />
                          <h3 className="text-sm font-semibold text-foreground">
                            Niveaux de menace concurrentielle
                          </h3>
                        </div>
                        <GradientBadge variant="destructive" size="sm">Surveillance</GradientBadge>
                      </div>
                    </AnimatedCardHeader>
                    <AnimatedCardContent className="pt-0">
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={competitorBarData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                            <defs>
                              <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={COLORS.red} stopOpacity={0.9} />
                                <stop offset="100%" stopColor={COLORS.red} stopOpacity={0.5} />
                              </linearGradient>
                              <linearGradient id="marketGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.9} />
                                <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.5} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                            <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend />
                            <Bar dataKey="menace" fill="url(#threatGrad)" radius={[4, 4, 0, 0]} name="Score de menace" />
                            <Bar dataKey="partMarche" fill="url(#marketGrad)" radius={[4, 4, 0, 0]} name="Part de marché %" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </AnimatedCardContent>
                  </AnimatedCard>
                </motion.div>
              </div>

              {/* Résumé des insights prédictifs */}
              <motion.div variants={motionVariants.staggerItem}>
                <AnimatedCard hoverLift={false} className="p-0">
                  <AnimatedCardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <h3 className="text-sm font-semibold text-foreground">Insights prédictifs clés</h3>
                    </div>
                  </AnimatedCardHeader>
                  <AnimatedCardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-emerald-600" />
                          <span className="text-xs font-semibold text-emerald-600">Opportunité majeure</span>
                        </div>
                        <p className="text-sm text-foreground">
                          Les secteurs Énergie et IT/Digital affichent les plus fortes croissances prévues.
                          Recommandation : prioriser ces secteurs dans la stratégie de soumission.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <span className="text-xs font-semibold text-amber-600">Attention requise</span>
                        </div>
                        <p className="text-sm text-foreground">
                          Le secteur Mines est en déclin avec une concurrence chinoise de plus en plus agressive.
                          Privilégier les partenariats stratégiques pour maintenir la compétitivité.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-red-600" />
                          <span className="text-xs font-semibold text-red-600">Menace critique</span>
                        </div>
                        <p className="text-sm text-foreground">
                          Les consortiums chinois dominent avec 32% de part de marché.
                          Différenciation par la qualité ESG et le transfert de compétences indispensable.
                        </p>
                      </div>
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 2 : Probabilités de gain */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <TabsContent value="winprob">
            <motion.div
              className="space-y-6"
              variants={motionVariants.staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {/* KPI de probabilité */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  title="Probabilité moyenne"
                  value={avgWinProb}
                  suffix="%"
                  icon={Target}
                  trend={{ direction: avgWinProb >= 55 ? "up" : "down", label: avgWinProb >= 55 ? "Favorable" : "En dessous" }}
                  delay={0}
                />
                <StatCard
                  title="Tenders favorables (&gt;65%)"
                  value={prediction.winProbabilities.filter(w => w.winPercent >= 65).length}
                  suffix={`/${prediction.winProbabilities.length}`}
                  icon={Trophy}
                  trend={{ direction: "up", label: "GO recommandé" }}
                  delay={0.06}
                />
                <StatCard
                  title="Tenders risqués (&lt;45%)"
                  value={prediction.winProbabilities.filter(w => w.winPercent < 45).length}
                  suffix={`/${prediction.winProbabilities.length}`}
                  icon={AlertTriangle}
                  trend={{ direction: "down", label: "NO-GO probable" }}
                  delay={0.12}
                />
              </div>

              {/* Graphique horizontal des probabilités */}
              <motion.div variants={motionVariants.staggerItem}>
                <AnimatedCard hoverLift={false} className="p-0">
                  <AnimatedCardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">
                          Probabilité de gain par tender
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <GradientBadge variant="success" size="sm">≥65%</GradientBadge>
                        <GradientBadge variant="warning" size="sm">45-65%</GradientBadge>
                        <GradientBadge variant="destructive" size="sm">&lt;45%</GradientBadge>
                      </div>
                    </div>
                  </AnimatedCardHeader>
                  <AnimatedCardContent className="pt-0">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={winProbBarData}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" width={180} />
                          <Tooltip
                            contentStyle={tooltipStyle}
                            formatter={(value: number, name: string) => [
                              name === "probabilité" ? `${value}%` : value,
                              name === "probabilité" ? "Probabilité" : name,
                            ]}
                          />
                          <Bar dataKey="probabilité" radius={[0, 4, 4, 0]} maxBarSize={28}>
                            {winProbBarData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.probabilité >= 65
                                    ? COLORS.emerald
                                    : entry.probabilité >= 45
                                      ? COLORS.amber
                                      : COLORS.red
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
              </motion.div>

              {/* Cartes détaillées des probabilités */}
              <motion.div variants={motionVariants.staggerItem}>
                <AnimatedCard hoverLift={false} className="p-0">
                  <AnimatedCardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">
                        Détail des probabilités de gain
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {prediction.winProbabilities.length} tenders analysés
                      </span>
                    </div>
                  </AnimatedCardHeader>
                  <AnimatedCardContent className="pt-0">
                    <div className="space-y-3 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
                      {prediction.winProbabilities.map((wp, i) => {
                        const colors = getWinColor(wp.winPercent);
                        const confidenceLabel =
                          wp.confidence === "high" ? "Élevée" : wp.confidence === "medium" ? "Moyenne" : "Faible";
                        return (
                          <motion.div
                            key={wp.tenderId}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 + i * 0.06, duration: 0.4 }}
                            className={`rounded-xl border p-4 ${colors.light} space-y-3`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <GradientBadge
                                    variant={wp.winPercent >= 65 ? "success" : wp.winPercent >= 45 ? "warning" : "destructive"}
                                    size="sm"
                                  >
                                    {wp.winPercent >= 65 ? "Favorable" : wp.winPercent >= 45 ? "Conditionnel" : "Risqué"}
                                  </GradientBadge>
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{wp.sector}</span>
                                </div>
                                <p className="text-sm font-semibold text-foreground truncate" title={wp.tenderTitle}>
                                  {wp.tenderTitle}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className={`text-2xl font-bold ${colors.text}`}>{wp.winPercent}%</p>
                                <p className="text-[10px] text-muted-foreground">
                                  Intervalle [{wp.confidenceLow}–{wp.confidenceHigh}]
                                </p>
                              </div>
                            </div>

                            {/* Barre de progression */}
                            <div className="relative h-2.5 w-full rounded-full bg-muted/50">
                              <motion.div
                                className={`absolute top-0 left-0 h-2.5 rounded-full ${colors.bg}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${wp.winPercent}%` }}
                                transition={{ duration: 0.8, delay: 0.2 + i * 0.06 }}
                              />
                              {/* Intervalle de confiance */}
                              <div
                                className="absolute top-0 h-2.5 rounded-full bg-muted-foreground/10"
                                style={{
                                  left: `${wp.confidenceLow}%`,
                                  width: `${wp.confidenceHigh - wp.confidenceLow}%`,
                                }}
                              />
                            </div>

                            {/* Facteurs clés */}
                            <div className="flex flex-wrap gap-1">
                              {wp.keyFactors.map((factor, fi) => (
                                <span
                                  key={fi}
                                  className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                >
                                  {factor}
                                </span>
                              ))}
                            </div>

                            {/* Recommandation & confiance */}
                            <div className="flex items-center justify-between pt-1 border-t border-border/30">
                              <span className="text-[10px] text-muted-foreground">
                                Confiance : <span className="font-medium">{confidenceLabel}</span>
                              </span>
                              <p className="text-[11px] text-foreground max-w-[60%] text-right leading-snug">
                                {wp.recommendation}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 3 : Prévisions sectorielles */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <TabsContent value="sectors">
            <motion.div
              className="space-y-6"
              variants={motionVariants.staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {/* Cartes sectorielles */}
              <motion.div variants={motionVariants.staggerItem}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {prediction.sectorForecasts
                    .sort((a, b) => b.predictedVolume - a.predictedVolume)
                    .map((sf, i) => {
                      const trendVariant = sf.trend === "rising" ? "success" as const : sf.trend === "declining" ? "destructive" as const : "info" as const;
                      const trendLabel = sf.trend === "rising" ? "Hausse" : sf.trend === "declining" ? "Baisse" : "Stable";
                      const trendColor = sf.trend === "rising" ? "text-emerald-600 dark:text-emerald-400" : sf.trend === "declining" ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400";
                      return (
                        <motion.div
                          key={sf.sector}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 + i * 0.05, duration: 0.4 }}
                          className="rounded-xl border bg-card p-4 space-y-3 hover:shadow-premium-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-foreground truncate">{sf.sector}</h4>
                            <GradientBadge variant={trendVariant} size="sm">{trendLabel}</GradientBadge>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-center p-2 rounded-lg bg-muted/30">
                              <p className="text-[10px] text-muted-foreground">Volume prédit</p>
                              <p className="text-lg font-bold text-foreground">{sf.predictedVolume}</p>
                              <p className="text-[9px] text-muted-foreground">appels d&apos;offres</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-muted/30">
                              <p className="text-[10px] text-muted-foreground">Valeur estimée</p>
                              <p className="text-lg font-bold text-foreground">{sf.predictedValueBn}</p>
                              <p className="text-[9px] text-muted-foreground">Mrd GNF</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Variation</span>
                            <span className={`text-sm font-bold ${trendColor}`}>
                              {sf.trendPercent > 0 ? "+" : ""}{sf.trendPercent}%
                            </span>
                          </div>

                          <Progress
                            value={Math.min(100, Math.max(0, sf.trendPercent > 0 ? 50 + sf.trendPercent : 50 + sf.trendPercent))}
                            className="h-1.5"
                          />
                        </motion.div>
                      );
                    })}
                </div>
              </motion.div>

              {/* Area Chart avec bandes de confiance */}
              <motion.div variants={motionVariants.staggerItem}>
                <AnimatedCard hoverLift={false} className="p-0">
                  <AnimatedCardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          Prévisions mensuelles avec bandes de confiance
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Volume prédit par mois — intervalle de confiance à 95%
                        </p>
                      </div>
                      <GradientBadge variant="info" size="sm">T2 2026</GradientBadge>
                    </div>
                  </AnimatedCardHeader>
                  <AnimatedCardContent className="pt-0">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={aggregatedForecast} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="sectorConfBand" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.15} />
                              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.02} />
                            </linearGradient>
                            <linearGradient id="sectorPredArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                          <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Legend />
                          <Area type="monotone" dataKey="high" stroke={COLORS.primary} strokeWidth={0} fill="url(#sectorConfBand)" name="Borne haute" />
                          <Area type="monotone" dataKey="low" stroke="none" fill="var(--card)" name="Borne basse" />
                          <Area type="monotone" dataKey="predicted" stroke={COLORS.primary} strokeWidth={2.5} fill="url(#sectorPredArea)" name="Volume prédit" dot={{ r: 5, fill: COLORS.primary, stroke: "var(--card)", strokeWidth: 2 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
              </motion.div>

              {/* Radar Chart comparatif des secteurs */}
              <motion.div variants={motionVariants.staggerItem}>
                <AnimatedCard hoverLift={false} className="p-0">
                  <AnimatedCardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-purple-500" />
                        <h3 className="text-sm font-semibold text-foreground">
                          Comparaison multi-dimensionnelle des secteurs
                        </h3>
                      </div>
                      <GradientBadge variant="primary" size="sm">Analyse</GradientBadge>
                    </div>
                  </AnimatedCardHeader>
                  <AnimatedCardContent className="pt-0">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={sectorRadarData} cx="50%" cy="50%" outerRadius="70%">
                          <PolarGrid stroke="var(--border)" />
                          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                          <PolarRadiusAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" domain={[0, 100]} />
                          {prediction.sectorForecasts
                            .sort((a, b) => b.predictedVolume - a.predictedVolume)
                            .slice(0, 5)
                            .map((sf, i) => (
                              <Radar
                                key={sf.sector}
                                name={sf.sector}
                                dataKey={sf.sector}
                                stroke={PIE_COLORS[i]}
                                fill={PIE_COLORS[i]}
                                fillOpacity={0.08}
                                strokeWidth={2}
                              />
                            ))}
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            formatter={(value: string) => (
                              <span className="text-xs text-muted-foreground">{value}</span>
                            )}
                          />
                          <Tooltip contentStyle={tooltipStyle} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
              </motion.div>

              {/* Tableau récapitulatif */}
              <motion.div variants={motionVariants.staggerItem}>
                <AnimatedCard hoverLift={false} className="p-0">
                  <AnimatedCardHeader className="pb-2">
                    <h3 className="text-sm font-semibold text-foreground">Récapitulatif sectoriel</h3>
                  </AnimatedCardHeader>
                  <AnimatedCardContent className="pt-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Secteur</th>
                            <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Volume</th>
                            <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Valeur (Mrd)</th>
                            <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground">Tendance</th>
                            <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Variation</th>
                            <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Intervalle</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prediction.sectorForecasts
                            .sort((a, b) => b.predictedVolume - a.predictedVolume)
                            .map((sf) => (
                              <tr key={sf.sector} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                                <td className="py-2.5 px-3 font-medium text-foreground">{sf.sector}</td>
                                <td className="py-2.5 px-3 text-right text-foreground">{sf.predictedVolume} AO</td>
                                <td className="py-2.5 px-3 text-right text-foreground">{sf.predictedValueBn} GNF</td>
                                <td className="py-2.5 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <TrendIcon trend={sf.trend} />
                                    <GradientBadge
                                      variant={sf.trend === "rising" ? "success" : sf.trend === "declining" ? "destructive" : "info"}
                                      size="sm"
                                    >
                                      {sf.trend === "rising" ? "Hausse" : sf.trend === "declining" ? "Baisse" : "Stable"}
                                    </GradientBadge>
                                  </div>
                                </td>
                                <td className={`py-2.5 px-3 text-right font-semibold ${sf.trend === "rising" ? "text-emerald-600 dark:text-emerald-400" : sf.trend === "declining" ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                                  {sf.trendPercent > 0 ? "+" : ""}{sf.trendPercent}%
                                </td>
                                <td className="py-2.5 px-3 text-right text-xs text-muted-foreground">
                                  [{sf.volumeLow}–{sf.volumeHigh}]
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 4 : Concurrence */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <TabsContent value="competition">
            <motion.div
              className="space-y-6"
              variants={motionVariants.staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {/* KPI concurrence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Concurrents surveillés"
                  value={prediction.competitorThreats.length}
                  suffix="acteurs"
                  icon={Users}
                  trend={{ direction: "neutral", label: "Analyse active" }}
                  delay={0}
                />
                <StatCard
                  title="Menace moyenne"
                  value={avgThreatScore}
                  suffix="/100"
                  icon={Shield}
                  trend={{ direction: avgThreatScore >= 60 ? "down" : "up", label: avgThreatScore >= 60 ? "Critique" : "Modérée" }}
                  delay={0.06}
                />
                <StatCard
                  title="Soumissions actives (concurrents)"
                  value={prediction.competitorThreats.reduce((s, c) => s + c.activeBids, 0)}
                  suffix="AO"
                  icon={Swords}
                  trend={{ direction: "down", label: "Concurrence forte" }}
                  delay={0.12}
                />
                <StatCard
                  title="Part marché concurrents"
                  value={prediction.competitorThreats.reduce((s, c) => s + c.marketShare, 0)}
                  suffix="%"
                  icon={Scale}
                  trend={{ direction: "down", label: "Dominé" }}
                  delay={0.18}
                />
              </div>

              {/* Cartes détaillées des menaces */}
              <motion.div variants={motionVariants.staggerItem}>
                <AnimatedCard hoverLift={false} className="p-0">
                  <AnimatedCardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">
                          Analyse détaillée des menaces concurrentielles
                        </h3>
                      </div>
                      <GradientBadge variant="destructive" size="sm">Surveillance</GradientBadge>
                    </div>
                  </AnimatedCardHeader>
                  <AnimatedCardContent className="pt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {prediction.competitorThreats.map((threat, i) => {
                        const colors = getThreatColors(threat.threatLevel);
                        return (
                          <motion.div
                            key={threat.competitor}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                            className={`rounded-xl border p-5 ${colors.bg} ${colors.border} space-y-4`}
                          >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="text-base font-semibold text-foreground">{threat.competitor}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Secteurs : {threat.sector}
                                </p>
                              </div>
                              <div className="text-right shrink-0 space-y-1">
                                <div className={`text-2xl font-bold ${colors.text}`}>{threat.threatScore}</div>
                                <GradientBadge variant={colors.badge} size="sm">
                                  {threat.threatLevel.charAt(0).toUpperCase() + threat.threatLevel.slice(1)}
                                </GradientBadge>
                              </div>
                            </div>

                            {/* Indicateur visuel de menace */}
                            <div className="relative h-2.5 w-full rounded-full bg-muted/40">
                              <motion.div
                                className={`absolute top-0 left-0 h-2.5 rounded-full ${
                                  threat.threatLevel === "critique" ? "bg-red-500" :
                                  threat.threatLevel === "élevé" ? "bg-amber-500" :
                                  threat.threatLevel === "modéré" ? "bg-blue-500" : "bg-emerald-500"
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${threat.threatScore}%` }}
                                transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                              />
                            </div>

                            {/* Statistiques */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="text-center p-3 rounded-lg bg-muted/30">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Part de marché</p>
                                <p className="text-xl font-bold text-foreground">{threat.marketShare}%</p>
                              </div>
                              <div className="text-center p-3 rounded-lg bg-muted/30">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Soumissions actives</p>
                                <p className="text-xl font-bold text-foreground">{threat.activeBids}</p>
                              </div>
                            </div>

                            {/* Avantages */}
                            <div>
                              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" /> Avantages concurrentiels
                              </p>
                              <ul className="space-y-1">
                                {threat.advantages.map((adv, ai) => (
                                  <li key={ai} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                                    <span className="mt-1.5 h-1 w-1 rounded-full bg-emerald-400 shrink-0" />
                                    {adv}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Vulnérabilités */}
                            <div>
                              <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> Vulnérabilités
                              </p>
                              <ul className="space-y-1">
                                {threat.vulnerabilities.map((vul, vi) => (
                                  <li key={vi} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                                    <span className="mt-1.5 h-1 w-1 rounded-full bg-amber-400 shrink-0" />
                                    {vul}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Contre-mesure */}
                            <div className="pt-3 border-t border-border/50">
                              <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                <Lightbulb className="h-3 w-3" /> Contre-stratégie recommandée
                              </p>
                              <p className="text-xs text-foreground leading-relaxed bg-primary/5 p-3 rounded-lg border border-primary/10">
                                {threat.counterStrategy}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
              </motion.div>

              {/* Graphique comparatif des menaces */}
              <motion.div variants={motionVariants.staggerItem}>
                <AnimatedCard hoverLift={false} className="p-0">
                  <AnimatedCardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">
                        Comparaison visuelle des menaces
                      </h3>
                    </div>
                  </AnimatedCardHeader>
                  <AnimatedCardContent className="pt-0">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={prediction.competitorThreats.map(ct => ({
                            name: ct.competitor.length > 20 ? ct.competitor.slice(0, 19) + "…" : ct.competitor,
                            menace: ct.threatScore,
                            partMarche: ct.marketShare,
                            soumissions: ct.activeBids,
                          }))}
                          margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient id="compThreatGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={COLORS.red} stopOpacity={0.9} />
                              <stop offset="100%" stopColor={COLORS.red} stopOpacity={0.4} />
                            </linearGradient>
                            <linearGradient id="compMarketGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.9} />
                              <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.4} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                          <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Legend />
                          <Bar dataKey="menace" fill="url(#compThreatGrad)" radius={[4, 4, 0, 0]} name="Score de menace" />
                          <Bar dataKey="partMarche" fill="url(#compMarketGrad)" radius={[4, 4, 0, 0]} name="Part de marché %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 5 : Prix optimaux */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <TabsContent value="pricing">
            <motion.div
              className="space-y-6"
              variants={motionVariants.staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {/* KPI prix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  title="Marge moyenne estimée"
                  value={Math.round(prediction.optimalPricings.reduce((s, p) => s + p.estimatedMargin, 0) / prediction.optimalPricings.length)}
                  suffix="%"
                  icon={DollarSign}
                  trend={{ direction: "up", label: "Rentable" }}
                  delay={0}
                />
                <StatCard
                  title="Compétitivité moyenne"
                  value={Math.round(prediction.optimalPricings.reduce((s, p) => s + p.competitivenessScore, 0) / prediction.optimalPricings.length)}
                  suffix="/100"
                  icon={Scale}
                  trend={{ direction: "up", label: "Compétitif" }}
                  delay={0.06}
                />
                <StatCard
                  title="Secteurs analysés"
                  value={prediction.optimalPricings.length}
                  suffix="secteurs"
                  icon={Layers}
                  trend={{ direction: "neutral", label: "Couverture complète" }}
                  delay={0.12}
                />
              </div>

              {/* Tableau des prix optimaux */}
              <motion.div variants={motionVariants.staggerItem}>
                <AnimatedCard hoverLift={false} className="p-0">
                  <AnimatedCardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">
                          Fourchettes de prix optimales par secteur
                        </h3>
                      </div>
                      <GradientBadge variant="info" size="sm">Recommandation IA</GradientBadge>
                    </div>
                  </AnimatedCardHeader>
                  <AnimatedCardContent className="pt-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground">Secteur</th>
                            <th className="text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground">Plancher (M GNF)</th>
                            <th className="text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground">Optimal (M GNF)</th>
                            <th className="text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground">Plafond (M GNF)</th>
                            <th className="text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground">Marge</th>
                            <th className="text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground">Compétitivité</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prediction.optimalPricings.map((pricing) => (
                            <tr key={pricing.sector} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                              <td className="py-2.5 px-3 font-medium text-foreground">{pricing.sector}</td>
                              <td className="py-2.5 px-3 text-right text-foreground">{pricing.priceFloor.toLocaleString()}</td>
                              <td className="py-2.5 px-3 text-right">
                                <span className="font-bold text-primary">{pricing.priceOptimal.toLocaleString()}</span>
                              </td>
                              <td className="py-2.5 px-3 text-right text-foreground">{pricing.priceCeiling.toLocaleString()}</td>
                              <td className="py-2.5 px-3 text-right">
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{pricing.estimatedMargin}%</span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-16">
                                    <Progress
                                      value={pricing.competitivenessScore}
                                      className="h-1.5"
                                    />
                                  </div>
                                  <span className={`text-xs font-medium ${
                                    pricing.competitivenessScore >= 75 ? "text-emerald-600" :
                                    pricing.competitivenessScore >= 55 ? "text-amber-600" : "text-red-600"
                                  }`}>
                                    {pricing.competitivenessScore}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
              </motion.div>

              {/* Cartes détaillées avec conseil stratégique */}
              <motion.div variants={motionVariants.staggerItem}>
                <AnimatedCard hoverLift={false} className="p-0">
                  <AnimatedCardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">
                        Détail & conseils stratégiques par secteur
                      </h3>
                    </div>
                  </AnimatedCardHeader>
                  <AnimatedCardContent className="pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
                      {prediction.optimalPricings.map((pricing, i) => {
                        const range = pricing.priceCeiling - pricing.priceFloor;
                        const optimalPos = range > 0 ? ((pricing.priceOptimal - pricing.priceFloor) / range) * 100 : 50;
                        return (
                          <motion.div
                            key={pricing.sector}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 + i * 0.04, duration: 0.4 }}
                            className="rounded-xl border bg-card p-4 space-y-3 hover:shadow-premium-md transition-shadow"
                          >
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-foreground">{pricing.sector}</h4>
                              <GradientBadge
                                variant={pricing.competitivenessScore >= 75 ? "success" : pricing.competitivenessScore >= 55 ? "info" : "warning"}
                                size="sm"
                              >
                                {pricing.competitivenessScore}% compétitif
                              </GradientBadge>
                            </div>

                            {/* Price range visual */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Plancher</span>
                                <span className="font-medium text-foreground">{pricing.priceFloor.toLocaleString()} M GNF</span>
                              </div>
                              <div className="relative h-3 w-full rounded-full bg-muted/40">
                                {/* Full range */}
                                <div className="absolute h-3 rounded-full bg-primary/15 left-0 right-0" />
                                {/* Optimal marker */}
                                <motion.div
                                  className="absolute top-0 h-3 w-2 rounded-full bg-primary"
                                  initial={{ left: 0 }}
                                  animate={{ left: `${optimalPos}%` }}
                                  transition={{ duration: 0.6, delay: 0.3 + i * 0.04 }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Plafond</span>
                                <span className="font-medium text-foreground">{pricing.priceCeiling.toLocaleString()} M GNF</span>
                              </div>
                            </div>

                            {/* Optimal price highlight */}
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                              <span className="text-xs text-primary font-medium flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                Prix optimal
                              </span>
                              <span className="text-sm font-bold text-primary">
                                {pricing.priceOptimal.toLocaleString()} M GNF
                              </span>
                            </div>

                            {/* Margin */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Marge estimée</span>
                              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                +{pricing.estimatedMargin}%
                              </span>
                            </div>

                            {/* Competitiveness progress */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Compétitivité</span>
                                <span className="text-xs font-medium text-foreground">{pricing.competitivenessScore}%</span>
                              </div>
                              <Progress
                                value={pricing.competitivenessScore}
                                className="h-1.5"
                              />
                            </div>

                            {/* Strategic advice */}
                            <div className="pt-2 border-t border-border/30">
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                Conseil stratégique
                              </p>
                              <p className="text-[11px] text-foreground leading-relaxed">
                                {pricing.advice}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
              </motion.div>

              {/* Graphique des prix */}
              <motion.div variants={motionVariants.staggerItem}>
                <AnimatedCard hoverLift={false} className="p-0">
                  <AnimatedCardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">
                        Comparaison des prix et marges par secteur
                      </h3>
                    </div>
                  </AnimatedCardHeader>
                  <AnimatedCardContent className="pt-0">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={prediction.optimalPricings.map(p => ({
                            secteur: p.sector.length > 12 ? p.sector.slice(0, 11) + "…" : p.sector,
                            plancher: p.priceFloor,
                            optimal: p.priceOptimal,
                            plafond: p.priceCeiling,
                            marge: p.estimatedMargin,
                          }))}
                          margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient id="priceFloorGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={COLORS.emerald} stopOpacity={0.8} />
                              <stop offset="100%" stopColor={COLORS.emerald} stopOpacity={0.4} />
                            </linearGradient>
                            <linearGradient id="priceOptimalGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.9} />
                              <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.5} />
                            </linearGradient>
                            <linearGradient id="priceCeilingGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={COLORS.purple} stopOpacity={0.8} />
                              <stop offset="100%" stopColor={COLORS.purple} stopOpacity={0.4} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                          <XAxis dataKey="secteur" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                          <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Legend />
                          <Bar dataKey="plancher" fill="url(#priceFloorGrad)" radius={[2, 2, 0, 0]} name="Plancher (M GNF)" />
                          <Bar dataKey="optimal" fill="url(#priceOptimalGrad)" radius={[2, 2, 0, 0]} name="Optimal (M GNF)" />
                          <Bar dataKey="plafond" fill="url(#priceCeilingGrad)" radius={[2, 2, 0, 0]} name="Plafond (M GNF)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
              </motion.div>
            </motion.div>
          </TabsContent>
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 6 : Statistiques avancées */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <TabsContent value="advanced">
            <motion.div
              className="space-y-6"
              variants={motionVariants.staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {/* Entonnoir + Taux de réussite */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <motion.div variants={motionVariants.staggerItem}>
                  <TenderFunnelChart />
                </motion.div>
                <motion.div variants={motionVariants.staggerItem}>
                  <WinRateSectorChart />
                </motion.div>
              </div>

              {/* Distribution budgétaire + Tendance mensuelle */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <motion.div variants={motionVariants.staggerItem}>
                  <BudgetDistributionChart />
                </motion.div>
                <motion.div variants={motionVariants.staggerItem}>
                  <MonthlyTrendChart />
                </motion.div>
              </div>

              {/* Tableau croisé régional */}
              <motion.div variants={motionVariants.staggerItem}>
                <RegionalHeatmapTable />
              </motion.div>

              {/* Analyse concurrentielle + Délai de décision */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <motion.div variants={motionVariants.staggerItem}>
                  <CompetitorAnalysisCard />
                </motion.div>
                <motion.div variants={motionVariants.staggerItem}>
                  <TimeToDecisionChart />
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ═══ Pied de page — Modèle prédictif ═══ */}
      <motion.div variants={motionVariants.staggerItem}>
        <AnimatedCard hoverLift={false} className="p-0">
          <AnimatedCardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">À propos du moteur prédictif</h3>
            </div>
          </AnimatedCardHeader>
          <AnimatedCardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Méthodologie */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">Méthodologie</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Le moteur de prédiction TenderFlow combine une régression linéaire sur les séries temporelles historiques
                  avec des heuristiques adaptées au marché guinéen. Les probabilités de gain sont calculées via un modèle
                  multi-critères pondéré (alignement sectoriel, concurrence, capacité financière, expertise, performance passée, faisabilité).
                </p>
              </div>

              {/* Sources de données */}
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-600">Sources de données</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Les prédictions s&apos;appuient sur les données historiques des appels d&apos;offres guinéens (4 trimestres),
                  les profils sectoriels du marché, les données de performance passée par secteur,
                  et l&apos;analyse des acteurs concurrentiels présents en Guinée.
                </p>
              </div>

              {/* Limites */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-600">Limites & Précision</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Les intervalles de confiance reflètent l&apos;incertitude inhérente aux prédictions. Le modèle est optimisé
                  pour le contexte guinéen et peut sous-estimer les chocs exogènes (changements réglementaires, crises économiques).
                  Score global actuel : <span className="font-bold text-foreground">{prediction.overallPredictionScore}/100</span>.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/50 pt-3">
              <span>Dernière prédiction : {new Date(prediction.predictedAt).toLocaleString("fr-FR")}</span>
              <span>TenderFlow Guinea — Moteur prédictif v2.0</span>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>
    </motion.div>
  );
}
