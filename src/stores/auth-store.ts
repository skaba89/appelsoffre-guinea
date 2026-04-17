"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  setAuth: (data: { user: User; access_token: string }) => void;
  loginDemo: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      tenantId: null,
      role: null,

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
    }),
    {
      name: "tenderflow-auth",
    }
  )
);
