"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AppLayout from "@/components/layout/app-layout";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [canRender, setCanRender] = useState(false);
  const redirectAttempted = useRef(false);

  useEffect(() => {
    // Wait for zustand persist to rehydrate from localStorage
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      // Prevent multiple redirect calls
      if (!redirectAttempted.current) {
        redirectAttempted.current = true;
        router.replace("/login");
      }
    } else {
      // Auth is confirmed, allow rendering
      redirectAttempted.current = false;
      setCanRender(true);
    }
  }, [_hasHydrated, isAuthenticated, router]);

  // While hydrating or not yet confirmed auth, show a loading spinner
  if (!canRender || !_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Redirection...</p>
        </div>
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
