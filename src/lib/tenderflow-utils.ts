import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined, currency: string = "GNF"): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("fr-GN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("fr-FR").format(n);
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function daysUntil(date: string | null | undefined): number | null {
  if (!date) return null;
  const now = new Date();
  const target = new Date(date);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function strategyColor(strategy: string | null | undefined): string {
  switch (strategy) {
    case "go": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "go_conditional": return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    case "no_go": return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
}

export function strategyLabel(strategy: string | null | undefined): string {
  switch (strategy) {
    case "go": return "GO";
    case "go_conditional": return "GO sous conditions";
    case "no_go": return "NO GO";
    default: return "Non évalué";
  }
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    qualifying: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    qualified: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
    go: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    no_go: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    responding: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    won: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    lost: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    expired: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  };
  return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    new: "Nouveau",
    qualifying: "Qualification",
    qualified: "Qualifié",
    go: "GO",
    no_go: "NO GO",
    responding: "En réponse",
    won: "Gagné",
    lost: "Perdu",
    expired: "Expiré",
  };
  return labels[status] || status;
}

export const SECTORS = [
  "BTP", "IT / Digital", "Énergie", "Mines", "Agriculture",
  "Santé", "Éducation", "Conseil", "Fournitures", "Logistique",
  "Maintenance", "Sécurité", "Télécom", "Industrie", "Finance",
  "Eau / Assainissement", "Autres",
];

export const REGIONS = [
  "Conakry", "Kindia", "Boké", "Labé", "Faranah",
  "Kankan", "Nzérékoré", "Mamou", "National",
];
