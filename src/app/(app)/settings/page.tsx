"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Shield,
  Bell,
  Users,
  ScrollText,
  Save,
  Camera,
  Lock,
  Smartphone,
  Monitor,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ChevronDown,
  Mail,
  Megaphone,
  CalendarClock,
  Newspaper,
  Eye,
  EyeOff,
  Key,
  Globe,
  Building2,
  Phone,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ROLES,
  PERMISSIONS,
  getRolePermissions,
  hasPermission,
  getPermissionsByCategory,
  type Role,
  type Permission,
} from "@/lib/rbac";
import {
  getAuditTrail,
  AUDIT_ACTION_LABELS,
  AUDIT_ACTION_CATEGORIES,
  type AuditAction,
  type AuditEntry,
} from "@/lib/audit-trail";

// ─── Animation variants ───────────────────────────────────────────────────────

const tabVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

// ─── Mock team members ────────────────────────────────────────────────────────

const TEAM_MEMBERS = [
  { id: "demo-1", name: "Mamadou Diallo", email: "m.diallo@tenderflow.gn", role: "tenant_admin" as Role, avatar: null, active: true },
  { id: "u-002", name: "Fatoumata Binta Bah", email: "fb.bah@dne.gouv.gn", role: "manager" as Role, avatar: null, active: true },
  { id: "u-003", name: "Ibrahima Keita", email: "i.keita@soguipami.gouv.gn", role: "manager" as Role, avatar: null, active: true },
  { id: "u-004", name: "Mariama Condé", email: "m.conde@seg.gouv.gn", role: "analyst" as Role, avatar: null, active: true },
  { id: "u-005", name: "Aissatou Diallo", email: "a.diallo@aguipe.gouv.gn", role: "analyst" as Role, avatar: null, active: true },
  { id: "u-006", name: "Kadiatou Touré", email: "k.toure@aguipe.gouv.gn", role: "viewer" as Role, avatar: null, active: true },
  { id: "u-007", name: "Oumar Sylla", email: "o.sylla@mpw.gouv.gn", role: "viewer" as Role, avatar: null, active: false },
];

