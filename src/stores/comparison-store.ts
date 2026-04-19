"use client";

import { create } from "zustand";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════════════════
// TenderFlow Guinea — Comparison Store
// Zustand store for managing tender comparison selection (temporary, no persist)
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_COMPARISON_ITEMS = 4;

interface ComparisonState {
  /** Set of tender IDs currently in comparison */
  tenderIds: Set<string>;
  /** Add a tender to comparison */
  addToComparison: (tenderId: string) => void;
  /** Remove a tender from comparison */
  removeFromComparison: (tenderId: string) => void;
  /** Clear all tenders from comparison */
  clearComparison: () => void;
  /** Get the array of tender IDs in comparison */
  getComparisonItems: () => string[];
  /** Check if a tender is in comparison */
  isInComparison: (tenderId: string) => boolean;
  /** Number of items currently in comparison */
  count: number;
}

export const useComparisonStore = create<ComparisonState>((set, get) => ({
  tenderIds: new Set<string>(),
  count: 0,

  addToComparison: (tenderId: string) => {
    const { tenderIds } = get();
    if (tenderIds.has(tenderId)) return; // Already in comparison
    if (tenderIds.size >= MAX_COMPARISON_ITEMS) {
      toast.error(
        `Maximum ${MAX_COMPARISON_ITEMS} appels d'offres dans la comparaison`,
        { description: "Supprimez un appel d'offres avant d'en ajouter un nouveau." }
      );
      return;
    }
    const newSet = new Set(tenderIds);
    newSet.add(tenderId);
    set({ tenderIds: newSet, count: newSet.size });
    toast.success("Ajouté à la comparaison", {
      description: `${newSet.size}/${MAX_COMPARISON_ITEMS} appels d'offres sélectionnés`,
    });
  },

  removeFromComparison: (tenderId: string) => {
    const { tenderIds } = get();
    if (!tenderIds.has(tenderId)) return;
    const newSet = new Set(tenderIds);
    newSet.delete(tenderId);
    set({ tenderIds: newSet, count: newSet.size });
    toast.info("Retiré de la comparaison");
  },

  clearComparison: () => {
    set({ tenderIds: new Set<string>(), count: 0 });
    toast.info("Comparaison réinitialisée");
  },

  getComparisonItems: () => {
    return Array.from(get().tenderIds);
  },

  isInComparison: (tenderId: string) => {
    return get().tenderIds.has(tenderId);
  },
}));
