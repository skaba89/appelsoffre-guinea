"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Workflow, Play, Pause, Plus, ArrowRight, Clock,
  Zap, Mail, FileCheck, Bell, Bot, RefreshCw,
  CheckCircle2, AlertTriangle, Settings2, MoreVertical,
} from "lucide-react";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motionVariants } from "@/lib/design-tokens";

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

export default function WorkflowsPage() {
  const [expandedId, setExpandedId] = useState<string | null>("wf-1");

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
