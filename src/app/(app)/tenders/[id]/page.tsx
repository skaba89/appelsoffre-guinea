"use client";

import { use, useState } from "react";
import Link from "next/link";
import { mockTenders } from "@/lib/mock-data";
import {
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  daysUntil,
  strategyColor,
  strategyLabel,
  statusColor,
  statusLabel,
} from "@/lib/tenderflow-utils";
import { motionVariants, transitions } from "@/lib/design-tokens";
import type { TenderInput } from "@/lib/scoring-engine";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Building2,
  MapPin,
  FileText,
  Target,
  CheckCircle,
  TrendingUp,
  Upload,
  Download,
  Clock,
  History,
  Zap,
  AlertCircle,
  CheckCircle2,
  CircleDot,
  User,
  Edit3,
  Eye,
  Shield,
  Globe,
  Banknote,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  AnimatedCard,
  AnimatedCardContent,
  AnimatedCardHeader,
} from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { ScoreGauge } from "@/components/ui/score-gauge";
import { ScoringTab } from "./scoring-tab";
import { FavoriteButton } from "@/components/ui/favorite-button";

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { value: "overview", label: "Vue d'ensemble", icon: Eye },
  { value: "scoring", label: "Scoring IA", icon: Target },
  { value: "documents", label: "Documents", icon: FileText },
  { value: "history", label: "Historique", icon: History },
] as const;

type TabValue = (typeof TABS)[number]["value"];

// ─── Strategy badge variant ──────────────────────────────────────────────────

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

// ─── Mock documents ───────────────────────────────────────────────────────────

const MOCK_DOCUMENTS = [
  {
    id: "d-001",
    name: "Avis d'appel d'offres",
    size: "2.4 MB",
    type: "PDF",
    uploadedAt: "2026-04-10T10:00:00Z",
    uploadedBy: "Système",
  },
  {
    id: "d-002",
    name: "Cahier des clauses techniques",
    size: "5.1 MB",
    type: "PDF",
    uploadedAt: "2026-04-10T10:00:00Z",
    uploadedBy: "Système",
  },
  {
    id: "d-003",
    name: "Règlement de consultation",
    size: "1.8 MB",
    type: "PDF",
    uploadedAt: "2026-04-10T10:00:00Z",
    uploadedBy: "Système",
  },
  {
    id: "d-004",
    name: "Annexe — Plans et schémas",
    size: "12.3 MB",
    type: "ZIP",
    uploadedAt: "2026-04-11T14:30:00Z",
    uploadedBy: "Ibrahima Keita",
  },
  {
    id: "d-005",
    name: "Formulaire de soumission",
    size: "0.8 MB",
    type: "DOCX",
    uploadedAt: "2026-04-12T09:00:00Z",
    uploadedBy: "Système",
  },
];

// ─── Mock history ─────────────────────────────────────────────────────────────

