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
} from "@/lib/tenderflow-utils";
import { motionVariants, transitions } from "@/lib/design-tokens";
import { motion, AnimatePresence } from "framer-motion";
import { useFavoritesStore } from "@/stores/favorites-store";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { Button } from "@/components/ui/button";
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
import {
  Heart,
  Search,
  ArrowUpDown,
  FileText,
  Clock,
  Target,
  MapPin,
  Building2,
  Zap,
  TrendingUp,
  BookOpen,
} from "lucide-react";

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
  if (d < 0) return { days: d, label: "Expiré", urgency: "expired" };
  if (d <= 7) return { days: d, label: `${d}j`, urgency: "critical" };
  if (d <= 21) return { days: d, label: `${d}j`, urgency: "warning" };
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

const SORT_OPTIONS = [
  { value: "added-desc", label: "Récemment ajouté" },
  { value: "added-asc", label: "Premier ajouté" },
  { value: "deadline-asc", label: "Échéance proche" },
  { value: "deadline-desc", label: "Échéance lointaine" },
  { value: "score-desc", label: "Score ↓" },
  { value: "score-asc", label: "Score ↑" },
];

export default function FavoritesPage() {
  const { favorites, removeFavorite, getFavoriteCount } = useFavoritesStore();
  const [sortValue, setSortValue] = useState("added-desc");
  const [search, setSearch] = useState("");

  // Get favorited tenders from mock data
  const favoriteTenders = useMemo(() => {
    const tenders = mockTenders.filter((t) => favorites.includes(t.id));

    // Search
    let result = tenders;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q) ||
          t.publishing_authority.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortValue) {
        case "deadline-asc":
          return a.deadline_date.localeCompare(b.deadline_date);
        case "deadline-desc":
          return b.deadline_date.localeCompare(a.deadline_date);
        case "score-desc":
          return (b.priority_score ?? 0) - (a.priority_score ?? 0);
        case "score-asc":
          return (a.priority_score ?? 0) - (b.priority_score ?? 0);
        case "added-asc": {
          const aIdx = favorites.indexOf(a.id);
          const bIdx = favorites.indexOf(b.id);
          return aIdx - bIdx;
        }
        case "added-desc":
        default: {
          const aIdx2 = favorites.indexOf(a.id);
          const bIdx2 = favorites.indexOf(b.id);
          return bIdx2 - aIdx2;
        }
      }
    });

    return result;
  }, [favorites, sortValue, search]);

  // Empty state
  if (favorites.length === 0) {
    return (
      <motion.div
        variants={motionVariants.fadeInUp}
        initial="hidden"
        animate="visible"
        transition={transitions.normal}
        className="space-y-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Favoris</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Vos appels d&apos;offres sauvegardés
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Aucun favori pour le moment
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-md">
            Parcourez les appels d&apos;offres et cliquez sur le cœur pour
            sauvegarder ceux qui vous intéressent.
          </p>
          <Link href="/tenders">
            <Button className="mt-4 gap-2">
              <BookOpen className="w-4 h-4" />
              Parcourir les appels d&apos;offres
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        variants={motionVariants.fadeInUp}
        initial="hidden"
        animate="visible"
        transition={transitions.normal}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Favoris</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {getFavoriteCount()} appel{getFavoriteCount() !== 1 ? "s" : ""} d&apos;offres sauvegardé{getFavoriteCount() !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Top bar: Search + Sort */}
      <motion.div
        variants={motionVariants.fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ ...transitions.normal, delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Rechercher dans vos favoris..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-10 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <Select value={sortValue} onValueChange={setSortValue}>
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
      </motion.div>

      {/* Favorites grid */}
      {favoriteTenders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/20" />
          <h3 className="mt-3 text-sm font-semibold text-foreground">
            Aucun résultat
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Essayez de modifier votre recherche
          </p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          variants={motionVariants.staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {favoriteTenders.map((tender) => (
              <FavoriteTenderCard key={tender.id} tender={tender} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function FavoriteTenderCard({ tender }: { tender: Tender }) {
  const countdown = deadlineCountdown(tender.deadline_date);

  return (
    <motion.div
      variants={motionVariants.staggerItem}
      layout
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
    >
      <div className="relative">
        <Link href={`/tenders/${tender.id}`} className="block h-full">
          <AnimatedCard
            variant="elevated"
            className="h-full relative overflow-hidden py-0 cursor-pointer"
          >
            {/* Favorite button — top right */}
            <div className="absolute top-3 right-3 z-10">
              <FavoriteButton tenderId={tender.id} size="sm" />
            </div>

            {/* Score badge — top left */}
            <div className="absolute top-3 left-3 z-10">
              <ScoreGauge
                value={(tender.priority_score ?? 0) * 100}
                size="sm"
                suffix="%"
                showValue={true}
                delay={0.1}
              />
            </div>

            <AnimatedCardHeader className="pt-16 pb-0">
              <div className="flex items-start gap-2 mb-1">
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {tender.sector}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
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
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground">Date limite :</span>
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

              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground">Budget :</span>
                <span className="text-xs font-medium text-foreground truncate">
                  {formatCurrency(tender.budget_min)} — {formatCurrency(tender.budget_max)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-foreground">{tender.region}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground truncate">
                  {tender.publishing_authority}
                </span>
              </div>

              <Separator className="my-1" />

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
      </div>
    </motion.div>
  );
}
