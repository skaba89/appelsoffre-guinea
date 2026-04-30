"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmApi } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import { Building2, Search, Plus, Globe, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AccountsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["crm-accounts", { search, type: typeFilter }],
    queryFn: async () => { const res = await crmApi.listAccounts({ search: search || undefined, type: typeFilter || undefined, page_size: 50 }); return res.data; },
  });

  const [showCreate, setShowCreate] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: "", type: "company", sector: "", website: "", city: "", country: "GN", is_public_buyer: false, source_url: "", source_label: "" });
  const createMutation = useMutation({
    mutationFn: (data: any) => crmApi.createAccount(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["crm-accounts"] }); setShowCreate(false); setNewAccount({ name: "", type: "company", sector: "", website: "", city: "", country: "GN", is_public_buyer: false, source_url: "", source_label: "" }); },
  });

  const accounts = data?.items || [];
  const typeLabels: Record<string, string> = { buyer: "Acheteur public", company: "Entreprise", partner: "Partenaire", competitor: "Concurrent" };
  const typeColors: Record<string, string> = { buyer: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", company: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200", partner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", competitor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comptes CRM</h1>
          <p className="text-muted-foreground mt-1">{data?.total || 0} organisations</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"><Plus className="w-4 h-4" /> Nouveau compte</button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Rechercher..." /></div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
          <option value="">Tous types</option><option value="buyer">Acheteur</option><option value="company">Entreprise</option><option value="partner">Partenaire</option><option value="competitor">Concurrent</option>
        </select>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Nouveau compte</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="block text-sm font-medium text-foreground mb-1">Nom *</label><input value={newAccount.name} onChange={(e) => setNewAccount(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Type</label><select value={newAccount.type} onChange={(e) => setNewAccount(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"><option value="buyer">Acheteur public</option><option value="company">Entreprise</option><option value="partner">Partenaire</option><option value="competitor">Concurrent</option></select></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Secteur</label><input value={newAccount.sector} onChange={(e) => setNewAccount(p => ({ ...p, sector: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Site web</label><input value={newAccount.website} onChange={(e) => setNewAccount(p => ({ ...p, website: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Ville</label><input value={newAccount.city} onChange={(e) => setNewAccount(p => ({ ...p, city: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Source URL</label><input value={newAccount.source_url} onChange={(e) => setNewAccount(p => ({ ...p, source_url: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="URL publique traçable" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Source label</label><input value={newAccount.source_label} onChange={(e) => setNewAccount(p => ({ ...p, source_label: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" /></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={newAccount.is_public_buyer} onChange={(e) => setNewAccount(p => ({ ...p, is_public_buyer: e.target.checked }))} /><label className="text-sm text-foreground">Acheteur public</label></div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent">Annuler</button>
            <button onClick={() => createMutation.mutate(newAccount)} disabled={!newAccount.name || createMutation.isPending} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">{createMutation.isPending ? "Création..." : "Créer"}</button>
          </div>
        </div>
      )}

      {/* Accounts list */}
      {accounts.length === 0 ? (
        <div className="text-center py-12"><Building2 className="w-16 h-16 mx-auto text-muted-foreground/20" /><p className="mt-4 text-muted-foreground">Aucun compte CRM</p></div>
      ) : (
        <div className="grid gap-3">
          {accounts.map((account: any) => (
            <div key={account.id} className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Building2 className="w-5 h-5 text-primary" /></div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{account.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={cn("px-2 py-0.5 rounded text-xs font-medium", typeColors[account.type] || "bg-gray-100 text-gray-800")}>{typeLabels[account.type] || account.type}</span>
                      {account.sector && <span className="text-xs text-muted-foreground">{account.sector}</span>}
                      {account.city && <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{account.city}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {account.website && <a href={account.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><ExternalLink className="w-4 h-4" /></a>}
                  {account.source_url && <a href={account.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"><Globe className="w-3 h-3" />source</a>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
