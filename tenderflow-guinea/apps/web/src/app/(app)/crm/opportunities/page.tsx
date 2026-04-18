"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmApi } from "@/lib/api";
import { formatCurrency, cn } from "@/lib/utils";
import { TrendingUp, Plus } from "lucide-react";
import { useState } from "react";

const STAGES = ["prospecting", "qualification", "proposal", "negotiation", "won", "lost"] as const;
const STAGE_LABELS: Record<string, string> = { prospecting: "Prospection", qualification: "Qualification", proposal: "Proposition", negotiation: "Négociation", won: "Gagné", lost: "Perdu" };
const STAGE_COLORS: Record<string, string> = { prospecting: "bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700", qualification: "bg-yellow-100 border-yellow-300 dark:bg-yellow-900 dark:border-yellow-700", proposal: "bg-purple-100 border-purple-300 dark:bg-purple-900 dark:border-purple-700", negotiation: "bg-amber-100 border-amber-300 dark:bg-amber-900 dark:border-amber-700", won: "bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700", lost: "bg-red-100 border-red-300 dark:bg-red-900 dark:border-red-700" };

export default function OpportunitiesPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newOpp, setNewOpp] = useState({ name: "", stage: "prospecting", amount: "", currency: "GNF" });

  const { data } = useQuery({
    queryKey: ["crm-opportunities"],
    queryFn: async () => { const res = await crmApi.listOpportunities({ page_size: 100 }); return res.data; },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => crmApi.createOpportunity(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["crm-opportunities"] }); setShowCreate(false); },
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => crmApi.updateStage(id, stage),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crm-opportunities"] }),
  });

  const opportunities = data?.items || [];
  const byStage = STAGES.reduce((acc, stage) => {
    acc[stage] = opportunities.filter((o: any) => o.stage === stage);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline commercial</h1>
          <p className="text-muted-foreground mt-1">{opportunities.length} opportunités</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"><Plus className="w-4 h-4" /> Nouvelle opportunité</button>
      </div>

      {showCreate && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Nouvelle opportunité</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3"><label className="block text-sm font-medium text-foreground mb-1">Nom *</label><input value={newOpp.name} onChange={(e) => setNewOpp(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Montant</label><input type="number" value={newOpp.amount} onChange={(e) => setNewOpp(p => ({ ...p, amount: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Devise</label><select value={newOpp.currency} onChange={(e) => setNewOpp(p => ({ ...p, currency: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"><option value="GNF">GNF</option><option value="USD">USD</option><option value="EUR">EUR</option></select></div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-accent">Annuler</button>
            <button onClick={() => createMutation.mutate({ ...newOpp, amount: newOpp.amount ? parseFloat(newOpp.amount) : null })} disabled={!newOpp.name || createMutation.isPending} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">Créer</button>
          </div>
        </div>
      )}

      {/* Kanban board */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto">
        {STAGES.map((stage) => (
          <div key={stage} className="space-y-2">
            <div className={cn("rounded-lg border p-2 text-center", STAGE_COLORS[stage])}>
              <p className="text-xs font-semibold">{STAGE_LABELS[stage]}</p>
              <p className="text-[10px] text-muted-foreground">{byStage[stage]?.length || 0}</p>
            </div>
            <div className="space-y-2 min-h-[200px]">
              {byStage[stage]?.map((opp: any) => (
                <div key={opp.id} className="bg-card rounded-lg border border-border p-3 cursor-pointer hover:border-primary/40 transition-all">
                  <p className="text-sm font-medium text-foreground line-clamp-2">{opp.name}</p>
                  {opp.amount && <p className="text-xs font-semibold text-foreground mt-1">{formatCurrency(opp.amount, opp.currency)}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">{Math.round(opp.probability * 100)}% prob.</p>
                  {/* Stage change buttons */}
                  <div className="flex gap-1 mt-2">
                    {STAGES.filter(s => s !== stage).slice(0, 3).map((s) => (
                      <button key={s} onClick={() => updateStageMutation.mutate({ id: opp.id, stage: s })} className="px-1.5 py-0.5 rounded text-[9px] bg-muted hover:bg-accent text-muted-foreground hover:text-foreground">{STAGE_LABELS[s].slice(0, 3)}.</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
