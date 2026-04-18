"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { mockTenders } from "@/lib/mock-data";
import type { Tender } from "@/lib/mock-data";
import {
  cn,
  formatCurrency,
  formatDate,
  daysUntil,
  strategyColor,
  strategyLabel,
  statusColor,
  statusLabel,
  SECTORS,
  REGIONS,
} from "@/lib/tenderflow-utils";
import { motionVariants, transitions } from "@/lib/design-tokens";
import {
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Building2,
  Clock,
  ArrowUpDown,
  X,
  FileText,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AnimatedCard,
  AnimatedCardContent,
  AnimatedCardHeader,
} from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { ScoreGauge } from "@/components/ui/score-gauge";
import { Separator } from "@/components/ui/separator";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

const STATUS_OPTIONS = [
  { value: "new", label: "Nouveau" },
  { value: "qualifying", label: "Qualification" },
  { value: "qualified", label: "Qualifié" },
  { value: "go", label: "GO" },
  { value: "no_go", label: "NO GO" },
  { value: "responding", label: "En réponse" },
  { value: "won", label: "Gagné" },
  { value: "expired", label: "Expiré" },
];

const STRATEGY_OPTIONS = [
  { value: "go", label: "GO" },
  { value: "go_conditional", label: "GO sous conditions" },
  { value: "no_go", label: "NO GO" },
];

