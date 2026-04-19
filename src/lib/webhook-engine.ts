// ═══════════════════════════════════════════════════════════════════════════════
// TenderFlow Guinea — Webhook Engine
// Webhook registration, delivery simulation, and management
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Types ──────────────────────────────────────────────────────────────────────

export type WebhookEvent =
  | "new_tender"
  | "deadline_reminder"
  | "score_update"
  | "competitor_alert";

export interface WebhookRegistration {
  id: string;
  url: string;
  events: WebhookEvent[];
  description: string;
  createdAt: string;
  status: "active" | "paused" | "error";
  lastDelivery?: string;
  userId?: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: Record<string, unknown>;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

export const WEBHOOK_EVENTS: Record<WebhookEvent, { label: string; description: string; icon: string }> = {
  new_tender: {
    label: "Nouvel appel d'offres",
    description: "Déclenché quand un nouvel appel d'offres est détecté",
    icon: "📢",
  },
  deadline_reminder: {
    label: "Rappel d'échéance",
    description: "Déclenché avant la date limite d'un appel d'offres",
    icon: "⏰",
  },
  score_update: {
    label: "Mise à jour de score",
    description: "Déclenché quand le score d'un appel d'offres est recalculé",
    icon: "📊",
  },
  competitor_alert: {
    label: "Alerte concurrent",
    description: "Déclenché quand une activité concurrente est détectée",
    icon: "🔴",
  },
};

export const ALL_WEBHOOK_EVENTS: WebhookEvent[] = [
  "new_tender",
  "deadline_reminder",
  "score_update",
  "competitor_alert",
];

// ─── In-Memory Store ────────────────────────────────────────────────────────────

const webhookStore: Map<string, WebhookRegistration> = new Map();
const deliveryStore: Map<string, WebhookDelivery[]> = new Map();

// ─── URL Validation ─────────────────────────────────────────────────────────────

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

// ─── ID Generation ──────────────────────────────────────────────────────────────

function generateId(): string {
  return `wh-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Register Webhook ───────────────────────────────────────────────────────────

export function registerWebhook(
  url: string,
  events: WebhookEvent[],
  description: string
): { success: boolean; webhook?: WebhookRegistration; error?: string } {
  // Validate URL
  if (!url || !isValidUrl(url)) {
    return { success: false, error: "L'URL du webhook est invalide. Elle doit commencer par http:// ou https://" };
  }

  // Validate events
  if (!events || events.length === 0) {
    return { success: false, error: "Au moins un événement doit être sélectionné" };
  }

  const invalidEvents = events.filter((e) => !ALL_WEBHOOK_EVENTS.includes(e));
  if (invalidEvents.length > 0) {
    return { success: false, error: `Événements invalides : ${invalidEvents.join(", ")}` };
  }

  // Check for duplicate URL
  const existing = Array.from(webhookStore.values()).find((w) => w.url === url);
  if (existing) {
    return { success: false, error: "Un webhook avec cette URL existe déjà" };
  }

  const id = generateId();
  const webhook: WebhookRegistration = {
    id,
    url,
    events,
    description,
    createdAt: new Date().toISOString(),
    status: "active",
  };

  webhookStore.set(id, webhook);
  deliveryStore.set(id, []);

  return { success: true, webhook };
}

// ─── Deliver Webhook ────────────────────────────────────────────────────────────

export function deliverWebhook(
  webhookId: string,
  event: WebhookEvent,
  payload: Record<string, unknown>
): { success: boolean; delivery?: WebhookDelivery; error?: string } {
  const webhook = webhookStore.get(webhookId);
  if (!webhook) {
    return { success: false, error: "Webhook introuvable" };
  }

  if (!webhook.events.includes(event)) {
    return { success: false, error: `Ce webhook n'est pas abonné à l'événement ${event}` };
  }

  // Simulate delivery with random success/fail
  const isSuccess = Math.random() > 0.2; // 80% success rate
  const responseTime = Math.floor(Math.random() * 800) + 100; // 100-900ms
  const statusCode = isSuccess
    ? 200
    : Math.random() > 0.5
      ? 500
      : 503;

  const delivery: WebhookDelivery = {
    id: `del-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    webhookId,
    event,
    payload,
    statusCode,
    responseTime,
    timestamp: new Date().toISOString(),
    success: isSuccess,
    errorMessage: isSuccess ? undefined : statusCode === 500 ? "Erreur interne du serveur" : "Service indisponible",
  };

  // Store delivery
  const deliveries = deliveryStore.get(webhookId) || [];
  deliveries.unshift(delivery);
  deliveryStore.set(webhookId, deliveries.slice(0, 50)); // Keep last 50

  // Update webhook last delivery
  webhook.lastDelivery = delivery.timestamp;
  if (!isSuccess && webhook.status === "active") {
    // Don't change status on first failure, but could implement retry logic
  }

  return { success: true, delivery };
}

// ─── Get Webhook Deliveries ─────────────────────────────────────────────────────

export function getWebhookDeliveries(webhookId: string, limit = 10): WebhookDelivery[] {
  const deliveries = deliveryStore.get(webhookId) || [];
  return deliveries.slice(0, limit);
}

// ─── Delete Webhook ─────────────────────────────────────────────────────────────

export function deleteWebhook(webhookId: string): { success: boolean; error?: string } {
  if (!webhookStore.has(webhookId)) {
    return { success: false, error: "Webhook introuvable" };
  }

  webhookStore.delete(webhookId);
  deliveryStore.delete(webhookId);
  return { success: true };
}

