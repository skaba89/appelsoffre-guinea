"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import {
  Search, TrendingUp, FileCheck, DollarSign,
  RefreshCw, Bell, Download, ArrowRight,
  Zap, Clock, CheckCircle2, AlertTriangle, Building2,
  Calendar, Users, ChevronRight, BarChart3,
} from "lucide-react";
import { GuineaMap } from "@/components/ui/guinea-map";
import { useAuthStore } from "@/stores/auth-store";
import { StatCard } from "@/components/ui/stat-card";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motionVariants, transitions, chartColors } from "@/lib/design-tokens";

// ===== MOCK DATA =====
const monthlyTenders = [
  { month: "Oct", appels: 42, soumissions: 28, succes: 19 },
  { month: "Nov", appels: 56, soumissions: 35, succes: 24 },
  { month: "Déc", appels: 38, soumissions: 22, succes: 15 },
  { month: "Jan", appels: 65, soumissions: 41, succes: 29 },
  { month: "Fév", appels: 78, soumissions: 52, succes: 36 },
  { month: "Mar", appels: 91, soumissions: 63, succes: 43 },
];

const sectorData = [
  { name: "BTP & Infra", value: 35, color: "#3b82f6" },
  { name: "IT & Digital", value: 22, color: "#10b981" },
  { name: "Mines", value: 18, color: "#f59e0b" },
  { name: "Santé", value: 12, color: "#ef4444" },
  { name: "Éducation", value: 8, color: "#8b5cf6" },
  { name: "Transport", value: 5, color: "#ec4899" },
];

const topTenders = [
  { id: "AO-2026-0147", title: "Construction route Kissidougou–Kérouané", score: 92, deadline: "15 Mai 2026", sector: "BTP", status: "go" },
  { id: "AO-2026-0139", title: "Système d'information du Ministère des Mines", score: 87, deadline: "22 Mai 2026", sector: "IT", status: "go" },
  { id: "AO-2026-0156", title: "Équipement hospitalier régional Nzérékoré", score: 78, deadline: "8 Juin 2026", sector: "Santé", status: "go" },
  { id: "AO-2026-0162", title: "Fournitures bureautiques Administration publique", score: 45, deadline: "20 Avr 2026", sector: "Divers", status: "no-go" },
  { id: "AO-2026-0158", title: "Réhabilitation réseau d'eau Kankan", score: 72, deadline: "30 Mai 2026", sector: "BTP", status: "go" },
];

const pipelineData = [
  { stage: "Qualification", count: 34, color: "#3b82f6" },
  { stage: "Rédaction", count: 18, color: "#f59e0b" },
  { stage: "Soumission", count: 12, color: "#10b981" },
  { stage: "Résultat", count: 8, color: "#8b5cf6" },
];

const recentActivities = [
  { icon: Search, text: "Nouvel AO détecté : Construction route Kissidougou", time: "Il y a 12 min", color: "text-blue-500" },
  { icon: CheckCircle2, text: "Soumission envoyée : Système SI Ministère Mines", time: "Il y a 2h", color: "text-emerald-500" },
  { icon: TrendingUp, text: "Scoring complété : AO-2026-0147 → 92% GO", time: "Il y a 3h", color: "text-primary" },
  { icon: AlertTriangle, text: "Deadline approche : Fournitures bureautiques (J-3)", time: "Il y a 5h", color: "text-amber-500" },
  { icon: Users, text: "Contact ajouté : Direction Mines Kankan", time: "Il y a 8h", color: "text-purple-500" },
];

const regionData = [
  { region: "conakry", count: 58, name: "Conakry" },
  { region: "kankan", count: 23, name: "Kankan" },
  { region: "nzerekore", count: 18, name: "Nzérékoré" },
  { region: "kindia", count: 15, name: "Kindia" },
  { region: "boke", count: 12, name: "Boké" },
  { region: "labe", count: 9, name: "Labé" },
  { region: "faranah", count: 7, name: "Faranah" },
  { region: "mamou", count: 5, name: "Mamou" },
];

