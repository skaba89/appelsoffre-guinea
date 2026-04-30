"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface FavoritesState {
  favorites: string[];
  _hasHydrated: boolean;

  addFavorite: (tenderId: string) => void;
  removeFavorite: (tenderId: string) => void;
  toggleFavorite: (tenderId: string) => void;
  isFavorite: (tenderId: string) => boolean;
  getFavorites: () => string[];
  getFavoriteCount: () => number;
  setHasHydrated: (v: boolean) => void;
}

function safeLocalStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const testKey = "__tf_fav_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return localStorage;
  } catch {
    return undefined;
  }
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      _hasHydrated: false,

      addFavorite: (tenderId: string) =>
        set((s) => {
          if (s.favorites.includes(tenderId)) return s;
          return { favorites: [...s.favorites, tenderId] };
        }),

      removeFavorite: (tenderId: string) =>
        set((s) => ({
          favorites: s.favorites.filter((id) => id !== tenderId),
        })),

      toggleFavorite: (tenderId: string) => {
        const { favorites } = get();
        if (favorites.includes(tenderId)) {
          get().removeFavorite(tenderId);
        } else {
          get().addFavorite(tenderId);
        }
      },

      isFavorite: (tenderId: string): boolean => {
        return get().favorites.includes(tenderId);
      },

      getFavorites: (): string[] => {
        return get().favorites;
      },

      getFavoriteCount: (): number => {
        return get().favorites.length;
      },

      setHasHydrated: (v: boolean) => set({ _hasHydrated: v }),
    }),
    {
      name: "tenderflow-favorites",
      partialize: (state) => ({
        favorites: state.favorites,
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
