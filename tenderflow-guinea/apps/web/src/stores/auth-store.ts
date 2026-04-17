/** TenderFlow Guinea — Auth Store (Zustand) */
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
  refreshToken: string | null;
  isAuthenticated: boolean;
  tenantId: string | null;
  role: string | null;

  setAuth: (data: {
    user: User;
    access_token: string;
    refresh_token: string;
  }) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      tenantId: null,
      role: null,

      setAuth: (data) => {
        const membership = data.user.memberships?.[0];
        set({
          user: data.user,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          isAuthenticated: true,
          tenantId: membership?.tenant_id || null,
          role: membership?.role || null,
        });
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
        }
      },

      setUser: (user) => {
        const membership = user.memberships?.[0];
        set({ user, tenantId: membership?.tenant_id || null, role: membership?.role || null });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          tenantId: null,
          role: null,
        });
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      },
    }),
    {
      name: "tenderflow-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tenantId: state.tenantId,
        role: state.role,
      }),
    }
  )
);
