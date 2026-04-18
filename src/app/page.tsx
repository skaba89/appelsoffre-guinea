"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Target, Bot, Users, FileText,
  Zap, ArrowRight, BarChart3, Workflow,
  Shield, Globe, Clock, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GradientBadge } from "@/components/ui/gradient-badge";

const features = [
  {
    icon: Search,
    title: "Veille automatisée",
    description: "Collecte automatique des appels d'offres depuis 50+ sources guinéennes et internationales, 24h/24. Notre crawler parcourt les sites gouvernementaux, les journaux officiels et les plateformes internationales pour ne rien manquer.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Target,
    title: "Scoring intelligent",
    description: "Évaluation multi-critères avec recommandation GO/NO-GO basée sur votre profil entreprise. Notre moteur ML analyse 8 critères clés pour maximiser votre taux de succès sur les soumissions.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Bot,
    title: "Assistant IA RAG",
    description: "Analyse sémantique des documents réglementaires guinéens, génération de réponses et aide à la rédaction. Base de connaissances intégrée sur le Code des Marchés Publics de Guinée.",
    gradient: "from-purple-500 to-violet-500",
  },
  {
    icon: Users,
    title: "CRM intégré",
    description: "Gestion des contacts professionnels, suivi des opportunités et pipeline de réponse aux appels d'offres. Conçu spécifiquement pour le marché guinéen avec ses réseaux institutionnels.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: BarChart3,
    title: "Prédictions IA",
    description: "Probabilités de victoire, prévisions sectorielles, pricing optimal et analyse des concurrents. Anticipez les tendances du marché des marchés publics guinéens.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Workflow,
    title: "Automatisation ETL",
    description: "Pipeline d'extraction, transformation et chargement avec détection de doublons et classification automatique. 18 sources guinéennes surveillées en continu.",
    gradient: "from-indigo-500 to-blue-500",
  },
];

const stats = [
  { value: "500+", label: "Appels d'offres actifs", icon: Search },
  { value: "50+", label: "Sources surveillées", icon: Globe },
  { value: "98%", label: "Précision du scoring", icon: Target },
  { value: "24/7", label: "Veille continue", icon: Clock },
];

const trustIndicators = [
  "Code des Marchés Publics Guinée 2018",
  "Décret d'application en vigueur",
  "Conformité Loi PPP",
  "Données RGPD-ready",
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function LandingPage() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      window.location.href = "/dashboard";
    }
  }, [_hasHydrated, isAuthenticated]);

  if (_hasHydrated && isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
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
              <Button size="sm" className="gap-2">
                <Zap className="w-3.5 h-3.5" /> Essai gratuit
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <GradientBadge variant="primary" size="md" animated className="mb-6">
                <Zap className="w-3.5 h-3.5 mr-1" /> Plateforme SaaS nouvelle génération
              </GradientBadge>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl lg:text-6xl font-bold text-foreground tracking-tight"
            >
              Veillez, Qualifiez,
              <span className="text-primary"> Gagnez</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            >
              TenderFlow Guinea est la plateforme intelligente de veille, qualification et traitement
              des appels d'offres publics et privés en Guinée. Automatisez votre veille, évaluez les
              opportunités et maximisez votre taux de succès.
            </motion.p>

            <motion.div variants={itemVariants} className="mt-8 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2 shadow-premium-md">
                  Commencer gratuitement <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Voir la démo
                </Button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={itemVariants}
              className="mt-10 flex items-center justify-center gap-4 flex-wrap"
            >
              {trustIndicators.map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {item}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={itemVariants} className="text-center">
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-foreground">Tout ce dont vous avez besoin</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Une suite complète d&apos;outils pour transformer votre approche des appels d&apos;offres en Guinée
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="border-border hover:shadow-premium-lg transition-all duration-300 h-full group">
                <CardContent className="p-6">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section className="bg-card/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground">Comment ça marche</h2>
            <p className="mt-3 text-muted-foreground">3 étapes pour maximiser vos chances de succès</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                step: "01",
                title: "Configurez votre profil",
                desc: "Renseignez les compétences, secteurs et zones d'intervention de votre entreprise. Notre IA calcule automatiquement votre score de matching.",
                icon: Shield,
              },
              {
                step: "02",
                title: "Recevez les opportunités",
                desc: "Notre crawler surveille 50+ sources guinéennes en temps réel. Les appels d'offres correspondants arrivent directement dans votre tableau de bord.",
                icon: Search,
              },
              {
                step: "03",
                title: "Soumettez avec confiance",
                desc: "Analysez chaque opportunité avec le scoring IA, générez vos réponses avec l'assistant RAG et suivez vos soumissions dans le CRM intégré.",
                icon: CheckCircle2,
              },
            ].map((item) => (
              <motion.div key={item.step} variants={itemVariants} className="relative text-center">
                <div className="text-6xl font-bold text-primary/10 absolute -top-4 left-1/2 -translate-x-1/2">
                  {item.step}
                </div>
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-700" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-primary-foreground">Prêt à transformer votre veille ?</h2>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Rejoignez les entreprises qui font confiance à TenderFlow Guinea pour leurs appels d&apos;offres.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="gap-2 shadow-premium-lg">
                  Démarrer maintenant <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
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
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <span>Conditions d&apos;utilisation</span>
              <span>Politique de confidentialité</span>
              <span>Contact</span>
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
