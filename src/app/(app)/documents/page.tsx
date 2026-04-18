"use client";

import { useState } from "react";
import { FileText, Upload, Search, Download, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const documents = [
  { id: "d-1", name: "Avis d'appel d'offres - SOGUIPAMI", tender: "AO/SOGUIPAMI/2026/0023", size: "2.4 MB", type: "PDF", status: "indexed", date: "10 avr. 2026" },
  { id: "d-2", name: "CCTP - Pont Kouroussa", tender: "AO/MTP/2026/0142", size: "5.1 MB", type: "PDF", status: "indexed", date: "12 avr. 2026" },
  { id: "d-3", name: "Règlement de consultation - DNE", tender: "AO/DNE/2026/0087", size: "1.8 MB", type: "PDF", status: "pending", date: "11 avr. 2026" },
  { id: "d-4", name: "Plans architecturaux - SEG", tender: "AO/SEG/2026/0198", size: "12.3 MB", type: "ZIP", status: "indexed", date: "9 avr. 2026" },
  { id: "d-5", name: "Cahier des charges - ONGUI", tender: "AO/ONGUI/2026/0012", size: "3.2 MB", type: "PDF", status: "indexed", date: "6 avr. 2026" },
  { id: "d-6", name: "Annexes financières - MF", tender: "AO/MF/2026/0034", size: "1.1 MB", type: "XLSX", status: "pending", date: "5 avr. 2026" },
  { id: "d-7", name: "Dossier technique - AGUIPE", tender: "AO/AGUIPE/2026/0019", size: "8.7 MB", type: "PDF", status: "indexed", date: "7 avr. 2026" },
];

export default function DocumentsPage() {
  const [search, setSearch] = useState("");

  const filtered = documents.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.tender.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} document(s)</p>
        </div>
        <Button className="gap-2"><Upload className="w-4 h-4" /> Téléverser</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un document..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Document</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">AO</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Taille</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Statut</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Date</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(doc => (
              <tr key={doc.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <span className="text-xs font-bold text-red-600 dark:text-red-400">{doc.type}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{doc.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{doc.tender}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{doc.size}</td>
                <td className="px-4 py-3">
                  <Badge variant={doc.status === "indexed" ? "default" : "secondary"} className="text-xs">
                    {doc.status === "indexed" ? "Indexé" : "En attente"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">{doc.date}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
