"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Kanban, Plus, MoreHorizontal, Clock, MapPin, Banknote,
  ArrowUpRight, User, AlertTriangle, CheckCircle2, XCircle,
  ChevronDown, GripVertical, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, daysUntil } from "@/lib/tenderflow-utils";
import { scoreTender, type ScoringResult } from "@/lib/scoring-engine";

// ─── Pipeline Stages ──────────────────────────────────────────────────────────

interface PipelineStage {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}

const STAGES: PipelineStage[] = [
  { id: "new", label: "Nouveau", color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950/30", icon: <Plus className="h-4 w-4" /> },
  { id: "qualifying", label: "Qualification", color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-950/30", icon: <Clock className="h-4 w-4" /> },
  { id: "qualified", label: "Qualifié", color: "text-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-950/30", icon: <CheckCircle2 className="h-4 w-4" /> },
  { id: "go", label: "GO", color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-950/30", icon: <CheckCircle2 className="h-4 w-4" /> },
  { id: "no_go", label: "NO GO", color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-950/30", icon: <XCircle className="h-4 w-4" /> },
  { id: "responding", label: "En réponse", color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950/30", icon: <ArrowUpRight className="h-4 w-4" /> },
  { id: "won", label: "Gagné", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-950/30", icon: <CheckCircle2 className="h-4 w-4" /> },
  { id: "lost", label: "Perdu", color: "text-gray-600", bgColor: "bg-gray-50 dark:bg-gray-950/30", icon: <XCircle className="h-4 w-4" /> },
];

// ─── Pipeline Card Data ──────────────────────────────────────────────────────

interface PipelineCard {
  id: string;
  reference: string;
  title: string;
  sector: string;
  region: string;
  authority: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  status: string;
  assignee?: string;
  priority: "high" | "medium" | "low";
  score?: ScoringResult;
}

// ─── Mock Pipeline Data ──────────────────────────────────────────────────────

const INITIAL_CARDS: PipelineCard[] = [
  {
    id: "p-001", reference: "AO/MTP/2026/001", title: "Construction RN1 Conakry-Kindia",
    sector: "BTP", region: "Conakry", authority: "Ministère des Travaux Publics",
    budgetMin: 20_000_000_000, budgetMax: 30_000_000_000, deadline: "2026-07-15",
    status: "new", assignee: "Amadou D.", priority: "high",
  },
  {
    id: "p-002", reference: "AO/DGSI/2026/003", title: "Équipements informatiques administration",
    sector: "IT / Digital", region: "Conakry", authority: "DGSI",
    budgetMin: 5_000_000_000, budgetMax: 10_000_000_000, deadline: "2026-06-30",
    status: "qualifying", assignee: "Fatou B.", priority: "high",
  },
  {
    id: "p-003", reference: "AO/EDG/2026/007", title: "Électrification rurale Labé",
    sector: "Énergie", region: "Labé", authority: "EDG",
    budgetMin: 8_000_000_000, budgetMax: 15_000_000_000, deadline: "2026-08-01",
    status: "qualified", assignee: "Moussa C.", priority: "medium",
  },
  {
    id: "p-004", reference: "AO/MMG/2026/012", title: "Consulting gouvernance minière",
    sector: "Conseil", region: "Conakry", authority: "Ministère des Mines",
    budgetMin: 2_000_000_000, budgetMax: 4_000_000_000, deadline: "2026-05-20",
    status: "go", assignee: "Aïssatou D.", priority: "high",
  },
  {
    id: "p-005", reference: "AO/MS/2026/005", title: "Centre Hospitalier Nzérékoré",
    sector: "Santé", region: "Nzérékoré", authority: "Ministère de la Santé",
    budgetMin: 15_000_000_000, budgetMax: 22_000_000_000, deadline: "2026-09-15",
    status: "new", priority: "medium",
  },
  {
    id: "p-006", reference: "AO/MA/2026/009", title: "Appui secteur agricole Kankan",
    sector: "Agriculture", region: "Kankan", authority: "Ministère de l'Agriculture",
    budgetMin: 4_000_000_000, budgetMax: 8_000_000_000, deadline: "2026-06-01",
    status: "responding", assignee: "Ibrahim K.", priority: "medium",
  },
  {
    id: "p-007", reference: "AO/MJ/2026/004", title: "Système d'information judiciaire",
    sector: "IT / Digital", region: "National", authority: "Ministère de la Justice",
    budgetMin: 3_000_000_000, budgetMax: 7_000_000_000, deadline: "2026-07-30",
    status: "go", assignee: "Fatou B.", priority: "high",
  },
  {
    id: "p-008", reference: "AO/SOGUIPAMI/2026/001", title: "Concession bauxite Sangarédi",
    sector: "Mines", region: "Boké", authority: "SOGUIPAMI",
    budgetMin: 80_000_000_000, budgetMax: 120_000_000_000, deadline: "2026-04-30",
    status: "no_go", priority: "low",
  },
  {
    id: "p-009", reference: "AO/MTP/2025/045", title: "Rehabilitation pont Kankan",
    sector: "BTP", region: "Kankan", authority: "Ministère des Travaux Publics",
    budgetMin: 3_000_000_000, budgetMax: 5_000_000_000, deadline: "2025-12-15",
    status: "won", assignee: "Amadou D.", priority: "high",
  },
  {
    id: "p-010", reference: "AO/EDG/2025/032", title: "Lignes HT Kindia",
    sector: "Énergie", region: "Kindia", authority: "EDG",
    budgetMin: 6_000_000_000, budgetMax: 9_000_000_000, deadline: "2025-11-01",
    status: "lost", priority: "medium",
  },
];

// ─── Priority Config ──────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  high: { label: "Haute", color: "bg-red-500", textColor: "text-red-600" },
  medium: { label: "Moyenne", color: "bg-amber-500", textColor: "text-amber-600" },
  low: { label: "Basse", color: "bg-gray-400", textColor: "text-gray-500" },
};

// ─── Page Component ───────────────────────────────────────────────────────────

export default function PipelinePage() {
  const [cards, setCards] = useState<PipelineCard[]>(INITIAL_CARDS);
  const [selectedCard, setSelectedCard] = useState<PipelineCard | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "funnel">("kanban");

  // Group cards by stage
  const stageCards = useMemo(() => {
    const groups: Record<string, PipelineCard[]> = {};
    for (const stage of STAGES) {
      groups[stage.id] = cards
        .filter((c) => c.status === stage.id)
        .sort((a, b) => {
          const prio = { high: 0, medium: 1, low: 2 };
          return prio[a.priority] - prio[b.priority];
        });
    }
    return groups;
  }, [cards]);

  // Pipeline stats
  const stats = useMemo(() => {
    const total = cards.length;
    const activeStages = ["new", "qualifying", "qualified", "go", "responding"];
    const active = cards.filter((c) => activeStages.includes(c.status)).length;
    const totalBudget = cards
      .filter((c) => activeStages.includes(c.status))
      .reduce((sum, c) => sum + (c.budgetMin + c.budgetMax) / 2, 0);
    const urgentDeadlines = cards.filter((c) => {
      const d = daysUntil(c.deadline);
      return d !== null && d >= 0 && d <= 7 && activeStages.includes(c.status);
    }).length;
    return { total, active, totalBudget, urgentDeadlines };
  }, [cards]);

  // Move card to different stage
  const moveCard = (cardId: string, newStage: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, status: newStage } : c))
    );
  };

  // Funnel data
  const funnelData = useMemo(() => {
    return STAGES.map((stage) => ({
      ...stage,
      count: stageCards[stage.id]?.length ?? 0,
      cards: stageCards[stage.id] ?? [],
    }));
  }, [stageCards]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Kanban className="h-6 w-6 text-primary" />
            Pipeline des appels d&apos;offres
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualisez et gérez le cycle de vie de vos appels d&apos;offres
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === "kanban" ? "default" : "outline"} size="sm" onClick={() => setViewMode("kanban")}>
            <Kanban className="h-4 w-4 mr-1" /> Kanban
          </Button>
          <Button variant={viewMode === "funnel" ? "default" : "outline"} size="sm" onClick={() => setViewMode("funnel")}>
            Entonnoir
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total AO</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
            <p className="text-xs text-muted-foreground">En cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalBudget)}</p>
            <p className="text-xs text-muted-foreground">Budget pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.urgentDeadlines}</p>
            <p className="text-xs text-muted-foreground">Échéances &lt;7j</p>
          </CardContent>
        </Card>
      </div>

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex gap-4" style={{ minWidth: STAGES.length * 280 }}>
            {STAGES.map((stage) => {
              const stageItems = stageCards[stage.id] ?? [];
              return (
                <div key={stage.id} className="flex-1 min-w-[270px]">
                  {/* Stage Header */}
                  <div className={`rounded-t-xl px-3 py-2.5 ${stage.bgColor} border border-border`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={stage.color}>{stage.icon}</span>
                        <span className={`font-semibold text-sm ${stage.color}`}>{stage.label}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">{stageItems.length}</Badge>
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2 pt-2 min-h-[200px]">
                    <AnimatePresence>
                      {stageItems.map((card, i) => (
                        <motion.div
                          key={card.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: i * 0.05 }}
                          layout
                        >
                          <Card
                            className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30"
                            onClick={() => setSelectedCard(selectedCard?.id === card.id ? null : card)}
                          >
                            <CardContent className="p-3">
                              {/* Priority + Reference */}
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-mono text-muted-foreground">{card.reference}</span>
                                <div className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[card.priority].color}`} title={PRIORITY_CONFIG[card.priority].label} />
                              </div>

                              {/* Title */}
                              <h4 className="font-medium text-sm line-clamp-2 leading-tight">{card.title}</h4>

                              {/* Metadata */}
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs">{card.sector}</Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                  <MapPin className="h-3 w-3" />
                                  {card.region}
                                </span>
                              </div>

                              {/* Budget + Deadline */}
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                  <Banknote className="h-3 w-3" />
                                  {formatCurrency((card.budgetMin + card.budgetMax) / 2)}
                                </span>
                                <span className={`text-xs flex items-center gap-0.5 ${
                                  daysUntil(card.deadline) !== null && daysUntil(card.deadline)! < 7
                                    ? "text-red-500 font-medium"
                                    : "text-muted-foreground"
                                }`}>
                                  <Clock className="h-3 w-3" />
                                  {daysUntil(card.deadline) ?? "—"}j
                                </span>
                              </div>

                              {/* Assignee */}
                              {card.assignee && (
                                <div className="flex items-center gap-1.5 mt-2">
                                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-3 w-3 text-primary" />
                                  </div>
                                  <span className="text-xs text-muted-foreground">{card.assignee}</span>
                                </div>
                              )}

                              {/* Move buttons */}
                              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
                                {stage.id !== "new" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const prevIdx = STAGES.findIndex((s) => s.id === stage.id) - 1;
                                      if (prevIdx >= 0) moveCard(card.id, STAGES[prevIdx].id);
                                    }}
                                  >
                                    ← Reculer
                                  </Button>
                                )}
                                {stage.id !== "lost" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs ml-auto"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const nextIdx = STAGES.findIndex((s) => s.id === stage.id) + 1;
                                      if (nextIdx < STAGES.length) moveCard(card.id, STAGES[nextIdx].id);
                                    }}
                                  >
                                    Avancer →
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {stageItems.length === 0 && (
                      <div className="flex items-center justify-center h-24 border border-dashed border-border rounded-xl">
                        <p className="text-xs text-muted-foreground">Aucun AO</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Funnel View */}
      {viewMode === "funnel" && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              {funnelData
                .filter((s) => s.count > 0)
                .map((stage, i) => {
                  const maxCount = Math.max(...funnelData.map((s) => s.count), 1);
                  const width = Math.max((stage.count / maxCount) * 100, 15);
                  return (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-28 text-right">
                        <span className={`text-sm font-medium ${stage.color}`}>{stage.label}</span>
                      </div>
                      <div className="flex-1 flex items-center gap-3">
                        <motion.div
                          className={`h-12 rounded-lg ${stage.bgColor} border border-border flex items-center justify-center`}
                          style={{ width: `${width}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${width}%` }}
                          transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                        >
                          <span className={`font-bold text-lg ${stage.color}`}>{stage.count}</span>
                        </motion.div>
                        <div className="flex-1 flex flex-wrap gap-1">
                          {stage.cards.slice(0, 3).map((card) => (
                            <Badge key={card.id} variant="secondary" className="text-xs">
                              {card.reference}
                            </Badge>
                          ))}
                          {stage.cards.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{stage.cards.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
