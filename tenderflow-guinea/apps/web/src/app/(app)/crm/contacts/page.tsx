"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmApi } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import { Users, Search, Plus, Shield, ExternalLink } from "lucide-react";

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["crm-contacts", { search }],
    queryFn: async () => { const res = await crmApi.listContacts({ search: search || undefined, page_size: 50 }); return res.data; },
  });

  const [newContact, setNewContact] = useState({ first_name: "", last_name: "", job_title: "", organization_name: "", professional_email: "", professional_phone: "", institutional_page: "", source_url: "", source_label: "" });
  const createMutation = useMutation({
    mutationFn: (data: any) => crmApi.createContact(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["crm-contacts"] }); setShowCreate(false); },
  });

  const contacts = data?.items || [];
  const validationColors: Record<string, string> = { pending: "bg-yellow-100 text-yellow-800", verified: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-800" };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts professionnels</h1>
          <p className="text-muted-foreground mt-1">{data?.total || 0} contacts — données professionnelles publiques uniquement</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"><Plus className="w-4 h-4" /> Nouveau contact</button>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-200">
        <Shield className="w-4 h-4 inline mr-1" /> Conformité : seuls les contacts professionnels publics sont autorisés. Chaque contact doit être traçable à une source publique.
      </div>

      <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Rechercher par nom, organisation..." /></div>

      {showCreate && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Nouveau contact professionnel</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-foreground mb-1">Prénom *</label><input value={newContact.first_name} onChange={(e) => setNewContact(p => ({ ...p, first_name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Nom *</label><input value={newContact.last_name} onChange={(e) => setNewContact(p => ({ ...p, last_name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Poste</label><input value={newContact.job_title} onChange={(e) => setNewContact(p => ({ ...p, job_title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Organisation</label><input value={newContact.organization_name} onChange={(e) => setNewContact(p => ({ ...p, organization_name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Email professionnel</label><input type="email" value={newContact.professional_email} onChange={(e) => setNewContact(p => ({ ...p, professional_email: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="institutionnel uniquement" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Tél. professionnel</label><input value={newContact.professional_phone} onChange={(e) => setNewContact(p => ({ ...p, professional_phone: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Source URL *</label><input value={newContact.source_url} onChange={(e) => setNewContact(p => ({ ...p, source_url: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="URL publique de la source" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Source label</label><input value={newContact.source_label} onChange={(e) => setNewContact(p => ({ ...p, source_label: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" /></div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent">Annuler</button>
            <button onClick={() => createMutation.mutate(newContact)} disabled={(!newContact.first_name || !newContact.last_name) || createMutation.isPending} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">{createMutation.isPending ? "Création..." : "Créer"}</button>
          </div>
        </div>
      )}

      {contacts.length === 0 ? (
        <div className="text-center py-12"><Users className="w-16 h-16 mx-auto text-muted-foreground/20" /><p className="mt-4 text-muted-foreground">Aucun contact</p></div>
      ) : (
        <div className="grid gap-3">
          {contacts.map((contact: any) => (
            <div key={contact.id} className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{contact.first_name?.[0]}{contact.last_name?.[0]}</div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{contact.first_name} {contact.last_name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      {contact.job_title && <span className="text-xs text-muted-foreground">{contact.job_title}</span>}
                      {contact.organization_name && <span className="text-xs text-muted-foreground">— {contact.organization_name}</span>}
                      <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", validationColors[contact.validation_status] || "bg-gray-100 text-gray-800")}>{contact.validation_status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {contact.professional_email && <span className="text-xs text-muted-foreground">{contact.professional_email}</span>}
                  {contact.source_url && <a href={contact.source_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><ExternalLink className="w-3.5 h-3.5" /></a>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
