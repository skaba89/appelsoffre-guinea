"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { tendersApi, documentsApi } from "@/lib/api";
import { Bot, Send, FileText, Sparkles, Loader2, MessageSquare, Lightbulb, AlertTriangle, CheckSquare, Target } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { label: "Résumé du DAO", icon: FileText, prompt: "Fais un résumé structuré de ce DAO en mettant en évidence les exigences clés, les critères de sélection et les pièces à fournir." },
  { label: "Matrice de conformité", icon: CheckSquare, prompt: "Génère une matrice de conformité pour cet appel d'offres en listant chaque exigence et si elle est remplie ou non." },
  { label: "Points d'attention", icon: AlertTriangle, prompt: "Identifie les points d'attention, risques et pièges potentiels dans cet appel d'offres." },
  { label: "Stratégie de réponse", icon: Target, prompt: "Propose une stratégie de réponse à cet appel d'offres avec les points forts à mettre en avant et les axes d'amélioration." },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedTenderId, setSelectedTenderId] = useState("");

  const { data: tenders } = useQuery({
    queryKey: ["tenders-for-ai"],
    queryFn: async () => {
      const res = await tendersApi.list({ page_size: 50, sort_by: "deadline_date", sort_order: "asc" });
      return res.data?.items || [];
    },
  });

  const askMutation = useMutation({
    mutationFn: async (question: string) => {
      if (!selectedTenderId) throw new Error("Sélectionnez un appel d'offres");
      const res = await documentsApi.ask(selectedTenderId, question);
      return res.data;
    },
    onSuccess: (data) => {
      const answer = data?.data?.answer || data?.answer || "Je n'ai pas pu générer une réponse. Veuillez réessayer.";
      const sources = data?.data?.sources || [];
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: answer,
          sources,
          timestamp: new Date(),
        },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Une erreur est survenue. Vérifiez que des documents ont été ingérés pour cet appel d'offres.",
          timestamp: new Date(),
        },
      ]);
    },
  });

  const handleSend = (question?: string) => {
    const q = question || input.trim();
    if (!q || !selectedTenderId) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: q, timestamp: new Date() },
    ]);
    setInput("");
    askMutation.mutate(q);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assistant IA</h1>
          <p className="text-muted-foreground mt-1">Interrogez vos DAO avec l&apos;intelligence artificielle</p>
        </div>
        <select
          value={selectedTenderId}
          onChange={(e) => {
            setSelectedTenderId(e.target.value);
            setMessages([]);
          }}
          className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm max-w-md"
        >
          <option value="">-- Sélectionnez un appel d&apos;offres --</option>
          {(tenders || []).map((t: any) => (
            <option key={t.id} value={t.id}>
              {t.reference} — {t.title?.slice(0, 50)}
            </option>
          ))}
        </select>
      </div>

      {!selectedTenderId ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Bot className="w-20 h-20 mx-auto text-muted-foreground/20" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">Sélectionnez un appel d&apos;offres</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Choisissez un appel d&apos;offres dans la liste ci-dessus pour commencer à interagir avec l&apos;assistant IA sur ses documents.
          </p>
          <Link href="/tenders" className="mt-4 inline-block text-sm text-primary hover:underline">
            Voir tous les appels d&apos;offres
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat area */}
          <div className="lg:col-span-3 flex flex-col">
            {/* Messages */}
            <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden flex flex-col" style={{ minHeight: "500px" }}>
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Assistant TenderFlow</span>
                  <span className="text-xs text-muted-foreground">— Analyse de DAO</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/20" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Posez une question ou utilisez un prompt rapide ci-dessous
                    </p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-lg p-4 max-w-[85%]",
                      msg.role === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted/50 text-foreground"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/30">
                        <p className="text-[10px] uppercase font-semibold opacity-70 mb-1">Sources</p>
                        {msg.sources.map((src, j) => (
                          <p key={j} className="text-xs opacity-70">{src}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {askMutation.isPending && (
                  <div className="bg-muted/50 rounded-lg p-4 max-w-[85%]">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyse en cours...
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-2"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Posez votre question sur l'appel d'offres..."
                    disabled={askMutation.isPending}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || askMutation.isPending}
                    className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Quick prompts sidebar */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" /> Prompts rapides
              </h3>
              <div className="space-y-2">
                {QUICK_PROMPTS.map((qp) => (
                  <button
                    key={qp.label}
                    onClick={() => handleSend(qp.prompt)}
                    disabled={askMutation.isPending}
                    className="w-full text-left px-3 py-2.5 rounded-lg border border-border text-sm text-foreground hover:bg-accent hover:border-primary/30 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <qp.icon className="w-4 h-4 text-primary shrink-0" />
                    <span>{qp.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Conseils</h3>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-start gap-1.5">
                  <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                  Uploadez d&apos;abord le DAO dans la section Documents
                </li>
                <li className="flex items-start gap-1.5">
                  <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                  Cliquez sur &quot;Ingérer&quot; pour activer le RAG
                </li>
                <li className="flex items-start gap-1.5">
                  <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                  Soyez précis dans vos questions pour de meilleurs résultats
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
