"use client";

import { useState, useMemo, useEffect } from "react";
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

type PipelineStage = "prospecting" | "qualification" | "proposal" | "negotiation" | "won" | "lost";

interface Opportunity {
  id: string;
  name: string;
  account_id?: string;
  account_name?: string;
  amount: number | null;
  stage: PipelineStage;
  probability: number;
  close_date: string | null;
  currency: string;
  notes?: string;
}

// ─── Pipeline Column Config ───────────────────────────────────────────────────

const PIPELINE_COLUMNS: {
  key: PipelineStage;
  label: string;
  color: string;
  bgAccent: string;
  headerBg: string;
}[] = [
  { key: "prospecting", label: "Prospection", color: "text-sky-600 dark:text-sky-400", bgAccent: "bg-sky-500", headerBg: "bg-sky-50 dark:bg-sky-950/40" },
  { key: "qualification", label: "Qualification", color: "text-amber-600 dark:text-amber-400", bgAccent: "bg-amber-500", headerBg: "bg-amber-50 dark:bg-amber-950/40" },
  { key: "proposal", label: "Proposition", color: "text-violet-600 dark:text-violet-400", bgAccent: "bg-violet-500", headerBg: "bg-violet-50 dark:bg-violet-950/40" },
  { key: "negotiation", label: "Négociation", color: "text-orange-600 dark:text-orange-400", bgAccent: "bg-orange-500", headerBg: "bg-orange-50 dark:bg-orange-950/40" },
  { key: "won", label: "Gagné", color: "text-emerald-600 dark:text-emerald-400", bgAccent: "bg-emerald-500", headerBg: "bg-emerald-50 dark:bg-emerald-950/40" },
  { key: "lost", label: "Perdu", color: "text-red-600 dark:text-red-400", bgAccent: "bg-red-500", headerBg: "bg-red-50 dark:bg-red-950/40" },
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
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  async function fetchOpportunities() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/crm/opportunities?page_size=100");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const list = Array.isArray(data) ? data : data.opportunities || [];
      setOpportunities(list);
    } catch (err: any) {
      console.error("Error fetching opportunities:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return opportunities;
    const q = search.toLowerCase();
    return opportunities.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        (o.account_name || "").toLowerCase().includes(q) ||
        o.stage.toLowerCase().includes(q)
    );
  }, [search, opportunities]);

  // Stats calculations
  const totalPipeline = filtered.reduce((s, o) => s + (o.amount || 0), 0);
  const wonCount = filtered.filter((o) => o.stage === "won").length;
  const tauxReussite = filtered.length > 0 ? Math.round((wonCount / filtered.length) * 100) : 0;
  const cycleMoyen = 42; // jours (mock)
  const activeOpps = filtered.filter((o) => o.stage !== "won" && o.stage !== "lost").length;

  const columnData = PIPELINE_COLUMNS.map((col) => {
    const opps = filtered.filter((o) => o.stage === col.key);
    const totalValue = opps.reduce((s, o) => s + (o.amount || 0), 0);
    return { ...col, opps, totalValue };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Chargement des opportunités...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive font-medium">Erreur : {error}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Vérifiez que le backend FastAPI est bien démarré sur le port 8000.
        </p>
      </div>
    );
  }

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
            {filtered.length} opportunités · {formatCurrency(totalPipeline)}
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
            <div className="grid grid-cols-[1fr_140px_120px_90px_80px] gap-2 px-4 py-2.5 border-b bg-muted/30 text-xs font-medium text-muted-foreground">
              <span>Opportunité</span>
              <span className="hidden sm:block">Organisation</span>
              <span className="hidden md:block">Montant</span>
              <span className="hidden lg:block">Échéance</span>
              <span className="text-center">Probabilité</span>
            </div>
            {/* Table rows */}
            <motion.div
              variants={motionVariants.staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {filtered.map((opp) => {
                const col = PIPELINE_COLUMNS.find((c) => c.key === opp.stage);
                const prob = Math.round(opp.probability * 100);
                return (
                  <motion.div
                    key={opp.id}
                    variants={motionVariants.staggerItem}
                    className="grid grid-cols-[1fr_140px_120px_90px_80px] gap-2 px-4 py-3 border-b last:border-b-0 hover:bg-accent/30 transition-colors items-center"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {opp.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {opp.currency}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground truncate hidden sm:block">
                      {opp.account_name || "—"}
                    </span>
                    <span className="text-sm font-medium text-foreground hidden md:block">
                      {opp.amount ? formatCurrency(opp.amount) : "—"}
                    </span>
                    <span className="text-sm text-muted-foreground hidden lg:block">
                      {opp.close_date ? formatDate(opp.close_date) : "—"}
                    </span>
                    <div className="flex justify-center">
                      <GradientBadge
                        variant={scoreBadgeVariant(prob)}
                        size="sm"
                      >
                        {prob}%
                      </GradientBadge>
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
  const col = PIPELINE_COLUMNS.find((c) => c.key === opp.stage);
  const prob = Math.round(opp.probability * 100);

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
          {opp.name}
        </p>
        <GradientBadge
          variant={scoreBadgeVariant(prob)}
          size="sm"
        >
          {prob}%
        </GradientBadge>
      </div>

      {opp.account_name && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
          <Building2 className="w-3 h-3 shrink-0" />
          <span className="truncate">{opp.account_name}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          {opp.amount ? formatCurrency(opp.amount) : "—"}
        </span>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <CalendarDays className="w-3 h-3" />
          {opp.close_date ? formatDate(opp.close_date) : "—"}
        </div>
      </div>

      {/* Footer: stage indicator */}
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          {opp.currency}
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
