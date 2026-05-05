"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Mail, Phone, Building2, Search, BadgeCheck, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Contact {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  job_title?: string;
  organization_name?: string;
  company_name?: string;
  company?: { id: string; name: string } | null;
  account_id?: string;
  validation_status?: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/crm/contacts?page_size=100");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Proxy returns { contacts: [...], total, ... } or an array
      const list = Array.isArray(data) ? data : data.contacts || [];
      setContacts(list);
    } catch (err: any) {
      console.error("Error fetching contacts:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredContacts = search
    ? contacts.filter(
        (c) =>
          (c.name || `${c.first_name || ""} ${c.last_name || ""}`).toLowerCase().includes(search.toLowerCase()) ||
          (c.organization_name || c.company_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (c.position || c.job_title || "").toLowerCase().includes(search.toLowerCase()) ||
          (c.email || "").toLowerCase().includes(search.toLowerCase())
      )
    : contacts;

  const statusConfig: Record<string, { label: string; color: string }> = {
    verified: { label: "Vérifié", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
    pending: { label: "En attente", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
    rejected: { label: "Rejeté", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Chargement des contacts...</span>
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
          Contacts ({filteredContacts.length})
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

      {filteredContacts.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Aucun contact</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Les contacts apparaîtront ici une fois ajoutés via le backend.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredContacts.map((contact) => {
            const displayName =
              contact.name ||
              [contact.first_name, contact.last_name].filter(Boolean).join(" ") ||
              "Sans nom";
            const companyName = contact.company?.name || contact.organization_name || contact.company_name || null;
            const position = contact.position || contact.job_title || null;
            const status = contact.validation_status || "pending";
            const statusInfo = statusConfig[status] || statusConfig.pending;

            return (
              <div
                key={contact.id}
                className="rounded-lg border p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2.5">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{displayName}</h3>
                        {status === "verified" && (
                          <BadgeCheck className="h-4 w-4 text-emerald-500" />
                        )}
                        <Badge className={`text-[10px] px-1.5 py-0 border-0 ${statusInfo.color}`}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      {position && (
                        <p className="text-sm text-muted-foreground mt-0.5">{position}</p>
                      )}
                      <div className="mt-2 flex flex-col gap-1.5">
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            {contact.email}
                          </a>
                        )}
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {contact.phone}
                          </a>
                        )}
                        {companyName && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="h-3.5 w-3.5" />
                            {contact.company?.id ? (
                              <Link
                                href={`/crm/accounts/${contact.company.id}`}
                                className="hover:text-primary hover:underline"
                              >
                                {companyName}
                              </Link>
                            ) : (
                              <span>{companyName}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
