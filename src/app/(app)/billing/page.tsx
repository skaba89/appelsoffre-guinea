"use client";

import { CheckCircle2, Zap, Building2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const plans = [
  {
    name: "Starter",
    icon: Zap,
    price: "0",
    period: "/mois",
    description: "Pour découvrir TenderFlow",
    features: ["5 appels d'offres/mois", "1 source de veille", "Scoring basique", "1 utilisateur"],
    current: false,
  },
  {
    name: "Professionnel",
    icon: Building2,
    price: "150 000",
    period: "/mois",
    description: "Pour les PME et ETI",
    features: ["Appels d'offres illimités", "10 sources de veille", "Scoring avancé + IA", "5 utilisateurs", "CRM intégré", "Prompts automatiques"],
    current: true,
  },
  {
    name: "Entreprise",
    icon: Crown,
    price: "500 000",
    period: "/mois",
    description: "Pour les grands comptes",
    features: ["Tout Professionnel", "Sources illimitées", "API & intégrations", "Utilisateurs illimités", "Support prioritaire", "SLA garanti"],
    current: false,
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Abonnement & Facturation</h1>
        <p className="text-muted-foreground mt-1">Gérez votre plan et votre utilisation</p>
      </div>

      {/* Current plan */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-primary-foreground">Plan actuel</Badge>
                <h2 className="text-lg font-bold text-foreground">Professionnel</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Facturation mensuelle — 150 000 GNF/mois</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Prochaine facturation</p>
              <p className="text-sm font-medium text-foreground">1er mai 2026</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Appels d'offres", used: 47, total: "∞" },
              { label: "Sources actives", used: 5, total: 10 },
              { label: "Utilisateurs", used: 3, total: 5 },
              { label: "Prompts générés", used: 28, total: "∞" },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{item.used} / {item.total}</p>
                {typeof item.total === "number" && (
                  <Progress value={(item.used / item.total) * 100} className="h-1.5 mt-1" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Changer de plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(plan => {
            const Icon = plan.icon;
            return (
              <Card key={plan.name} className={plan.current ? "border-primary" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-foreground">{plan.price} GNF</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <div className="space-y-2 mb-6">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        <span className="text-xs text-muted-foreground">{f}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full"
                    variant={plan.current ? "outline" : "default"}
                    disabled={plan.current}
                  >
                    {plan.current ? "Plan actuel" : "Choisir ce plan"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
