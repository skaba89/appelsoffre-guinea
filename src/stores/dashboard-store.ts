"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ═══════════════════════════════════════════════════════════════════════════════
// TenderFlow Guinea — Dashboard Widget Store
// Zustand store with persist middleware for customizable dashboard layout
// ═══════════════════════════════════════════════════════════════════════════════

export type WidgetSize = "sm" | "md" | "lg";

export interface WidgetLayout {
  id: string;
  type: string;
  visible: boolean;
  order: number;
  size: WidgetSize;
}

export const WIDGET_TYPES: Record<string, { label: string; description: string; defaultSize: WidgetSize }> = {
  StatsOverview: { label: "Vue d'ensemble KPI", description: "Indicateurs clés : Total AO, Actifs, Score moyen, Échéances", defaultSize: "lg" },
  RecentTenders: { label: "Appels d'offres récents", description: "5 derniers AO avec scores et délais", defaultSize: "md" },
  GuineaMap: { label: "Carte de Guinée", description: "Carte interactive des régions", defaultSize: "lg" },
  ScoreDistribution: { label: "Distribution des scores", description: "Répartition des scores par tranche", defaultSize: "md" },
  SectorChart: { label: "AO par secteur", description: "Graphique horizontal des secteurs", defaultSize: "md" },
  DeadlineAlerts: { label: "Alertes échéances", description: "AO avec deadline < 7 jours", defaultSize: "md" },
  QuickActions: { label: "Actions rapides", description: "Boutons d'accès rapide", defaultSize: "sm" },
};

const DEFAULT_WIDGETS: WidgetLayout[] = [
  { id: "w-stats", type: "StatsOverview", visible: true, order: 0, size: "lg" },
  { id: "w-recent", type: "RecentTenders", visible: true, order: 1, size: "md" },
  { id: "w-map", type: "GuineaMap", visible: true, order: 2, size: "lg" },
  { id: "w-scores", type: "ScoreDistribution", visible: true, order: 3, size: "md" },
  { id: "w-sector", type: "SectorChart", visible: true, order: 4, size: "md" },
  { id: "w-deadlines", type: "DeadlineAlerts", visible: true, order: 5, size: "md" },
  { id: "w-actions", type: "QuickActions", visible: true, order: 6, size: "sm" },
];

interface DashboardState {
  widgets: WidgetLayout[];
  isCustomizing: boolean;
  _hasHydrated: boolean;

  addWidget: (type: string) => void;
  removeWidget: (id: string) => void;
  reorderWidgets: (orderedIds: string[]) => void;
  moveWidget: (fromIndex: number, toIndex: number) => void;
  toggleWidget: (id: string) => void;
  setWidgetSize: (id: string, size: WidgetSize) => void;
  resetToDefault: () => void;
  setCustomizing: (v: boolean) => void;
  setHasHydrated: (v: boolean) => void;
  getVisibleWidgets: () => WidgetLayout[];
}

function safeLocalStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const testKey = "__tf_dash_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return localStorage;
  } catch {
    return undefined;
  }
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      widgets: DEFAULT_WIDGETS,
      isCustomizing: false,
      _hasHydrated: false,

      addWidget: (type: string) => {
        const { widgets } = get();
        const existing = widgets.find((w) => w.type === type && !w.visible);
        if (existing) {
          set({
            widgets: widgets.map((w) =>
              w.id === existing.id ? { ...w, visible: true } : w
            ),
          });
          return;
        }
        const config = WIDGET_TYPES[type];
        if (!config) return;
        const id = `w-${type.toLowerCase()}-${Date.now()}`;
        const maxOrder = widgets.reduce((max, w) => Math.max(max, w.order), 0);
        set({
          widgets: [
            ...widgets,
            { id, type, visible: true, order: maxOrder + 1, size: config.defaultSize },
          ],
        });
      },

      removeWidget: (id: string) =>
        set((s) => ({
          widgets: s.widgets.map((w) =>
            w.id === id ? { ...w, visible: false } : w
          ),
        })),

      reorderWidgets: (orderedIds: string[]) =>
        set((s) => {
          const orderMap = new Map(orderedIds.map((id, i) => [id, i]));
          return {
            widgets: s.widgets.map((w) => ({
              ...w,
              order: orderMap.get(w.id) ?? w.order,
            })),
          };
        }),

      moveWidget: (fromIndex: number, toIndex: number) =>
        set((s) => {
          const visible = s.widgets
            .filter((w) => w.visible)
            .sort((a, b) => a.order - b.order);
          if (fromIndex < 0 || fromIndex >= visible.length) return s;
          const clampedTo = Math.max(0, Math.min(toIndex, visible.length - 1));
          if (fromIndex === clampedTo) return s;
          const reordered = [...visible];
          const [moved] = reordered.splice(fromIndex, 1);
          reordered.splice(clampedTo, 0, moved);
          const orderMap = new Map(reordered.map((w, i) => [w.id, i]));
          return {
            widgets: s.widgets.map((w) => ({
              ...w,
              order: orderMap.get(w.id) ?? w.order,
            })),
          };
        }),

      toggleWidget: (id: string) =>
        set((s) => ({
          widgets: s.widgets.map((w) =>
            w.id === id ? { ...w, visible: !w.visible } : w
          ),
        })),

      setWidgetSize: (id: string, size: WidgetSize) =>
        set((s) => ({
          widgets: s.widgets.map((w) =>
            w.id === id ? { ...w, size } : w
          ),
        })),

      resetToDefault: () => set({ widgets: DEFAULT_WIDGETS }),

      setCustomizing: (v: boolean) => set({ isCustomizing: v }),

      setHasHydrated: (v: boolean) => set({ _hasHydrated: v }),

      getVisibleWidgets: () =>
        get()
          .widgets.filter((w) => w.visible)
          .sort((a, b) => a.order - b.order),
    }),
    {
      name: "tenderflow-dashboard",
      partialize: (state) => ({
        widgets: state.widgets,
        isCustomizing: state.isCustomizing,
      }),
      storage: createJSONStorage(() => safeLocalStorage() ?? {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
