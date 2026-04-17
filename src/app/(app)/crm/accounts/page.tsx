"use client";

import { mockAccounts } from "@/lib/mock-data";
import { formatDate } from "@/lib/tenderflow-utils";
import { Plus, Building2, Globe, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comptes CRM</h1>
          <p className="text-muted-foreground mt-1">{mockAccounts.length} organisations</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Ajouter</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau compte</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Nom</Label><Input placeholder="Nom de l'organisation" /></div>
              <div className="space-y-2"><Label>Secteur</Label><Input placeholder="Secteur d'activité" /></div>
              <div className="space-y-2"><Label>Région</Label><Input placeholder="Région" /></div>
              <div className="space-y-2"><Label>Site web</Label><Input placeholder="https://..." /></div>
              <Button className="w-full">Créer le compte</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockAccounts.map(account => (
          <Card key={account.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{account.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px]">{account.sector}</Badge>
                    <Badge variant="outline" className="text-[10px]">{account.region}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {account.contact_count} contacts</span>
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {account.opportunity_count} opportunités</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
