"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Upload, Search, Download, Trash2, Eye,
  FileSpreadsheet, Archive, Image, FileType, FolderOpen,
  CheckCircle2, Clock, AlertCircle, MoreHorizontal, Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { motionVariants } from "@/lib/design-tokens";
import { exportToCSV } from "@/lib/export-engine";

// ===== Types =====
interface Document {
  id: string;
  name: string;
  tender: string;
  size: string;
  sizeBytes: number;
  type: "PDF" | "XLSX" | "ZIP" | "DOCX" | "IMG" | "AUTRE";
  status: "indexed" | "pending" | "error";
  date: string;
  category: string;
}

// ===== Mock Data =====
const documents: Document[] = [
  { id: "d-1", name: "Avis d'appel d'offres - SOGUIPAMI", tender: "AO/SOGUIPAMI/2026/0023", size: "2.4 MB", sizeBytes: 2400000, type: "PDF", status: "indexed", date: "10 avr. 2026", category: "Avis" },
  { id: "d-2", name: "CCTP - Pont Kouroussa", tender: "AO/MTP/2026/0142", size: "5.1 MB", sizeBytes: 5100000, type: "PDF", status: "indexed", date: "12 avr. 2026", category: "CCTP" },
  { id: "d-3", name: "Règlement de consultation - DNE", tender: "AO/DNE/2026/0087", size: "1.8 MB", sizeBytes: 1800000, type: "PDF", status: "pending", date: "11 avr. 2026", category: "Règlement" },
  { id: "d-4", name: "Plans architecturaux - SEG", tender: "AO/SEG/2026/0198", size: "12.3 MB", sizeBytes: 12300000, type: "ZIP", status: "indexed", date: "9 avr. 2026", category: "Plans" },
  { id: "d-5", name: "Cahier des charges - ONGUI", tender: "AO/ONGUI/2026/0012", size: "3.2 MB", sizeBytes: 3200000, type: "PDF", status: "indexed", date: "6 avr. 2026", category: "CC" },
  { id: "d-6", name: "Annexes financières - MF", tender: "AO/MF/2026/0034", size: "1.1 MB", sizeBytes: 1100000, type: "XLSX", status: "pending", date: "5 avr. 2026", category: "Financier" },
  { id: "d-7", name: "Dossier technique - AGUIPE", tender: "AO/AGUIPE/2026/0019", size: "8.7 MB", sizeBytes: 8700000, type: "PDF", status: "indexed", date: "7 avr. 2026", category: "Technique" },
  { id: "d-8", name: "Modèle déclaration - MTP", tender: "AO/MTP/2026/0142", size: "450 KB", sizeBytes: 450000, type: "DOCX", status: "indexed", date: "12 avr. 2026", category: "Modèle" },
  { id: "d-9", name: "Photos site - Nzérékoré", tender: "AO/MS/2026/0156", size: "24.5 MB", sizeBytes: 24500000, type: "ZIP", status: "error", date: "8 avr. 2026", category: "Photos" },
];

// ===== Helpers =====
const typeIcons: Record<string, React.ElementType> = {
  PDF: FileText,
  XLSX: FileSpreadsheet,
  ZIP: Archive,
  DOCX: FileType,
  IMG: Image,
  AUTRE: FolderOpen,
};

const typeColors: Record<string, string> = {
  PDF: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  XLSX: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  ZIP: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  DOCX: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  IMG: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  AUTRE: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
};

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  indexed: { icon: CheckCircle2, color: "text-emerald-500", label: "Indexé" },
  pending: { icon: Clock, color: "text-amber-500", label: "En attente" },
  error: { icon: AlertCircle, color: "text-red-500", label: "Erreur" },
};

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const categories = ["all", ...Array.from(new Set(documents.map((d) => d.category)))];

  const filtered = documents.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.tender.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || d.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const totalSize = documents.reduce((sum, d) => sum + d.sizeBytes, 0);
  const indexedCount = documents.filter((d) => d.status === "indexed").length;
  const pendingCount = documents.filter((d) => d.status === "pending").length;
  const errorCount = documents.filter((d) => d.status === "error").length;

  // Simulated upload
  const simulateUpload = useCallback(() => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setUploadProgress(null), 1000);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    simulateUpload();
  }, [simulateUpload]);

  return (
    <motion.div
      className="space-y-6"
      variants={motionVariants.staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={motionVariants.staggerItem} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Centre de documents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {documents.length} documents · {(totalSize / 1024 / 1024).toFixed(1)} MB au total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              exportToCSV({
                format: "csv",
                filename: "documents-tenderflow",
                data: filtered.map((d) => ({
                  nom: d.name,
                  appel_offre: d.tender,
                  taille: d.size,
                  type: d.type,
                  statut: statusConfig[d.status].label,
                  categorie: d.category,
                  date: d.date,
                })),
                columns: [
                  { key: "nom", label: "Document" },
                  { key: "appel_offre", label: "Appel d'offres" },
                  { key: "taille", label: "Taille" },
                  { key: "type", label: "Type" },
                  { key: "statut", label: "Statut" },
                  { key: "categorie", label: "Catégorie" },
                  { key: "date", label: "Date" },
                ],
              });
            }}
          >
            <Download className="w-3.5 h-3.5" /> Exporter
          </Button>
          <Button className="gap-2" onClick={simulateUpload}>
            <Upload className="w-4 h-4" /> Téléverser
          </Button>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={motionVariants.staggerItem} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: documents.length, icon: FolderOpen, color: "text-primary bg-primary/10" },
          { label: "Indexés", value: indexedCount, icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
          { label: "En attente", value: pendingCount, icon: Clock, color: "text-amber-500 bg-amber-500/10" },
          { label: "Erreurs", value: errorCount, icon: AlertCircle, color: "text-red-500 bg-red-500/10" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Upload zone */}
      <motion.div variants={motionVariants.staggerItem}>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200
            ${isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/40 hover:bg-muted/20"
            }
          `}
        >
          <Upload className={`w-8 h-8 mx-auto mb-3 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground/40"}`} />
          <p className="text-sm font-medium text-foreground">
            {isDragging ? "Déposez vos fichiers ici" : "Glissez-déposez vos documents ici"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX, ZIP — Max 50 MB par fichier</p>

          {/* Upload progress */}
          <AnimatePresence>
            {uploadProgress !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 max-w-md mx-auto"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Téléversement en cours...</span>
                  <span className="font-medium text-foreground">{Math.min(Math.round(uploadProgress), 100)}%</span>
                </div>
                <Progress value={Math.min(uploadProgress, 100)} className="h-2" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Search + Filter */}
      <motion.div variants={motionVariants.staggerItem} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un document..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setActiveCategory(cat)}
            >
              {cat === "all" ? "Tous" : cat}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Document list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((doc, index) => {
            const TypeIcon = typeIcons[doc.type] || FolderOpen;
            const status = statusConfig[doc.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50, height: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
              >
                <AnimatedCard hoverLift={false} className="cursor-pointer">
                  <AnimatedCardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      {/* Type icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${typeColors[doc.type]}`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                          <Badge variant="secondary" className="text-[9px] shrink-0">{doc.category}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground truncate">{doc.tender}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{doc.size}</span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1">
                          <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                          <span className={`text-xs font-medium ${status.color} hidden sm:inline`}>{status.label}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground hidden lg:inline">{doc.date}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/30" />
            <p className="mt-2 text-sm font-medium text-muted-foreground">Aucun document trouvé</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Essayez un autre terme de recherche ou filtre</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
