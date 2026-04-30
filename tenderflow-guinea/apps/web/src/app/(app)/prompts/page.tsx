"use client";

import { useQuery } from "@tanstack/react-query";
import { promptsApi } from "@/lib/api";
import { FileCode, Copy } from "lucide-react";
import { useState } from "react";

export default function PromptsPage() {
  const [tenderId, setTenderId] = useState("");
  const { data } = useQuery({
    queryKey: ["prompts", { tender_id: tenderId || undefined }],
    queryFn: async () => { const res = await promptsApi.list({ tender_id: tenderId || undefined, page_size: 50 }); return res.data; },
  });

  const prompts = data?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Prompts IA</h1>
        <p className="text-muted-foreground mt-1">Prompts générés pour le traitement des appels d'offres</p>
      </div>
      <div className="flex gap-2">
        <input value={tenderId} onChange={(e) => setTenderId(e.target.value)} placeholder="Filtrer par ID appel d'offres" className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
      </div>
      {prompts.length === 0 ? (
        <div className="text-center py-12"><FileCode className="w-16 h-16 mx-auto text-muted-foreground/20" /><p className="mt-4 text-muted-foreground">Aucun prompt généré. Allez sur un appel d'offres et cliquez &quot;Générer prompts&quot;.</p></div>
      ) : (
        <div className="space-y-3">
          {prompts.map((prompt: any) => (
            <div key={prompt.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{prompt.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">{prompt.prompt_type.replace(/_/g, " ")}</span>
                    {prompt.sector && <span className="text-xs text-muted-foreground">{prompt.sector}</span>}
                    <span className="text-xs text-muted-foreground">v{prompt.version}</span>
                    {prompt.is_edited && <span className="text-xs text-amber-600">modifié</span>}
                  </div>
                </div>
                <button onClick={() => navigator.clipboard.writeText(prompt.prompt_text)} className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-accent"><Copy className="w-4 h-4" /></button>
              </div>
              <pre className="mt-3 text-xs text-foreground/80 bg-muted/50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">{prompt.prompt_text}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
