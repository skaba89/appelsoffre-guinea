"use client";

import { useState } from "react";
import { Shield, Users, Database, Settings, FileText, Play, Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const sources = [
  { id: "s-1", name: "Journal Officiel de Guinée", url: "https://journal-officiel.gouv.gn", status: "active", last_run: "Il y a 2h", tenders_found: 45 },
  { id: "s-2", name: "AMP Guinée", url: "https://amp.gouv.gn", status: "active", last_run: "Il y a 4h", tenders_found: 28 },
  { id: "s-3", name: "Banque Mondiale - Guinea", url: "https://worldbank.org/procurement/gn", status: "active", last_run: "Il y a 6h", tenders_found: 12 },
  { id: "s-4", name: "AFD Guinée", url: "https://afd.fr/guinee-marches", status: "paused", last_run: "Il y a 2j", tenders_found: 8 },
  { id: "s-5", name: "Commune de Conakry", url: "https://conakry-guinee.info", status: "active", last_run: "Il y a 1h", tenders_found: 15 },
];

const users = [
  { id: "u-1", name: "Mamadou Diallo", email: "demo@tenderflow.gn", role: "tenant_admin", status: "active" },
  { id: "u-2", name: "Fatoumata Binta Bah", email: "fb.bah@dsg-gn.com", role: "analyst", status: "active" },
  { id: "u-3", name: "Ibrahima Keita", email: "i.keita@dsg-gn.com", role: "bid_manager", status: "active" },
  { id: "u-4", name: "Mariama Condé", email: "m.conde@dsg-gn.com", role: "sales", status: "invited" },
  { id: "u-5", name: "Aissatou Diallo", email: "a.diallo@dsg-gn.com", role: "viewer", status: "active" },
];

const scoringConfig = [
  { dimension: "Priorité", weight: 30, description: "Importance stratégique de l'AO" },
  { dimension: "Compatibilité", weight: 30, description: "Adéquation avec le profil entreprise" },
  { dimension: "Faisabilité", weight: 25, description: "Capacité technique et financière" },
  { dimension: "Probabilité de gain", weight: 15, description: "Estimation des chances de succès" },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Administration</h1>
        <p className="text-muted-foreground mt-1">Gestion de la plateforme et de la configuration</p>
      </div>

      <Tabs defaultValue="sources">
        <TabsList>
          <TabsTrigger value="sources" className="gap-2"><Database className="w-4 h-4" /> Sources</TabsTrigger>
          <TabsTrigger value="scoring" className="gap-2"><Settings className="w-4 h-4" /> Scoring</TabsTrigger>
          <TabsTrigger value="users" className="gap-2"><Users className="w-4 h-4" /> Utilisateurs</TabsTrigger>
          <TabsTrigger value="audit" className="gap-2"><FileText className="w-4 h-4" /> Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Sources de veille</CardTitle>
                <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Ajouter</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {sources.map(source => (
                  <div key={source.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        <Database className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{source.name}</p>
                        <p className="text-xs text-muted-foreground">{source.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">Dernière exécution : {source.last_run}</p>
                        <p className="text-xs text-muted-foreground">{source.tenders_found} AO trouvés</p>
                      </div>
                      <Badge variant={source.status === "active" ? "default" : "secondary"} className="text-xs">
                        {source.status === "active" ? "Actif" : "En pause"}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Play className="w-3 h-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scoring" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Configuration du scoring</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Ajustez les pondérations des dimensions de scoring. Le total doit être égal à 100%.</p>
              {scoringConfig.map(dim => (
                <div key={dim.dimension} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{dim.dimension}</p>
                      <p className="text-xs text-muted-foreground">{dim.description}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">{dim.weight}%</span>
                  </div>
                  <Progress value={dim.weight} className="h-2" />
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Total</span>
                <span className="text-sm font-bold text-green-600">100%</span>
              </div>
              <Button className="gap-2"><Settings className="w-4 h-4" /> Modifier les pondérations</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Utilisateurs</CardTitle>
                <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Inviter</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">{user.role.replace("_", " ")}</Badge>
                      <Badge variant={user.status === "active" ? "default" : "secondary"} className="text-xs">
                        {user.status === "active" ? "Actif" : "Invité"}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="w-3 h-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Journal d'audit</CardTitle></CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {[
                  { action: "Connexion", user: "Mamadou Diallo", date: "18 avr. 2026, 08:30", ip: "197.148.xx.xx" },
                  { action: "Création de source", user: "Mamadou Diallo", date: "17 avr. 2026, 15:45", ip: "197.148.xx.xx" },
                  { action: "Modification scoring", user: "Mamadou Diallo", date: "16 avr. 2026, 10:20", ip: "197.148.xx.xx" },
                  { action: "Invitation utilisateur", user: "Mamadou Diallo", date: "15 avr. 2026, 09:10", ip: "197.148.xx.xx" },
                  { action: "Export données", user: "Fatoumata Binta Bah", date: "14 avr. 2026, 14:30", ip: "197.148.xx.xx" },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{log.action}</p>
                      <p className="text-xs text-muted-foreground">{log.user} — {log.ip}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{log.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
