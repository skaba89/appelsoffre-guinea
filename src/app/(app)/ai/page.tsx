"use client";

import { useState } from "react";
import { Bot, Send, FileText, Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const conversations = [
  { id: "1", title: "Analyse AO SOGUIPAMI", date: "Aujourd'hui" },
  { id: "2", title: "Stratégie réponse MTP", date: "Hier" },
  { id: "3", title: "Évaluation compatibilité DNE", date: "13 avr." },
];

const suggestions = [
  "Analyser les derniers appels d'offres publiés",
  "Quels AO correspondent le mieux à mon profil ?",
  "Aide-moi à rédiger une lettre de manifestation",
  "Évalue la faisabilité de l'AO SOGUIPAMI",
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Voici mon analyse concernant votre demande :\n\n**Points clés identifiés :**\n\n1. Votre demande concerne la veille et l'analyse des appels d'offres en Guinée\n2. Je recommande de consulter les AO récents dans le secteur IT/Digital\n3. L'AO SOGUIPAMI (AO/SOGUIPAMI/2026/0023) présente le meilleur score de compatibilité (90%)\n\n**Prochaines étapes suggérées :**\n- Examiner le cahier des charges en détail\n- Préparer une synthèse GO/NO-GO\n- Identifier les partenaires potentiels pour renforcer la proposition\n\nVoulez-vous que j'approfondisse un point en particulier ?`,
      }]);
    }, 1200);
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      {/* Sidebar - conversations */}
      <div className="hidden md:flex flex-col w-64 border border-border rounded-lg bg-card">
        <div className="p-3 border-b border-border">
          <Button className="w-full gap-2" size="sm" variant="outline">
            <Plus className="w-4 h-4" /> Nouvelle conversation
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map(conv => (
              <button
                key={conv.id}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors"
              >
                <p className="text-sm font-medium text-foreground truncate">{conv.title}</p>
                <p className="text-xs text-muted-foreground">{conv.date}</p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col border border-border rounded-lg bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-sm font-semibold text-foreground">Assistant IA TenderFlow</h2>
            <p className="text-xs text-muted-foreground">Analyse et conseil pour vos appels d'offres</p>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Assistant IA TenderFlow</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                Posez vos questions sur les appels d'offres, demandez des analyses de compatibilité,
                ou sollicitez de l'aide pour la rédaction de vos réponses.
              </p>
              <div className="flex flex-wrap gap-2 mt-6 justify-center max-w-lg">
                {suggestions.map(s => (
                  <Button
                    key={s}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setInput(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] rounded-xl px-4 py-3 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Posez votre question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              className="flex-1"
            />
            <Button onClick={handleSend} className="gap-2">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
