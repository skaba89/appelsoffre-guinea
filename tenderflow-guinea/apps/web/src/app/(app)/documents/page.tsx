"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentsApi, tendersApi } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import { FolderOpen, Upload, FileText, Play, Download, Search, Filter, File, FileCheck, Clock, HardDrive } from "lucide-react";
import Link from "next/link";

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [tenderFilter, setTenderFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: tenders } = useQuery({
    queryKey: ["tenders-for-docs"],
    queryFn: async () => {
      const res = await tendersApi.list({ page_size: 100, sort_by: "created_at", sort_order: "desc" });
      return res.data?.items || [];
    },
  });

  const { data: docs } = useQuery({
    queryKey: ["documents", { tender_id: tenderFilter || undefined }],
    queryFn: async () => {
      if (tenderFilter) {
        const res = await documentsApi.list(tenderFilter);
        return res.data?.items || res.data || [];
      }
      // Fetch documents for all tenders
      const allDocs: any[] = [];
      for (const tender of (tenders || []).slice(0, 20)) {
        try {
          const res = await documentsApi.list(tender.id);
          const tenderDocs = res.data?.items || res.data || [];
          allDocs.push(...tenderDocs.map((d: any) => ({ ...d, tender_title: tender.title, tender_reference: tender.reference })));
        } catch { /* skip */ }
      }
      return allDocs;
    },
    enabled: !!tenders && tenders.length > 0,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ tenderId, file }: { tenderId: string; file: File }) => documentsApi.upload(tenderId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  const ingestMutation = useMutation({
    mutationFn: (docId: string) => documentsApi.ingest(docId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  const filteredDocs = (docs || []).filter((doc: any) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        doc.original_filename?.toLowerCase().includes(q) ||
        doc.tender_title?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const fileTypeIcons: Record<string, React.ElementType> = {
    pdf: FileText,
    doc: File,
    docx: File,
    xls: File,
    xlsx: File,
    default: File,
  };

  const getFileIcon = (filename: string) => {
    const ext = filename?.split(".").pop()?.toLowerCase() || "";
    return fileTypeIcons[ext] || fileTypeIcons.default;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Centre de documents</h1>
          <p className="text-muted-foreground mt-1">{filteredDocs.length} documents</p>
        </div>
        {tenderFilter && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            <Upload className="w-4 h-4" /> Uploader un document
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f && tenderFilter) uploadMutation.mutate({ tenderId: tenderFilter, file: f });
          }}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Rechercher un document..."
          />
        </div>
        <select
          value={tenderFilter}
          onChange={(e) => setTenderFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
        >
          <option value="">Tous les appels d'offres</option>
          {(tenders || []).map((t: any) => (
            <option key={t.id} value={t.id}>{t.reference} — {t.title?.slice(0, 40)}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total documents", value: filteredDocs.length, icon: FolderOpen, color: "blue" },
          { label: "Ingérés (RAG)", value: filteredDocs.filter((d: any) => d.is_ingested).length, icon: FileCheck, color: "green" },
          { label: "En attente", value: filteredDocs.filter((d: any) => !d.is_ingested).length, icon: Clock, color: "amber" },
          { label: "Taille totale", value: "---", icon: HardDrive, color: "purple" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2">
              <stat.icon className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
            <p className="text-xl font-bold text-foreground mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Document list */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground/20" />
          <p className="mt-4 text-muted-foreground">Aucun document trouvé</p>
          <p className="text-sm text-muted-foreground mt-1">
            Uploadez des DAO depuis la page d&apos;un appel d&apos;offres ou sélectionnez un AO ci-dessus
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Document</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Appel d&apos;offres</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Statut</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc: any) => {
                const Icon = getFileIcon(doc.original_filename);
                return (
                  <tr key={doc.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-foreground font-medium truncate max-w-[200px]">
                          {doc.original_filename}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {doc.tender_reference && (
                        <Link
                          href={`/tenders/${doc.tender_id}`}
                          className="text-primary hover:underline text-xs"
                        >
                          {doc.tender_reference}
                        </Link>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {doc.is_ingested ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <FileCheck className="w-3 h-3" /> Ingéré
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                          <Clock className="w-3 h-3" /> En attente
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {formatDate(doc.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!doc.is_ingested && (
                          <button
                            onClick={() => ingestMutation.mutate(doc.id)}
                            disabled={ingestMutation.isPending}
                            className="px-2 py-1 rounded text-xs text-primary hover:bg-primary/10 disabled:opacity-50 flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" /> Ingérer
                          </button>
                        )}
                        <button className="px-2 py-1 rounded text-xs text-muted-foreground hover:bg-accent flex items-center gap-1">
                          <Download className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useRef } from "react";