// ─── List Webhooks ──────────────────────────────────────────────────────────────

export function listWebhooks(): WebhookRegistration[] {
  return Array.from(webhookStore.values());
}

// ─── Get Webhook by ID ──────────────────────────────────────────────────────────

export function getWebhook(webhookId: string): WebhookRegistration | undefined {
  return webhookStore.get(webhookId);
}

// ─── Test Webhook ───────────────────────────────────────────────────────────────

export function testWebhook(webhookId: string): { success: boolean; delivery?: WebhookDelivery; error?: string } {
  const webhook = webhookStore.get(webhookId);
  if (!webhook) {
    return { success: false, error: "Webhook introuvable" };
  }

  const testPayload = {
    event: "test",
    message: "Ceci est un test de webhook TenderFlow Guinea",
    timestamp: new Date().toISOString(),
    webhookId,
    testMode: true,
  };

  // For test, always succeed
  const delivery: WebhookDelivery = {
    id: `del-test-${Date.now().toString(36)}`,
    webhookId,
    event: webhook.events[0],
    payload: testPayload,
    statusCode: 200,
    responseTime: Math.floor(Math.random() * 300) + 50,
    timestamp: new Date().toISOString(),
    success: true,
  };

  const deliveries = deliveryStore.get(webhookId) || [];
  deliveries.unshift(delivery);
  deliveryStore.set(webhookId, deliveries.slice(0, 50));

  webhook.lastDelivery = delivery.timestamp;

  return { success: true, delivery };
}

// ─── Seed Demo Webhooks ────────────────────────────────────────────────────────

export function seedDemoWebhooks(): void {
  const existing = listWebhooks();
  if (existing.length > 0) return;

  const demo1 = registerWebhook(
    "https://mon-app.gn/webhooks/tenderflow",
    ["new_tender", "deadline_reminder"],
    "Webhook pour notifications internes"
  );

  if (demo1.webhook) {
    // Add some mock deliveries
    const mockDeliveries: WebhookDelivery[] = [
      {
        id: "del-mock-1",
        webhookId: demo1.webhook.id,
        event: "new_tender",
        payload: { tenderId: "t-001", reference: "AO/MTP/2026/0142", title: "Construction pont Kouroussa" },
        statusCode: 200,
        responseTime: 245,
        timestamp: "2026-04-15T10:30:00Z",
        success: true,
      },
      {
        id: "del-mock-2",
        webhookId: demo1.webhook.id,
        event: "deadline_reminder",
        payload: { tenderId: "t-010", daysLeft: 3 },
        statusCode: 200,
        responseTime: 312,
        timestamp: "2026-04-15T06:00:00Z",
        success: true,
      },
      {
        id: "del-mock-3",
        webhookId: demo1.webhook.id,
        event: "new_tender",
        payload: { tenderId: "t-015", reference: "AO/SGG/2026/0089" },
        statusCode: 503,
        responseTime: 5000,
        timestamp: "2026-04-14T08:00:00Z",
        success: false,
        errorMessage: "Service indisponible",
      },
      {
        id: "del-mock-4",
        webhookId: demo1.webhook.id,
        event: "deadline_reminder",
        payload: { tenderId: "t-006", daysLeft: 1 },
        statusCode: 200,
        responseTime: 189,
        timestamp: "2026-04-13T09:00:00Z",
        success: true,
      },
      {
        id: "del-mock-5",
        webhookId: demo1.webhook.id,
        event: "new_tender",
        payload: { tenderId: "t-012", reference: "AO/AGUIPE/2026/0019" },
        statusCode: 200,
        responseTime: 156,
        timestamp: "2026-04-12T14:00:00Z",
        success: true,
      },
    ];
    deliveryStore.set(demo1.webhook.id, mockDeliveries);
  }

  const demo2 = registerWebhook(
    "https://api.dsg-gn.com/hooks/score",
    ["score_update", "competitor_alert"],
    "Alertes de score et concurrents"
  );

  if (demo2.webhook) {
    const mockDeliveries2: WebhookDelivery[] = [
      {
        id: "del-mock-6",
        webhookId: demo2.webhook.id,
        event: "score_update",
        payload: { tenderId: "t-003", oldScore: 88, newScore: 95 },
        statusCode: 200,
        responseTime: 198,
        timestamp: "2026-04-15T08:00:00Z",
        success: true,
      },
      {
        id: "del-mock-7",
        webhookId: demo2.webhook.id,
        event: "competitor_alert",
        payload: { competitorName: "China Road and Bridge", tenderId: "t-007" },
        statusCode: 500,
        responseTime: 3000,
        timestamp: "2026-04-14T12:00:00Z",
        success: false,
        errorMessage: "Erreur interne du serveur",
      },
    ];
    deliveryStore.set(demo2.webhook.id, mockDeliveries2);
  }
}

// ─── Utility ────────────────────────────────────────────────────────────────────

export function webhookStatusLabel(status: WebhookRegistration["status"]): string {
  const labels: Record<WebhookRegistration["status"], string> = {
    active: "Actif",
    paused: "En pause",
    error: "Erreur",
  };
  return labels[status];
}

export function webhookStatusColor(status: WebhookRegistration["status"]): string {
  const colors: Record<WebhookRegistration["status"], string> = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    paused: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    error: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  };
  return colors[status];
}