const MOCK_HISTORY = [
  {
    id: "h-001",
    action: "Appel d'offres détecté et importé",
    description:
      "L'appel d'offres a été détecté automatiquement depuis le portail des marchés publics.",
    timestamp: "2026-04-09T14:00:00Z",
    icon: Globe,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    id: "h-002",
    action: "Scoring IA initial effectué",
    description:
      "Le moteur de scoring a évalué l'appel d'offres avec un score composite initial.",
    timestamp: "2026-04-09T14:05:00Z",
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "h-003",
    action: "Recommandation GO émise",
    description:
      "Basé sur le score composite et l'analyse des risques, une recommandation GO a été émise.",
    timestamp: "2026-04-09T14:10:00Z",
    icon: Zap,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  {
    id: "h-004",
    action: "Documents téléchargés",
    description:
      "5 documents ont été téléchargés et indexés (avis, CCT, RC, annexes, formulaire).",
    timestamp: "2026-04-11T14:30:00Z",
    icon: FileText,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  {
    id: "h-005",
    action: "Statut mis à jour : Qualification",
    description:
      "Le statut de l'appel d'offres a été mis à jour suite à l'analyse préliminaire.",
    timestamp: "2026-04-12T10:00:00Z",
    icon: CheckCircle2,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    id: "h-006",
    action: "Note ajoutée par l'équipe",
    description:
      'Un membre de l\'équipe a ajouté une note : "Vérifier les exigences de certification ISO 9001".',
    timestamp: "2026-04-13T09:30:00Z",
    icon: Edit3,
    color: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-100 dark:bg-sky-900/30",
  },
  {
    id: "h-007",
    action: "Score mis à jour",
    description:
      "Le score de priorité a été réévalué suite à de nouvelles informations sur la concurrence.",
    timestamp: "2026-04-14T16:00:00Z",
    icon: TrendingUp,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
];

// ─── Mock requirements ────────────────────────────────────────────────────────

const MOCK_REQUIREMENTS = [
  "Expérience minimale de 10 ans dans des projets similaires",
  "Chiffre d'affaires minimum : 5 milliards GNF/an",
  "Certification ISO 9001 ou équivalente requise",
  "Au moins 3 références de projets de même envergure",
  "Présence locale ou partenaire local en Guinée",
  "Capacité de financement : cautionnement de 3% du montant estimé",
  "Personnel clé : ingénieur en chef + chef de projet certifié",
  "Plan de gestion environnementale et sociale obligatoire",
];

// ─── Detail Item ──────────────────────────────────────────────────────────────

function DetailItem({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          highlight
            ? "bg-red-100 dark:bg-red-900/30"
            : "bg-muted"
        )}
      >
        <Icon
          className={cn(
            "w-4 h-4",
            highlight ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
          )}
        />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={cn(
            "text-sm font-medium",
            highlight ? "text-red-600 dark:text-red-400" : "text-foreground"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TenderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const tender = mockTenders.find((t) => t.id === id);
  const [activeTab, setActiveTab] = useState<TabValue>("overview");

  if (!tender) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText className="w-16 h-16 text-muted-foreground/30" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Appel d&apos;offres introuvable
        </h2>
        <Link href="/tenders" className="mt-2 text-primary hover:underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const dl = daysUntil(tender.deadline_date);

  const scores = [
    { label: "Priorité", value: tender.priority_score, icon: Target, color: "text-blue-600 dark:text-blue-400" },
    { label: "Compatibilité", value: tender.compatibility_score, icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Faisabilité", value: tender.feasibility_score, icon: TrendingUp, color: "text-purple-600 dark:text-purple-400" },
    { label: "Probabilité de gain", value: tender.win_probability_score, icon: TrendingUp, color: "text-amber-600 dark:text-amber-400" },
  ];

  const tenderInput: TenderInput = {
    id: tender.id,
    sector: tender.sector,
    region: tender.region,
    tenderType: tender.tender_type,
    deadlineDate: tender.deadline_date,
    budgetMin: tender.budget_min,
    budgetMax: tender.budget_max,
    publishingAuthority: tender.publishing_authority,
    priorityScore: tender.priority_score,
    compatibilityScore: tender.compatibility_score,
    feasibilityScore: tender.feasibility_score,
    winProbabilityScore: tender.win_probability_score,
    strategyRecommendation: tender.strategy_recommendation,
  };

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <motion.div
        variants={motionVariants.fadeInUp}
        initial="hidden"
        animate="visible"
        transition={transitions.normal}
      >
        <div className="flex items-start gap-3">
          <Link href="/tenders">
            <Button variant="ghost" size="icon" className="shrink-0 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>

          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <GradientBadge
                variant={strategyBadgeVariant(tender.strategy_recommendation)}
                size="lg"
                animated
                pulse
              >
                {tender.strategy_recommendation === "go" && (
                  <Zap className="w-4 h-4" />
                )}
                {tender.strategy_recommendation === "go_conditional" && (
                  <TrendingUp className="w-4 h-4" />
                )}
                {tender.strategy_recommendation === "no_go" && (
                  <AlertCircle className="w-4 h-4" />
                )}
                {strategyLabel(tender.strategy_recommendation)}
              </GradientBadge>
              <Badge
                className={cn(statusColor(tender.status))}
                variant="secondary"
              >
                {statusLabel(tender.status)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {tender.tender_type === "international"
                  ? "International"
                  : "National"}
              </Badge>
            </div>

            {/* Title + reference */}
            <h1 className="text-xl font-bold text-foreground leading-snug">
              {tender.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {tender.reference} — {tender.publishing_authority}
            </p>
          </div>

          {/* Score gauge */}
          <div className="hidden sm:flex shrink-0">
            <ScoreGauge
              value={(tender.priority_score ?? 0) * 100}
              size="md"
              suffix="/100"
              label="Score de priorité"
              delay={0.2}
            />
          </div>

          {/* Favorite button */}
          <FavoriteButton tenderId={tender.id} size="lg" />

          {/* Source link */}
          <Button variant="outline" className="shrink-0 gap-2" asChild>
            <a
              href={tender.source_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4" /> Source
            </a>
          </Button>
        </div>
      </motion.div>

      {/* ── Tab Navigation ─────────────────────────────────────────────────── */}
      <motion.div
        variants={motionVariants.fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ ...transitions.normal, delay: 0.1 }}
      >
        <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Tab Content ────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transitions.normal}
          >
            <OverviewTab
              tender={tender}
              dl={dl}
              scores={scores}
            />
          </motion.div>
        )}

        {activeTab === "scoring" && (
          <motion.div
            key="scoring"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transitions.normal}
          >
            <ScoringTab tender={tenderInput} />
          </motion.div>
        )}

        {activeTab === "documents" && (
          <motion.div
            key="documents"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transitions.normal}
          >
            <DocumentsTab />
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transitions.normal}
          >
            <HistoryTab />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  tender,
  dl,
  scores,
}: {
  tender: NonNullable<ReturnType<typeof mockTenders.find>>;
  dl: number | null;
  scores: { label: string; value: number; icon: React.ElementType; color: string }[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Description */}
        <AnimatedCard variant="elevated" hoverLift={false} tapScale={false}>
          <AnimatedCardHeader>
            <h3 className="text-base font-semibold text-foreground">
              Description
            </h3>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {tender.description}
            </p>
          </AnimatedCardContent>
        </AnimatedCard>

        {/* Détails de l'appel d'offres */}
        <AnimatedCard variant="elevated" hoverLift={false} tapScale={false}>
          <AnimatedCardHeader>
            <h3 className="text-base font-semibold text-foreground">
              Détails de l&apos;appel d&apos;offres
            </h3>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem
                icon={Building2}
                label="Autorité publiante"
                value={tender.publishing_authority}
              />
              <DetailItem
                icon={MapPin}
                label="Région"
                value={tender.region}
              />
              <DetailItem
                icon={Calendar}
                label="Date limite"
                value={formatDate(tender.deadline_date)}
                highlight={dl !== null && dl < 7}
              />
              <DetailItem
                icon={FileText}
                label="Secteur"
                value={tender.sector}
              />
              <DetailItem
                icon={Banknote}
                label="Budget minimum"
                value={formatCurrency(tender.budget_min)}
              />
              <DetailItem
                icon={Banknote}
                label="Budget maximum"
                value={formatCurrency(tender.budget_max)}
              />
              <DetailItem
                icon={Globe}
                label="Type"
                value={
                  tender.tender_type === "international"
                    ? "Appel d'offres international"
                    : "Appel d'offres national"
                }
              />
              <DetailItem
                icon={Shield}
                label="Recommandation"
                value={strategyLabel(tender.strategy_recommendation)}
              />
            </div>
          </AnimatedCardContent>
        </AnimatedCard>

        {/* Exigences clés */}
        <AnimatedCard variant="elevated" hoverLift={false} tapScale={false}>
          <AnimatedCardHeader>
            <h3 className="text-base font-semibold text-foreground">
              Exigences clés
            </h3>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <ul className="space-y-2">
              {MOCK_REQUIREMENTS.map((req, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{req}</span>
                </li>
              ))}
            </ul>
          </AnimatedCardContent>
        </AnimatedCard>

        {/* Chronologie */}
        <AnimatedCard variant="elevated" hoverLift={false} tapScale={false}>
          <AnimatedCardHeader>
            <h3 className="text-base font-semibold text-foreground">
              Chronologie
            </h3>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <div className="space-y-4">
              <TimelineItem
                date={formatDate(tender.created_at)}
                label="Publication de l'appel d'offres"
                isDone
              />
              <TimelineItem
                date={formatDate(tender.updated_at)}
                label="Dernière mise à jour"
                isDone
              />
              <TimelineItem
                date={formatDate(tender.deadline_date)}
                label="Date limite de soumission"
                isDone={dl !== null && dl <= 0}
                isUrgent={dl !== null && dl > 0 && dl < 14}
              />
              <TimelineItem
                date="À déterminer"
                label="Évaluation des offres"
                isDone={false}
              />
              <TimelineItem
                date="À déterminer"
                label="Attribution du marché"
                isDone={false}
              />
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </div>

      {/* Right sidebar: Scores + Budget */}
      <div className="space-y-6">
        {/* Quick scores */}
        <AnimatedCard variant="elevated" hoverLift={false} tapScale={false}>
          <AnimatedCardHeader>
            <h3 className="text-base font-semibold text-foreground">
              Scores détaillés
            </h3>
          </AnimatedCardHeader>
          <AnimatedCardContent className="space-y-4">
            {scores.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <s.icon className={cn("w-3.5 h-3.5", s.color)} />
                    <span className="text-xs text-muted-foreground">
                      {s.label}
                    </span>
                  </div>
                  <span className={cn("text-xs font-bold tabular-nums", s.color)}>
                    {((s.value ?? 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress value={(s.value ?? 0) * 100} className="h-1.5" />
              </div>
            ))}
          </AnimatedCardContent>
        </AnimatedCard>

        {/* Budget info */}
        <AnimatedCard variant="elevated" hoverLift={false} tapScale={false}>
          <AnimatedCardHeader>
            <h3 className="text-base font-semibold text-foreground">
              Informations budgétaires
            </h3>
          </AnimatedCardHeader>
          <AnimatedCardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Budget minimum</p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(tender.budget_min)}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground">Budget maximum</p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(tender.budget_max)}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground">Budget moyen estimé</p>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(
                  (tender.budget_min + tender.budget_max) / 2
                )}
              </p>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>

        {/* Strategy recommendation */}
        <AnimatedCard variant="elevated" hoverLift={false} tapScale={false}>
          <AnimatedCardHeader>
            <h3 className="text-base font-semibold text-foreground">
              Recommandation stratégique
            </h3>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <div
              className={cn(
                "text-center p-4 rounded-xl",
                strategyColor(tender.strategy_recommendation)
              )}
            >
              <p className="text-2xl font-bold">
                {strategyLabel(tender.strategy_recommendation)}
              </p>
              <p className="text-xs mt-1 opacity-80">
                Score composite :{" "}
                {((tender.priority_score ?? 0) * 100).toFixed(0)}%
              </p>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </div>
    </div>
  );
}

// ─── Timeline Item ────────────────────────────────────────────────────────────

function TimelineItem({
  date,
  label,
  isDone,
  isUrgent,
}: {
  date: string;
  label: string;
  isDone: boolean;
  isUrgent?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "w-3 h-3 rounded-full shrink-0 mt-1",
            isDone
              ? "bg-emerald-500"
              : isUrgent
                ? "bg-amber-500 ring-2 ring-amber-200 dark:ring-amber-900/50"
                : "bg-muted-foreground/30"
          )}
        />
        <div className="w-0.5 flex-1 bg-border mt-1" />
      </div>
      <div className="pb-4">
        <p
          className={cn(
            "text-sm font-medium",
            isDone
              ? "text-foreground"
              : isUrgent
                ? "text-amber-600 dark:text-amber-400"
                : "text-muted-foreground"
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "text-xs mt-0.5",
            isUrgent ? "text-amber-600/80 dark:text-amber-400/80" : "text-muted-foreground"
          )}
        >
          {date}
        </p>
      </div>
    </div>
  );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────

