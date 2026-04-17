"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { mockTenders } from "@/lib/mock-data";
import { cn, formatCurrency, formatDate, daysUntil, strategyColor, strategyLabel, statusColor, statusLabel, SECTORS, REGIONS } from "@/lib/tenderflow-utils";
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PAGE_SIZE = 8;

export default function TendersPage() {
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [strategyFilter, setStrategyFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let result = [...mockTenders];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q) ||
        t.publishing_authority.toLowerCase().includes(q)
      );
    }
    if (sectorFilter !== "all") result = result.filter(t => t.sector === sectorFilter);
    if (regionFilter !== "all") result = result.filter(t => t.region === regionFilter);
    if (statusFilter !== "all") result = result.filter(t => t.status === statusFilter);
    if (strategyFilter !== "all") result = result.filter(t => t.strategy_recommendation === strategyFilter);

    result.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case "title": aVal = a.title; bVal = b.title; break;
        case "deadline_date": aVal = a.deadline_date; bVal = b.deadline_date; break;
        case "priority_score": aVal = a.priority_score; bVal = b.priority_score; break;
        case "budget_max": aVal = a.budget_max; bVal = b.budget_max; break;
        default: aVal = a.created_at; bVal = b.created_at;
      }
      if (typeof aVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [search, sectorFilter, regionFilter, statusFilter, strategyFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Appels d'offres</h1>
        <p className="text-muted-foreground mt-1">{filtered.length} appel(s) d'offres trouvé(s)</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre, référence ou autorité..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <Select value={sectorFilter} onValueChange={(v) => { setSectorFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full lg:w-44"><SelectValue placeholder="Secteur" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les secteurs</SelectItem>
                {SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={(v) => { setRegionFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Région" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les régions</SelectItem>
                {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="new">Nouveau</SelectItem>
                <SelectItem value="qualifying">Qualification</SelectItem>
                <SelectItem value="qualified">Qualifié</SelectItem>
                <SelectItem value="go">GO</SelectItem>
                <SelectItem value="no_go">NO GO</SelectItem>
                <SelectItem value="responding">En réponse</SelectItem>
              </SelectContent>
            </Select>
            <Select value={strategyFilter} onValueChange={(v) => { setStrategyFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full lg:w-44"><SelectValue placeholder="Stratégie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les stratégies</SelectItem>
                <SelectItem value="go">GO</SelectItem>
                <SelectItem value="go_conditional">GO sous conditions</SelectItem>
                <SelectItem value="no_go">NO GO</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("title")}>
                    Appel d'offres <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Secteur</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Région</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("budget_max")}>
                    Budget <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("deadline_date")}>
                    Échéance <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Score</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Stratégie</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((tender) => {
                const dl = daysUntil(tender.deadline_date);
                return (
                  <tr key={tender.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/tenders/${tender.id}`} className="group">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate max-w-xs">
                          {tender.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{tender.reference}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant="secondary" className="text-xs">{tender.sector}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">{tender.region}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      {formatCurrency(tender.budget_min)} — {formatCurrency(tender.budget_max)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-sm font-medium", dl !== null && dl < 7 ? "text-destructive" : "text-muted-foreground")}>
                        {dl ?? "—"}j
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(tender.priority_score || 0) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{((tender.priority_score || 0) * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn("text-xs", strategyColor(tender.strategy_recommendation))} variant="secondary">
                        {strategyLabel(tender.strategy_recommendation)}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">
            {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
