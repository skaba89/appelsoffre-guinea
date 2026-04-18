"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { tendersApi } from "@/lib/api";
import { cn, formatDate, formatCurrency, strategyColor, strategyLabel, statusColor, daysUntil, SECTORS, REGIONS } from "@/lib/utils";
import Link from "next/link";
import { Search, Filter, FileText, Clock, MapPin, Building2, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

export default function TendersListPage() {
  const [filters, setFilters] = useState<any>({ page: 1, page_size: 20 });
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["tenders", filters],
    queryFn: async () => {
      const res = await tendersApi.list(filters);
      return res.data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev: any) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const updateFilter = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  const tenders = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appels d'offres</h1>
          <p className="text-muted-foreground mt-1">{total} opportunités trouvées</p>
        </div>
        <Link href="/tenders/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
          <FileText className="w-4 h-4" /> Nouvel AO
        </Link>
      </div>

      {/* Search + Filters bar */}
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Rechercher par titre, référence, organisation..." />
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
            Rechercher
          </button>
          <button type="button" onClick={() => setShowFilters(!showFilters)}
            className={cn("px-3 py-2 rounded-lg border text-sm font-medium transition-colors", showFilters ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent")}>
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </form>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-card rounded-xl border border-border p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Secteur</label>
              <select value={filters.sector || ""} onChange={(e) => updateFilter("sector", e.target.value)}
                className="w-full px-2 py-1.5 rounded border border-input bg-background text-sm text-foreground">
                <option value="">Tous</option>
                {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Région</label>
              <select value={filters.region || ""} onChange={(e) => updateFilter("region", e.target.value)}
                className="w-full px-2 py-1.5 rounded border border-input bg-background text-sm text-foreground">
                <option value="">Toutes</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Statut</label>
              <select value={filters.status || ""} onChange={(e) => updateFilter("status", e.target.value)}
                className="w-full px-2 py-1.5 rounded border border-input bg-background text-sm text-foreground">
                <option value="">Tous</option>
                <option value="new">Nouveau</option>
                <option value="qualifying">Qualification</option>
                <option value="qualified">Qualifié</option>
                <option value="go">GO</option>
                <option value="no_go">NO GO</option>
                <option value="responding">En réponse</option>
                <option value="won">Gagné</option>
                <option value="lost">Perdu</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Stratégie</label>
              <select value={filters.strategy || ""} onChange={(e) => updateFilter("strategy", e.target.value)}
                className="w-full px-2 py-1.5 rounded border border-input bg-background text-sm text-foreground">
                <option value="">Toutes</option>
                <option value="go">GO</option>
                <option value="go_conditional">GO sous conditions</option>
                <option value="no_go">NO GO</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tender list */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement...</div>
      ) : tenders.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground/20" />
          <p className="mt-4 text-lg font-medium text-foreground">Aucun appel d'offres</p>
          <p className="text-sm text-muted-foreground mt-1">Essayez d'ajuster vos filtres ou lancez une collecte</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tenders.map((tender: any) => (
            <Link key={tender.id} href={`/tenders/${tender.id}`}
              className="block bg-card rounded-xl border border-border p-5 hover:border-primary/30 hover:shadow-sm transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{tender.reference}</span>
                    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", statusColor(tender.status))}>
                      {tender.status?.replace("_", " ")}
                    </span>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">{tender.tender_type}</span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mt-2 line-clamp-2">{tender.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                    {tender.organization && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{tender.organization}</span>}
                    {tender.sector && <span className="flex items-center gap-1"><Filter className="w-3 h-3" />{tender.sector}</span>}
                    {tender.region && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{tender.region}</span>}
                    {tender.deadline_date && (
                      <span className={cn("flex items-center gap-1", (daysUntil(tender.deadline_date) ?? 999) < 7 ? "text-destructive font-medium" : "")}>
                        <Clock className="w-3 h-3" />{daysUntil(tender.deadline_date) ?? "—"}j restants
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {tender.budget_estimated && (
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(tender.budget_estimated, tender.currency)}</p>
                  )}
                  {tender.strategy_recommendation && (
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", strategyColor(tender.strategy_recommendation))}>
                      {strategyLabel(tender.strategy_recommendation)}
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>Priorité: {Math.round(tender.priority_score * 100)}%</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setFilters((p: any) => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={filters.page <= 1}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-accent disabled:opacity-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-foreground">Page {filters.page} sur {totalPages}</span>
          <button onClick={() => setFilters((p: any) => ({ ...p, page: Math.min(totalPages, p.page + 1) }))} disabled={filters.page >= totalPages}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-accent disabled:opacity-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
