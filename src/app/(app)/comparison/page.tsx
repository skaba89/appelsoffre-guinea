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
  strategyLabel,
  statusLabel,
  statusColor,
} from "@/lib/tenderflow-utils";
import { motionVariants, transitions } from "@/lib/design-tokens";
import {
  GitCompareArrows,
  X,
  Plus,
  Trash2,
  Search,
  Clock,
  Target,
  MapPin,
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useComparisonStore } from "@/stores/comparison-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AnimatedCard,
  AnimatedCardContent,
  AnimatedCardHeader,
} from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── Constants ──────────────────────────────────────────────────────────────────

const MAX_ITEMS = 4;

const COMPARISON_ROWS: {
  key: string;
  label: string;
  icon: React.ElementType;
  render: (tender: Tender) => React.ReactNode;
}[] = [
  {
    key: "title",
    label: "Titre",
    icon: FileText,
    render: (t) => (
      <Link href={`/tenders/${t.id}`} className="text-sm font-medium text-primary hover:underline line-clamp-2">
        {t.title}
      </Link>
    ),
  },
  {
    key: "reference",
    label: "Référence",
    icon: FileText,
    render: (t) => <span className="text-sm font-mono text-foreground">{t.reference}</span>,
  },
  {
    key: "sector",
    label: "Secteur",
    icon: Target,
    render: (t) => <Badge variant="secondary" className="text-xs">{t.sector}</Badge>,
  },
  {
    key: "region",
    label: "Région",
    icon: MapPin,
    render: (t) => <span className="text-sm text-foreground">{t.region}</span>,
  },
  {
    key: "budget",
    label: "Budget",
    icon: Target,
    render: (t) => (
      <div className="text-sm">
        <span className="text-foreground font-medium">{formatCurrency(t.budget_max)}</span>
        <span className="text-muted-foreground text-xs block">min: {formatCurrency(t.budget_min)}</span>
      </div>
    ),
  },
  {
    key: "deadline",
    label: "Date limite",
    icon: Clock,
    render: (t) => {
      const d = daysUntil(t.deadline_date);
      const isUrgent = d !== null && d >= 0 && d <= 7;
      return (
        <div className="text-sm">
          <span className={cn("font-medium", isUrgent ? "text-red-600 dark:text-red-400" : "text-foreground")}>
            {formatDate(t.deadline_date)}
          </span>
          {d !== null && d >= 0 && (
            <span className={cn("text-xs block", isUrgent ? "text-red-500" : "text-muted-foreground")}>
              {d}j restant{d !== 1 ? "s" : ""}
            </span>
          )}
          {d !== null && d < 0 && (
            <span className="text-xs block text-muted-foreground">Expiré</span>
          )}
        </div>
      );
    },
  },
  {
    key: "score",
    label: "Score priorité",
    icon: Target,
    render: (t) => {
      const score = (t.priority_score ?? 0) * 100;
      return (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Progress
              value={score}
              className={cn(
                "h-2 flex-1",
                score >= 80 ? "[&>div]:bg-emerald-500" :
                score >= 60 ? "[&>div]:bg-amber-500" :
                "[&>div]:bg-red-500"
              )}
            />
            <span className="text-sm font-bold tabular-nums w-10 text-right text-foreground">
              {score.toFixed(0)}%
            </span>
          </div>
        </div>
      );
    },
  },
  {
    key: "recommendation",
    label: "Recommandation",
    icon: CheckCircle2,
    render: (t) => {
      const variant = t.strategy_recommendation === "go" ? "success" as const
        : t.strategy_recommendation === "go_conditional" ? "warning" as const
        : "destructive" as const;
      return (
        <GradientBadge variant={variant} size="sm">
          {strategyLabel(t.strategy_recommendation)}
        </GradientBadge>
      );
    },
  },
  {
    key: "authority",
    label: "Autorité",
    icon: Building2,
    render: (t) => <span className="text-sm text-muted-foreground line-clamp-2">{t.publishing_authority}</span>,
  },
  {
    key: "type",
    label: "Type",
    icon: FileText,
    render: (t) => (
      <Badge variant="outline" className="text-xs">
        {t.tender_type === "international" ? "International" : "National"}
      </Badge>
    ),
  },
  {
    key: "status",
    label: "Statut",
    icon: AlertTriangle,
    render: (t) => (
      <Badge variant="secondary" className={cn("text-xs", statusColor(t.status))}>
        {statusLabel(t.status)}
      </Badge>
    ),
  },
  {
    key: "compatibility",
    label: "Compatibilité",
    icon: Target,
    render: (t) => {
      const score = (t.compatibility_score ?? 0) * 100;
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className="text-xs font-medium tabular-nums text-foreground">{score.toFixed(0)}%</span>
        </div>
      );
    },
  },
  {
    key: "feasibility",
    label: "Faisabilité",
    icon: Target,
    render: (t) => {
      const score = (t.feasibility_score ?? 0) * 100;
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className="text-xs font-medium tabular-nums text-foreground">{score.toFixed(0)}%</span>
        </div>
      );
    },
  },
  {
    key: "winProbability",
    label: "Probabilité de gain",
    icon: Target,
    render: (t) => {
      const score = (t.win_probability_score ?? 0) * 100;
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                score >= 60 ? "bg-emerald-500" : score >= 35 ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className="text-xs font-medium tabular-nums text-foreground">{score.toFixed(0)}%</span>
        </div>
      );
    },
  },
];

