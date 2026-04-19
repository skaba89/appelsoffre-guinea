"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { motionVariants, transitions } from "@/lib/design-tokens";
import {
  Clock, FileText, Target, MessageSquare, Upload, UserPlus,
  Trophy, Zap, CircleDot, History, Filter, ChevronDown,
  ChevronUp, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  userName: string;
  tenderRef?: string;
  tenderTitle?: string;
}

type ActivityType =
  | "new_tender"
  | "score_update"
  | "status_change"
  | "comment"
  | "document_upload"
  | "team_assign"
  | "deadline_alert"
  | "win"
  | "strategy_change";

// ─── Activity type config ──────────────────────────────────────────────────────

const ACTIVITY_TYPE_CONFIG: Record<
  ActivityType,
  { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  new_tender: { label: "Nouvel AO", icon: FileText, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  score_update: { label: "Score", icon: Target, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
  status_change: { label: "Statut", icon: CircleDot, color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
  comment: { label: "Commentaire", icon: MessageSquare, color: "text-sky-600 dark:text-sky-400", bgColor: "bg-sky-100 dark:bg-sky-900/30" },
  document_upload: { label: "Document", icon: Upload, color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-100 dark:bg-emerald-900/30" },
  team_assign: { label: "Équipe", icon: UserPlus, color: "text-pink-600 dark:text-pink-400", bgColor: "bg-pink-100 dark:bg-pink-900/30" },
  deadline_alert: { label: "Échéance", icon: Clock, color: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30" },
  win: { label: "Victoire", icon: Trophy, color: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30" },
  strategy_change: { label: "Stratégie", icon: Zap, color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-100 dark:bg-orange-900/30" },
};

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    type: "new_tender",
    title: "Nouvel appel d'offres détecté",
    description: "AO-2026-045 — Construction de la route Conakry-Coyah, lot 3. Budget estimé : 15,2 Mds GNF.",
    timestamp: "2026-04-19T10:15:00Z",
    userName: "Crawler automatique",
    tenderRef: "AO-2026-045",
    tenderTitle: "Construction route Conakry-Coyah",
  },
  {
    id: "act-2",
    type: "score_update",
    title: "Score de priorité mis à jour",
    description: "Le score de AO-2026-032 est passé de 62% à 78% suite à l'analyse des critères de compatibilité.",
    timestamp: "2026-04-19T09:45:00Z",
    userName: "Moteur IA",
    tenderRef: "AO-2026-032",
    tenderTitle: "Équipements informatiques Ministère des Finances",
  },
  {
    id: "act-3",
    type: "win",
    title: "Marché remporté !",
    description: "AO-2026-012 — Fourniture d'équipements hospitaliers au CHU de Conakry. Montant : 3,8 Mds GNF.",
    timestamp: "2026-04-18T16:30:00Z",
    userName: "Mamadou Diallo",
    tenderRef: "AO-2026-012",
    tenderTitle: "Équipements hospitaliers CHU Conakry",
  },
  {
    id: "act-4",
    type: "comment",
    title: "Commentaire ajouté",
    description: "Ibrahima Keita a commenté : \"Vérifier les exigences de certification ISO 9001 pour ce marché.\"",
    timestamp: "2026-04-18T14:20:00Z",
    userName: "Ibrahima Keita",
    tenderRef: "AO-2026-028",
  },
  {
    id: "act-5",
    type: "deadline_alert",
    title: "Alerte échéance imminente",
    description: "AO-2026-019 — La date limite de soumission est dans 3 jours (22 avril 2026). Action requise.",
    timestamp: "2026-04-18T08:00:00Z",
    userName: "Système d'alertes",
    tenderRef: "AO-2026-019",
    tenderTitle: "Réhabilitation réseau d'eau Kankan",
  },
  {
    id: "act-6",
    type: "document_upload",
    title: "Document ajouté",
    description: "Cahier des clauses techniques particulières (CCTP) téléchargé pour AO-2026-033.",
    timestamp: "2026-04-17T15:10:00Z",
    userName: "Fatou Camara",
    tenderRef: "AO-2026-033",
  },
  {
    id: "act-7",
    type: "team_assign",
    title: "Membre assigné",
    description: "Abdoulaye Touré a été assigné comme chef de projet pour AO-2026-040.",
    timestamp: "2026-04-17T11:00:00Z",
    userName: "Mamadou Diallo",
    tenderRef: "AO-2026-040",
  },
  {
    id: "act-8",
    type: "strategy_change",
    title: "Recommandation stratégique modifiée",
    description: "AO-2026-025 est passé de GO à GO SOUS CONDITIONS suite à l'analyse des risques concurrentiels.",
    timestamp: "2026-04-17T09:30:00Z",
    userName: "Moteur IA",
    tenderRef: "AO-2026-025",
  },
  {
    id: "act-9",
    type: "status_change",
    title: "Changement de statut",
    description: "AO-2026-015 est passé de \"Qualification\" à \"GO\" après validation par l'équipe.",
    timestamp: "2026-04-16T14:00:00Z",
    userName: "Ibrahima Keita",
    tenderRef: "AO-2026-015",
  },
  {
    id: "act-10",
    type: "new_tender",
    title: "Nouvel appel d'offres détecté",
    description: "AO-2026-046 — Fourniture de panneaux solaires pour les écoles rurales. Budget : 2,1 Mds GNF.",
    timestamp: "2026-04-16T10:00:00Z",
    userName: "Crawler automatique",
    tenderRef: "AO-2026-046",
    tenderTitle: "Panneaux solaires écoles rurales",
  },
  {
    id: "act-11",
    type: "score_update",
    title: "Score de faisabilité recalculé",
    description: "Le score de faisabilité de AO-2026-020 a baissé à 45% après prise en compte des exigences de cautionnement.",
    timestamp: "2026-04-15T16:30:00Z",
    userName: "Moteur IA",
    tenderRef: "AO-2026-020",
  },
  {
    id: "act-12",
    type: "comment",
    title: "Note interne ajoutée",
    description: "Fatou Camara a ajouté : \"Contacter le partenaire local à N'Zérékoré pour les documents administratifs.\"",
    timestamp: "2026-04-15T11:20:00Z",
    userName: "Fatou Camara",
  },
  {
    id: "act-13",
    type: "deadline_alert",
    title: "Rappel échéance",
    description: "AO-2026-010 — Plus que 7 jours avant la date limite. Préparer la soumission.",
    timestamp: "2026-04-14T09:00:00Z",
    userName: "Système d'alertes",
    tenderRef: "AO-2026-010",
  },
  {
    id: "act-14",
    type: "document_upload",
    title: "Formulaire de soumission généré",
    description: "Le formulaire de soumission pour AO-2026-022 a été généré automatiquement par l'assistant IA.",
    timestamp: "2026-04-13T14:45:00Z",
    userName: "Assistant IA",
    tenderRef: "AO-2026-022",
  },
  {
    id: "act-15",
    type: "status_change",
    title: "Appel d'offres expiré",
    description: "AO-2026-005 — La date limite est dépassée. Statut mis à jour automatiquement.",
    timestamp: "2026-04-12T23:59:00Z",
    userName: "Système",
    tenderRef: "AO-2026-005",
  },
  {
    id: "act-16",
    type: "win",
    title: "Marché attribué confirmé",
    description: "AO-2026-008 — Marché de construction du marché de Mamou officiellement attribué. Montant : 4,5 Mds GNF.",
    timestamp: "2026-04-11T10:00:00Z",
    userName: "Mamadou Diallo",
    tenderRef: "AO-2026-008",
    tenderTitle: "Construction marché de Mamou",
  },
  {
    id: "act-17",
    type: "new_tender",
    title: "Nouvel appel d'offres détecté",
    description: "AO-2026-047 — Audit organisationnel du Ministère de l'Éducation. Budget : 850 M GNF.",
    timestamp: "2026-04-10T08:30:00Z",
    userName: "Crawler automatique",
    tenderRef: "AO-2026-047",
    tenderTitle: "Audit Ministère Éducation",
  },
  {
    id: "act-18",
    type: "strategy_change",
    title: "NO-GO recommandé",
    description: "AO-2026-030 — Le score composite est tombé à 28%. Recommandation NO-GO confirmée.",
    timestamp: "2026-04-09T15:00:00Z",
    userName: "Moteur IA",
    tenderRef: "AO-2026-030",
  },
];

// ─── Filter definitions ────────────────────────────────────────────────────────

const typeFilters: { value: ActivityType | "all"; label: string; icon: React.ElementType }[] = [
  { value: "all", label: "Tous", icon: History },
  { value: "new_tender", label: "Nouveaux AO", icon: FileText },
  { value: "score_update", label: "Scores", icon: Target },
  { value: "status_change", label: "Statuts", icon: CircleDot },
  { value: "comment", label: "Commentaires", icon: MessageSquare },
  { value: "deadline_alert", label: "Échéances", icon: Clock },
  { value: "win", label: "Victoires", icon: Trophy },
];

const dateFilters = [
  { value: "today", label: "Aujourd'hui" },
  { value: "7days", label: "7 derniers jours" },
  { value: "30days", label: "30 derniers jours" },
  { value: "all", label: "Tout" },
] as const;

// ─── Utility functions ─────────────────────────────────────────────────────────

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  if (days < 30) return `Il y a ${days}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function filterByDateRange(activities: ActivityItem[], range: string): ActivityItem[] {
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  let cutoff: Date;
  switch (range) {
    case "today":
      cutoff = new Date(now.getTime() - msPerDay);
      break;
    case "7days":
      cutoff = new Date(now.getTime() - 7 * msPerDay);
      break;
    case "30days":
      cutoff = new Date(now.getTime() - 30 * msPerDay);
      break;
    default:
      return activities;
  }
  return activities.filter((a) => new Date(a.timestamp) >= cutoff);
}

// ─── Page Component ────────────────────────────────────────────────────────────

export default function ActivityPage() {
  const [activeTypeFilter, setActiveTypeFilter] = useState<ActivityType | "all">("all");
  const [activeDateFilter, setActiveDateFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Apply filters
  const filtered = useMemo(() => {
    let result = MOCK_ACTIVITIES;
    if (activeTypeFilter !== "all") {
      result = result.filter((a) => a.type === activeTypeFilter);
    }
    result = filterByDateRange(result, activeDateFilter);
    return result;
  }, [activeTypeFilter, activeDateFilter]);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    return {
      total: MOCK_ACTIVITIES.length,
      today: MOCK_ACTIVITIES.filter((a) => now.getTime() - new Date(a.timestamp).getTime() < msPerDay).length,
      thisWeek: MOCK_ACTIVITIES.filter((a) => now.getTime() - new Date(a.timestamp).getTime() < 7 * msPerDay).length,
    };
  }, []);

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
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Fil d&apos;activité
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Toute l&apos;activité récente de votre plateforme TenderFlow
          </p>
        </div>
        <GradientBadge variant="primary" size="md" animated>
          {stats.total} événements
        </GradientBadge>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={motionVariants.staggerItem} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, icon: History, color: "text-primary bg-primary/10" },
          { label: "Aujourd'hui", value: stats.today, icon: Clock, color: "text-blue-500 bg-blue-500/10" },
          { label: "Cette semaine", value: stats.thisWeek, icon: Calendar, color: "text-emerald-500 bg-emerald-500/10" },
          { label: "Filtrés", value: filtered.length, icon: Filter, color: "text-purple-500 bg-purple-500/10" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", stat.color)}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Type Filters */}
      <motion.div variants={motionVariants.staggerItem} className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {typeFilters.map((filter) => {
          const isActive = activeTypeFilter === filter.value;
          return (
            <Button
              key={filter.value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setActiveTypeFilter(filter.value)}
            >
              <filter.icon className="w-3 h-3" />
              {filter.label}
            </Button>
          );
        })}
      </motion.div>

      {/* Date Filters */}
      <motion.div variants={motionVariants.staggerItem} className="flex items-center gap-2 flex-wrap">
        <Clock className="w-4 h-4 text-muted-foreground" />
        {dateFilters.map((filter) => {
          const isActive = activeDateFilter === filter.value;
          return (
            <Button
              key={filter.value}
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setActiveDateFilter(filter.value)}
            >
              {filter.label}
            </Button>
          );
        })}
      </motion.div>

      {/* Activity Timeline */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((activity, index) => {
            const config = ACTIVITY_TYPE_CONFIG[activity.type];
            const Icon = config.icon;
            const isExpanded = expandedId === activity.id;

            return (
              <motion.div
                key={activity.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
              >
                <AnimatedCard
                  hoverLift={false}
                  className="cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                >
                  <AnimatedCardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-background", config.bgColor)}>
                        <Icon className={cn("w-4 h-4", config.color)} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground">
                            {activity.title}
                          </p>
                          <Badge variant="secondary" className={cn("text-[10px] h-5", config.bgColor, config.color)}>
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-muted-foreground">
                            {activity.userName}
                          </span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(activity.timestamp)}
                          </span>
                          {activity.tenderRef && (
                            <>
                              <span className="text-[10px] text-muted-foreground">·</span>
                              <span className="text-[10px] text-primary font-medium">
                                {activity.tenderRef}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Expanded details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-3 pt-3 border-t border-border"
                            >
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {activity.description}
                              </p>
                              {activity.tenderTitle && (
                                <div className="mt-2 flex items-center gap-2">
                                  <ExternalLink className="w-3.5 h-3.5 text-primary" />
                                  <span className="text-sm text-primary font-medium">
                                    {activity.tenderTitle}
                                  </span>
                                </div>
                              )}
                              <div className="mt-2 text-[10px] text-muted-foreground">
                                {new Date(activity.timestamp).toLocaleString("fr-FR", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Expand indicator */}
                      <div className="shrink-0 text-muted-foreground">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Aucune activité</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Aucun événement ne correspond à vos filtres
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setActiveTypeFilter("all");
                setActiveDateFilter("all");
              }}
            >
              Réinitialiser les filtres
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
