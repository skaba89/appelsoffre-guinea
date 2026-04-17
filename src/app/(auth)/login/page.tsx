"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Mail, Lock, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginDemo, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleDemoLogin = () => {
    loginDemo();
    router.push("/dashboard");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleDemoLogin();
  };

  return (
    <Card className="border-border">
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
        {/* Demo login button */}
        <Button
          className="w-full gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
          size="lg"
          onClick={handleDemoLogin}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email professionnel</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="vous@entreprise.gn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button type="submit" variant="outline" className="w-full gap-2">
            Se connecter <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Créer un compte
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