// ─── Add Tender Dialog ──────────────────────────────────────────────────────────

function AddTenderDialog() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { addToComparison, isInComparison, count } = useComparisonStore();

  const availableTenders = useMemo(() => {
    return mockTenders.filter((t) => {
      if (isInComparison(t.id)) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q) ||
          t.sector.toLowerCase().includes(q) ||
          t.publishing_authority.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, isInComparison]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={count >= MAX_ITEMS}
        >
          <Plus className="w-4 h-4" />
          Ajouter un appel d&apos;offres
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter à la comparaison</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre, référence, secteur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <ScrollArea className="h-72">
            <div className="space-y-1">
              {availableTenders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucun appel d&apos;offres disponible
                </p>
              ) : (
                availableTenders.map((tender) => (
                  <button
                    key={tender.id}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent transition-colors group"
                    onClick={() => {
                      addToComparison(tender.id);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary truncate">
                          {tender.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground font-mono">
                            {tender.reference}
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            {tender.sector}
                          </Badge>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <GitCompareArrows className="w-8 h-8 text-muted-foreground/40" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        Aucun appel d&apos;offres à comparer
      </h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-md">
        Ajoutez jusqu&apos;à {MAX_ITEMS} appels d&apos;offres depuis la liste des appels d&apos;offres
        pour les comparer côte à côte.
      </p>
      <Link href="/tenders">
        <Button variant="outline" className="mt-4 gap-1.5">
          Voir les appels d&apos;offres
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </motion.div>
  );
}

// ─── Main Comparison Page ───────────────────────────────────────────────────────

export default function ComparisonPage() {
  const { getComparisonItems, removeFromComparison, clearComparison, count } =
    useComparisonStore();

  const comparisonIds = getComparisonItems();
  const tenders = useMemo(
    () => comparisonIds.map((id) => mockTenders.find((t) => t.id === id)).filter(Boolean) as Tender[],
    [comparisonIds]
  );

  if (tenders.length === 0) {
    return (
      <div className="space-y-6">
        <ComparisonHeader count={0} onClear={clearComparison} />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ComparisonHeader count={count} onClear={clearComparison} />

      {/* ── Comparison Table ──────────────────────────────────────────────── */}
      <motion.div
        variants={motionVariants.fadeInUp}
        initial="hidden"
        animate="visible"
        transition={transitions.normal}
      >
        <AnimatedCard
          variant="outline"
          hoverLift={false}
          tapScale={false}
          className="overflow-hidden"
        >
          {/* Table container with horizontal scroll for many columns */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-border">
                  {/* Row labels column */}
                  <th className="text-left px-4 py-3 w-44 shrink-0 bg-muted/30">
                    <span className="text-xs font-medium text-muted-foreground">
                      Critère
                    </span>
                  </th>
                  {/* Tender columns */}
                  {tenders.map((tender, i) => (
                    <th key={tender.id} className="px-4 py-3 bg-muted/30">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0 text-center">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {tender.reference}
                          </p>
                          <Badge variant="secondary" className="text-[10px] mt-1">
                            {tender.sector}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromComparison(tender.id)}
                          title="Retirer de la comparaison"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </th>
                  ))}
                  {/* Add column */}
                  {tenders.length < MAX_ITEMS && (
                    <th className="px-4 py-3 bg-muted/30 w-20">
                      <AddTenderDialog />
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, rowIdx) => (
                  <tr
                    key={row.key}
                    className={cn(
                      "border-b border-border last:border-0",
                      rowIdx % 2 === 0 ? "bg-background" : "bg-muted/10"
                    )}
                  >
                    {/* Row label */}
                    <td className="px-4 py-3 w-44 shrink-0">
                      <div className="flex items-center gap-2">
                        <row.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs font-medium text-muted-foreground">
                          {row.label}
                        </span>
                      </div>
                    </td>
                    {/* Data cells */}
                    {tenders.map((tender) => (
                      <td key={tender.id} className="px-4 py-3">
                        {row.render(tender)}
                      </td>
                    ))}
                    {/* Add column empty cell */}
                    {tenders.length < MAX_ITEMS && (
                      <td className="px-4 py-3" />
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimatedCard>
      </motion.div>

      {/* ── Quick Comparison Highlights ───────────────────────────────────── */}
      {tenders.length >= 2 && (
        <motion.div
          variants={motionVariants.fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ ...transitions.normal, delay: 0.15 }}
        >
          <AnimatedCard variant="outline" hoverLift={false} tapScale={false}>
            <AnimatedCardHeader>
              <h3 className="text-base font-semibold text-foreground">
                Points forts de la comparaison
              </h3>
              <p className="text-xs text-muted-foreground">
                Analyse rapide des différences clés entre les appels d&apos;offres
              </p>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Best Score */}
                <HighlightCard
                  label="Score le plus élevé"
                  tender={tenders.reduce((best, t) =>
                    (t.priority_score ?? 0) > (best.priority_score ?? 0) ? t : best
                  )}
                  value={((tenders.reduce((best, t) =>
                    (t.priority_score ?? 0) > (best.priority_score ?? 0) ? t : best
                  ).priority_score ?? 0) * 100).toFixed(0) + "%"}
                />
                {/* Biggest Budget */}
                <HighlightCard
                  label="Budget le plus élevé"
                  tender={tenders.reduce((best, t) =>
                    t.budget_max > best.budget_max ? t : best
                  )}
                  value={formatCurrency(tenders.reduce((best, t) =>
                    t.budget_max > best.budget_max ? t : best
                  ).budget_max)}
                />
                {/* Most Urgent */}
                <HighlightCard
                  label="Échéance la plus proche"
                  tender={tenders.reduce((best, t) => {
                    const d1 = daysUntil(t.deadline_date) ?? Infinity;
                    const d2 = daysUntil(best.deadline_date) ?? Infinity;
                    return d1 < d2 ? t : best;
                  })}
                  value={() => {
                    const d = daysUntil(tenders.reduce((best, t) => {
                      const d1 = daysUntil(t.deadline_date) ?? Infinity;
                      const d2 = daysUntil(best.deadline_date) ?? Infinity;
                      return d1 < d2 ? t : best;
                    }).deadline_date);
                    return d !== null ? `${d}j` : "—";
                  }}
                />
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function ComparisonHeader({
  count,
  onClear,
}: {
  count: number;
  onClear: () => void;
}) {
  return (
    <motion.div
      variants={motionVariants.fadeInUp}
      initial="hidden"
      animate="visible"
      transition={transitions.normal}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <GitCompareArrows className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              Comparaison
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {count === 0
              ? "Comparez jusqu'à 4 appels d'offres côte à côte"
              : `${count} appel${count !== 1 ? "s" : ""} d'offres sélectionné${count !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {count > 0 && (
            <>
              <AddTenderDialog />
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-destructive"
                onClick={onClear}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Tout supprimer
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function HighlightCard({
  label,
  tender,
  value,
}: {
  label: string;
  tender: Tender;
  value: string | (() => string);
}) {
  const displayValue = typeof value === "function" ? value() : value;

  return (
    <div className="p-3 rounded-lg border border-border bg-muted/20">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-lg font-bold text-primary">{displayValue}</p>
      <p className="text-xs text-muted-foreground truncate mt-0.5">
        {tender.reference} — {tender.title}
      </p>
    </div>
  );
}
