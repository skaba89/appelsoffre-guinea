"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import AppLayout from "@/components/layout/app-layout";
import {
  FileText, Zap, Mail, Lock, ArrowRight, Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { KeyboardShortcutsDialog } from "@/components/ui/keyboard-shortcuts-dialog";

/**
 * Inline login form rendered when user is not authenticated.
 * This avoids any router.replace() calls that cause RSC redirect loops
 * in iframe environments.
 */
function InlineLoginForm() {
  const { loginDemo } = useAuthStore();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <FileText className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-xl">Connexion à TenderFlow</CardTitle>
          <CardDescription>Accédez à votre espace de veille des appels d'offres</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
            size="lg"
            onClick={loginDemo}
          >
            <Zap className="w-4 h-4" />
            Accéder en mode Démo
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); loginDemo(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email professionnel</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@entreprise.gn"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" variant="outline" className="w-full gap-2">
              Se connecter <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Onboarding banner shown when user hasn't completed onboarding.
 * Uses client-side navigation (router.push) to avoid middleware conflicts.
 */
function OnboardingBanner({ onNavigate }: { onNavigate: () => void }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20"
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-primary shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-medium">Bienvenue !</span>{" "}
            Personnalisez votre expérience en configurant votre profil.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={onNavigate}
        >
          <Rocket className="w-3.5 h-3.5" />
          Configurer
        </Button>
      </div>
    </motion.div>
  );
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const { isComplete, _hasHydrated: onboardingHydrated } = useOnboardingStore();
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const redirectRef = useRef(false);

  useEffect(() => {
    // Give Zustand a short window to hydrate from localStorage.
    // If localStorage is blocked (iframe), _hasHydrated may already be true
    // from the onRehydrateStorage callback with safeLocalStorage fallback.
    // If not hydrated after 1.5s, force ready state to unblock the UI.
    const timeout = setTimeout(() => {
      setReady(true);
    }, 1500);

    if (_hasHydrated && onboardingHydrated) {
      clearTimeout(timeout);
      // Use microtask to avoid synchronous setState in effect
      queueMicrotask(() => setReady(true));
    }

    return () => clearTimeout(timeout);
  }, [_hasHydrated, onboardingHydrated]);

  // Show onboarding banner if authenticated and onboarding not complete
  // (but not on the onboarding page itself)
  const showOnboardingBanner = ready && isAuthenticated && !isComplete && pathname !== "/onboarding";

  // Handle onboarding navigation
  const handleGoToOnboarding = () => {
    if (!redirectRef.current) {
      redirectRef.current = true;
      router.push("/onboarding");
    }
  };

  // Show loading spinner while waiting for hydration or timeout
  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // NOT authenticated → show inline login form (NO router.replace!)
  // This completely avoids redirect loops in iframe / RSC contexts
  if (!isAuthenticated) {
    return <InlineLoginForm />;
  }

  // Authenticated → show the app
  return (
    <>
      <AnimatePresence>
        {showOnboardingBanner && (
          <OnboardingBanner onNavigate={handleGoToOnboarding} />
        )}
      </AnimatePresence>
      <AppLayout>{children}</AppLayout>
      <KeyboardShortcutsDialog />
    </>
  );
}
