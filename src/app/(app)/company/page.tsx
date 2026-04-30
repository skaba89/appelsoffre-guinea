"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2, Plus, Trash2, Save, MapPin, Globe,
  Users, Briefcase, TrendingUp, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScoreGauge } from "@/components/ui/score-gauge";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { Progress } from "@/components/ui/progress";
import { motionVariants } from "@/lib/design-tokens";

const references = [
  { id: "r-1", client: "Ministère des Travaux Publics", project: "SIG Gestion des Marchés", year: "2025", amount: "2,5 Mds GNF", sector: "IT / Digital" },
  { id: "r-2", client: "AGUIPE", project: "Portail e-Administration", year: "2024", amount: "1,2 Mds GNF", sector: "IT / Digital" },
  { id: "r-3", client: "SOGUIPAMI", project: "Système de Cartographie Minière", year: "2024", amount: "3,8 Mds GNF", sector: "Mines" },
  { id: "r-4", client: "EDG", project: "Réseau intelligent Conakry", year: "2023", amount: "5,2 Mds GNF", sector: "Énergie" },
];

const sectorStrengths = [
  { sector: "IT / Digital", score: 92, color: "bg-blue-500" },
  { sector: "BTP & Infra", score: 68, color: "bg-emerald-500" },
  { sector: "Mines", score: 55, color: "bg-amber-500" },
  { sector: "Énergie", score: 45, color: "bg-orange-500" },
  { sector: "Santé", score: 30, color: "bg-red-500" },
];

const zones = [
  { name: "Conakry", active: true },
  { name: "Kindia", active: true },
  { name: "Boké", active: true },
  { name: "Kankan", active: true },
  { name: "Nzérékoré", active: false },
  { name: "Labé", active: false },
  { name: "Mamou", active: false },
  { name: "Faranah", active: false },
];

export default function CompanyPage() {
  const [activeTab, setActiveTab] = useState<"info" | "references" | "matching">("info");

  return (
    <motion.div
      className="space-y-6"
      variants={motionVariants.staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={motionVariants.staggerItem} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profil entreprise</h1>
          <p className="text-sm text-muted-foreground mt-1">Configurez votre profil pour un meilleur matching avec les appels d&apos;offres</p>
        </div>
        <div className="flex items-center gap-2">
          {["info", "references", "matching"].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className="text-xs"
            >
              {tab === "info" ? "Informations" : tab === "references" ? "Références" : "Matching IA"}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Info Tab */}
      {activeTab === "info" && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" /> Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Nom de l&apos;entreprise</Label><Input defaultValue="Digital Solutions Guinée SARL" /></div>
                  <div className="space-y-2"><Label>NIF</Label><Input placeholder="Numéro d&apos;identification fiscale" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Secteur principal</Label><Input defaultValue="IT / Digital" /></div>
                  <div className="space-y-2"><Label>Effectif</Label><Input defaultValue="25-50" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Siège social</Label><Input defaultValue="Conakry, Kaloum" /></div>
                  <div className="space-y-2"><Label>Site web</Label><Input defaultValue="https://dsg-guinee.com" /></div>
                </div>
                <div className="space-y-2">
                  <Label>Compétences clés</Label>
                  <Textarea defaultValue="Développement de systèmes d'information, Intelligence artificielle, Cybersécurité, Gestion de projets IT, Formation et accompagnement numérique" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Zones d&apos;intervention</Label>
                  <div className="flex flex-wrap gap-2">
                    {zones.map((zone) => (
                      <Badge
                        key={zone.name}
                        variant={zone.active ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        {zone.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button className="gap-2"><Save className="w-4 h-4" /> Enregistrer</Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Matching Score Gauge */}
            <AnimatedCard hoverLift={false} className="p-0">
              <AnimatedCardHeader className="pb-2">
                <CardTitle className="text-base text-center">Score de matching</CardTitle>
              </AnimatedCardHeader>
              <AnimatedCardContent className="pt-0 flex flex-col items-center">
                <ScoreGauge score={72} size="md" />
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Compatibilité moyenne avec les AO actifs
                </p>
                <GradientBadge variant="success" size="sm" className="mt-2">Bon profil</GradientBadge>
              </AnimatedCardContent>
            </AnimatedCard>

            {/* Quick stats */}
            <AnimatedCard hoverLift={false} className="p-0">
              <AnimatedCardContent className="p-4">
                <div className="space-y-3">
                  {[
                    { icon: Briefcase, label: "Références", value: "4" },
                    { icon: Users, label: "AO répondus", value: "12" },
                    { icon: TrendingUp, label: "Taux de succès", value: "33%", valueColor: "text-emerald-600" },
                    { icon: Globe, label: "Zones actives", value: "4/8" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <stat.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className={`text-sm font-semibold ${stat.valueColor || "text-foreground"}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </AnimatedCardContent>
            </AnimatedCard>
          </div>
        </motion.div>
      )}

      {/* References Tab */}
      {activeTab === "references" && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Références clients</CardTitle>
                <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Ajouter</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {references.map((ref) => (
                  <div key={ref.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{ref.project}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{ref.client}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{ref.year}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">{ref.sector}</Badge>
                      <Badge variant="outline" className="text-xs">{ref.amount}</Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Matching IA Tab */}
      {activeTab === "matching" && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          {/* Sector strengths */}
          <AnimatedCard hoverLift={false} className="p-0">
            <AnimatedCardHeader className="pb-2">
              <CardTitle className="text-base">Force sectorielle</CardTitle>
            </AnimatedCardHeader>
            <AnimatedCardContent className="pt-0 space-y-4">
              {sectorStrengths.map((sector) => (
                <div key={sector.sector} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{sector.sector}</span>
                    <span className="text-sm font-semibold text-foreground">{sector.score}%</span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`absolute left-0 top-0 h-full rounded-full ${sector.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${sector.score}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </AnimatedCardContent>
          </AnimatedCard>

          {/* Recommendations */}
          <AnimatedCard hoverLift={false} className="p-0">
            <AnimatedCardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Recommandations IA
              </CardTitle>
            </AnimatedCardHeader>
            <AnimatedCardContent className="pt-0 space-y-3">
              {[
                { title: "Renforcez votre présence Mines", desc: "Votre score secteur Mines est à 55%. Ajoutez des références minières pour améliorer votre matching.", priority: "high" },
                { title: "Étendez à Nzérékoré", desc: "Zone forestière avec 18 AO actifs. Activer cette zone augmenterait votre couverture de 22%.", priority: "medium" },
                { title: "Ajoutez des certifications", desc: "Les AO du BTP exigent souvent ISO 9001. Ajoutez vos certifications pour +15% de matching.", priority: "medium" },
              ].map((rec) => (
                <div key={rec.title} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{rec.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rec.desc}</p>
                  </div>
                  <GradientBadge variant={rec.priority === "high" ? "destructive" : "primary"} size="sm">
                    {rec.priority === "high" ? "Priorité" : "Conseil"}
                  </GradientBadge>
                </div>
              ))}
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>
      )}
    </motion.div>
  );
}