const MOCK_SESSIONS = [
  { id: "s-1", device: "Chrome sur Windows", location: "Conakry, Guinée", ip: "196.128.45.12", lastActive: "2026-04-15T08:12:33Z", current: true },
  { id: "s-2", device: "Safari sur iPhone", location: "Conakry, Guinée", ip: "196.128.45.88", lastActive: "2026-04-14T18:30:00Z", current: false },
  { id: "s-3", device: "Firefox sur MacOS", location: "Kankan, Guinée", ip: "41.82.157.22", lastActive: "2026-04-13T15:32:45Z", current: false },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Profil Tab ───────────────────────────────────────────────────────────────

function ProfilTab() {
  const [profile, setProfile] = useState({
    name: "Mamadou Diallo",
    email: "m.diallo@tenderflow.gn",
    phone: "+224 622 00 11 22",
    organization: "Digital Solutions Guinée SARL",
    timezone: "africa_conakry",
    language: "fr",
  });

  return (
    <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      {/* Avatar card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" /> Photo de profil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{profile.name}</p>
              <p className="text-xs text-muted-foreground">{profile.email}</p>
              <Badge variant="secondary" className="text-xs">
                Administrateur Tenant
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Informations personnelles
          </CardTitle>
          <CardDescription>Mettez à jour vos informations de profil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Nom complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="profile-name"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email professionnel</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="profile-email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile-phone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="profile-phone"
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-org">Organisation</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="profile-org"
                  value={profile.organization}
                  onChange={(e) => setProfile((p) => ({ ...p, organization: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fuseau horaire</Label>
              <Select
                value={profile.timezone}
                onValueChange={(v) => setProfile((p) => ({ ...p, timezone: v }))}
              >
                <SelectTrigger>
                  <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="africa_conakry">Africa/Conakry (GMT+0)</SelectItem>
                  <SelectItem value="europe_paris">Europe/Paris (GMT+1)</SelectItem>
                  <SelectItem value="africa_dakar">Africa/Dakar (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Langue</Label>
              <Select
                value={profile.language}
                onValueChange={(v) => setProfile((p) => ({ ...p, language: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="gap-2">
            <Save className="w-4 h-4" /> Enregistrer le profil
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Sécurité Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  return (
    <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      {/* Password change */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4" /> Changer le mot de passe
          </CardTitle>
          <CardDescription>Utilisez un mot de passe fort avec au moins 12 caractères</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-pw">Mot de passe actuel</Label>
            <div className="relative">
              <Input
                id="current-pw"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-pw">Nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="new-pw"
                type={showNewPassword ? "text" : "password"}
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-pw">Confirmer le mot de passe</Label>
            <Input id="confirm-pw" type="password" placeholder="••••••••••••" />
          </div>
          <Button className="gap-2">
            <Key className="w-4 h-4" /> Mettre à jour le mot de passe
          </Button>
        </CardContent>
      </Card>

      {/* 2FA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> Authentification à deux facteurs
          </CardTitle>
          <CardDescription>Ajoutez une couche de sécurité supplémentaire à votre compte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Authentification 2FA {twoFAEnabled ? "activée" : "désactivée"}
              </p>
              <p className="text-xs text-muted-foreground">
                {twoFAEnabled
                  ? "Votre compte est protégé par une vérification en deux étapes"
                  : "Activez la 2FA pour sécuriser l'accès à votre compte"}
              </p>
            </div>
            <Switch checked={twoFAEnabled} onCheckedChange={setTwoFAEnabled} />
          </div>
          {twoFAEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-900/40"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    2FA configurée avec succès
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Vous recevrez un code de vérification sur votre application d&apos;authentification à chaque connexion.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Active sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Monitor className="w-4 h-4" /> Sessions actives
          </CardTitle>
          <CardDescription>Gérez vos appareils connectés</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {MOCK_SESSIONS.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{session.device}</p>
                    {session.current && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Actuelle
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {session.location} · {session.ip} · Dernière activité {formatDate(session.lastActive)}
                  </p>
                </div>
              </div>
              {!session.current && (
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  Révoquer
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Login history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" /> Historique des connexions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-64">
            <div className="space-y-2">
              {[
                { date: "15/04/2026 08:12", status: "success", device: "Chrome / Windows", ip: "196.128.45.12" },
                { date: "14/04/2026 07:45", status: "success", device: "Safari / iPhone", ip: "196.128.45.88" },
                { date: "13/04/2026 09:30", status: "success", device: "Chrome / Windows", ip: "196.128.45.12" },
                { date: "12/04/2026 14:20", status: "failed", device: "Firefox / Linux", ip: "41.82.157.22" },
                { date: "12/04/2026 14:22", status: "success", device: "Firefox / Linux", ip: "41.82.157.22" },
                { date: "11/04/2026 08:05", status: "success", device: "Chrome / Windows", ip: "196.128.45.12" },
                { date: "10/04/2026 09:15", status: "success", device: "Safari / iPhone", ip: "196.128.45.88" },
              ].map((entry, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {entry.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <div>
                      <p className="text-sm text-foreground">{entry.device}</p>
                      <p className="text-xs text-muted-foreground">{entry.ip}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{entry.date}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab() {
  const [notifications, setNotifications] = useState({
    email_new_tenders: true,
    email_deadline: true,
    email_score_update: true,
    email_match: true,
    email_weekly: false,
    push_new_tenders: true,
    push_deadline: true,
    push_score_update: false,
    push_match: true,
    push_daily_digest: false,
    deadline_reminder_7: true,
    deadline_reminder_3: true,
    deadline_reminder_1: true,
  });

  const toggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      {/* Email alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="w-4 h-4" /> Alertes par email
          </CardTitle>
          <CardDescription>Configurez les notifications envoyées à votre adresse email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "email_new_tenders" as const, icon: Megaphone, label: "Nouveaux appels d'offres", desc: "Recevoir une alerte quand un nouvel AO est publié" },
            { key: "email_deadline" as const, icon: CalendarClock, label: "Échéances proches", desc: "Rappel avant la date limite de soumission" },
            { key: "email_score_update" as const, icon: Shield, label: "Mises à jour de score", desc: "Notification quand un score est recalculé" },
            { key: "email_match" as const, icon: CheckCircle2, label: "Correspondances profil", desc: "Alerte quand un AO correspond à votre profil" },
            { key: "email_weekly" as const, icon: Newspaper, label: "Rapport hebdomadaire", desc: "Résumé hebdomadaire de l'activité par email" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <Switch checked={notifications[item.key]} onCheckedChange={() => toggle(item.key)} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Push notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" /> Notifications push
          </CardTitle>
          <CardDescription>Alertes en temps réel dans votre navigateur</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "push_new_tenders" as const, label: "Nouveaux appels d'offres", desc: "Notification instantanée pour les nouveaux AO" },
            { key: "push_deadline" as const, label: "Rappels d'échéance", desc: "Push de rappel avant la date limite" },
            { key: "push_score_update" as const, label: "Mises à jour de score", desc: "Push quand un score est mis à jour" },
            { key: "push_match" as const, label: "Correspondances profil", desc: "Push quand un AO correspond à votre profil" },
            { key: "push_daily_digest" as const, label: "Résumé quotidien", desc: "Notification quotidienne avec le résumé du jour" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch checked={notifications[item.key]} onCheckedChange={() => toggle(item.key)} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Deadline reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarClock className="w-4 h-4" /> Rappels d'échéance
          </CardTitle>
          <CardDescription>Configurez les délais de rappel avant les dates limites</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "deadline_reminder_7" as const, label: "7 jours avant", desc: "Rappel une semaine avant l'échéance" },
            { key: "deadline_reminder_3" as const, label: "3 jours avant", desc: "Rappel trois jours avant l'échéance" },
            { key: "deadline_reminder_1" as const, label: "1 jour avant", desc: "Rappel la veille de l'échéance" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch checked={notifications[item.key]} onCheckedChange={() => toggle(item.key)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Accès & Rôles Tab ───────────────────────────────────────────────────────

function AccessRolesTab() {
  const permissionsByCategory = useMemo(() => getPermissionsByCategory(), []);
  const allRoles: Role[] = ["super_admin", "tenant_admin", "manager", "analyst", "viewer"];

  return (
    <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      {/* RBAC matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4" /> Matrice des permissions
          </CardTitle>
          <CardDescription>Vue d'ensemble des accès par rôle</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Permission</TableHead>
                  {allRoles.map((role) => (
                    <TableHead key={role} className="text-center min-w-[110px]">
                      <div className="flex flex-col items-center gap-1">
                        <Badge variant="secondary" className={`text-[10px] px-1.5 ${ROLES[role].color}`}>
                          {ROLES[role].label}
                        </Badge>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <>
                    <TableRow key={`cat-${category}`}>
                      <TableCell
                        colSpan={allRoles.length + 1}
                        className="bg-muted/50 font-semibold text-xs text-muted-foreground uppercase tracking-wider py-2"
                      >
                        {category}
                      </TableCell>
                    </TableRow>
                    {perms.map((perm) => (
                      <TableRow key={perm}>
                        <TableCell className="text-sm text-foreground">
                          {PERMISSIONS[perm].label}
                        </TableCell>
                        {allRoles.map((role) => {
                          const allowed = hasPermission(role, perm);
                          return (
                            <TableCell key={`${role}-${perm}`} className="text-center">
                              {allowed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                              ) : (
                                <XCircle className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Team members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" /> Membres de l'équipe
              </CardTitle>
              <CardDescription>{TEAM_MEMBERS.length} membres actifs</CardDescription>
            </div>
            <Button size="sm" className="gap-2">
              <Users className="w-4 h-4" /> Inviter un membre
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-96">
            <div className="space-y-2">
              {TEAM_MEMBERS.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="text-xs bg-muted">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{member.name}</p>
                        {!member.active && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Inactif
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className={`text-[10px] px-2 ${ROLES[member.role].color}`}>
                      {ROLES[member.role].label}
                    </Badge>
                    <Select defaultValue={member.role}>
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {ROLES[role].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Journal d'audit Tab ──────────────────────────────────────────────────────

function AuditTrailTab() {
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredEntries = useMemo(() => {
    return getAuditTrail({
      action: actionFilter !== "all" ? (actionFilter as AuditAction) : undefined,
      userId: userFilter !== "all" ? userFilter : undefined,
      startDate: dateFrom || undefined,
      endDate: dateTo || undefined,
      search: searchQuery || undefined,
    });
  }, [actionFilter, userFilter, searchQuery, dateFrom, dateTo]);

  const uniqueUsers = useMemo(() => {
    const users = new Map<string, string>();
    const allEntries = getAuditTrail();
    allEntries.forEach((e) => users.set(e.userId, e.userName));
    return Array.from(users.entries());
  }, []);

  const allActions = useMemo(() => {
    return Object.entries(AUDIT_ACTION_LABELS).map(([key, label]) => ({
      value: key,
      label,
    }));
  }, []);

  return (
    <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filtres du journal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 text-sm"
              />
            </div>

            {/* Action type filter */}
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Type d'action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                {Object.entries(AUDIT_ACTION_CATEGORIES).map(([category, actions]) => (
                  <React.Fragment key={category}>
                    <SelectItem value={category} disabled className="font-semibold text-xs text-muted-foreground">
                      {category}
                    </SelectItem>
                    {actions.map((action) => (
                      <SelectItem key={action} value={action} className="pl-6">
                        {AUDIT_ACTION_LABELS[action]}
                      </SelectItem>
                    ))}
                  </React.Fragment>
                ))}
              </SelectContent>
            </Select>

            {/* User filter */}
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Utilisateur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les utilisateurs</SelectItem>
                {uniqueUsers.map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date from */}
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 text-sm"
              placeholder="Du"
            />

            {/* Date to */}
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 text-sm"
              placeholder="Au"
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="w-3 h-3" />
            <span>{filteredEntries.length} entrée{filteredEntries.length !== 1 ? "s" : ""} trouvée{filteredEntries.length !== 1 ? "s" : ""}</span>
          </div>
        </CardContent>
      </Card>

      {/* Audit trail table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ScrollText className="w-4 h-4" /> Journal d'audit
          </CardTitle>
          <CardDescription>Historique immuable de toutes les actions du système</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Date & Heure</TableHead>
                  <TableHead className="w-[160px]">Utilisateur</TableHead>
                  <TableHead className="w-[200px]">Action</TableHead>
                  <TableHead>Ressource</TableHead>
                  <TableHead className="hidden lg:table-cell">Détails</TableHead>
                  <TableHead className="hidden xl:table-cell w-[120px]">Adresse IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucune entrée trouvée pour ces filtres
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(entry.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-[9px] bg-muted">
                              {getInitials(entry.userName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-foreground truncate">{entry.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px] font-normal">
                          {AUDIT_ACTION_LABELS[entry.action]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-foreground max-w-[200px] truncate">
                        {entry.resource}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[280px] truncate">
                        {entry.details}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-xs text-muted-foreground font-mono">
                        {entry.ipAddress}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profil");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground mt-1">Gérez votre profil, la sécurité et les accès de votre organisation</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="profil" className="gap-1.5 text-xs sm:text-sm">
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="securite" className="gap-1.5 text-xs sm:text-sm">
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sécurité</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs sm:text-sm">
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="acces" className="gap-1.5 text-xs sm:text-sm">
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Accès & Rôles</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5 text-xs sm:text-sm">
            <ScrollText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Journal d'audit</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <AnimatePresence mode="wait">
            {activeTab === "profil" && (
              <TabsContent key="profil" value="profil" forceMount>
                <ProfilTab />
              </TabsContent>
            )}
            {activeTab === "securite" && (
              <TabsContent key="securite" value="securite" forceMount>
                <SecurityTab />
              </TabsContent>
            )}
            {activeTab === "notifications" && (
              <TabsContent key="notifications" value="notifications" forceMount>
                <NotificationsTab />
              </TabsContent>
            )}
            {activeTab === "acces" && (
              <TabsContent key="acces" value="acces" forceMount>
                <AccessRolesTab />
              </TabsContent>
            )}
            {activeTab === "audit" && (
              <TabsContent key="audit" value="audit" forceMount>
                <AuditTrailTab />
              </TabsContent>
            )}
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  );
}


