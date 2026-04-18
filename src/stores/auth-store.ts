"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  is_active: boolean;
  is_superuser: boolean;
  memberships: Array<{
    id: string;
    tenant_id: string;
    role: string;
    is_active: boolean;
  }>;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  tenantId: string | null;
  role: string | null;
  _hasHydrated: boolean;
  setAuth: (data: { user: User; access_token: string }) => void;
  loginDemo: () => void;
  logout: () => void;
  setHasHydrated: (v: boolean) => void;
}

/**
 * Safe localStorage wrapper that handles:
 * - SSR (no window)
 * - Third-party iframe restrictions (localStorage blocked)
 * - Quota exceeded errors
 */
function safeLocalStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    // Test if localStorage is actually accessible
    const testKey = "__tf_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return localStorage;
  } catch {
    // localStorage is blocked (e.g. third-party iframe)
    return undefined;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      tenantId: null,
      role: null,
      _hasHydrated: false,

      setAuth: (data) => {
        const membership = data.user.memberships?.[0];
        set({
          user: data.user,
          accessToken: data.access_token,
          isAuthenticated: true,
          tenantId: membership?.tenant_id || null,
          role: membership?.role || null,
        });
      },

      loginDemo: () => {
        set({
          user: {
            id: "demo-1",
            email: "demo@tenderflow.gn",
            full_name: "Mamadou Diallo",
            avatar_url: null,
            is_active: true,
            is_superuser: false,
            memberships: [
              {
                id: "mem-1",
                tenant_id: "tenant-1",
                role: "tenant_admin",
                is_active: true,
              },
            ],
          },
          accessToken: "demo-token",
          isAuthenticated: true,
          tenantId: "tenant-1",
          role: "tenant_admin",
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          tenantId: null,
          role: null,
        });
      },

      setHasHydrated: (v: boolean) => {
        set({ _hasHydrated: v });
      },
    }),
    {
      name: "tenderflow-auth",
      // Only persist auth data, NOT internal flags like _hasHydrated
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        tenantId: state.tenantId,
        role: state.role,
      }),
      // Use safe localStorage that handles iframe restrictions
      storage: createJSONStorage(() => safeLocalStorage() ?? {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }),
      onRehydrateStorage: () => (state) => {
        // Always mark as hydrated, even if rehydration failed
        state?.setHasHydrated(true);
      },
    }
  )
);
