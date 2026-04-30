"use client";

import { mockPrompts, PROMPT_TYPE_LABELS } from "@/lib/mock-data";
import { formatDate, cn } from "@/lib/tenderflow-utils";
import { Copy, Check, Send, FileCode } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const typeColors: Record<string, string> = {
  analyse_opportunite: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  lettre_manifestation: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  note_comprehension: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  strategie_reponse: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  plan_methodologique: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  matrice_conformite: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  argumentaire_technique: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  planification_ressources: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  analyse_risques: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  synthese_go_nogo: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

export default function PromptsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Prompts générés</h1>
        <p className="text-muted-foreground mt-1">Prompts automatiquement générés pour vos appels d'offres</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockPrompts.map(prompt => (
          <Card key={prompt.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Badge className={cn("text-xs", typeColors[prompt.prompt_type] || "bg-gray-100 text-gray-800")} variant="secondary">
                    {PROMPT_TYPE_LABELS[prompt.prompt_type] || prompt.prompt_type}
                  </Badge>
                  <Link href={`/tenders/${prompt.tender_id}`} className="block">
                    <CardTitle className="text-sm text-primary hover:underline">{prompt.tender_ref}</CardTitle>
                  </Link>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => copyToClipboard(prompt.content, prompt.id)}
                  >
                    {copied === prompt.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">{prompt.content}</p>
              <p className="text-[10px] text-muted-foreground mt-3">{formatDate(prompt.created_at)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
