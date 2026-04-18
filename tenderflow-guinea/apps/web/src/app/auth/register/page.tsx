"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", full_name: "", tenant_name: "", tenant_slug: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères"); return; }
    setLoading(true);
    try {
      const { data: tokenData } = await authApi.register(form);
      const { data: userData } = await authApi.getMe();
      setAuth({ user: userData, access_token: tokenData.access_token, refresh_token: tokenData.refresh_token });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-foreground">TenderFlow</h1>
              <p className="text-xs text-muted-foreground">Guinée</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Créer votre workspace</h2>
          <p className="text-muted-foreground mt-1">Commencez votre veille des appels d'offres en Guinée</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4">
          {error && <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Nom complet</label>
              <input type="text" value={form.full_name} onChange={(e) => update("full_name", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Amadou Diallo" required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Email professionnel</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="amadou@entreprise.com" required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Mot de passe</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring pr-10"
                  placeholder="Min. 8 caractères" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nom du workspace</label>
              <input type="text" value={form.tenant_name} onChange={(e) => update("tenant_name", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Mon Entreprise SARL" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Identifiant</label>
              <input type="text" value={form.tenant_slug} onChange={(e) => update("tenant_slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-"))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="mon-entreprise" pattern="[a-z0-9][a-z0-9\-]*[a-z0-9]" required />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
            {loading ? "Création..." : "Créer mon workspace"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Déjà inscrit ? <Link href="/auth/login" className="text-primary hover:underline font-medium">Se connecter</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
