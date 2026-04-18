/** TenderFlow Guinea — Utility functions */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined, currency: string = "GNF"): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("fr-GN", {
    style: "currency",
    currency: currency === "GNF" ? "GNF" : currency,
    maximumFractionDigits: 0,
  }).format(amount);
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
    case "go": return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950";
    case "go_conditional": return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950";
    case "no_go": return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950";
    default: return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950";
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
    new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    qualifying: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    qualified: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    go: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    no_go: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    responding: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    won: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    lost: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    expired: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
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
