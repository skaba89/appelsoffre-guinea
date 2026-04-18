"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  List,
  TrendingUp,
  Clock,
  Target,
  Briefcase,
  CalendarDays,
  Building2,
  ChevronRight,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { StatCard } from "@/components/ui/stat-card";
import { motionVariants, transitions } from "@/lib/design-tokens";
import { cn, formatCurrency, formatDate, daysUntil } from "@/lib/tenderflow-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type PipelineStage = "veille" | "qualification" | "redaction" | "soumission" | "resultat";

interface Opportunity {
  id: string;
  title: string;
  organization: string;
  budget: number;
  deadline: string;
  score: number;
  stage: PipelineStage;
  sector: string;
  region: string;
  reference: string;
  contactName: string;
}

// ─── Pipeline Column Config ───────────────────────────────────────────────────

const PIPELINE_COLUMNS: {
  key: PipelineStage;
  label: string;
  color: string;
  bgAccent: string;
  headerBg: string;
}[] = [
  { key: "veille", label: "Veille", color: "text-sky-600 dark:text-sky-400", bgAccent: "bg-sky-500", headerBg: "bg-sky-50 dark:bg-sky-950/40" },
  { key: "qualification", label: "Qualification", color: "text-amber-600 dark:text-amber-400", bgAccent: "bg-amber-500", headerBg: "bg-amber-50 dark:bg-amber-950/40" },
  { key: "redaction", label: "Rédaction", color: "text-violet-600 dark:text-violet-400", bgAccent: "bg-violet-500", headerBg: "bg-violet-50 dark:bg-violet-950/40" },
  { key: "soumission", label: "Soumission", color: "text-orange-600 dark:text-orange-400", bgAccent: "bg-orange-500", headerBg: "bg-orange-50 dark:bg-orange-950/40" },
  { key: "resultat", label: "Résultat", color: "text-emerald-600 dark:text-emerald-400", bgAccent: "bg-emerald-500", headerBg: "bg-emerald-50 dark:bg-emerald-950/40" },
];

// ─── Mock Data: 12+ realistic Guinea tender opportunities ─────────────────────

const opportunities: Opportunity[] = [
  { id: "o-001", title: "Construction pont Kouroussa", organization: "Ministère des Travaux Publics", budget: 20_000_000_000, deadline: "2026-06-15", score: 85, stage: "redaction", sector: "BTP", region: "Kankan", reference: "AO/MTP/2026/0142", contactName: "Abdoulaye Soumah" },
  { id: "o-002", title: "Panneaux solaires centres de santé", organization: "Direction Nationale de l'Énergie", budget: 6_500_000_000, deadline: "2026-05-20", score: 72, stage: "qualification", sector: "Énergie", region: "National", reference: "AO/DNE/2026/0087", contactName: "Fatoumata Binta Bah" },
  { id: "o-003", title: "SIG ressources minières", organization: "SOGUIPAMI", budget: 4_500_000_000, deadline: "2026-05-10", score: 91, stage: "soumission", sector: "IT / Digital", region: "Conakry", reference: "AO/SOGUIPAMI/2026/0023", contactName: "Ibrahima Keita" },
  { id: "o-004", title: "Réseau eau Conakry Phase 2", organization: "Société des Eaux de Guinée", budget: 27_500_000_000, deadline: "2026-07-01", score: 48, stage: "veille", sector: "Eau / Assainissement", region: "Conakry", reference: "AO/SEG/2026/0198", contactName: "Mariama Condé" },
  { id: "o-005", title: "Cybersécurité Administration publique", organization: "AGUIPE", budget: 3_250_000_000, deadline: "2026-05-15", score: 78, stage: "redaction", sector: "IT / Digital", region: "Conakry", reference: "AO/AGUIPE/2026/0019", contactName: "Aissatou Diallo" },
  { id: "o-006", title: "Équipement informatique 200 écoles", organization: "Ministère de l'Éducation", budget: 5_500_000_000, deadline: "2026-05-30", score: 62, stage: "qualification", sector: "Éducation", region: "National", reference: "AO/MEPU/2026/0156", contactName: "Moussa Camara" },
  { id: "o-007", title: "Restructuration ONGUI", organization: "Office National de Gestion Urbaine", budget: 850_000_000, deadline: "2026-04-25", score: 88, stage: "soumission", sector: "Conseil", region: "Conakry", reference: "AO/ONGUI/2026/0012", contactName: "Kadiatou Touré" },
  { id: "o-008", title: "Audit comptes établissements publics", organization: "Ministère des Finances", budget: 1_150_000_000, deadline: "2026-04-28", score: 82, stage: "resultat", sector: "Finance", region: "Conakry", reference: "AO/MF/2026/0034", contactName: "Lamine Fofana" },
  { id: "o-009", title: "Réseau 4G zones rurales", organization: "ARTP", budget: 15_000_000_000, deadline: "2026-05-25", score: 55, stage: "veille", sector: "Télécom", region: "National", reference: "AO/ARTP/2026/0045", contactName: "Oumar Sylla" },
  { id: "o-010", title: "Matériels laboratoire CHU Conakry", organization: "Ministère de la Santé", budget: 2_250_000_000, deadline: "2026-05-05", score: 68, stage: "qualification", sector: "Santé", region: "Conakry", reference: "AO/MS/2026/0078", contactName: "Hawa Dioubaté" },
  { id: "o-011", title: "Route Boké-Kamsar 85km", organization: "Ministère des Travaux Publics", budget: 50_000_000_000, deadline: "2026-06-30", score: 32, stage: "veille", sector: "BTP", region: "Boké", reference: "AO/MTP/2026/0201", contactName: "Abdoulaye Soumah" },
  { id: "o-012", title: "Programme rizicole Guinée Forestière", organization: "Ministère de l'Agriculture", budget: 10_000_000_000, deadline: "2026-06-20", score: 45, stage: "veille", sector: "Agriculture", region: "Nzérékoré", reference: "AO/MA/2026/0067", contactName: "Aminata Sow" },
  { id: "o-013", title: "GMAO SIGG", organization: "Société Interprofessionnelle du Gaz", budget: 800_000_000, deadline: "2026-03-15", score: 95, stage: "resultat", sector: "Industrie", region: "Conakry", reference: "AO/SIGG/2026/0031", contactName: "Boubacar Barry" },
  { id: "o-014", title: "Sécurité bâtiments publics Kankan", organization: "Secrétariat Général du Gouvernement", budget: 2_750_000_000, deadline: "2026-05-12", score: 38, stage: "qualification", sector: "Sécurité", region: "Kankan", reference: "AO/SGG/2026/0089", contactName: "Kadiatou Touré" },
];

