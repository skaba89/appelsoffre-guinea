"use client";

import { use, useState } from "react";
import Link from "next/link";
import { mockTenders } from "@/lib/mock-data";
import { cn, formatCurrency, formatDate, daysUntil, strategyColor, strategyLabel, statusColor, statusLabel } from "@/lib/tenderflow-utils";
import { PROMPT_TYPE_LABELS } from "@/lib/mock-data";
import {
  ArrowLeft, ExternalLink, Calendar, Building2, MapPin, FileText,
  Target, CheckCircle, AlertTriangle, TrendingUp, Send, Bot, Copy, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";

export default function TenderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const tender = mockTenders.find(t => t.id === id);
  const [activeTab, setActiveTab] = useState("overview");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  if (!tender) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText className="w-16 h-16 text-muted-foreground/30" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">Appel d'offres introuvable</h2>
        <Link href="/tenders" className="mt-2 text-primary hover:underline">Retour à la liste</Link>
      </div>
    );
  }

  const dl = daysUntil(tender.deadline_date);
  const scoreData = [
    { dimension: "Priorité", value: (tender.priority_score || 0) * 100 },
    { dimension: "Compatibilité", value: (tender.compatibility_score || 0) * 100 },
    { dimension: "Faisabilité", value: (tender.feasibility_score || 0) * 100 },
    { dimension: "Probabilité", value: (tender.win_probability_score || 0) * 100 },
  ];

  const scores = [
    { label: "Priorité", value: tender.priority_score, icon: Target, color: "text-blue-600" },
    { label: "Compatibilité", value: tender.compatibility_score, icon: CheckCircle, color: "text-green-600" },
    { label: "Faisabilité", value: tender.feasibility_score, icon: TrendingUp, color: "text-purple-600" },
    { label: "Probabilité de gain", value: tender.win_probability_score, icon: TrendingUp, color: "text-amber-600" },
  ];

  const documents = [
    { name: "Avis d'appel d'offres", size: "2.4 MB", type: "PDF" },
    { name: "Cahier des clauses techniques", size: "5.1 MB", type: "PDF" },
    { name: "Règlement de consultation", size: "1.8 MB", type: "PDF" },
    { name: "Annexe - Plans et schémas", size: "12.3 MB", type: "ZIP" },
  ];

  const promptTypes = Object.entries(PROMPT_TYPE_LABELS);

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: `Basé sur l'analyse de l'appel d'offres "${tender.title}" (${tender.reference}), voici mes observations :\n\nCet AO présente un score de compatibilité de ${((tender.compatibility_score || 0) * 100).toFixed(0)}% avec votre profil. ${tender.strategy_recommendation === "go" ? "Je recommande une réponse positive." : tender.strategy_recommendation === "go_conditional" ? "Une réponse conditionnelle est recommandée." : "Je déconseille de répondre à cet AO."}\n\nPoints clés à considérer :\n• Budget estimé : ${formatCurrency(tender.budget_min)} — ${formatCurrency(tender.budget_max)}\n• Échéance : ${dl ?? "—"} jours restants\n• Autorité : ${tender.publishing_authority}`,
      }]);
    }, 800);
  };

  const copyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(id);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/tenders">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className={cn(strategyColor(tender.strategy_recommendation))} variant="secondary">
              {strategyLabel(tender.strategy_recommendation)}
            </Badge>
            <Badge className={cn(statusColor(tender.status))} variant="secondary">
              {statusLabel(tender.status)}
            </Badge>
            <Badge variant="outline" className="text-xs">{tender.tender_type === "international" ? "International" : "National"}</Badge>
          </div>
          <h1 className="text-xl font-bold text-foreground">{tender.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{tender.reference} — {tender.publishing_authority}</p>
        </div>
        <Button variant="outline" className="shrink-0 gap-2" asChild>
          <a href={tender.source_url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" /> Source
          </a>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="scoring">Scoring</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="ai">Assistant IA</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tender.description}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Détails</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem icon={Building2} label="Autorité" value={tender.publishing_authority} />
                    <DetailItem icon={MapPin} label="Région" value={tender.region} />
                    <DetailItem icon={Calendar} label="Date limite" value={formatDate(tender.deadline_date)} highlight={dl !== null && dl < 7} />
                    <DetailItem icon={FileText} label="Secteur" value={tender.sector} />
                    <DetailItem icon={Target} label="Budget min" value={formatCurrency(tender.budget_min)} />
                    <DetailItem icon={Target} label="Budget max" value={formatCurrency(tender.budget_max)} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Quick scores */}
              <Card>
                <CardHeader><CardTitle className="text-base">Scores</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {scores.map(s => (
                    <div key={s.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{s.label}</span>
                        <span className="text-xs font-medium text-foreground">{((s.value || 0) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={(s.value || 0) * 100} className="h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Strategy */}
              <Card>
                <CardHeader><CardTitle className="text-base">Recommandation</CardTitle></CardHeader>
                <CardContent>
                  <div className={cn("text-center p-4 rounded-lg", strategyColor(tender.strategy_recommendation))}>
                    <p className="text-2xl font-bold">{strategyLabel(tender.strategy_recommendation)}</p>
                    <p className="text-xs mt-1 opacity-80">
                      Score composite : {((tender.priority_score || 0) * 100).toFixed(0)}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Scoring Tab */}
        <TabsContent value="scoring" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Radar de scoring</CardTitle></CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={scoreData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="dimension" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                      <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Détail des scores</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {scores.map(s => (
                  <div key={s.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <s.icon className={cn("w-4 h-4", s.color)} />
                        <span className="text-sm font-medium text-foreground">{s.label}</span>
                      </div>
                      <span className="text-lg font-bold text-foreground">{((s.value || 0) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={(s.value || 0) * 100} className="h-2" />
                  </div>
                ))}
                <Separator className="my-4" />
                <div className={cn("text-center p-6 rounded-lg", strategyColor(tender.strategy_recommendation))}>
                  <p className="text-3xl font-bold">{strategyLabel(tender.strategy_recommendation)}</p>
                  <p className="text-sm mt-2 opacity-80">Recommandation stratégique basée sur l'analyse multi-critères</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Documents</CardTitle>
                <Button size="sm" className="gap-2">
                  <FileText className="w-4 h-4" /> Téléverser
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <span className="text-xs font-bold text-red-600 dark:text-red-400">{doc.type}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.size}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Télécharger</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promptTypes.map(([type, label]) => (
              <Card key={type}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{label}</CardTitle>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyPrompt(`Généré pour ${tender.reference} — ${label}`, type)}>
                      {copiedPrompt === type ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Prompt généré automatiquement pour l'AO {tender.reference}. {type === "analyse_opportunite"
                      ? `Analysez l'opportunité de répondre à "${tender.title}" en évaluant l'adéquation avec nos compétences, notre expérience dans le secteur ${tender.sector}, et notre capacité à livrer.`
                      : type === "synthese_go_nogo"
                        ? `Produisez une synthèse GO/NO-GO pour cet AO avec un score de compatibilité de ${((tender.compatibility_score || 0) * 100).toFixed(0)}%.`
                        : `Générez un contenu de type "${label}" pour l'appel d'offres ${tender.reference}.`
                    }
                  </p>
                  <Button variant="outline" size="sm" className="mt-3 gap-1">
                    <Send className="w-3 h-3" /> Générer
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai" className="mt-4">
          <Card className="flex flex-col h-[600px]">
            <CardHeader className="pb-2 border-b border-border">
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" /> Assistant IA — {tender.reference}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Bot className="w-12 h-12 text-muted-foreground/30" />
                  <p className="mt-3 text-sm text-muted-foreground">Posez une question sur cet appel d'offres</p>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {["Analyser cet AO", "Évaluer la compatibilité", "Rédiger une réponse"].map(s => (
                      <Button key={s} variant="outline" size="sm" onClick={() => { setChatInput(s); }}>
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2.5 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="border-t border-border p-4 flex gap-2">
              <Input
                placeholder="Posez votre question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleChatSend(); }}
              />
              <Button onClick={handleChatSend} className="gap-2">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value, highlight }: { icon: React.ElementType; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", highlight ? "text-destructive" : "text-muted-foreground")} />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-sm font-medium", highlight ? "text-destructive" : "text-foreground")}>{value}</p>
      </div>
    </div>
  );
}
