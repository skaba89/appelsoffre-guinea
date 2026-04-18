"use client";

import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";
import { FileText, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const { loginDemo, isAuthenticated, _hasHydrated } = useAuthStore();

  const handleDemoRegister = () => {
    loginDemo();
    // Full page navigation to avoid RSC issues in iframe
    window.location.href = "/dashboard";
  };

  // If already authenticated, redirect via full page load
  if (_hasHydrated && isAuthenticated) {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <FileText className="w-7 h-7 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-xl">Créer votre espace</CardTitle>
        <CardDescription>Démarrez votre veille des appels d'offres en Guinée</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          className="w-full gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
          size="lg"
          onClick={handleDemoRegister}
        >
          <Building2 className="w-4 h-4" />
          Essai gratuit (Mode Démo)
        </Button>

        <form onSubmit={(e) => { e.preventDefault(); handleDemoRegister(); }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet</Label>
              <Input id="full_name" placeholder="Mamadou Diallo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="vous@entreprise.gn" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant_name">Nom de l'organisation</Label>
            <Input id="tenant_name" placeholder="Mon Entreprise SARL" />
          </div>
          <Button type="submit" variant="outline" className="w-full gap-2">
            Créer le compte <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Déjà inscrit ?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