// ─── Score badge variant helper ───────────────────────────────────────────────

function scoreBadgeVariant(score: number): "success" | "warning" | "destructive" {
  if (score >= 70) return "success";
  if (score >= 45) return "warning";
  return "destructive";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OpportunitiesPage() {
  const [viewMode, setViewMode] = useState<"kanban" | "liste">("kanban");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return opportunities;
    const q = search.toLowerCase();
    return opportunities.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.organization.toLowerCase().includes(q) ||
        o.sector.toLowerCase().includes(q) ||
        o.reference.toLowerCase().includes(q)
    );
  }, [search]);

  // Stats calculations
  const totalPipeline = filtered.reduce((s, o) => s + o.budget, 0);
  const wonCount = filtered.filter((o) => o.stage === "resultat").length;
  const tauxReussite = filtered.length > 0 ? Math.round((wonCount / filtered.length) * 100) : 0;
  const cycleMoyen = 42; // jours (mock)
  const activeOpps = filtered.filter((o) => o.stage !== "resultat").length;

  const columnData = PIPELINE_COLUMNS.map((col) => {
    const opps = filtered.filter((o) => o.stage === col.key);
    const totalValue = opps.reduce((s, o) => s + o.budget, 0);
    return { ...col, opps, totalValue };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitions.normal}
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Pipeline des opportunités
          </h1>
          <p className="text-muted-foreground mt-1">
            {filtered.length} opportunités en cours ·{" "}
            {formatCurrency(totalPipeline)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-48 h-9"
            />
          </div>
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              className="rounded-none h-8 px-3"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="w-4 h-4 mr-1" /> Kanban
            </Button>
            <Button
              variant={viewMode === "liste" ? "default" : "ghost"}
              size="sm"
              className="rounded-none h-8 px-3"
              onClick={() => setViewMode("liste")}
            >
              <List className="w-4 h-4 mr-1" /> Liste
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={motionVariants.staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={motionVariants.staggerItem}>
          <StatCard
            title="Total pipeline"
            value={totalPipeline / 1_000_000_000}
            suffix="Mrd GNF"
            icon={TrendingUp}
            trend={{ direction: "up", label: "+18%" }}
            sparklineData={[32, 38, 42, 35, 50, 61, 72, 80]}
            delay={0}
          />
        </motion.div>
        <motion.div variants={motionVariants.staggerItem}>
          <StatCard
            title="Taux de réussite"
            value={tauxReussite}
            suffix="%"
            icon={Target}
            trend={{ direction: "up", label: "+5%" }}
            sparklineData={[28, 30, 35, 32, 40, 38, 42, 45]}
            delay={0.06}
          />
        </motion.div>
        <motion.div variants={motionVariants.staggerItem}>
          <StatCard
            title="Cycle moyen"
            value={cycleMoyen}
            suffix="jours"
            icon={Clock}
            trend={{ direction: "down", label: "-3j" }}
            sparklineData={[55, 50, 48, 46, 44, 43, 42, 42]}
            delay={0.12}
          />
        </motion.div>
        <motion.div variants={motionVariants.staggerItem}>
          <StatCard
            title="Opportunités actives"
            value={activeOpps}
            suffix=""
            icon={Briefcase}
            trend={{ direction: "up", label: "+2" }}
            sparklineData={[8, 9, 10, 9, 11, 12, 11, 12]}
            delay={0.18}
          />
        </motion.div>
      </motion.div>

      {/* Kanban View */}
      <AnimatePresence mode="wait">
        {viewMode === "kanban" ? (
          <motion.div
            key="kanban"
            className="flex gap-4 overflow-x-auto pb-4 snap-x"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitions.normal}
          >
            {columnData.map((col, colIdx) => (
              <div
                key={col.key}
                className="min-w-[280px] max-w-[280px] flex-shrink-0 snap-start"
              >
                {/* Column header */}
                <motion.div
                  className={cn(
                    "rounded-t-xl border border-b-0 px-4 py-3",
                    col.headerBg
                  )}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...transitions.normal, delay: colIdx * 0.08 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn("w-2 h-2 rounded-full", col.bgAccent)} />
                    <h3 className={cn("text-sm font-semibold", col.color)}>
                      {col.label}
                    </h3>
                    <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                      {col.opps.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(col.totalValue)}
                  </p>
                </motion.div>

                {/* Cards */}
                <motion.div
                  className="rounded-b-xl border border-t-0 bg-muted/20 p-3 space-y-2 min-h-[200px]"
                  variants={motionVariants.staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {col.opps.map((opp) => (
                    <OppCard key={opp.id} opp={opp} />
                  ))}
                  {col.opps.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-xs text-muted-foreground">
                        Aucune opportunité
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="liste"
            className="rounded-xl border bg-card overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitions.normal}
          >
            {/* Table header */}
            <div className="grid grid-cols-[1fr_140px_120px_90px_80px_80px] gap-2 px-4 py-2.5 border-b bg-muted/30 text-xs font-medium text-muted-foreground">
              <span>Opportunité</span>
              <span className="hidden sm:block">Organisation</span>
              <span className="hidden md:block">Budget</span>
              <span className="hidden lg:block">Échéance</span>
              <span className="text-center">Score</span>
              <span className="text-center">Étape</span>
            </div>
            {/* Table rows */}
            <motion.div
              variants={motionVariants.staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {filtered.map((opp) => {
                const days = daysUntil(opp.deadline);
                const col = PIPELINE_COLUMNS.find((c) => c.key === opp.stage);
                return (
                  <motion.div
                    key={opp.id}
                    variants={motionVariants.staggerItem}
                    className="grid grid-cols-[1fr_140px_120px_90px_80px_80px] gap-2 px-4 py-3 border-b last:border-b-0 hover:bg-accent/30 transition-colors items-center"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {opp.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {opp.reference} · {opp.region}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground truncate hidden sm:block">
                      {opp.organization}
                    </span>
                    <span className="text-sm font-medium text-foreground hidden md:block">
                      {formatCurrency(opp.budget)}
                    </span>
                    <span className="text-sm text-muted-foreground hidden lg:block">
                      {formatDate(opp.deadline)}
                      {days !== null && days <= 15 && days > 0 && (
                        <span className="ml-1 text-destructive text-[11px]">
                          ({days}j)
                        </span>
                      )}
                    </span>
                    <div className="flex justify-center">
                      <GradientBadge
                        variant={scoreBadgeVariant(opp.score)}
                        size="sm"
                      >
                        {opp.score}
                      </GradientBadge>
                    </div>
                    <div className="flex justify-center">
                      {col && (
                        <Badge
                          className={cn(
                            "text-[10px] gap-1 border-0",
                            col.headerBg,
                            col.color
                          )}
                          variant="outline"
                        >
                          {col.label}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Opportunity Card Sub-Component ──────────────────────────────────────────

function OppCard({ opp }: { opp: Opportunity }) {
  const days = daysUntil(opp.deadline);
  const col = PIPELINE_COLUMNS.find((c) => c.key === opp.stage);

  return (
    <motion.div
      variants={motionVariants.staggerItem}
      className={cn(
        "rounded-lg border bg-card p-3 cursor-pointer",
        "hover:shadow-premium-md transition-shadow duration-200"
      )}
      whileHover={{ y: -1, transition: { duration: 0.15 } }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-foreground leading-snug">
          {opp.title}
        </p>
        <GradientBadge
          variant={scoreBadgeVariant(opp.score)}
          size="sm"
        >
          {opp.score}
        </GradientBadge>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
        <Building2 className="w-3 h-3 shrink-0" />
        <span className="truncate">{opp.organization}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          {formatCurrency(opp.budget)}
        </span>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <CalendarDays className="w-3 h-3" />
          {days !== null && days > 0 ? (
            <span className={days <= 15 ? "text-destructive font-medium" : ""}>
              {days}j
            </span>
          ) : (
            <span>{formatDate(opp.deadline)}</span>
          )}
        </div>
      </div>

      {/* Footer: sector + stage indicator */}
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          {opp.sector}
        </Badge>
        <ChevronRight className="w-3 h-3 text-muted-foreground/40 ml-auto" />
      </div>

      {/* Stage color bar */}
      {col && (
        <div className={cn("h-0.5 rounded-full mt-2", col.bgAccent)} />
      )}
    </motion.div>
  );
}