function DocumentsTab() {
  const [dragActive, setDragActive] = useState(false);

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <AnimatedCard variant="elevated" hoverLift={false} tapScale={false}>
        <AnimatedCardContent className="py-6">
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-accent/30"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
            }}
          >
            <Upload
              className={cn(
                "w-10 h-10 mx-auto mb-3",
                dragActive ? "text-primary" : "text-muted-foreground/50"
              )}
            />
            <p className="text-sm font-medium text-foreground">
              Glissez-déposez vos fichiers ici
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ou cliquez pour parcourir · PDF, DOCX, XLSX, ZIP (max 50 Mo)
            </p>
            <Button variant="outline" size="sm" className="mt-4 gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              Parcourir les fichiers
            </Button>
          </div>
        </AnimatedCardContent>
      </AnimatedCard>

      {/* Document list */}
      <AnimatedCard variant="elevated" hoverLift={false} tapScale={false}>
        <AnimatedCardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">
              Documents ({MOCK_DOCUMENTS.length})
            </h3>
          </div>
        </AnimatedCardHeader>
        <AnimatedCardContent>
          <div className="divide-y divide-border">
            {MOCK_DOCUMENTS.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between py-3 group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      doc.type === "PDF"
                        ? "bg-red-100 dark:bg-red-900/30"
                        : doc.type === "DOCX"
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : "bg-amber-100 dark:bg-amber-900/30"
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs font-bold",
                        doc.type === "PDF"
                          ? "text-red-600 dark:text-red-400"
                          : doc.type === "DOCX"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {doc.type}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {doc.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {doc.size}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        Ajouté le {formatDate(doc.uploadedAt)}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        {doc.uploadedBy}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1.5 shrink-0">
                  <Download className="w-3.5 h-3.5" />
                  Télécharger
                </Button>
              </div>
            ))}
          </div>
        </AnimatedCardContent>
      </AnimatedCard>
    </div>
  );
}

// ─── History Tab ──────────────────────────────────────────────────────────────

function HistoryTab() {
  return (
    <AnimatedCard variant="elevated" hoverLift={false} tapScale={false}>
      <AnimatedCardHeader>
        <h3 className="text-base font-semibold text-foreground">
          Journal d&apos;activité
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Historique complet des événements liés à cet appel d&apos;offres
        </p>
      </AnimatedCardHeader>
      <AnimatedCardContent>
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-0">
            {MOCK_HISTORY.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: i * 0.06,
                    ...transitions.normal,
                  }}
                  className="relative flex gap-4 pb-8 last:pb-0"
                >
                  {/* Icon circle */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-background",
                      item.bgColor
                    )}
                  >
                    <Icon className={cn("w-4 h-4", item.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm font-medium text-foreground">
                      {item.action}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {formatDateTime(item.timestamp)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  );
}