const regionDetails: Record<string, { topSectors: string[]; trend: string }> = {
  conakry: { topSectors: ["IT & Digital", "Services", "BTP"], trend: "+8%" },
  kankan: { topSectors: ["BTP & Infra", "Mines", "Éducation"], trend: "+12%" },
  nzerekore: { topSectors: ["Agriculture", "Santé", "BTP"], trend: "+5%" },
  kindia: { topSectors: ["Agriculture", "Mines", "Transport"], trend: "+3%" },
  boke: { topSectors: ["Mines", "BTP & Infra", "Transport"], trend: "+15%" },
  labe: { topSectors: ["Agriculture", "Éducation", "Santé"], trend: "+2%" },
  faranah: { topSectors: ["Agriculture", "BTP", "Énergie"], trend: "+6%" },
  mamou: { topSectors: ["Agriculture", "Transport", "Santé"], trend: "+4%" },
};

// ===== COMPONENT =====
export default function DashboardPage() {
  const { user } = useAuthStore();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const firstName = user?.full_name?.split(" ")[0] || "Utilisateur";
  const today = useMemo(() => {
    return new Date().toLocaleDateString("fr-FR", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  }, []);

  return (
    <motion.div
      className="space-y-6"
      variants={motionVariants.staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* ===== Hero Section ===== */}
      <motion.div variants={motionVariants.staggerItem} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Bonjour, {firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Nouveau scan
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Bell className="h-4 w-4" />
            Alertes
          </Button>
          <Button size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </motion.div>

      {/* ===== KPI Row ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Appels d'offres actifs"
          value={147}
          icon={Search}
          trend={{ direction: "up", label: "+12%" }}
          sparklineData={[42, 56, 38, 65, 78, 91]}
          delay={0}
        />
        <StatCard
          title="Taux de réussite"
          value={68}
          suffix="%"
          icon={TrendingUp}
          trend={{ direction: "up", label: "+5%" }}
          sparklineData={[45, 52, 48, 58, 62, 68]}
          delay={0.06}
        />
        <StatCard
          title="Opportunités GO"
          value={23}
          icon={FileCheck}
          trend={{ direction: "up", label: "+8%" }}
          sparklineData={[12, 15, 14, 18, 20, 23]}
          delay={0.12}
        />
        <StatCard
          title="Pipeline (GNF)"
          value={2.4}
          suffix="M"
          prefix=""
          icon={DollarSign}
          trend={{ direction: "up", label: "+15%" }}
          sparklineData={[1.2, 1.5, 1.4, 1.8, 2.1, 2.4]}
          decimals={1}
          delay={0.18}
        />
      </div>

      {/* ===== Main Charts Row ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tender Flow Chart */}
        <motion.div variants={motionVariants.staggerItem}>
          <AnimatedCard hoverLift={false} className="p-0">
            <AnimatedCardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Flux des appels d'offres</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">6 derniers mois</p>
                </div>
                <GradientBadge variant="primary" size="sm">Live</GradientBadge>
              </div>
            </AnimatedCardHeader>
            <AnimatedCardContent className="pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTenders} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAppels" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSucces" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Area type="monotone" dataKey="appels" stroke="#3b82f6" strokeWidth={2} fill="url(#colorAppels)" name="Appels d'offres" />
                    <Area type="monotone" dataKey="succes" stroke="#10b981" strokeWidth={2} fill="url(#colorSucces)" name="Réussites" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>

        {/* Sector Distribution Chart */}
        <motion.div variants={motionVariants.staggerItem}>
          <AnimatedCard hoverLift={false} className="p-0">
            <AnimatedCardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Répartition par secteur</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Appels d'offres actifs</p>
                </div>
              </div>
            </AnimatedCardHeader>
            <AnimatedCardContent className="pt-0">
              <div className="h-64 flex items-center">
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {sectorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => [`${value}%`, "Part"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-2.5 pl-2">
                  {sectorData.map((sector) => (
                    <div key={sector.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sector.color }} />
                      <span className="text-xs text-muted-foreground flex-1 truncate">{sector.name}</span>
                      <span className="text-xs font-semibold text-foreground">{sector.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>
      </div>

      {/* ===== Secondary Row ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Tenders */}
        <motion.div variants={motionVariants.staggerItem}>
          <AnimatedCard hoverLift={false} className="p-0">
            <AnimatedCardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Top Appels d'offres</h3>
                <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                  Voir tout <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </AnimatedCardHeader>
            <AnimatedCardContent className="pt-0">
              <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                {topTenders.map((tender, i) => (
                  <motion.div
                    key={tender.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      tender.status === "go" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                    }`}>
                      {tender.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{tender.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-muted-foreground">{tender.id}</span>
                        <span className="text-[11px] text-muted-foreground">•</span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-3 w-3" /> {tender.deadline}
                        </span>
                      </div>
                    </div>
                    <GradientBadge
                      variant={tender.status === "go" ? "success" : "destructive"}
                      size="sm"
                    >
                      {tender.status === "go" ? "GO" : "NO-GO"}
                    </GradientBadge>
                  </motion.div>
                ))}
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>

        {/* Pipeline */}
        <motion.div variants={motionVariants.staggerItem}>
          <AnimatedCard hoverLift={false} className="p-0">
            <AnimatedCardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Pipeline de réponse</h3>
                <span className="text-xs text-muted-foreground">72 total</span>
              </div>
            </AnimatedCardHeader>
            <AnimatedCardContent className="pt-0">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="stage" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={800}>
                      {pipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Pipeline progress bar */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Taux de conversion</span>
                  <span className="font-semibold text-foreground">24%</span>
                </div>
                <Progress value={24} className="h-2" />
                <p className="text-[11px] text-muted-foreground">8 contrats remportés sur 34 qualifications</p>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={motionVariants.staggerItem}>
          <AnimatedCard hoverLift={false} className="p-0">
            <AnimatedCardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Activité récente</h3>
                <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                  Tout voir <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </AnimatedCardHeader>
            <AnimatedCardContent className="pt-0">
              <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                {recentActivities.map((activity, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.06 }}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`mt-0.5 ${activity.color}`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">{activity.text}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>
      </div>

      {/* ===== Bottom Row — Geographic Coverage ===== */}
      <motion.div variants={motionVariants.staggerItem}>
        <AnimatedCard hoverLift={false} className="p-0">
          <AnimatedCardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Couverture géographique</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Cliquez sur une région pour voir les détails</p>
              </div>
              <GradientBadge variant="primary" size="sm" animated>8 régions</GradientBadge>
            </div>
          </AnimatedCardHeader>
          <AnimatedCardContent className="pt-0">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Interactive Map */}
              <div className="flex-1">
                <GuineaMap
                  data={regionData.map((r) => ({ region: r.region, count: r.count, label: r.name }))}
                  onRegionClick={(regionId) => setSelectedRegion(selectedRegion === regionId ? null : regionId)}
                  selectedRegion={selectedRegion}
                />
              </div>

              {/* Region Detail Panel */}
              <div className="lg:w-64 shrink-0">
                <AnimatePresence mode="wait">
                  {selectedRegion ? (
                    <motion.div
                      key={selectedRegion}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 rounded-xl border border-border bg-muted/30 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-foreground">
                          {regionData.find((r) => r.region === selectedRegion)?.name}
                        </h4>
                        <button
                          onClick={() => setSelectedRegion(null)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Fermer
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        <span className="text-lg font-bold text-foreground">
                          {regionData.find((r) => r.region === selectedRegion)?.count}
                        </span>
                        <span className="text-xs text-muted-foreground">appels d&apos;offres actifs</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-xs font-semibold text-emerald-600">
                          {regionDetails[selectedRegion]?.trend}
                        </span>
                        <span className="text-xs text-muted-foreground">ce mois</span>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Secteurs principaux</p>
                        {regionDetails[selectedRegion]?.topSectors.map((sector) => (
                          <div key={sector} className="flex items-center gap-2 text-xs text-foreground">
                            <ChevronRight className="h-3 w-3 text-primary" />
                            {sector}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-2 min-h-[120px]"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Search className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">Sélectionnez une région sur la carte pour voir les détails</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>

      {/* ===== Quick Actions Footer ===== */}
      <motion.div
        variants={motionVariants.staggerItem}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {[
          { icon: Zap, title: "Lancer un scan", desc: "Rechercher de nouveaux appels d'offres", color: "bg-blue-500/10 text-blue-600" },
          { icon: Calendar, title: "Planifier une alerte", desc: "Rappels avant les deadlines", color: "bg-amber-500/10 text-amber-600" },
          { icon: Building2, title: "Ajouter un contact", desc: "Enrichir le réseau professionnel", color: "bg-purple-500/10 text-purple-600" },
        ].map((action, i) => (
          <motion.button
            key={action.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.06 }}
            className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors text-left group"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color} shrink-0 group-hover:scale-105 transition-transform`}>
              <action.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{action.title}</p>
              <p className="text-xs text-muted-foreground">{action.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
