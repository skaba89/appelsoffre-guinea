"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Users, Mail, Phone, Globe, User } from "lucide-react";

interface Contact {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
}

interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  description?: string;
  address?: string;
  contacts?: Contact[];
  _count?: { contacts: number };
}

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    Promise.all([
      fetch(`/api/crm/accounts?id=${id}`).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }),
      fetch(`/api/crm/contacts?company_id=${id}`).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }),
    ])
      .then(([companyData, contactsData]) => {
        const companyInfo = Array.isArray(companyData) 
          ? companyData.find((c: Company) => c.id === id) 
          : companyData.company || companyData.account || companyData;
        setCompany(companyInfo || null);
        
        const contactsList = Array.isArray(contactsData) 
          ? contactsData 
          : contactsData.contacts || [];
        setContacts(contactsList);
        
        // If company has contacts embedded, use those too
        if (companyInfo?.contacts && companyInfo.contacts.length > 0) {
          setContacts(companyInfo.contacts);
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching company details:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive font-medium">
            {error || "Entreprise non trouvée"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux entreprises
      </button>

      {/* Company Header */}
      <div className="rounded-lg border p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{company.name}</h1>
            {company.industry && (
              <p className="text-muted-foreground mt-1">{company.industry}</p>
            )}
            {company.description && (
              <p className="text-muted-foreground mt-2">{company.description}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-4">
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  {company.website}
                </a>
              )}
              {company.address && (
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  {company.address}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {contacts.length} contact(s)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contacts */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Contacts ({contacts.length})
        </h2>
        {contacts.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <User className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">Aucun contact pour cette entreprise</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {contacts.map((contact) => {
              const displayName = contact.name || 
                [contact.first_name, contact.last_name].filter(Boolean).join(" ") || 
                "Sans nom";
              return (
                <div key={contact.id} className="rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-muted p-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{displayName}</h3>
                      {contact.position && (
                        <p className="text-sm text-muted-foreground">{contact.position}</p>
                      )}
                      <div className="mt-2 flex flex-col gap-1">
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            {contact.email}
                          </a>
                        )}
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {contact.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
