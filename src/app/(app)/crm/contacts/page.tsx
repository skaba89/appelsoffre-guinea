"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Mail, Phone, Building2 } from "lucide-react";

interface Contact {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  company?: { id: string; name: string };
  company_id?: string;
  company_name?: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/crm/contacts")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setContacts(Array.isArray(data) ? data : data.contacts || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching contacts:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

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
        <p className="text-destructive font-medium">Erreur: {error}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Vérifiez que le backend FastAPI est bien démarré sur le port 8000.
        </p>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Aucun contact</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Les contacts apparaîtront ici une fois ajoutés.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Contacts ({contacts.length})</h2>
      </div>
      <div className="grid gap-3">
        {contacts.map((contact) => {
          const displayName = contact.name || 
            [contact.first_name, contact.last_name].filter(Boolean).join(" ") || 
            "Sans nom";
          const companyName = contact.company?.name || contact.company_name || null;

          return (
            <div
              key={contact.id}
              className="rounded-lg border p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{displayName}</h3>
                    {contact.position && (
                      <p className="text-sm text-muted-foreground">{contact.position}</p>
                    )}
                    <div className="mt-2 flex flex-col gap-1">
                      {contact.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{contact.email}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{contact.phone}</span>
                        </div>
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
    </div>
  );
}
