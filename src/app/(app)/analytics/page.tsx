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
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { Progress } from "@/components/ui/progress";
import { motionVariants } from "@/lib/design-tokens";

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

export default function AnalyticsPage() {
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

      {/* Predictive Insights */}
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
