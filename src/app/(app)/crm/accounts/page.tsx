"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Users, ExternalLink, Search, BadgeCheck, Globe, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Account {
  id: string;
  name: string;
  type: string;
  industry?: string;
  sector?: string;
  website?: string;
  description?: string;
  address?: string;
  city?: string;
  country: string;
  is_public_buyer: boolean;
  source_label?: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts(searchQuery?: string) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page_size", "100");
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/crm/accounts?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Proxy returns { companies: [...], total, ... } or an array
      const list = Array.isArray(data) ? data : data.companies || data.accounts || [];
      setAccounts(list);
    } catch (err: any) {
      console.error("Error fetching accounts:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredAccounts = search
    ? accounts.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          (a.industry || a.sector || "").toLowerCase().includes(search.toLowerCase()) ||
          (a.city || "").toLowerCase().includes(search.toLowerCase())
      )
    : accounts;

  const typeLabels: Record<string, { label: string; color: string }> = {
    buyer: { label: "Acheteur public", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
    company: { label: "Entreprise", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
    partner: { label: "Partenaire", color: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300" },
    competitor: { label: "Concurrent", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Chargement des entreprises...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive font-medium">Erreur : {error}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Vérifiez que le backend FastAPI est bien démarré sur le port 8000.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Count */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">
          Entreprises ({filteredAccounts.length})
        </h2>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      {filteredAccounts.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Aucune entreprise</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Les entreprises apparaîtront ici une fois ajoutées via le backend.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredAccounts.map((account) => {
            const typeInfo = typeLabels[account.type] || { label: account.type, color: "bg-gray-100 text-gray-800" };
            return (
              <Link
                key={account.id}
                href={`/crm/accounts/${account.id}`}
                className="block rounded-lg border p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2.5">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{account.name}</h3>
                        {account.is_public_buyer && (
                          <BadgeCheck className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge className={`text-[10px] px-1.5 py-0 border-0 ${typeInfo.color}`}>
                          {typeInfo.label}
                        </Badge>
                        {(account.industry || account.sector) && (
                          <span className="text-sm text-muted-foreground">
                            {account.industry || account.sector}
                          </span>
                        )}
                      </div>
                      {account.description && (
                        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                          {account.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        {account.city && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {account.city}
                          </span>
                        )}
                        {account.website && (
                          <span className="flex items-center gap-1 text-xs text-blue-500">
                            <Globe className="h-3 w-3" />
                            {account.website.replace(/^https?:\/\//, "")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
