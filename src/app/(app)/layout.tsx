"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/app-layout";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only redirect after hydration is complete to avoid flash redirects
    if (_hasHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  // Wait for client mount and hydration before deciding what to render
  if (!mounted || !_hasHydrated) {
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
