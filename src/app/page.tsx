"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  Search, Target, Bot, Users, FileText, TrendingUp,
  Shield, Zap, Globe, ArrowRight, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Search,
    title: "Veille automatisée",
    description: "Collecte automatique des appels d'offres depuis 50+ sources guinéennes et internationales, 24h/24.",
  },
  {
    icon: Target,
    title: "Scoring intelligent",
    description: "Évaluation multi-critères avec recommandation GO/NO-GO basée sur votre profil entreprise.",
  },
  {
    icon: Bot,
    title: "Assistant IA",
    description: "Analyse sémantique des documents, génération de prompts et aide à la rédaction des réponses.",
  },
  {
    icon: Users,
    title: "CRM intégré",
    description: "Gestion des contacts professionnels, suivi des opportunités et pipeline de réponse aux appels d'offres.",
  },
];

const stats = [
  { value: "500+", label: "Appels d'offres" },
  { value: "50+", label: "Sources surveillées" },
  { value: "98%", label: "Précision du scoring" },
  { value: "24/7", label: "Veille continue" },
];

export default function LandingPage() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const redirectAttempted = useRef(false);

  useEffect(() => {
    // Only redirect after full hydration and confirmed authenticated
    if (_hasHydrated && isAuthenticated && !redirectAttempted.current) {
      redirectAttempted.current = true;
      router.replace("/dashboard");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  // Don't render landing content if authenticated (avoid flash)
  if (_hasHydrated && isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">TenderFlow</h1>
              <p className="text-[10px] text-muted-foreground leading-none">Guinée</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Essai gratuit</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
              <Zap className="w-3 h-3" />
              Plateforme SaaS nouvelle génération
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground tracking-tight">
              Veillez, Qualifiez,
              <span className="text-primary"> Gagnez</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              TenderFlow Guinea est la plateforme intelligente de veille, qualification et traitement
              des appels d'offres publics et privés en Guinée. Automatisez votre veille, évaluez les
              opportunités et maximisez votre taux de succès.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Commencer gratuitement <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Voir la démo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">Tout ce dont vous avez besoin</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Une suite complète d'outils pour transformer votre approche des appels d'offres en Guinée
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold">Prêt à transformer votre veille ?</h2>
          <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
            Rejoignez les entreprises qui font confiance à TenderFlow Guinea pour leurs appels d'offres.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="gap-2">
                Démarrer maintenant <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">TenderFlow Guinea</span>
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} TenderFlow Guinea. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
