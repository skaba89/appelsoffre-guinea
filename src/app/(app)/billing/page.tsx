"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Check, Zap, Building2, Crown, ArrowRight,
  BarChart3, FileText, Bot, Users, HardDrive, Key, Webhook,
  TrendingUp, Download, Copy, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnimatedCard } from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { motionVariants, transitions, chartColors } from "@/lib/design-tokens";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanFeature {
  label: string;
  included: boolean;
  detail?: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: PlanFeature[];
  limits: {
    tenders: number | null;
    scoring: number | null;
    aiQueries: number | null;
    storage: number;
    teamMembers: number;
  };
  popular?: boolean;
  enterprise?: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue";
  plan: string;
  downloadUrl: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PLANS: SubscriptionPlan[] = [
  {
    id: "free", name: "Gratuit", price: 0, currency: "€", period: "/mois",
    description: "Pour découvrir la plateforme",
    limits: { tenders: 5, scoring: 10, aiQueries: 5, storage: 0.5, teamMembers: 1 },
    features: [
      { label: "5 appels d'offres/mois", included: true },
      { label: "10 scorings IA", included: true },
      { label: "5 requêtes assistant IA", included: true },
      { label: "0.5 Go stockage", included: true },
      { label: "1 membre d'équipe", included: true },
      { label: "Alertes email", included: false },
      { label: "Export PDF", included: false },
      { label: "API Access", included: false },
    ],
  },
  {
    id: "starter", name: "Starter", price: 49, currency: "€", period: "/mois",
    description: "Pour les PME guinéennes",
    limits: { tenders: 50, scoring: 100, aiQueries: 50, storage: 5, teamMembers: 5 },
    popular: true,
    features: [
      { label: "50 appels d'offres/mois", included: true },
      { label: "100 scorings IA", included: true },
      { label: "50 requêtes assistant IA", included: true },
      { label: "5 Go stockage", included: true },
      { label: "5 membres d'équipe", included: true },
      { label: "Alertes email", included: true },
      { label: "Export PDF", included: true },
      { label: "API Access", included: false, detail: "Pro requis" },
    ],
  },
  {
    id: "pro", name: "Pro", price: 149, currency: "€", period: "/mois",
    description: "Pour les entreprises en croissance",
    limits: { tenders: null, scoring: null, aiQueries: 500, storage: 50, teamMembers: 25 },
    features: [
      { label: "Appels d'offres illimités", included: true },
      { label: "Scorings IA illimités", included: true },
      { label: "500 requêtes assistant IA", included: true },
      { label: "50 Go stockage", included: true },
      { label: "25 membres d'équipe", included: true },
      { label: "Alertes email + push", included: true },
      { label: "Export PDF + Excel", included: true },
      { label: "API Access", included: true },
    ],
  },
  {
    id: "enterprise", name: "Enterprise", price: 0, currency: "", period: "sur devis",
    description: "Pour les grandes organisations",
    limits: { tenders: null, scoring: null, aiQueries: null, storage: 500, teamMembers: 999 },
    enterprise: true,
    features: [
      { label: "Appels d'offres illimités", included: true },
      { label: "Scorings IA illimités", included: true },
      { label: "Requêtes IA illimitées", included: true },
      { label: "500 Go stockage", included: true },
      { label: "Membres illimités", included: true },
      { label: "Alertes + SMS + Webhooks", included: true },
      { label: "Tous les formats d'export", included: true },
      { label: "API + SSO + RBAC avancé", included: true },
    ],
  },
];

const USAGE = {
  tenders: { used: 32, limit: 50 },
  scoring: { used: 67, limit: 100 },
  aiQueries: { used: 23, limit: 50 },
  storage: { used: 2.3, limit: 5 },
};

const INVOICES: Invoice[] = [
  { id: "INV-2026-0042", date: "1 Avr 2026", amount: 49, currency: "€", status: "paid", plan: "Starter", downloadUrl: "#" },
  { id: "INV-2026-0038", date: "1 Mar 2026", amount: 49, currency: "€", status: "paid", plan: "Starter", downloadUrl: "#" },
  { id: "INV-2026-0031", date: "1 Fév 2026", amount: 49, currency: "€", status: "paid", plan: "Starter", downloadUrl: "#" },
  { id: "INV-2026-0025", date: "1 Jan 2026", amount: 49, currency: "€", status: "paid", plan: "Starter", downloadUrl: "#" },
  { id: "INV-2025-0019", date: "1 Déc 2025", amount: 0, currency: "€", status: "paid", plan: "Gratuit", downloadUrl: "#" },
];

const USAGE_HISTORY = [
  { month: "Nov", tenders: 18, scoring: 35, ai: 8 },
  { month: "Déc", tenders: 22, scoring: 42, ai: 12 },
  { month: "Jan", tenders: 28, scoring: 55, ai: 18 },
  { month: "Fév", tenders: 35, scoring: 68, ai: 22 },
  { month: "Mar", tenders: 30, scoring: 72, ai: 20 },
  { month: "Avr", tenders: 32, scoring: 67, ai: 23 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const currentPlan = PLANS.find((p) => p.id === "starter")!;

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
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Abonnement & Facturation</h1>
          <p className="text-muted-foreground mt-1">Gérez votre plan et votre utilisation</p>
        </div>
        <GradientBadge variant="primary" size="md">Plan Starter</GradientBadge>
      </motion.div>

      {/* Current Plan & Usage */}
      <motion.div variants={motionVariants.staggerItem}>
        <AnimatedCard hoverLift={false} className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Plan {currentPlan.name}</h2>
                <p className="text-sm text-muted-foreground">{currentPlan.price > 0 ? `${currentPlan.price}${currentPlan.currency}${currentPlan.period}` : currentPlan.period}</p>
              </div>
            </div>
            <Button className="gap-2">
              <Crown className="w-4 h-4" /> Passer au Pro
            </Button>
          </div>

          {/* Usage meters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Appels d'offres", icon: FileText, ...USAGE.tenders },
              { label: "Scorings IA", icon: BarChart3, ...USAGE.scoring },
              { label: "Requêtes IA", icon: Bot, ...USAGE.aiQueries },
              { label: "Stockage (Go)", icon: HardDrive, ...USAGE.storage },
            ].map((item) => {
              const pct = Math.round((item.used / item.limit) * 100);
              return (
                <div key={item.label} className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <item.icon className="w-3.5 h-3.5" />
                      {item.label}
                    </div>
                    <span className={cn("text-xs font-semibold", pct >= 90 ? "text-red-600" : pct >= 70 ? "text-amber-600" : "text-emerald-600")}>
                      {pct}%
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {item.used} / {item.limit} {item.label === "Stockage (Go)" ? "Go" : "ce mois"}
                  </p>
                </div>
              );
            })}
          </div>
        </AnimatedCard>
      </motion.div>

      {/* Plan Comparison */}
      <motion.div variants={motionVariants.staggerItem}>
        <h3 className="text-lg font-semibold text-foreground mb-4">Comparaison des plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-xl border p-5 flex flex-col",
                plan.popular ? "border-primary ring-2 ring-primary/20" : "border-border",
                plan.id === "starter" ? "bg-primary/5" : "bg-card"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <GradientBadge variant="primary" size="sm">Populaire</GradientBadge>
                </div>
              )}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  {plan.id === "free" && <Zap className="w-5 h-5 text-muted-foreground" />}
                  {plan.id === "starter" && <TrendingUp className="w-5 h-5 text-primary" />}
                  {plan.id === "pro" && <Crown className="w-5 h-5 text-amber-500" />}
                  {plan.id === "enterprise" && <Building2 className="w-5 h-5 text-purple-500" />}
                  <h4 className="text-lg font-bold text-foreground">{plan.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-3">
                  {plan.enterprise ? (
                    <span className="text-2xl font-bold text-foreground">Sur devis</span>
                  ) : (
                    <span className="text-2xl font-bold text-foreground">
                      {plan.price > 0 ? `${plan.price}${plan.currency}` : "Gratuit"}
                      {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 flex-1 mb-4">
                {plan.features.map((f) => (
                  <div key={f.label} className="flex items-center gap-2">
                    {f.included ? (
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-muted-foreground/30 shrink-0" />
                    )}
                    <span className={cn("text-sm", f.included ? "text-foreground" : "text-muted-foreground")}>
                      {f.label}
                    </span>
                    {f.detail && <span className="text-[10px] text-muted-foreground">({f.detail})</span>}
                  </div>
                ))}
              </div>

              <Button
                variant={plan.id === "starter" ? "outline" : "default"}
                className="w-full gap-2"
                disabled={plan.id === "starter"}
              >
                {plan.id === "starter" ? "Plan actuel" : plan.enterprise ? "Contacter les ventes" : "Choisir ce plan"}
                {plan.id !== "starter" && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Invoice History */}
      <motion.div variants={motionVariants.staggerItem}>
        <AnimatedCard hoverLift={false} className="p-0">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Historique des factures</h3>
          </div>
          <div className="divide-y divide-border">
            {INVOICES.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{inv.id}</p>
                    <p className="text-xs text-muted-foreground">{inv.date} · Plan {inv.plan}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">
                    {inv.amount > 0 ? `${inv.amount}${inv.currency}` : "—"}
                  </span>
                  <Badge
                    className={cn(
                      "text-[10px] border-0",
                      inv.status === "paid" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" :
                      inv.status === "pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" :
                      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    )}
                  >
                    {inv.status === "paid" ? "Payée" : inv.status === "pending" ? "En attente" : "En retard"}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </AnimatedCard>
      </motion.div>

      {/* API & Integrations */}
      <motion.div variants={motionVariants.staggerItem}>
        <AnimatedCard hoverLift={false} className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">API & Intégrations</h3>
            <GradientBadge variant="info" size="sm">Pro+</GradientBadge>
          </div>

          <div className="space-y-4">
            {/* API Key */}
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm font-medium text-foreground mb-2">Clé API</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-md bg-background border border-border text-xs font-mono">
                  {showApiKey ? "tf_live_sk_a1b2c3d4e5f6g7h8i9j0" : "••••••••••••••••••••••••"}
                </code>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setShowApiKey(!showApiKey)}>
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Webhook URL */}
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm font-medium text-foreground mb-2">URL Webhook</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-md bg-background border border-border text-xs font-mono">
                  https://api.tenderflow.gn/webhooks/wh_8e2e4773
                </code>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                <Webhook className="w-3 h-3 inline mr-1" />
                Recevez des notifications en temps réel pour chaque nouvel appel d'offres détecté
              </p>
            </div>
          </div>
        </AnimatedCard>
      </motion.div>
    </motion.div>
  );
}

function cn(...inputs: (string | boolean | undefined)[]) {
  return inputs.filter(Boolean).join(" ");
}
