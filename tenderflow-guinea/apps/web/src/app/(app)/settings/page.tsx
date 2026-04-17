"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { Settings, Users, Shield, Bell, Palette, Save, UserPlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { user, role } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "organization" | "members" | "notifications">("profile");

  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
  });

  const { data: members } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      try {
        const res = await authApi.getMe();
        return res.data;
      } catch {
        return null;
      }
    },
  });

  const [inviteForm, setInviteForm] = useState({ email: "", full_name: "", role: "viewer" });
  const inviteMutation = useMutation({
    mutationFn: (data: any) => authApi.invite(data),
    onSuccess: () => {
      setInviteForm({ email: "", full_name: "", role: "viewer" });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  const isAdmin = role === "tenant_admin" || role === "super_admin";

  const tabs = [
    { id: "profile" as const, label: "Profil", icon: UserPlus },
    { id: "organization" as const, label: "Organisation", icon: Settings },
    { id: "members" as const, label: "Membres", icon: Users },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground mt-1">Gérez votre profil et votre organisation</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Profile tab */}
      {activeTab === "profile" && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Informations personnelles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nom complet</label>
              <input
                value={profileForm.full_name}
                onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input
                value={profileForm.email}
                disabled
                className="w-full px-3 py-2 rounded-lg border border-input bg-muted text-muted-foreground text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
              <Save className="w-4 h-4" /> Sauvegarder
            </button>
          </div>
        </div>
      )}

      {/* Organization tab */}
      {activeTab === "organization" && isAdmin && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Paramètres organisation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nom de l&apos;organisation</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
                  placeholder="Mon organisation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Slug</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
                  placeholder="mon-organisation"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
                <Save className="w-4 h-4" /> Sauvegarder
              </button>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-destructive" /> Zone dangereuse
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              La suppression de l&apos;organisation est irréversible. Toutes les données seront perdues.
            </p>
            <button className="mt-4 px-4 py-2 rounded-lg border border-destructive text-destructive text-sm font-medium hover:bg-destructive/10">
              <Trash2 className="w-4 h-4 inline mr-1" /> Supprimer l&apos;organisation
            </button>
          </div>
        </div>
      )}

      {activeTab === "organization" && !isAdmin && (
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground/30" />
          <p className="mt-2 text-muted-foreground">Seuls les administrateurs peuvent modifier les paramètres de l&apos;organisation.</p>
        </div>
      )}

      {/* Members tab */}
      {activeTab === "members" && (
        <div className="space-y-6">
          {isAdmin && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Inviter un membre</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nom complet</label>
                  <input
                    value={inviteForm.full_name}
                    onChange={(e) => setInviteForm((p) => ({ ...p, full_name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
                    placeholder="Nom du collaborateur"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
                    placeholder="email@exemple.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Rôle</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm((p) => ({ ...p, role: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
                  >
                    <option value="viewer">Lecteur</option>
                    <option value="analyst">Analyste</option>
                    <option value="sales">Commercial</option>
                    <option value="bid_manager">Répondant AO</option>
                    <option value="tenant_admin">Administrateur</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => inviteMutation.mutate(inviteForm)}
                  disabled={!inviteForm.email || !inviteForm.full_name || inviteMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  {inviteMutation.isPending ? "Envoi..." : "Inviter"}
                </button>
              </div>
            </div>
          )}

          {/* Current member info */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Membres de l&apos;organisation</h2>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                    {user?.full_name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                  {role === "tenant_admin" ? "Admin" : role === "analyst" ? "Analyste" : role === "sales" ? "Commercial" : role === "bid_manager" ? "Répondant" : "Lecteur"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications tab */}
      {activeTab === "notifications" && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <h2 className="text-lg font-semibold text-foreground">Préférences de notification</h2>

          <div className="space-y-4">
            {[
              { id: "new_tender", label: "Nouveaux appels d'offres", desc: "Recevez une alerte quand un nouvel AO correspondant à votre profil est détecté" },
              { id: "deadline_reminder", label: "Rappels d'échéance", desc: "Notification 7 jours, 3 jours et 1 jour avant la date limite" },
              { id: "score_update", label: "Mise à jour des scores", desc: "Soyez informé quand le score d'un AO que vous suivez change" },
              { id: "crm_activity", label: "Activité CRM", desc: "Tâches, interactions et mises à jour d'opportunités" },
              { id: "digest_daily", label: "Résumé quotidien", desc: "Email récapitulatif quotidien des nouvelles opportunités" },
              { id: "digest_weekly", label: "Résumé hebdomadaire", desc: "Email récapitulatif hebdomadaire avec analyse des tendances" },
            ].map((pref) => (
              <div key={pref.id} className="flex items-start justify-between py-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{pref.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{pref.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <input type="checkbox" defaultChecked className="rounded border-input" />
                    Email
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <input type="checkbox" defaultChecked className="rounded border-input" />
                    In-app
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
              <Save className="w-4 h-4" /> Sauvegarder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
