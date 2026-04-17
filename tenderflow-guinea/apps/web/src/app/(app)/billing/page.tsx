"use client";

import { useQuery } from "@tanstack/react-query";
import { billingApi } from "@/lib/api";
import { CreditCard, Check, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BillingPage() {
  const { data: subscription } = useQuery({ queryKey: ["subscription"], queryFn: async () => { try { const res = await billingApi.getSubscription(); return res.data; } catch { return null; } } });
  const { data: plans } = useQuery({ queryKey: ["plans"], queryFn: async () => { const res = await billingApi.listPlans(); return res.data?.data; } });

  const currentPlan = subscription?.plan || "free";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Abonnement</h1>
        <p className="text-muted-foreground mt-1">Plan actuel : <span className="font-semibold text-primary capitalize">{currentPlan}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(plans || {}).map(([planKey, planData]: [string, any]) => {
          const isCurrent = planKey === currentPlan;
          const quotas = planData.quotas || {};
          return (
            <div key={planKey} className={cn("bg-card rounded-xl border p-6 relative", isCurrent ? "border-primary shadow-md" : "border-border")}>
              {isCurrent && <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">Actuel</div>}
              <h3 className="text-lg font-bold text-foreground capitalize">{planData.name}</h3>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">{quotas.max_users === -1 ? <Zap className="w-4 h-4 text-primary" /> : <Check className="w-4 h-4 text-green-500" />}<span>{quotas.max_users === -1 ? "Utilisateurs illimités" : `${quotas.max_users} utilisateurs`}</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><span>{quotas.max_tenders === -1 ? "AO illimités" : `${quotas.max_tenders} AO`}</span></div>
                <div className="flex items-center gap-2">{quotas.rag_enabled ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-400" />}<span>Assistant IA / RAG</span></div>
                <div className="flex items-center gap-2">{quotas.export_enabled ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-400" />}<span>Export documents</span></div>
              </div>
              {!isCurrent && planKey !== "free" && (
                <button className="mt-4 w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Passer à {planData.name}</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
