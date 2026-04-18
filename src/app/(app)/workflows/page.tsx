"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Workflow, Play, Pause, Plus, ArrowRight, Clock,
  Zap, Mail, FileCheck, Bell, Bot, RefreshCw,
  CheckCircle2, AlertTriangle, Settings2, MoreVertical,
  Globe, Landmark, Mountain, Radio, HardHat, HeartPulse,
  Plug, GraduationCap, Briefcase, Leaf, Flag, Factory,
  Droplets, Sprout, Smartphone, Truck, Scale, Search,
  Activity, XCircle, Wifi, WifiOff, ChevronDown, ChevronUp,
  ExternalLink, Timer, Files, AlertCircle, Loader2,
} from "lucide-react";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motionVariants } from "@/lib/design-tokens";
import {
  CRAWL_SOURCES,
  type CrawlSource,
  type SourceType,
  type HealthStatus,
  type ETLPipelineResult,
  type CrawlResult,
  runETLPipeline,
  detectDuplicates,
  healthLabel,
  healthColor,
  healthBgColor,
  sourceTypeLabel,
  sourceTypeBadgeVariant,
  formatRelativeTime,
  formatResponseTime,
} from "@/lib/crawler-engine";

// ===== Existing Workflow Types & Data (kept from original) =====

interface WorkflowStep {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
}

interface WorkflowDef {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "draft";
  trigger: string;
  steps: WorkflowStep[];
  lastRun: string;
  runsCount: number;
  successRate: number;
}

const workflows: WorkflowDef[] = [
  {
    id: "wf-1",
    name: "Nouvel AO → Scoring → Alerte",
    description: "Détecte un nouvel appel d'offres, lance le scoring automatique, et alerte si le score dépasse 70%.",
    status: "active",
    trigger: "Nouvel AO détecté par le crawler",
    steps: [
      { id: "s1", icon: RefreshCw, label: "Détection AO", description: "Crawler détecte un nouvel appel d'offres" },
      { id: "s2", icon: Bot, label: "Scoring IA", description: "Analyse multi-critères automatique" },
      { id: "s3", icon: FileCheck, label: "Évaluation GO/NO-GO", description: "Décision basée sur le seuil 70%" },
      { id: "s4", icon: Bell, label: "Notification", description: "Alerte équipe si GO" },
    ],
    lastRun: "Il y a 12 min",
    runsCount: 234,
    successRate: 94,
  },
  {
    id: "wf-2",
    name: "Deadline J-3 → Checklist → Rappel",
    description: "3 jours avant la deadline, vérifie la complétude du dossier et envoie des rappels.",
    status: "active",
    trigger: "Deadline J-3 détectée",
    steps: [
      { id: "s1", icon: Clock, label: "Détection deadline", description: "Identification AO avec deadline J-3" },
      { id: "s2", icon: FileCheck, label: "Vérification complétude", description: "Checklist documents requis" },
      { id: "s3", icon: Mail, label: "Rappel équipe", description: "Email + notification push" },
    ],
    lastRun: "Il y a 2h",
    runsCount: 89,
    successRate: 100,
  },
  {
    id: "wf-3",
    name: "AO GO → Création opportunité CRM",
    description: "Crée automatiquement une opportunité dans le CRM quand un AO est marqué GO.",
    status: "active",
    trigger: "AO marqué GO par le scoring",
    steps: [
      { id: "s1", icon: FileCheck, label: "AO marqué GO", description: "Scoring confirme l'opportunité" },
      { id: "s2", icon: Bot, label: "Extraction données", description: "IA extrait les infos clés" },
      { id: "s3", icon: Zap, label: "Création CRM", description: "Nouvelle opportunité + contacts associés" },
      { id: "s4", icon: Bell, label: "Assignation", description: "Notification au responsable" },
    ],
    lastRun: "Il y a 45 min",
    runsCount: 156,
    successRate: 97,
  },
  {
    id: "wf-4",
    name: "Rapport hebdomadaire automatique",
    description: "Génère et envoie un rapport d'activité chaque lundi à 8h.",
    status: "paused",
    trigger: "Chaque lundi à 8h00",
    steps: [
      { id: "s1", icon: RefreshCw, label: "Collecte données", description: "Agrégation KPIs de la semaine" },
      { id: "s2", icon: Bot, label: "Génération rapport", description: "IA rédige le résumé analytique" },
      { id: "s3", icon: Mail, label: "Envoi email", description: "Rapport PDF aux décideurs" },
    ],
    lastRun: "Il y a 7 jours",
    runsCount: 12,
    successRate: 100,
  },
  {
    id: "wf-5",
    name: "Analyse document auto (OCR)",
    description: "Quand un document est uploadé, extraction automatique des données par OCR + IA.",
    status: "draft",
    trigger: "Nouveau document uploadé",
    steps: [
      { id: "s1", icon: RefreshCw, label: "Upload détecté", description: "Nouveau fichier dans le centre documentaire" },
      { id: "s2", icon: Bot, label: "OCR + Parsing", description: "Extraction texte et métadonnées" },
      { id: "s3", icon: Bot, label: "Analyse IA", description: "Identification critères et risques" },
      { id: "s4", icon: FileCheck, label: "Enrichissement AO", description: "Mise à jour automatique de l'AO" },
    ],
    lastRun: "Jamais",
    runsCount: 0,
    successRate: 0,
  },
];

