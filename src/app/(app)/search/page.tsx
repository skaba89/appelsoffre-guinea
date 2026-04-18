"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, Save, Trash2, Bell, X, Clock,
  FileText, User, Building2, Folder, Sparkles,
  MapPin, Tag, Calendar, Banknote, Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  search,
  getSuggestions,
  getSavedSearches,
  saveSearch,
  deleteSavedSearch,
  countByType,
  facetBySector,
  facetByRegion,
  type SearchFilter,
  type SearchResult,
  type SearchSuggestion,
  type SavedSearch,
} from "@/lib/search-engine";
import { strategyColor, formatCurrency, formatDate, daysUntil } from "@/lib/tenderflow-utils";

// ─── Type Config ──────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  tender: { label: "Appel d'offres", icon: <FileText className="h-4 w-4" />, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  contact: { label: "Contact", icon: <User className="h-4 w-4" />, color: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" },
  account: { label: "Compte", icon: <Building2 className="h-4 w-4" />, color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  document: { label: "Document", icon: <Folder className="h-4 w-4" />, color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  opportunity: { label: "Opportunité", icon: <Sparkles className="h-4 w-4" />, color: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300" },
};

// ─── Page Component ───────────────────────────────────────────────────────────

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilter>({});
  const [savedSearchList, setSavedSearchList] = useState(getSavedSearches());

  const suggestions = useMemo(() => getSuggestions(query), [query]);

  const executeSearch = useCallback((q: string, f?: SearchFilter) => {
    const searchQuery = q || query;
    const searchFilters = f || filters;
    const r = search(searchQuery, searchFilters);
    setResults(r);
    setHasSearched(true);
    setShowSuggestions(false);
  }, [query, filters]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(value.length > 0);
    if (!value.trim()) {
      setResults([]);
      setHasSearched(false);
    }
  };

  const selectSuggestion = (s: SearchSuggestion) => {
    setQuery(s.text);
    executeSearch(s.text);
  };

  const typeCounts = useMemo(() => countByType(results), [results]);
  const sectorFacets = useMemo(() => facetBySector(results), [results]);
  const regionFacets = useMemo(() => facetByRegion(results), [results]);

  const filteredResults = useMemo(() => {
    if (!activeTypeFilter) return results;
    return results.filter((r) => r.document.type === activeTypeFilter);
  }, [results, activeTypeFilter]);

  const handleSaveSearch = () => {
    saveSearch({ name: query || "Recherche", query, filters, isAlert: false });
    setSavedSearchList(getSavedSearches());
  };

  const handleDeleteSearch = (id: string) => {
    deleteSavedSearch(id);
    setSavedSearchList(getSavedSearches());
  };

  const runSavedSearch = (ss: SavedSearch) => {
    setQuery(ss.query);
    setFilters(ss.filters);
    executeSearch(ss.query, ss.filters);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          Recherche avancée
        </h1>
        <p className="text-muted-foreground mt-1">
          Recherche full-text sur appels d&apos;offres, contacts, comptes et documents
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && executeSearch(query)}
              onFocus={() => query && setShowSuggestions(true)}
              placeholder="Rechercher un appel d'offres, contact, document..."
              className="pl-10 h-11 text-base"
            />
            {query && (
              <button onClick={() => { setQuery(""); setResults([]); setHasSearched(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button variant="outline" size="icon" className="h-11 w-11" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" />
          </Button>
          <Button className="h-11 px-6" onClick={() => executeSearch(query)}>
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
          {hasSearched && (
            <Button variant="outline" className="h-11" onClick={handleSaveSearch}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          )}
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-full left-0 right-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
            >
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => selectSuggestion(s)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent text-left transition-colors">
                  {s.type === "popular" && <Star className="h-4 w-4 text-amber-500" />}
                  {s.type === "completion" && <Search className="h-4 w-4 text-muted-foreground" />}
                  {s.type === "entity" && <Building2 className="h-4 w-4 text-blue-500" />}
                  {s.type === "history" && <Clock className="h-4 w-4 text-muted-foreground" />}
                  <span className="flex-1 text-sm">{s.text}</span>
                  {s.count && <Badge variant="secondary" className="text-xs">{s.count}</Badge>}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Secteur</label>
                    <Input placeholder="Ex: BTP, Mines..." value={filters.sectors?.join(", ") ?? ""} onChange={(e) => setFilters({ ...filters, sectors: e.target.value ? e.target.value.split(",").map((s) => s.trim()) : undefined })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Région</label>
                    <Input placeholder="Ex: Conakry, Boké..." value={filters.regions?.join(", ") ?? ""} onChange={(e) => setFilters({ ...filters, regions: e.target.value ? e.target.value.split(",").map((s) => s.trim()) : undefined })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Budget min (GNF)</label>
                    <Input type="number" placeholder="1000000000" value={filters.budgetMin ?? ""} onChange={(e) => setFilters({ ...filters, budgetMin: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Score min</label>
                    <Input type="number" min={0} max={100} placeholder="0-100" value={filters.scoreMin ?? ""} onChange={(e) => setFilters({ ...filters, scoreMin: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="ghost" size="sm" onClick={() => setFilters({})}>Réinitialiser</Button>
                  <Button size="sm" onClick={() => { executeSearch(query); setShowFilters(false); }}>Appliquer</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Searches */}
      {savedSearchList.length > 0 && !hasSearched && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Save className="h-4 w-4" /> Recherches sauvegardées
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedSearchList.map((ss) => (
              <motion.div key={ss.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => runSavedSearch(ss)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{ss.name}</p>
                        {ss.query && <p className="text-xs text-muted-foreground mt-0.5">&quot;{ss.query}&quot;</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">{ss.resultCount} résultats</Badge>
                          {ss.isAlert && <Badge className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"><Bell className="h-3 w-3 mr-1" />Alerte</Badge>}
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteSearch(ss.id); }} className="text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{results.length}</span> résultat{results.length !== 1 ? "s" : ""} trouvé{results.length !== 1 ? "s" : ""}
              {query && <> pour &quot;<span className="font-medium text-foreground">{query}</span>&quot;</>}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button onClick={() => setActiveTypeFilter(null)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${!activeTypeFilter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                Tout ({results.length})
              </button>
              {Object.entries(typeCounts).map(([type, count]) => {
                const config = TYPE_CONFIG[type];
                return (
                  <button key={type} onClick={() => setActiveTypeFilter(activeTypeFilter === type ? null : type)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${activeTypeFilter === type ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                    {config?.icon} {config?.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Facets */}
          {(sectorFacets.length > 0 || regionFacets.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sectorFacets.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1"><Tag className="h-3 w-3" /> Secteurs :</span>
                  {sectorFacets.slice(0, 5).map((f) => (<Badge key={f.sector} variant="secondary" className="text-xs">{f.sector} ({f.count})</Badge>))}
                </div>
              )}
              {regionFacets.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> Régions :</span>
                  {regionFacets.slice(0, 5).map((f) => (<Badge key={f.region} variant="secondary" className="text-xs">{f.region} ({f.count})</Badge>))}
                </div>
              )}
            </div>
          )}

          {/* Results */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredResults.map((result, i) => {
                const doc = result.document;
                const typeConfig = TYPE_CONFIG[doc.type];
                return (
                  <motion.div key={doc.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}>
                    <Card className="hover:border-primary/30 transition-all hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${typeConfig?.color ?? "bg-muted"}`}>
                            {typeConfig?.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="font-semibold text-sm leading-tight line-clamp-2">{doc.title}</h3>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.description}</p>
                              </div>
                              <div className="shrink-0 text-xs text-right">
                                <span className="text-muted-foreground">Pertinence</span>
                                <div className="font-bold text-primary">{Math.round(result.relevance * 100)}%</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-3 flex-wrap">
                              {doc.sector && <Badge variant="secondary" className="text-xs"><Tag className="h-3 w-3 mr-1" />{doc.sector}</Badge>}
                              {doc.region && <Badge variant="secondary" className="text-xs"><MapPin className="h-3 w-3 mr-1" />{doc.region}</Badge>}
                              {doc.status && <Badge className={`text-xs ${strategyColor(doc.status === "go" ? "go" : doc.status === "no_go" ? "no_go" : "go_conditional")}`}>{doc.status}</Badge>}
                              {doc.budget && <span className="text-xs text-muted-foreground flex items-center gap-1"><Banknote className="h-3 w-3" />{formatCurrency(doc.budget)}</span>}
                              {doc.deadline && <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(doc.deadline)}{daysUntil(doc.deadline) !== null && <span className={daysUntil(doc.deadline)! < 7 ? "text-red-500 font-medium" : ""}>({daysUntil(doc.deadline)}j)</span>}</span>}
                              {doc.score !== undefined && <span className={`text-xs font-medium ${doc.score >= 70 ? "text-emerald-600" : doc.score >= 50 ? "text-amber-600" : "text-red-600"}`}>Score: {doc.score}%</span>}
                              {doc.authority && <span className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" />{doc.authority}</span>}
                            </div>
                            {doc.tags.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-2">
                                {doc.tags.slice(0, 5).map((tag) => (<span key={tag} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{tag}</span>))}
                              </div>
                            )}
                            {result.highlights.length > 0 && (
                              <div className="mt-2 text-xs text-muted-foreground space-y-1">
                                {result.highlights.slice(0, 2).map((h, idx) => (<p key={idx} className="italic">{h.snippet}</p>))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredResults.length === 0 && (
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Aucun résultat trouvé</h3>
              <p className="text-muted-foreground mt-1">Essayez d&apos;élargir vos critères ou utilisez des termes différents.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
