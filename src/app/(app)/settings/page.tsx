"use client";

import { Save, Building2, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground mt-1">Configuration de votre organisation</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4" /> Organisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nom</Label><Input defaultValue="Digital Solutions Guinée SARL" /></div>
                <div className="space-y-2"><Label>Slug</Label><Input defaultValue="digital-solutions-gn" /></div>
              </div>
              <div className="space-y-2"><Label>Fuseau horaire</Label>
                <Select defaultValue="africa_conakry">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="africa_conakry">Africa/Conakry (GMT+0)</SelectItem>
                    <SelectItem value="europe_paris">Europe/Paris (GMT+1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Langue par défaut</Label>
                <Select defaultValue="fr">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="gap-2"><Save className="w-4 h-4" /> Enregistrer</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4" /> Préférences de notification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Nouveaux appels d'offres", desc: "Recevoir une alerte quand un nouvel AO est publié" },
                { label: "Échéances proches", desc: "Rappel 7 jours avant la date limite" },
                { label: "Mises à jour de score", desc: "Notification quand un score est recalculé" },
                { label: "Correspondances profil", desc: "Alerte quand un AO correspond à votre profil" },
                { label: "Rapport hebdomadaire", desc: "Résumé hebdomadaire par email" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div><p className="text-sm font-medium text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                  <Switch defaultChecked={i < 3} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4" /> Sécurité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Mot de passe actuel</Label><Input type="password" placeholder="••••••••" /></div>
              <div className="space-y-2"><Label>Nouveau mot de passe</Label><Input type="password" placeholder="••••••••" /></div>
              <div className="space-y-2"><Label>Confirmer le mot de passe</Label><Input type="password" placeholder="••••••••" /></div>
              <Button className="gap-2"><Save className="w-4 h-4" /> Changer le mot de passe</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
