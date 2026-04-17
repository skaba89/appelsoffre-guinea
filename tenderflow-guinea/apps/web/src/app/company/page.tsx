"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyApi } from "@/lib/api";
import { Building2, Save, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function CompanyPage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({ queryKey: ["company-profile"], queryFn: async () => { try { const res = await companyApi.getProfile(); return res.data; } catch { return null; } } });
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});

  const updateMutation = useMutation({
    mutationFn: (data: any) => profile ? companyApi.updateProfile(data) : companyApi.createProfile(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["company-profile"] }); setEditMode(false); },
  });

  if (isLoading) return <div className="text-center py-20 text-muted-foreground">Chargement...</div>;

  const currentProfile = editMode ? form : profile;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profil entreprise</h1>
          <p className="text-muted-foreground mt-1">Configuration du profil pour le matching et les réponses</p>
        </div>
        <button onClick={() => { if (!editMode) { setForm(profile || {}); setEditMode(true); } else { updateMutation.mutate(form); } }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
          {editMode ? <><Save className="w-4 h-4" /> {updateMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}</> : "Modifier"}
        </button>
      </div>

      {!profile && !editMode ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <Building2 className="w-16 h-16 mx-auto text-muted-foreground/20" />
          <p className="mt-4 text-foreground font-medium">Profil non configuré</p>
          <p className="text-sm text-muted-foreground mt-1">Configurez votre profil pour activer le matching automatique</p>
          <button onClick={() => { setForm({ company_name: "", description: "", activities: [], sectors: [], specializations: [], countries: ["GN"], regions: [], certifications: [], technical_capabilities: [] }); setEditMode(true); }}
            className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Créer le profil</button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground mb-1">Nom de l'entreprise</label>
              {editMode ? <input value={form.company_name || ""} onChange={(e) => setForm((p: any) => ({ ...p, company_name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" /> :
              <p className="text-foreground">{currentProfile?.company_name || "—"}</p>}</div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Tranche d'effectif</label>
              {editMode ? <input value={form.team_size_range || ""} onChange={(e) => setForm((p: any) => ({ ...p, team_size_range: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="ex: 10-50" /> :
              <p className="text-foreground">{currentProfile?.team_size_range || "—"}</p>}</div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-foreground mb-1">Description</label>
              {editMode ? <textarea value={form.description || ""} onChange={(e) => setForm((p: any) => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" /> :
              <p className="text-sm text-foreground/80">{currentProfile?.description || "—"}</p>}</div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Secteurs</label>
              {editMode ? <input value={(form.sectors || []).join(", ")} onChange={(e) => setForm((p: any) => ({ ...p, sectors: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="BTP, IT, Énergie..." /> :
              <div className="flex flex-wrap gap-1">{(currentProfile?.sectors || []).map((s: string, i: number) => <span key={i} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">{s}</span>)}</div>}</div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Certifications</label>
              {editMode ? <input value={(form.certifications || []).join(", ")} onChange={(e) => setForm((p: any) => ({ ...p, certifications: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" /> :
              <div className="flex flex-wrap gap-1">{(currentProfile?.certifications || []).map((s: string, i: number) => <span key={i} className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">{s}</span>)}</div>}</div>
          </div>
        </div>
      )}
    </div>
  );
}