const SORT_OPTIONS = [
  { value: "created_at-desc", label: "Plus récents" },
  { value: "created_at-asc", label: "Plus anciens" },
  { value: "priority_score-desc", label: "Score priorité ↓" },
  { value: "priority_score-asc", label: "Score priorité ↑" },
  { value: "deadline_date-asc", label: "Échéance proche" },
  { value: "deadline_date-desc", label: "Échéance lointaine" },
  { value: "budget_max-desc", label: "Budget ↓" },
  { value: "budget_max-asc", label: "Budget ↑" },
  { value: "title-asc", label: "Titre A→Z" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function strategyBadgeVariant(
  strategy: string
): "success" | "warning" | "destructive" {
  switch (strategy) {
    case "go":
      return "success";
    case "go_conditional":
      return "warning";
    case "no_go":
      return "destructive";
    default:
      return "warning";
  }
}

function deadlineCountdown(deadline: string): {
  days: number | null;
  label: string;
  urgency: "expired" | "critical" | "warning" | "normal";
} {
  const d = daysUntil(deadline);
  if (d === null) return { days: null, label: "—", urgency: "normal" };
  if (d < 0)
    return { days: d, label: "Expiré", urgency: "expired" };
  if (d <= 7)
    return { days: d, label: `${d}j`, urgency: "critical" };
  if (d <= 21)
    return { days: d, label: `${d}j`, urgency: "warning" };
  return { days: d, label: `${d}j`, urgency: "normal" };
}

function urgencyColor(urgency: string): string {
  switch (urgency) {
    case "expired":
      return "text-muted-foreground";
    case "critical":
      return "text-red-600 dark:text-red-400";
    case "warning":
      return "text-amber-600 dark:text-amber-400";
    default:
      return "text-muted-foreground";
  }
}

// ─── Tender Card (Grid View) ──────────────────────────────────────────────────

function TenderGridCard({ tender }: { tender: Tender }) {
  const countdown = deadlineCountdown(tender.deadline_date);

  return (
    <Link href={`/tenders/${tender.id}`} className="block h-full">
      <AnimatedCard
        variant="elevated"
        className="h-full relative overflow-hidden py-0 cursor-pointer"
      >
        {/* Score badge — top right */}
        <div className="absolute top-3 right-3 z-10">
          <ScoreGauge
            value={(tender.priority_score ?? 0) * 100}
            size="sm"
            suffix="%"
            showValue={true}
            delay={0.1}
          />
        </div>

        <AnimatedCardHeader className="pt-4 pb-0 pr-20">
          <div className="flex items-start gap-2 mb-1">
            <Badge variant="secondary" className="text-[10px] shrink-0">
              {tender.sector}
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px]"
            >
              {tender.tender_type === "international" ? "International" : "National"}
            </Badge>
          </div>
          <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 mt-1">
            {tender.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            {tender.reference}
          </p>
        </AnimatedCardHeader>

        <AnimatedCardContent className="pt-2 pb-4 space-y-3">
          {/* Deadline countdown */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">
              Date limite :
            </span>
            <span
              className={cn(
                "text-xs font-semibold",
                urgencyColor(countdown.urgency)
              )}
            >
              {formatDate(tender.deadline_date)}{" "}
              {countdown.days !== null && countdown.days >= 0 && (
                <span className="ml-1">
                  ({countdown.label} restant{countdown.days !== 1 ? "s" : ""})
                </span>
              )}
            </span>
          </div>

          {/* Budget */}
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">Budget :</span>
            <span className="text-xs font-medium text-foreground truncate">
              {formatCurrency(tender.budget_min)} — {formatCurrency(tender.budget_max)}
            </span>
          </div>

          {/* Region */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-foreground">{tender.region}</span>
          </div>

          {/* Authority */}
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {tender.publishing_authority}
            </span>
          </div>

          <Separator className="my-1" />

          {/* Bottom: status + GO/NO-GO */}
          <div className="flex items-center justify-between gap-2">
            <Badge
              className={cn("text-[10px]", statusColor(tender.status))}
              variant="secondary"
            >
              {statusLabel(tender.status)}
            </Badge>
            <GradientBadge
              variant={strategyBadgeVariant(tender.strategy_recommendation)}
              size="sm"
              animated
            >
              {tender.strategy_recommendation === "go" && (
                <Zap className="w-3 h-3" />
              )}
              {tender.strategy_recommendation === "go_conditional" && (
                <TrendingUp className="w-3 h-3" />
              )}
              {strategyLabel(tender.strategy_recommendation)}
            </GradientBadge>
          </div>
        </AnimatedCardContent>
      </AnimatedCard>
    </Link>
  );
}

// ─── Tender Row (List View) ───────────────────────────────────────────────────

function TenderListRow({ tender }: { tender: Tender }) {
  const countdown = deadlineCountdown(tender.deadline_date);

  return (
    <Link href={`/tenders/${tender.id}`} className="block">
      <motion.div
        className="group grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-3 border-b border-border hover:bg-accent/30 transition-colors"
        variants={motionVariants.staggerItem}
      >
        {/* Title + ref */}
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
            {tender.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground font-mono">
              {tender.reference}
            </span>
            <Badge variant="secondary" className="text-[10px] shrink-0">
              {tender.sector}
            </Badge>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {tender.region}
            </span>
          </div>
        </div>

        {/* Budget */}
        <div className="text-right hidden md:block">
          <p className="text-xs font-medium text-foreground">
            {formatCurrency(tender.budget_max)}
          </p>
          <p className="text-[10px] text-muted-foreground">budget max</p>
        </div>

        {/* Deadline */}
        <div className="text-right hidden sm:block">
          <p
            className={cn(
              "text-xs font-semibold",
              urgencyColor(countdown.urgency)
            )}
          >
            {countdown.days !== null && countdown.days >= 0
              ? `${countdown.label}`
              : "Expiré"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {formatDate(tender.deadline_date)}
          </p>
        </div>

        {/* Score */}
        <div className="flex items-center gap-1.5 hidden lg:flex">
          <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(tender.priority_score ?? 0) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">
            {((tender.priority_score ?? 0) * 100).toFixed(0)}%
          </span>
        </div>

        {/* GO/NO-GO */}
        <div className="shrink-0">
          <GradientBadge
            variant={strategyBadgeVariant(tender.strategy_recommendation)}
            size="sm"
          >
            {strategyLabel(tender.strategy_recommendation)}
          </GradientBadge>
        </div>
      </motion.div>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TendersPage() {
  // View & search state
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortValue, setSortValue] = useState("created_at-desc");

  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [sectorFilter, setSectorFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [strategyFilter, setStrategyFilter] = useState("all");
  const [scoreMin, setScoreMin] = useState("0");
  const [deadlineFilter, setDeadlineFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);

  // Parse sort
  const [sortField, sortDir] = sortValue.split("-") as [string, "asc" | "desc"];

  // ── Filtering ─────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = [...mockTenders];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q) ||
          t.publishing_authority.toLowerCase().includes(q) ||
          t.sector.toLowerCase().includes(q)
      );
    }

    // Sector
    if (sectorFilter !== "all")
      result = result.filter((t) => t.sector === sectorFilter);

    // Region
    if (regionFilter !== "all")
      result = result.filter((t) => t.region === regionFilter);

    // Status
    if (statusFilter !== "all")
      result = result.filter((t) => t.status === statusFilter);

    // Strategy
    if (strategyFilter !== "all")
      result = result.filter((t) => t.strategy_recommendation === strategyFilter);

    // Score minimum
    const minScore = parseInt(scoreMin) || 0;
    if (minScore > 0) {
      result = result.filter(
        (t) => (t.priority_score ?? 0) * 100 >= minScore
      );
    }

    // Deadline
    if (deadlineFilter !== "all") {
      result = result.filter((t) => {
        const d = daysUntil(t.deadline_date);
        if (d === null) return false;
        switch (deadlineFilter) {
          case "expired":
            return d < 0;
          case "7days":
            return d >= 0 && d <= 7;
          case "30days":
            return d > 7 && d <= 30;
          case "60days":
            return d > 30 && d <= 60;
          case "60plus":
            return d > 60;
          default:
            return true;
        }
      });
    }

    // Budget
    if (budgetFilter !== "all") {
      result = result.filter((t) => {
        const avg = (t.budget_min + t.budget_max) / 2;
        switch (budgetFilter) {
          case "small":
            return avg < 2_000_000_000;
          case "medium":
            return avg >= 2_000_000_000 && avg < 10_000_000_000;
          case "large":
            return avg >= 10_000_000_000 && avg < 30_000_000_000;
          case "very_large":
            return avg >= 30_000_000_000;
          default:
            return true;
        }
      });
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      switch (sortField) {
        case "title":
          aVal = a.title;
          bVal = b.title;
          break;
        case "deadline_date":
          aVal = a.deadline_date;
          bVal = b.deadline_date;
          break;
        case "priority_score":
          aVal = a.priority_score ?? 0;
          bVal = b.priority_score ?? 0;
          break;
        case "budget_max":
          aVal = a.budget_max;
          bVal = b.budget_max;
          break;
        default:
          aVal = a.created_at;
          bVal = b.created_at;
      }
      if (typeof aVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }
      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return result;
  }, [
    search,
    sectorFilter,
    regionFilter,
    statusFilter,
    strategyFilter,
    scoreMin,
    deadlineFilter,
    budgetFilter,
    sortField,
    sortDir,
  ]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeFilterCount = [
    sectorFilter !== "all",
    regionFilter !== "all",
    statusFilter !== "all",
    strategyFilter !== "all",
    parseInt(scoreMin) > 0,
    deadlineFilter !== "all",
    budgetFilter !== "all",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSectorFilter("all");
    setRegionFilter("all");
    setStatusFilter("all");
    setStrategyFilter("all");
    setScoreMin("0");
    setDeadlineFilter("all");
    setBudgetFilter("all");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.div
        variants={motionVariants.fadeInUp}
        initial="hidden"
        animate="visible"
        transition={transitions.normal}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Appels d&apos;offres
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filtered.length} appel{filtered.length !== 1 ? "s" : ""} d&apos;offres
              trouvé{filtered.length !== 1 ? "s" : ""}
              {activeFilterCount > 0 && (
                <span>
                  {" "}
                  · {activeFilterCount} filtre{activeFilterCount !== 1 ? "s" : ""} actif{activeFilterCount !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Top Bar: Search + View Toggle + Sort ──────────────────────────── */}
      <motion.div
        variants={motionVariants.fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ ...transitions.normal, delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre, référence, autorité ou secteur..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={view === "grid" ? "default" : "ghost"}
            size="sm"
            className="h-8 px-2.5"
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="sm"
            className="h-8 px-2.5"
            onClick={() => setView("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        {/* Sort dropdown */}
        <Select
          value={sortValue}
          onValueChange={(v) => {
            setSortValue(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filter toggle */}
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          className="h-9 gap-1.5 shrink-0"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtres
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
            >
              {activeFilterCount}
            </Badge>
          )}
          {showFilters ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </Button>
      </motion.div>

      {/* ── Advanced Filter Panel (Collapsible) ───────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <AnimatedCard
              variant="outline"
              hoverLift={false}
              tapScale={false}
              className="py-0"
            >
              <AnimatedCardContent className="py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Sector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Secteur
                    </label>
                    <Select
                      value={sectorFilter}
                      onValueChange={(v) => {
                        setSectorFilter(v);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les secteurs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les secteurs</SelectItem>
                        {SECTORS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Region */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Région
                    </label>
                    <Select
                      value={regionFilter}
                      onValueChange={(v) => {
                        setRegionFilter(v);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les régions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les régions</SelectItem>
                        {REGIONS.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Statut
                    </label>
                    <Select
                      value={statusFilter}
                      onValueChange={(v) => {
                        setStatusFilter(v);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les statuts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Strategy (GO/NO-GO) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Recommandation
                    </label>
                    <Select
                      value={strategyFilter}
                      onValueChange={(v) => {
                        setStrategyFilter(v);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les recommandations</SelectItem>
                        {STRATEGY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Score range */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Score minimum (%)
                    </label>
                    <Select
                      value={scoreMin}
                      onValueChange={(v) => {
                        setScoreMin(v);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les scores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Tous les scores</SelectItem>
                        <SelectItem value="50">≥ 50%</SelectItem>
                        <SelectItem value="60">≥ 60%</SelectItem>
                        <SelectItem value="70">≥ 70%</SelectItem>
                        <SelectItem value="80">≥ 80%</SelectItem>
                        <SelectItem value="90">≥ 90%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Deadline filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Délai d&apos;échéance
                    </label>
                    <Select
                      value={deadlineFilter}
                      onValueChange={(v) => {
                        setDeadlineFilter(v);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les délais" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les délais</SelectItem>
                        <SelectItem value="7days">7 jours ou moins</SelectItem>
                        <SelectItem value="30days">8 — 30 jours</SelectItem>
                        <SelectItem value="60days">31 — 60 jours</SelectItem>
                        <SelectItem value="60plus">Plus de 60 jours</SelectItem>
                        <SelectItem value="expired">Expirés</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Budget filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Budget moyen
                    </label>
                    <Select
                      value={budgetFilter}
                      onValueChange={(v) => {
                        setBudgetFilter(v);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les budgets" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les budgets</SelectItem>
                        <SelectItem value="small">&lt; 2 Mrd GNF</SelectItem>
                        <SelectItem value="medium">2 — 10 Mrd GNF</SelectItem>
                        <SelectItem value="large">10 — 30 Mrd GNF</SelectItem>
                        <SelectItem value="very_large">&gt; 30 Mrd GNF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reset */}
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-muted-foreground"
                      onClick={resetFilters}
                      disabled={activeFilterCount === 0}
                    >
                      <X className="w-3.5 h-3.5" />
                      Réinitialiser les filtres
                    </Button>
                  </div>
                </div>
              </AnimatedCardContent>
            </AnimatedCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active Filters Chips ────────────────────────────────────────────── */}
      {activeFilterCount > 0 && !showFilters && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-2"
        >
          {sectorFilter !== "all" && (
            <FilterChip
              label={`Secteur: ${sectorFilter}`}
              onRemove={() => {
                setSectorFilter("all");
                setPage(1);
              }}
            />
          )}
          {regionFilter !== "all" && (
            <FilterChip
              label={`Région: ${regionFilter}`}
              onRemove={() => {
                setRegionFilter("all");
                setPage(1);
              }}
            />
          )}
          {statusFilter !== "all" && (
            <FilterChip
              label={`Statut: ${statusLabel(statusFilter)}`}
              onRemove={() => {
                setStatusFilter("all");
                setPage(1);
              }}
            />
          )}
          {strategyFilter !== "all" && (
            <FilterChip
              label={`Recommandation: ${strategyLabel(strategyFilter)}`}
              onRemove={() => {
                setStrategyFilter("all");
                setPage(1);
              }}
            />
          )}
          {parseInt(scoreMin) > 0 && (
            <FilterChip
              label={`Score ≥ ${scoreMin}%`}
              onRemove={() => {
                setScoreMin("0");
                setPage(1);
              }}
            />
          )}
          {deadlineFilter !== "all" && (
            <FilterChip
              label={`Délai: ${
                deadlineFilter === "7days"
                  ? "≤ 7j"
                  : deadlineFilter === "30days"
                    ? "8-30j"
                    : deadlineFilter === "60days"
                      ? "31-60j"
                      : deadlineFilter === "60plus"
                        ? "+60j"
                        : "Expirés"
              }`}
              onRemove={() => {
                setDeadlineFilter("all");
                setPage(1);
              }}
            />
          )}
          {budgetFilter !== "all" && (
            <FilterChip
              label={`Budget: ${
                budgetFilter === "small"
                  ? "< 2 Mrd"
                  : budgetFilter === "medium"
                    ? "2-10 Mrd"
                    : budgetFilter === "large"
                      ? "10-30 Mrd"
                      : "> 30 Mrd"
              }`}
              onRemove={() => {
                setBudgetFilter("all");
                setPage(1);
              }}
            />
          )}
        </motion.div>
      )}

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {paginated.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <FileText className="w-16 h-16 text-muted-foreground/20" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            Aucun appel d&apos;offres trouvé
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-md">
            Aucun résultat ne correspond à vos critères de recherche. Essayez de
            modifier vos filtres ou votre recherche.
          </p>
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={resetFilters}
            >
              Réinitialiser les filtres
            </Button>
          )}
        </motion.div>
      ) : view === "grid" ? (
        /* ── Grid View ────────────────────────────────────────────────────── */
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          variants={motionVariants.staggerContainer}
          initial="hidden"
          animate="visible"
          key={`grid-${page}`}
        >
          {paginated.map((tender) => (
            <motion.div key={tender.id} variants={motionVariants.staggerItem}>
              <TenderGridCard tender={tender} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        /* ── List View ────────────────────────────────────────────────────── */
        <motion.div
          className="border border-border rounded-xl overflow-hidden"
          variants={motionVariants.staggerContainer}
          initial="hidden"
          animate="visible"
          key={`list-${page}`}
        >
          {/* List header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-2.5 bg-muted/50 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">
              Appel d&apos;offres
            </span>
            <span className="text-xs font-medium text-muted-foreground hidden md:block">
              Budget
            </span>
            <span className="text-xs font-medium text-muted-foreground hidden sm:block">
              Échéance
            </span>
            <span className="text-xs font-medium text-muted-foreground hidden lg:block">
              Score
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Décision
            </span>
          </div>

          {/* List rows */}
          {paginated.map((tender) => (
            <TenderListRow key={tender.id} tender={tender} />
          ))}
        </motion.div>
      )}

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <p className="text-sm text-muted-foreground">
            {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} sur{" "}
            {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                // Show first, last, and pages around current
                return p === 1 || p === totalPages || Math.abs(p - page) <= 1;
              })
              .map((p, i, arr) => {
                // Add ellipsis
                const showEllipsis = i > 0 && arr[i - 1] !== p - 1;
                return (
                  <span key={p} className="flex items-center gap-1">
                    {showEllipsis && (
                      <span className="text-muted-foreground text-xs px-1">…</span>
                    )}
                    <Button
                      variant={p === page ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8 text-xs"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  </span>
                );
              })}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
