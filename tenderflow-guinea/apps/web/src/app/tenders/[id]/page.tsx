"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tendersApi, documentsApi, promptsApi } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { cn, formatDate, formatCurrency, strategyColor, strategyLabel, statusColor, daysUntil } from "@/lib/utils";
import { ArrowLeft, FileText, Clock, MapPin, Building2, Tag, DollarSign, Bot, Sparkles, Upload, Play, MessageSquare, CheckSquare, TrendingUp, Target } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

export default function TenderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const tenderId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");

  const { data: tender, isLoading } = useQuery({
    queryKey: ["tender", tenderId],
    queryFn: async () => { const res = await tendersApi.get(tenderId); return res.data; },
  });

  const scoreMutation = useMutation({
    mutationFn: () => tendersApi.score(tenderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tender", tenderId] }),
  });
  const matchMutation = useMutation({
    mutationFn: () => tendersApi.match(tenderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tender", tenderId] }),
  });
  const generatePromptsMutation = useMutation({
    mutationFn: () => promptsApi.generate(tenderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prompts"] }),
  });
  const uploadMutation = useMutation({
    mutationFn: (file: File) => documentsApi.upload(tenderId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tender", tenderId] }),
  });
  const askMutation = useMutation({
    mutationFn: (question: string) => documentsApi.ask(tenderId, question),
    onSuccess: (res) => setChatAnswer(res.data?.data?.answer || ""),
  });

  if (isLoading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Chargement...</div>;
  if (!tender) return <div className="text-center py-20 text-muted-foreground">Appel d'offres introuvable</div>;

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{tender.reference}</span>
              <span className={cn("px-2 py-0.5 rounded text-xs font-medium", statusColor(tender.status))}>{tender.status?.replace("_", " ")}</span>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">{tender.tender_type}</span>
              {tender.strategy_recommendation && (
                <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", strategyColor(tender.strategy_recommendation))}>{strategyLabel(tender.strategy_recommendation)}</span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground mt-2">{tender.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
              {tender.organization && <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{tender.organization}</span>}
              {tender.sector && <span className="flex items-center gap-1"><Tag className="w-4 h-4" />{tender.sector}</span>}
              {tender.region && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{tender.region}</span>}
              {tender.deadline_date && <span className={cn("flex items-center gap-1", (daysUntil(tender.deadline_date) ?? 999) < 7 ? "text-destructive font-medium" : "")}><Clock className="w-4 h-4" />{formatDate(tender.deadline_date)} ({daysUntil(tender.deadline_date) ?? "—"}j)</span>}
              {tender.budget_estimated && <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{formatCurrency(tender.budget_estimated, tender.currency)}</span>}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => scoreMutation.mutate()} disabled={scoreMutation.isPending} className="px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 flex items-center gap-1"><Target className="w-4 h-4" />{scoreMutation.isPending ? "Calcul..." : "Scorer"}</button>
            <button onClick={() => matchMutation.mutate()} disabled={matchMutation.isPending} className="px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 flex items-center gap-1"><TrendingUp className="w-4 h-4" />{matchMutation.isPending ? "..." : "Matcher"}</button>
            <button onClick={() => generatePromptsMutation.mutate()} disabled={generatePromptsMutation.isPending} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1"><Sparkles className="w-4 h-4" />{generatePromptsMutation.isPending ? "..." : "Générer prompts"}</button>
          </div>
        </div>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[{ l: "Priorité", v: tender.priority_score }, { l: "Compatibilité", v: tender.compatibility_score }, { l: "Faisabilité", v: tender.feasibility_score }, { l: "Prob. gain", v: tender.win_probability }].map((s) => (
          <div key={s.l} className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-xs text-muted-foreground">{s.l}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{Math.round(s.v * 100)}%</p>
          </div>
        ))}
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">Stratégie</p>
          <span className={cn("inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-semibold", strategyColor(tender.strategy_recommendation))}>{strategyLabel(tender.strategy_recommendation)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {tender.ai_summary && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground mb-3"><Bot className="w-5 h-5 text-primary" /> Résumé IA</h2>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{tender.ai_summary}</p>
            </div>
          )}
          {tender.description && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-base font-semibold text-foreground mb-3">Description</h2>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{tender.description}</p>
            </div>
          )}
          {/* Documents */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground"><FileText className="w-5 h-5 text-primary" /> Documents ({tender.documents?.length || 0})</h2>
              <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent flex items-center gap-1"><Upload className="w-3 h-3" /> Upload</button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMutation.mutate(f); }} />
            </div>
            {tender.documents?.length > 0 ? (
              <div className="divide-y divide-border">
                {tender.documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-foreground">{doc.original_filename}</span></div>
                    <button onClick={async () => { await documentsApi.ingest(doc.id); queryClient.invalidateQueries({ queryKey: ["tender", tenderId] }); }} className="px-2 py-1 rounded text-xs text-primary hover:bg-primary/10 flex items-center gap-1"><Play className="w-3 h-3" /> Ingest</button>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">Aucun document — uploadez le DAO pour commencer</p>}
          </div>
          {/* AI Chat */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground mb-3"><MessageSquare className="w-5 h-5 text-primary" /> Question sur ce DAO</h2>
            <form onSubmit={(e) => { e.preventDefault(); if (chatQuestion.trim()) askMutation.mutate(chatQuestion); }} className="flex gap-2">
              <input value={chatQuestion} onChange={(e) => setChatQuestion(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Posez une question sur l'appel d'offres..." />
              <button type="submit" disabled={askMutation.isPending} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">{askMutation.isPending ? "Analyse..." : "Demander"}</button>
            </form>
            {chatAnswer && <div className="mt-3 bg-muted/50 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap">{chatAnswer}</div>}
          </div>
        </div>
        {/* Sidebar: Scores detail */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-base font-semibold text-foreground mb-3">Scores détaillés</h2>
            <div className="space-y-3">
              {tender.scores?.map((score: any) => (
                <div key={score.id}>
                  <div className="flex items-center justify-between mb-1"><span className="text-sm text-foreground capitalize">{score.score_type.replace("_", " ")}</span><span className="text-sm font-medium text-foreground">{Math.round(score.score_value * 100)}%</span></div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${score.score_value * 100}%` }} /></div>
                </div>
              ))}
              {(!tender.scores || tender.scores.length === 0) && <p className="text-sm text-muted-foreground">Cliquez sur &quot;Scorer&quot; pour calculer</p>}
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-base font-semibold text-foreground mb-3">Actions rapides</h2>
            <div className="space-y-2">
              <Link href={`/prompts?tender_id=${tenderId}`} className="block px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Voir les prompts</Link>
              <Link href={`/crm/opportunities?tender_id=${tenderId}`} className="block px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Opportunité CRM</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
