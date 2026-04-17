"use client";

import { Building2, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const references = [
  { id: "r-1", client: "Ministère des Travaux Publics", project: "SIG Gestion des Marchés", year: "2025", amount: "2,5 Mds GNF" },
  { id: "r-2", client: "AGUIPE", project: "Portail e-Administration", year: "2024", amount: "1,2 Mds GNF" },
  { id: "r-3", client: "SOGUIPAMI", project: "Système de Cartographie Minière", year: "2024", amount: "3,8 Mds GNF" },
];

export default function CompanyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profil entreprise</h1>
        <p className="text-muted-foreground mt-1">Configurez votre profil pour un meilleur matching avec les appels d'offres</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Company info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nom de l'entreprise</Label><Input defaultValue="Digital Solutions Guinée SARL" /></div>
                <div className="space-y-2"><Label>NIF</Label><Input placeholder="Numéro d'identification fiscale" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Secteur principal</Label><Input defaultValue="IT / Digital" /></div>
                <div className="space-y-2"><Label>Effectif</Label><Input defaultValue="25-50" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Siège social</Label><Input defaultValue="Conakry, Kaloum" /></div>
                <div className="space-y-2"><Label>Site web</Label><Input defaultValue="https://dsg-guinee.com" /></div>
              </div>
              <div className="space-y-2">
                <Label>Compétences clés</Label>
                <Textarea defaultValue="Développement de systèmes d'information, Intelligence artificielle, Cybersécurité, Gestion de projets IT, Formation et accompagnement numérique" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Zones d'intervention</Label>
                <Input defaultValue="Conakry, Kindia, Boké, Kankan, National" />
              </div>
              <Button className="gap-2"><Save className="w-4 h-4" /> Enregistrer</Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Matching score */}
          <Card>
            <CardHeader><CardTitle className="text-base">Score de matching</CardTitle></CardHeader>
            <CardContent className="text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-3xl font-bold text-primary">72%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-3">Compatibilité moyenne avec les AO actifs</p>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <Card>
            <CardHeader><CardTitle className="text-base">Statistiques</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Références</span><span className="text-sm font-medium">3</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">AO répondus</span><span className="text-sm font-medium">12</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Taux de succès</span><span className="text-sm font-medium text-green-600">33%</span></div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* References */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Références</CardTitle>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Ajouter</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {references.map(ref => (
              <div key={ref.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{ref.project}</p>
                  <p className="text-xs text-muted-foreground">{ref.client} — {ref.year}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs">{ref.amount}</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
