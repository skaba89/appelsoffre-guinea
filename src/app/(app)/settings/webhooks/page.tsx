"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Webhook,
  Plus,
  Trash2,
  Send,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Link2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { motionVariants, transitions } from "@/lib/design-tokens";
import {
  registerWebhook,
  listWebhooks,
  deleteWebhook,
  testWebhook,
  getWebhookDeliveries,
  seedDemoWebhooks,
  WEBHOOK_EVENTS,
  ALL_WEBHOOK_EVENTS,
  webhookStatusLabel,
  webhookStatusColor,
  type WebhookRegistration,
  type WebhookDelivery,
  type WebhookEvent,
} from "@/lib/webhook-engine";

// ─── Helper ────────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatResponseTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ─── Delivery History ──────────────────────────────────────────────────────────

function DeliveryHistory({ webhookId }: { webhookId: string }) {
  const deliveries = useMemo(() => getWebhookDeliveries(webhookId, 10), [webhookId]);

  if (deliveries.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        Aucun historique de livraison
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {deliveries.map((delivery) => (
        <div
          key={delivery.id}
          className="flex items-center justify-between px-3 py-2 rounded-md border border-border hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            {delivery.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive shrink-0" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">
                  {WEBHOOK_EVENTS[delivery.event]?.icon} {WEBHOOK_EVENTS[delivery.event]?.label ?? delivery.event}
                </span>
                <Badge
                  variant="secondary"
                  className={`text-[9px] font-mono px-1.5 py-0 ${
                    delivery.statusCode >= 200 && delivery.statusCode < 300
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                  }`}
                >
                  {delivery.statusCode}
                </Badge>
              </div>
              {delivery.errorMessage && (
                <p className="text-[10px] text-destructive mt-0.5">{delivery.errorMessage}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span>{formatResponseTime(delivery.responseTime)}</span>
            <span>{formatDate(delivery.timestamp)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Webhook Card ───────────────────────────────────────────────────────────────

function WebhookCard({
  webhook,
  onDelete,
  onTest,
}: {
  webhook: WebhookRegistration;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deliveries = useMemo(() => getWebhookDeliveries(webhook.id, 10), [webhook.id]);
  const successRate = useMemo(() => {
    if (deliveries.length === 0) return null;
    const successCount = deliveries.filter((d) => d.success).length;
    return Math.round((successCount / deliveries.length) * 100);
  }, [deliveries]);

  return (
    <>
      <motion.div
        variants={motionVariants.fadeInUp}
        initial="hidden"
        animate="visible"
        transition={transitions.normal}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-primary shrink-0" />
                  <CardTitle className="text-sm font-mono truncate">
                    {webhook.url}
                  </CardTitle>
                </div>
                {webhook.description && (
                  <CardDescription className="text-xs">{webhook.description}</CardDescription>
                )}
              </div>
              <Badge className={`shrink-0 text-[10px] ${webhookStatusColor(webhook.status)}`}>
                {webhookStatusLabel(webhook.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Events */}
            <div className="flex flex-wrap gap-1.5">
              {webhook.events.map((event) => (
                <Badge key={event} variant="outline" className="text-[10px] gap-1">
                  {WEBHOOK_EVENTS[event]?.icon} {WEBHOOK_EVENTS[event]?.label}
                </Badge>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Créé le {formatDate(webhook.createdAt)}
              </span>
              {webhook.lastDelivery && (
                <span>Dernière livraison : {formatDate(webhook.lastDelivery)}</span>
              )}
              {successRate !== null && (
                <span className={`flex items-center gap-1 ${successRate >= 80 ? "text-emerald-600 dark:text-emerald-400" : successRate >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                  {successRate}% de succès
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => onTest(webhook.id)}
              >
                <Send className="w-3 h-3" />
                Tester
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Historique ({deliveries.length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-destructive hover:text-destructive ml-auto"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-3 h-3" />
                Supprimer
              </Button>
            </div>

            {/* Delivery History */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <Separator className="mb-3" />
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-medium text-foreground">Historique de livraison</h4>
                    <DeliveryHistory webhookId={webhook.id} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Supprimer le webhook
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce webhook ? L&apos;URL ne recevra plus de notifications d&apos;événements. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="p-3 bg-muted/50 rounded-lg">
            <code className="text-xs font-mono text-foreground break-all">{webhook.url}</code>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              className="gap-1.5"
              onClick={() => {
                onDelete(webhook.id);
                setShowDeleteConfirm(false);
              }}
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Add Webhook Dialog ─────────────────────────────────────────────────────────

function AddWebhookDialog({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
}) {
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>([]);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleToggleEvent = useCallback((event: WebhookEvent) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
    setErrors((prev) => ({ ...prev, events: "" }));
  }, []);

  const handleSubmit = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!url.trim()) {
      newErrors.url = "L'URL est requise";
    } else {
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
          newErrors.url = "L'URL doit commencer par http:// ou https://";
        }
      } catch {
        newErrors.url = "Format d'URL invalide";
      }
    }

    if (selectedEvents.length === 0) {
      newErrors.events = "Au moins un événement doit être sélectionné";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = registerWebhook(url.trim(), selectedEvents, description.trim());
    if (!result.success) {
      setErrors({ url: result.error || "Erreur d'enregistrement" });
      return;
    }

    toast.success("Webhook enregistré avec succès");
    setUrl("");
    setSelectedEvents([]);
    setDescription("");
    setErrors({});
    onOpenChange(false);
    onAdded();
  }, [url, selectedEvents, description, onOpenChange, onAdded]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Webhook className="w-5 h-5 text-primary" />
            Ajouter un webhook
          </DialogTitle>
          <DialogDescription>
            Enregistrez une URL pour recevoir des notifications d&apos;événements TenderFlow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="webhook-url" className="text-xs font-medium">
              URL du webhook <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="webhook-url"
                placeholder="https://mon-app.gn/webhooks/tenderflow"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setErrors((prev) => ({ ...prev, url: "" }));
                }}
                className="pl-10"
              />
            </div>
            {errors.url && (
              <p className="text-[10px] text-destructive">{errors.url}</p>
            )}
          </div>

          {/* Events */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Événements <span className="text-destructive">*</span>
            </Label>
            <div className="space-y-2">
              {ALL_WEBHOOK_EVENTS.map((event) => {
                const config = WEBHOOK_EVENTS[event];
                return (
                  <div key={event} className="flex items-start gap-3 p-2 rounded-lg border border-border hover:bg-muted/20 transition-colors">
                    <Checkbox
                      id={`event-${event}`}
                      checked={selectedEvents.includes(event)}
                      onCheckedChange={() => handleToggleEvent(event)}
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <Label htmlFor={`event-${event}`} className="text-xs font-medium cursor-pointer">
                        {config.icon} {config.label}
                      </Label>
                      <p className="text-[10px] text-muted-foreground">{config.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.events && (
              <p className="text-[10px] text-destructive">{errors.events}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="webhook-desc" className="text-xs font-medium">
              Description <span className="text-muted-foreground">(optionnel)</span>
            </Label>
            <Input
              id="webhook-desc"
              placeholder="Webhook pour notifications internes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button className="gap-1.5" onClick={handleSubmit}>
            <Plus className="w-4 h-4" />
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookRegistration[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Seed demo data on first load and refresh
  useEffect(() => {
    seedDemoWebhooks();
    const data = listWebhooks();
    queueMicrotask(() => setWebhooks(data));
  }, [refreshKey]);

  const handleDelete = useCallback(
    (id: string) => {
      const result = deleteWebhook(id);
      if (result.success) {
        toast.success("Webhook supprimé avec succès");
        setWebhooks(listWebhooks());
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    },
    []
  );

  const handleTest = useCallback((id: string) => {
    const result = testWebhook(id);
    if (result.success) {
      toast.success("Test envoyé avec succès — code 200 reçu");
      setRefreshKey((k) => k + 1);
    } else {
      toast.error(result.error || "Erreur lors du test");
    }
  }, []);

  const handleAdded = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <motion.div
        variants={motionVariants.fadeInUp}
        initial="hidden"
        animate="visible"
        transition={transitions.normal}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Webhook className="w-5 h-5 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Webhooks</h1>
              <p className="text-sm text-muted-foreground">
                Gérez vos intégrations par webhooks pour les notifications d&apos;événements
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {webhooks.length} webhook{webhooks.length !== 1 ? "s" : ""}
            </Badge>
            <Button className="gap-1.5" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4" />
              Ajouter un webhook
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Info Card ───────────────────────────────────────────────────────── */}
      <motion.div
        variants={motionVariants.fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ ...transitions.normal, delay: 0.05 }}
      >
        <Card className="border-dashed bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Webhook className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <h3 className="text-sm font-medium text-foreground">Comment fonctionnent les webhooks ?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Les webhooks vous permettent de recevoir des notifications en temps réel quand des événements
                  se produisent sur TenderFlow. Enregistrez une URL HTTPS et sélectionnez les événements à surveiller.
                  Lorsqu&apos;un événement se produit, nous envoyons une requête HTTP POST avec les détails de l&apos;événement.
                </p>
                <div className="flex flex-wrap gap-3 mt-2">
                  {ALL_WEBHOOK_EVENTS.map((event) => {
                    const config = WEBHOOK_EVENTS[event];
                    return (
                      <span key={event} className="text-[10px] text-muted-foreground">
                        {config.icon} {config.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Webhook List ────────────────────────────────────────────────────── */}
      {webhooks.length === 0 ? (
        <motion.div
          variants={motionVariants.fadeInScale}
          initial="hidden"
          animate="visible"
          transition={transitions.normal}
        >
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Webhook className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Aucun webhook configuré</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Ajoutez votre premier webhook pour recevoir des notifications en temps réel
                sur vos systèmes externes.
              </p>
              <Button className="gap-1.5 mt-4" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4" />
                Ajouter un webhook
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {webhooks.map((webhook) => (
              <WebhookCard
                key={webhook.id}
                webhook={webhook}
                onDelete={handleDelete}
                onTest={handleTest}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Webhook Dialog */}
      <AddWebhookDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdded={handleAdded}
      />
    </div>
  );
}
