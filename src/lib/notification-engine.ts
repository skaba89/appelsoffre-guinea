"use client";

import { create } from "zustand";

// ===== Types =====
export type NotificationType = "deadline" | "new_tender" | "score" | "match" | "system" | "win" | "competitor";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  priority: "low" | "medium" | "high" | "critical";
  meta?: Record<string, string>;
}

// ===== Notification Engine =====
const NOTIFICATION_TEMPLATES = [
  {
    type: "new_tender" as NotificationType,
    title: "Nouvel appel d'offres détecté",
    message: "Construction route Kissidougou–Kérouané — AO/MTP/2026/0142",
    priority: "high" as const,
    link: "/tenders/t-001",
  },
  {
    type: "deadline" as NotificationType,
    title: "Échéance dans 48h",
    message: "Système d'information Ministère des Mines — Date limite : 20 Avr 2026",
    priority: "critical" as const,
    link: "/tenders/t-002",
  },
  {
    type: "score" as NotificationType,
    title: "Score IA disponible",
    message: "AO-2026-0156 : Score 78% — Recommandation GO",
    priority: "medium" as const,
    link: "/tenders/t-003",
  },
  {
    type: "competitor" as NotificationType,
    title: "Mouvement concurrent détecté",
    message: "China Road & Bridge a soumis une offre pour le projet Kankan",
    priority: "high" as const,
  },
  {
    type: "win" as NotificationType,
    title: "Contrat remporté !",
    message: "Votre soumission pour Équipement hospitalier Nzérékoré a été acceptée",
    priority: "high" as const,
  },
  {
    type: "match" as NotificationType,
    title: "Correspondance parfaite",
    message: "Nouvel AO correspondant à 94% à votre profil BTP & Infrastructures",
    priority: "medium" as const,
    link: "/tenders",
  },
  {
    type: "system" as NotificationType,
    title: "Rapport hebdomadaire prêt",
    message: "Le rapport de la semaine 15 est disponible pour téléchargement",
    priority: "low" as const,
  },
];

// ===== Notification Store =====
interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "isRead" | "createdAt">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  startSimulation: () => void;
  stopSimulation: () => void;
}

let simulationInterval: ReturnType<typeof setInterval> | null = null;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: INITIAL_NOTIFICATIONS,
  unreadCount: INITIAL_NOTIFICATIONS.filter((n) => !n.isRead).length,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markRead: (id) => {
    set((state) => {
      const wasUnread = state.notifications.find((n) => n.id === id && !n.isRead);
      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
      };
    });
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  removeNotification: (id) => {
    set((state) => {
      const wasUnread = state.notifications.find((n) => n.id === id && !n.isRead);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
      };
    });
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  startSimulation: () => {
    if (simulationInterval) return;
    simulationInterval = setInterval(() => {
      const template = NOTIFICATION_TEMPLATES[Math.floor(Math.random() * NOTIFICATION_TEMPLATES.length)];
      get().addNotification(template);
    }, 15000); // Every 15 seconds
  },

  stopSimulation: () => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      simulationInterval = null;
    }
  },
}));

// ===== Initial mock notifications =====
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    type: "new_tender",
    title: "Nouvel appel d'offres détecté",
    message: "Construction route Kissidougou–Kérouané — AO/MTP/2026/0142",
    isRead: false,
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    priority: "high",
    link: "/tenders/t-001",
  },
  {
    id: "notif-2",
    type: "deadline",
    title: "Échéance dans 48h",
    message: "Fournitures bureautiques Administration publique — Date limite : 20 Avr 2026",
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    priority: "critical",
    link: "/tenders/t-004",
  },
  {
    id: "notif-3",
    type: "score",
    title: "Score IA disponible",
    message: "AO-2026-0147 : Score 92% — Recommandation GO avec confiance élevée",
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    priority: "medium",
    link: "/tenders/t-001",
  },
  {
    id: "notif-4",
    type: "competitor",
    title: "Mouvement concurrent",
    message: "Vinci Construction a manifesté de l'intérêt pour le projet Boké",
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    priority: "high",
  },
  {
    id: "notif-5",
    type: "win",
    title: "Soumission envoyée",
    message: "Système SI Ministère des Mines — Soumission confirmée",
    isRead: true,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    priority: "medium",
    link: "/tenders/t-002",
  },
  {
    id: "notif-6",
    type: "system",
    title: "Scan automatique terminé",
    message: "18 sources analysées — 7 nouveaux appels d'offres détectés",
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    priority: "low",
  },
];

// ===== Utility functions =====
export function notificationTypeConfig(type: NotificationType): {
  icon: string;
  color: string;
  bgLight: string;
  bgDark: string;
  label: string;
} {
  const configs: Record<NotificationType, { icon: string; color: string; bgLight: string; bgDark: string; label: string }> = {
    deadline: { icon: "clock", color: "text-red-500", bgLight: "bg-red-100", bgDark: "dark:bg-red-900/30", label: "Échéance" },
    new_tender: { icon: "file", color: "text-blue-500", bgLight: "bg-blue-100", bgDark: "dark:bg-blue-900/30", label: "Nouvel AO" },
    score: { icon: "target", color: "text-green-500", bgLight: "bg-green-100", bgDark: "dark:bg-green-900/30", label: "Score" },
    match: { icon: "trending", color: "text-purple-500", bgLight: "bg-purple-100", bgDark: "dark:bg-purple-900/30", label: "Match" },
    system: { icon: "shield", color: "text-gray-500", bgLight: "bg-gray-100", bgDark: "dark:bg-gray-900/30", label: "Système" },
    win: { icon: "trophy", color: "text-amber-500", bgLight: "bg-amber-100", bgDark: "dark:bg-amber-900/30", label: "Victoire" },
    competitor: { icon: "alert", color: "text-orange-500", bgLight: "bg-orange-100", bgDark: "dark:bg-orange-900/30", label: "Concurrent" },
  };
  return configs[type] || configs.system;
}

export function priorityConfig(priority: string): { color: string; label: string } {
  const configs: Record<string, { color: string; label: string }> = {
    critical: { color: "text-red-600 bg-red-100 dark:bg-red-900/40", label: "Critique" },
    high: { color: "text-orange-600 bg-orange-100 dark:bg-orange-900/40", label: "Haute" },
    medium: { color: "text-blue-600 bg-blue-100 dark:bg-blue-900/40", label: "Moyenne" },
    low: { color: "text-gray-600 bg-gray-100 dark:bg-gray-900/40", label: "Basse" },
  };
  return configs[priority] || configs.medium;
}

export function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
