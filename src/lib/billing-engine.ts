// ─── TenderFlow Guinea — Billing Engine ────────────────────────────────────────

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  limits: {
    tenders: number | null; // null = unlimited
    scoring: number | null;
    aiQueries: number | null;
    storage: number; // GB
    teamMembers: number;
  };
  popular?: boolean;
  enterprise?: boolean;
}

export interface UsageMetrics {
  tenders: { used: number; limit: number | null };
  scoring: { used: number; limit: number | null };
  aiQueries: { used: number; limit: number | null };
  storage: { used: number; limit: number };
  teamMembers: { used: number; limit: number };
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue";
  planName: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// ─── Plans ─────────────────────────────────────────────────────────────────────

export const PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Gratuit",
    price: 0,
    currency: "€",
    period: "/mois",
    description: "Pour découvrir la plateforme",
    features: [
      "5 appels d'offres/mois",
      "10 scorings IA",
      "5 requêtes assistant IA",
      "0.5 Go stockage",
      "1 membre d'équipe",
    ],
    limits: { tenders: 5, scoring: 10, aiQueries: 5, storage: 0.5, teamMembers: 1 },
  },
  {
    id: "starter",
    name: "Starter",
    price: 49,
    currency: "€",
    period: "/mois",
    description: "Pour les PME guinéennes",
    features: [
      "50 appels d'offres/mois",
      "100 scorings IA",
      "50 requêtes assistant IA",
      "5 Go stockage",
      "5 membres d'équipe",
      "Alertes email",
      "Export PDF",
    ],
    limits: { tenders: 50, scoring: 100, aiQueries: 50, storage: 5, teamMembers: 5 },
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 149,
    currency: "€",
    period: "/mois",
    description: "Pour les entreprises en croissance",
    features: [
      "Appels d'offres illimités",
      "Scorings IA illimités",
      "500 requêtes assistant IA",
      "50 Go stockage",
      "25 membres d'équipe",
      "Alertes email + push",
      "Export PDF + Excel",
      "API Access",
    ],
    limits: { tenders: null, scoring: null, aiQueries: 500, storage: 50, teamMembers: 25 },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 0,
    currency: "€",
    period: "sur devis",
    description: "Pour les grandes organisations",
    features: [
      "Appels d'offres illimités",
      "Scorings IA illimités",
      "Requêtes IA illimitées",
      "500 Go stockage",
      "Membres illimités",
      "Alertes + SMS + Webhooks",
      "Tous les formats d'export",
      "API + SSO + RBAC avancé",
    ],
    limits: { tenders: null, scoring: null, aiQueries: null, storage: 500, teamMembers: 999 },
    enterprise: true,
  },
];

// ─── Current Usage (mock) ─────────────────────────────────────────────────────

export function getCurrentUsage(): UsageMetrics {
  return {
    tenders: { used: 32, limit: 50 },
    scoring: { used: 67, limit: 100 },
    aiQueries: { used: 23, limit: 50 },
    storage: { used: 2.3, limit: 5 },
    teamMembers: { used: 4, limit: 5 },
  };
}

// ─── Limit Check ──────────────────────────────────────────────────────────────

export function checkLimit(
  usage: UsageMetrics,
  resource: keyof UsageMetrics
): { allowed: boolean; percentUsed: number } {
  const item = usage[resource];
  const limit = item.limit;
  if (limit === null) return { allowed: true, percentUsed: 0 };
  const percentUsed = Math.round((item.used / limit) * 100);
  return { allowed: item.used < limit, percentUsed };
}

// ─── Invoice Generation ──────────────────────────────────────────────────────

export function generateInvoice(plan: SubscriptionPlan, month: string): Invoice {
  const items: InvoiceItem[] = [
    {
      description: `Abonnement TenderFlow ${plan.name} — ${month}`,
      quantity: 1,
      unitPrice: plan.price,
      total: plan.price,
    },
  ];

  // Add overage items for demo
  const usage = getCurrentUsage();
  if (usage.tenders.used > 50 && plan.id === "starter") {
    const overage = usage.tenders.used - 50;
    const unitPrice = 0.5;
    items.push({
      description: `Appels d'offres supplémentaires (${overage} au-delà du forfait)`,
      quantity: overage,
      unitPrice,
      total: overage * unitPrice,
    });
  }

  return {
    id: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`,
    date: new Date().toLocaleDateString("fr-FR"),
    amount: items.reduce((sum, i) => sum + i.total, 0),
    currency: plan.currency,
    status: "pending",
    planName: plan.name,
    items,
  };
}