const statusConfig = {
  active: { label: "Actif", variant: "success" as const },
  paused: { label: "En pause", variant: "warning" as const },
  draft: { label: "Brouillon", variant: "primary" as const },
};

// ===== Crawler-specific icon mapping =====

const sourceIconMap: Record<string, React.ElementType> = {
  Landmark, Mountain, Radio, HardHat, HeartPulse, Zap,
  Plug, GraduationCap, Briefcase, Globe, Leaf, Flag,
  Factory, Droplets, Sprout, Smartphone, Truck, Scale,
};

// ===== Crawl simulation state =====

interface CrawlSession {
  sourceId: string;
  progress: number;
  currentStep: number;
  pipeline: ETLPipelineResult | null;
  results: CrawlResult[];
  isRunning: boolean;
}

// ===== Health indicator dot =====

function HealthDot({ status }: { status: HealthStatus }) {
  const colorClass = status === "healthy"
    ? "bg-emerald-500"
    : status === "degraded"
    ? "bg-amber-500"
    : "bg-red-500";

  return (
    <span className="relative flex h-2.5 w-2.5">
      {status === "healthy" && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorClass} opacity-75`} />
      )}
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colorClass}`} />
    </span>
  );
}

// ===== Source Card =====

function SourceCard({
  source,
  onCrawl,
  isCrawling,
  crawlSession,
}: {
  source: CrawlSource;
  onCrawl: (sourceId: string) => void;
  isCrawling: boolean;
  crawlSession: CrawlSession | null;
}) {
  const IconComponent = sourceIconMap[source.icon] || Globe;
  const health = source.health;

  return (
    <motion.div
      variants={motionVariants.staggerItem}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <AnimatedCard
        hoverLift={false}
        className={`p-0 transition-all ${isCrawling ? "ring-1 ring-primary/30" : ""}`}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${healthBgColor(health.status)}`}>
                <IconComponent className={`h-4 w-4 ${healthColor(health.status)}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-foreground truncate">{source.name}</h3>
                  <GradientBadge variant={sourceTypeBadgeVariant(source.type)} size="sm">
                    {sourceTypeLabel(source.type)}
                  </GradientBadge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{source.url}</p>
              </div>
            </div>
            <HealthDot status={health.status} />
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{source.description}</p>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="px-2 py-1.5 rounded-lg bg-muted/30 text-center">
              <p className="text-[10px] text-muted-foreground">Secteur</p>
              <p className="text-xs font-medium text-foreground">{source.sector}</p>
            </div>
            <div className="px-2 py-1.5 rounded-lg bg-muted/30 text-center">
              <p className="text-[10px] text-muted-foreground">Taux succès</p>
              <p className={`text-xs font-medium ${health.successRate >= 0.85 ? "text-emerald-600" : health.successRate >= 0.6 ? "text-amber-600" : "text-red-600"}`}>
                {(health.successRate * 100).toFixed(0)}%
              </p>
            </div>
            <div className="px-2 py-1.5 rounded-lg bg-muted/30 text-center">
              <p className="text-[10px] text-muted-foreground">Dernier crawl</p>
              <p className="text-xs font-medium text-foreground">{formatRelativeTime(health.lastSuccessCrawl)}</p>
            </div>
          </div>

          {/* Health bar */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] text-muted-foreground shrink-0">Santé</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  health.uptime24h >= 90 ? "bg-emerald-500" : health.uptime24h >= 70 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${health.uptime24h}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">{health.uptime24h.toFixed(0)}%</span>
          </div>

          {/* Crawl progress (when running) */}
          {isCrawling && crawlSession && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-3 pt-3 border-t border-border"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Scan en cours...
                </span>
                <span className="text-xs text-muted-foreground">{crawlSession.progress.toFixed(0)}%</span>
              </div>
              <Progress value={crawlSession.progress} className="h-1.5" />
              {crawlSession.pipeline && (
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  {crawlSession.pipeline.steps.map((step, i) => (
                    <span
                      key={step.id}
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        step.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : step.status === "running"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.name}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Timer className="h-3 w-3" />
                {formatResponseTime(health.avgResponseTime)}
              </span>
              <span className="flex items-center gap-1">
                <Files className="h-3 w-3" />
                {health.lastTenderCount} AO
              </span>
              {health.errorCount > 0 && (
                <span className="flex items-center gap-1 text-amber-600">
                  <AlertCircle className="h-3 w-3" />
                  {health.errorCount} erreurs
                </span>
              )}
            </div>
            <Button
              variant={isCrawling ? "outline" : "secondary"}
              size="sm"
              className="gap-1.5 h-7 text-xs"
              onClick={() => onCrawl(source.id)}
              disabled={isCrawling}
            >
              {isCrawling ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Scan...
                </>
              ) : (
                <>
                  <Search className="h-3 w-3" />
                  Scanner
                </>
              )}
            </Button>
          </div>
        </div>
      </AnimatedCard>
    </motion.div>
  );
}

// ===== Crawl results summary =====

interface CrawlResultsSummaryProps {
  results: CrawlResult[];
  pipeline: ETLPipelineResult;
  onClose: () => void;
}

function CrawlResultsSummary({ results, pipeline, onClose }: CrawlResultsSummaryProps) {
  const newTenders = results.filter(r => !r.isDuplicate);
  const duplicates = results.filter(r => r.isDuplicate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <AnimatedCard hoverLift={false} className="p-0 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Scan terminé</h3>
                <p className="text-[11px] text-muted-foreground">
                  Pipeline ETL — {pipeline.runId.substring(0, 16)}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>

          {/* Pipeline steps result */}
          <div className="flex items-center gap-1 mb-3 flex-wrap">
            {pipeline.steps.map((step, i) => (
              <div key={step.id} className="flex items-center shrink-0">
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span className="text-[10px] font-medium text-emerald-700">{step.name}</span>
                  <span className="text-[10px] text-muted-foreground">({step.processedCount})</span>
                </div>
                {i < pipeline.steps.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground mx-0.5 shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-xl font-bold text-emerald-600">{newTenders.length}</p>
              <p className="text-[10px] text-muted-foreground">Nouveaux AO</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <p className="text-xl font-bold text-amber-600">{duplicates.length}</p>
              <p className="text-[10px] text-muted-foreground">Doublons filtrés</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <p className="text-xl font-bold text-red-600">{pipeline.errorCount}</p>
              <p className="text-[10px] text-muted-foreground">Erreurs</p>
            </div>
          </div>

          {/* Discovered tenders preview */}
          {newTenders.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Appels d'offres découverts</p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {newTenders.slice(0, 5).map((tender) => (
                  <div key={tender.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                    <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <FileCheck className="h-3 w-3 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{tender.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[9px] h-4 px-1">{tender.sector}</Badge>
                        <span className="text-[10px] text-muted-foreground">{tender.region}</span>
                        <span className="text-[10px] text-muted-foreground">
                          ≤ {formatRelativeTime(tender.deadlineDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {newTenders.length > 5 && (
                  <p className="text-[10px] text-muted-foreground text-center">
                    +{newTenders.length - 5} autres appels d'offres
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </AnimatedCard>
    </motion.div>
  );
}

// ===== Main Page =====

export default function WorkflowsPage() {
  const [expandedId, setExpandedId] = useState<string | null>("wf-1");
  const [crawlSessions, setCrawlSessions] = useState<Record<string, CrawlSession>>({});
  const [lastCrawlResults, setLastCrawlResults] = useState<{
    sourceId: string;
    results: CrawlResult[];
    pipeline: ETLPipelineResult;
  } | null>(null);
  const [sourcesExpanded, setSourcesExpanded] = useState(true);
  const [scanAllRunning, setScanAllRunning] = useState(false);
  const [scanAllProgress, setScanAllProgress] = useState(0);
  const intervalRefs = useRef<Record<string, NodeJS.Timeout>>({});

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(intervalRefs.current).forEach(clearInterval);
    };
  }, []);

  // Start a crawl simulation for a single source
  const startCrawl = useCallback((sourceId: string) => {
    const source = CRAWL_SOURCES.find(s => s.id === sourceId);
    if (!source) return;

    // Initialize crawl session
    const session: CrawlSession = {
      sourceId,
      progress: 0,
      currentStep: 0,
      pipeline: null,
      results: [],
      isRunning: true,
    };

    setCrawlSessions(prev => ({ ...prev, [sourceId]: session }));

    // Simulate progress
    let progress = 0;
    const pipeline = runETLPipeline(source);
    const totalDuration = pipeline.steps.reduce((sum, s) => sum + s.duration, 0);

    // Update pipeline steps progressively
    const stepTimers: NodeJS.Timeout[] = [];
    let elapsedDuration = 0;

    pipeline.steps.forEach((step, i) => {
      elapsedDuration += step.duration;
      const delay = elapsedDuration * 0.5; // Speed up simulation

      const timer = setTimeout(() => {
        setCrawlSessions(prev => {
          const current = prev[sourceId];
          if (!current) return prev;

          const updatedSteps = [...pipeline.steps];
          // Mark current and previous steps as completed
          for (let j = 0; j <= i; j++) {
            updatedSteps[j] = { ...updatedSteps[j], status: "completed" as const };
          }
          // Mark next step as running if exists
          if (i + 1 < updatedSteps.length) {
            updatedSteps[i + 1] = { ...updatedSteps[i + 1], status: "running" as const };
          }

          return {
            ...prev,
            [sourceId]: {
              ...current,
              currentStep: i,
              pipeline: { ...pipeline, steps: updatedSteps },
            },
          };
        });
      }, delay);

      stepTimers.push(timer);
    });

    // Progress interval
    const progressInterval = setInterval(() => {
      progress += 2 + Math.random() * 3;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);
        delete intervalRefs.current[sourceId];

        // Set final results
        setCrawlSessions(prev => {
          const current = prev[sourceId];
          if (!current) return prev;

          const finalResults = pipeline.rawTenderCount > 0
            ? Array.from({ length: pipeline.rawTenderCount }, (_, idx) => ({
                id: `t-${sourceId}-${idx}`,
                sourceId,
                title: `Appel d'offres ${pipeline.sourceId} #${idx + 1}`,
                description: `Tender découvert par le crawler ${sourceId}`,
                url: `${source.url}/ao/${idx}`,
                publishedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 86400000)).toISOString(),
                deadlineDate: new Date(Date.now() + (15 + Math.floor(Math.random() * 60)) * 86400000).toISOString(),
                publishingAuthority: "Autorité publique",
                sector: source.sector,
                region: source.region,
                budgetMin: 1_000_000_000 + Math.floor(Math.random() * 10_000_000_000),
                budgetMax: 5_000_000_000 + Math.floor(Math.random() * 20_000_000_000),
                tenderType: source.type === "international" ? "international" as const : "national" as const,
                isDuplicate: idx > 0 && Math.random() < 0.25,
                similarityScore: idx > 0 && Math.random() < 0.25 ? 0.7 + Math.random() * 0.25 : undefined,
                crawledAt: new Date().toISOString(),
              }))
            : [];

          const duplicates = finalResults.filter(r => r.isDuplicate);

          const finalPipeline = { ...pipeline };
          finalPipeline.duplicateCount = duplicates.length;
          finalPipeline.newTenderCount = finalResults.length - duplicates.length;
          finalPipeline.steps = finalPipeline.steps.map(s => ({ ...s, status: "completed" as const }));
          finalPipeline.completedAt = new Date().toISOString();
          finalPipeline.status = "completed" as const;

          setLastCrawlResults({
            sourceId,
            results: finalResults,
            pipeline: finalPipeline,
          });

          return {
            ...prev,
            [sourceId]: {
              ...current,
              progress: 100,
              isRunning: false,
              pipeline: finalPipeline,
              results: finalResults,
            },
          };
        });
      } else {
        setCrawlSessions(prev => {
          const current = prev[sourceId];
          if (!current) return prev;
          return {
            ...prev,
            [sourceId]: { ...current, progress },
          };
        });
      }
    }, 200);

    intervalRefs.current[sourceId] = progressInterval;
  }, []);

  // Scan all sources
  const startScanAll = useCallback(() => {
    setScanAllRunning(true);
    setScanAllProgress(0);
    setLastCrawlResults(null);

    let completedSources = 0;
    const activeSources = CRAWL_SOURCES.filter(s => s.status === "active" && s.health.status !== "down");
    const totalSources = activeSources.length;

    // Stagger crawl starts
    activeSources.forEach((source, i) => {
      setTimeout(() => {
        startCrawl(source.id);

        // Wait for this crawl to "finish" (simplified)
        setTimeout(() => {
          completedSources++;
          setScanAllProgress((completedSources / totalSources) * 100);

          if (completedSources >= totalSources) {
            setScanAllRunning(false);
          }
        }, 3000 + Math.random() * 2000);
      }, i * 800);
    });
  }, [startCrawl]);

  // Health stats
  const healthyCount = CRAWL_SOURCES.filter(s => s.health.status === "healthy").length;
  const degradedCount = CRAWL_SOURCES.filter(s => s.health.status === "degraded").length;
  const downCount = CRAWL_SOURCES.filter(s => s.health.status === "down").length;
  const totalTendersToday = CRAWL_SOURCES.reduce((sum, s) => sum + s.health.lastTenderCount, 0);

  return (
    <motion.div
      className="space-y-6"
      variants={motionVariants.staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={motionVariants.staggerItem} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workflows & Automatisation</h1>
          <p className="text-sm text-muted-foreground mt-1">Automatisez vos processus de veille et réponse</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Configurer
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Créer un workflow
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={motionVariants.staggerItem} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl border bg-card">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Play className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">3</p>
            <p className="text-xs text-muted-foreground">Workflows actifs</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl border bg-card">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">491</p>
            <p className="text-xs text-muted-foreground">Exécutions ce mois</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl border bg-card">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">96%</p>
            <p className="text-xs text-muted-foreground">Taux de succès moyen</p>
          </div>
        </div>
      </motion.div>

      {/* ═══ Sources de Veille Section ═══ */}
      <motion.div variants={motionVariants.staggerItem}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Sources de veille</h2>
              <p className="text-xs text-muted-foreground">
                {CRAWL_SOURCES.length} sources — {totalTendersToday} AO détectés aujourd&apos;hui
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Health summary pills */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md">
                <Wifi className="h-3 w-3" /> {healthyCount} OK
              </span>
              <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-500/10 px-2 py-1 rounded-md">
                <AlertTriangle className="h-3 w-3" /> {degradedCount} dégradé(s)
              </span>
              {downCount > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-red-600 bg-red-500/10 px-2 py-1 rounded-md">
                  <WifiOff className="h-3 w-3" /> {downCount} hors service
                </span>
              )}
            </div>
            <Button
              size="sm"
              className="gap-2"
              onClick={startScanAll}
              disabled={scanAllRunning}
            >
              {scanAllRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scan en cours... {scanAllProgress.toFixed(0)}%
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Lancer un scan
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSourcesExpanded(!sourcesExpanded)}
            >
              {sourcesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Scan all progress bar */}
        {scanAllRunning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="mb-4"
          >
            <div className="p-3 rounded-xl border bg-card">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  Scan global en cours — {scanAllProgress.toFixed(0)}%
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {Math.ceil((scanAllProgress / 100) * CRAWL_SOURCES.filter(s => s.status === "active").length)}/{CRAWL_SOURCES.filter(s => s.status === "active").length} sources
                </span>
              </div>
              <Progress value={scanAllProgress} className="h-2" />
            </div>
          </motion.div>
        )}

        {/* Crawl results summary */}
        <AnimatePresence>
          {lastCrawlResults && (
            <div className="mb-4">
              <CrawlResultsSummary
                results={lastCrawlResults.results}
                pipeline={lastCrawlResults.pipeline}
                onClose={() => setLastCrawlResults(null)}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Sources grid */}
        <AnimatePresence>
          {sourcesExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {CRAWL_SOURCES.map((source) => {
                  const session = crawlSessions[source.id];
                  const isCrawling = session?.isRunning ?? false;

                  return (
                    <SourceCard
                      key={source.id}
                      source={source}
                      onCrawl={startCrawl}
                      isCrawling={isCrawling}
                      crawlSession={session ?? null}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ═══ Workflows Pipeline Section ═══ */}
      <motion.div variants={motionVariants.staggerItem}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Workflow className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Pipelines d'automatisation</h2>
            <p className="text-xs text-muted-foreground">Workflows configurés pour la veille et la réponse</p>
          </div>
        </div>
      </motion.div>

      {/* Workflow List */}
      <div className="space-y-3">
        {workflows.map((wf, i) => {
          const isExpanded = expandedId === wf.id;
          const statusInfo = statusConfig[wf.status];

          return (
            <motion.div
              key={wf.id}
              variants={motionVariants.staggerItem}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
            >
              <AnimatedCard
                hoverLift={false}
                className={`p-0 cursor-pointer transition-all ${isExpanded ? "ring-1 ring-primary/20" : ""}`}
                onClick={() => setExpandedId(isExpanded ? null : wf.id)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        wf.status === "active" ? "bg-emerald-500/10" : wf.status === "paused" ? "bg-amber-500/10" : "bg-muted"
                      }`}>
                        <Workflow className={`h-5 w-5 ${
                          wf.status === "active" ? "text-emerald-600" : wf.status === "paused" ? "text-amber-600" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground">{wf.name}</h3>
                          <GradientBadge variant={statusInfo.variant} size="sm">{statusInfo.label}</GradientBadge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{wf.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {wf.runsCount > 0 && (
                        <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{wf.runsCount} exécutions</span>
                          <span className={wf.successRate >= 90 ? "text-emerald-600" : "text-amber-600"}>
                            {wf.successRate}% succès
                          </span>
                        </div>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded: Pipeline visualization */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border px-4 pb-4 pt-3"
                  >
                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Déclencheur</p>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                        <Zap className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs text-foreground">{wf.trigger}</span>
                      </div>
                    </div>

                    {/* Pipeline Steps */}
                    <p className="text-xs font-medium text-muted-foreground mb-2">Étapes du pipeline</p>
                    <div className="flex items-center gap-1 overflow-x-auto pb-2">
                      {wf.steps.map((step, j) => (
                        <div key={step.id} className="flex items-center shrink-0">
                          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors min-w-[120px]">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <step.icon className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-[11px] font-medium text-foreground text-center">{step.label}</span>
                            <span className="text-[10px] text-muted-foreground text-center leading-tight">{step.description}</span>
                          </div>
                          {j < wf.steps.length - 1 && (
                            <ArrowRight className="h-4 w-4 text-muted-foreground mx-1 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Footer stats */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        Dernière exécution : {wf.lastRun}
                      </span>
                      <div className="flex items-center gap-2">
                        {wf.status === "active" && (
                          <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                            <Pause className="h-3 w-3" />
                            Pause
                          </Button>
                        )}
                        {wf.status === "paused" && (
                          <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                            <Play className="h-3 w-3" />
                            Reprendre
                          </Button>
                        )}
                        <Button size="sm" className="gap-1.5 h-7 text-xs">
                          Exécuter
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatedCard>
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <motion.div
        variants={motionVariants.staggerItem}
        className="p-6 rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Créer un workflow personnalisé</h3>
            <p className="text-xs text-muted-foreground mt-1">Combinez des déclencheurs, conditions et actions pour automatiser vos processus.</p>
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau workflow
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
