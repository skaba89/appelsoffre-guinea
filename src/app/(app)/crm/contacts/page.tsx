"use client";

import { mockContacts } from "@/lib/mock-data";
import { cn } from "@/lib/tenderflow-utils";
import { Plus, Mail, Phone, Shield, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const validationBadge = (status: string) => {
  switch (status) {
    case "validated": return { icon: CheckCircle, label: "Validé", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" };
    case "pending": return { icon: Clock, label: "En attente", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" };
    default: return { icon: Shield, label: status, className: "bg-gray-100 text-gray-800" };
  }
};

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts professionnels</h1>
          <p className="text-muted-foreground mt-1">{mockContacts.length} contacts — Données professionnelles uniquement</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Ajouter</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau contact professionnel</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Nom complet</Label><Input placeholder="Nom Prénom" /></div>
                <div className="space-y-2"><Label>Entreprise</Label><Input placeholder="Organisation" /></div>
              </div>
              <div className="space-y-2"><Label>Fonction</Label><Input placeholder="Directeur, Chef de service..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Email professionnel</Label><Input placeholder="prenom.nom@org.gn" /></div>
                <div className="space-y-2"><Label>Téléphone professionnel</Label><Input placeholder="+224 6XX XX XX XX" /></div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Shield className="w-3 h-3" /> Seules les données professionnelles sont collectées (conformité RGPD)
              </p>
              <Button className="w-full">Ajouter le contact</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Compliance notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Conformité données personnelles</p>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
            Conformément à la politique de confidentialité, seules les informations de contact professionnelles
            (email pro, téléphone pro, fonction) sont collectées et stockées. Aucune donnée personnelle n'est enregistrée.
          </p>
        </div>
      </div>

      {/* Contacts table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Contact</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Entreprise</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Fonction</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Email pro</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden xl:table-cell">Tél. pro</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Validation</th>
              </tr>
            </thead>
            <tbody>
              {mockContacts.map(contact => {
                const vb = validationBadge(contact.validation_status);
                return (
                  <tr key={contact.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                          {contact.full_name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-foreground">{contact.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{contact.company}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{contact.role}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {contact.professional_email}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden xl:table-cell">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {contact.professional_phone}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn("text-xs gap-1", vb.className)} variant="secondary">
                        <vb.icon className="w-3 h-3" /> {vb.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
