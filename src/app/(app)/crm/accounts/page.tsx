"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Users, ExternalLink } from "lucide-react";

interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  description?: string;
  _count?: { contacts: number };
}

export default function AccountsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/crm/accounts")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setCompanies(Array.isArray(data) ? data : data.companies || data.accounts || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching accounts:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

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
        <p className="text-destructive font-medium">Erreur: {error}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Vérifiez que le backend FastAPI est bien démarré sur le port 8000.
        </p>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Aucune entreprise</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Les entreprises apparaîtront ici une fois ajoutées.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Entreprises ({companies.length})</h2>
      </div>
      <div className="grid gap-3">
        {companies.map((company) => (
          <Link
            key={company.id}
            href={`/crm/accounts/${company.id}`}
            className="block rounded-lg border p-4 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{company.name}</h3>
                  {company.industry && (
                    <p className="text-sm text-muted-foreground">{company.industry}</p>
                  )}
                  {company.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {company.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{company._count?.contacts || 0}</span>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            {company.website && (
              <p className="text-xs text-blue-500 mt-2 ml-10">{company.website}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
