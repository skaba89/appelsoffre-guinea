"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus, Mail, Phone, Shield, CheckCircle, Clock,
  Search, Building2, UserCheck, Users, Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AnimatedCard } from "@/components/ui/animated-card";
import { StatCard } from "@/components/ui/stat-card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { motionVariants, transitions } from "@/lib/design-tokens";
import { cn } from "@/lib/tenderflow-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Contact {
  id: string;
  full_name: string;
  company: string;
  role: string;
  professional_email: string;
  professional_phone: string;
  region: string;
  sector: string;
  validation_status: "validated" | "pending";
  isDecisionMaker: boolean;
  lastContact: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const contacts: Contact[] = [
  { id: "c-001", full_name: "Abdoulaye Soumah", company: "Ministère des Travaux Publics", role: "Directeur des Marchés", professional_email: "a.soumah@mtp.gouv.gn", professional_phone: "+224 621 00 00 01", region: "Conakry", sector: "BTP", validation_status: "validated", isDecisionMaker: true, lastContact: "Il y a 2j" },
  { id: "c-002", full_name: "Fatoumata Binta Bah", company: "Direction Nationale de l'Énergie", role: "Chef de Service Achat", professional_email: "fbah@dne.gouv.gn", professional_phone: "+224 622 00 00 02", region: "Conakry", sector: "Énergie", validation_status: "validated", isDecisionMaker: false, lastContact: "Il y a 5j" },
  { id: "c-003", full_name: "Ibrahima Keita", company: "SOGUIPAMI", role: "Directeur Général Adjoint", professional_email: "i.keita@soguipami.gouv.gn", professional_phone: "+224 623 00 00 03", region: "Conakry", sector: "Mines", validation_status: "validated", isDecisionMaker: true, lastContact: "Il y a 1j" },
  { id: "c-004", full_name: "Mariama Condé", company: "Société des Eaux de Guinée", role: "Responsable Technique", professional_email: "m.conde@seg.gouv.gn", professional_phone: "+224 624 00 00 04", region: "Conakry", sector: "Eau", validation_status: "pending", isDecisionMaker: false, lastContact: "Il y a 10j" },
  { id: "c-005", full_name: "Aissatou Diallo", company: "AGUIPE", role: "Directrice des Systèmes", professional_email: "a.diallo@aguipe.gouv.gn", professional_phone: "+224 625 00 00 05", region: "Conakry", sector: "IT / Digital", validation_status: "validated", isDecisionMaker: true, lastContact: "Il y a 3j" },
  { id: "c-006", full_name: "Moussa Camara", company: "Ministère de l'Éducation", role: "Sous-Directeur", professional_email: "m.camara@education.gouv.gn", professional_phone: "+224 626 00 00 06", region: "Conakry", sector: "Éducation", validation_status: "validated", isDecisionMaker: false, lastContact: "Il y a 7j" },
  { id: "c-007", full_name: "Kadiatou Touré", company: "ONGUI", role: "Secrétaire Générale", professional_email: "k.toure@ongui.gouv.gn", professional_phone: "+224 627 00 00 07", region: "Conakry", sector: "Conseil", validation_status: "validated", isDecisionMaker: true, lastContact: "Il y a 1j" },
  { id: "c-008", full_name: "Lamine Fofana", company: "Ministère des Finances", role: "Inspecteur des Finances", professional_email: "l.fofana@mf.gouv.gn", professional_phone: "+224 628 00 00 08", region: "Conakry", sector: "Finance", validation_status: "validated", isDecisionMaker: true, lastContact: "Il y a 4j" },
  { id: "c-009", full_name: "Oumar Sylla", company: "ARTP", role: "Directeur Réglementation", professional_email: "o.sylla@artp.gouv.gn", professional_phone: "+224 629 00 00 09", region: "Conakry", sector: "Télécom", validation_status: "pending", isDecisionMaker: true, lastContact: "Il y a 12j" },
  { id: "c-010", full_name: "Hawa Dioubaté", company: "Ministère de la Santé", role: "Pharmacienne Chef", professional_email: "h.dioubate@ms.gouv.gn", professional_phone: "+224 630 00 00 10", region: "Conakry", sector: "Santé", validation_status: "validated", isDecisionMaker: false, lastContact: "Il y a 6j" },
  { id: "c-011", full_name: "Aminata Sow", company: "Ministère de l'Agriculture", role: "Coordinatrice Programme", professional_email: "a.sow@agriculture.gouv.gn", professional_phone: "+224 631 00 00 11", region: "Nzérékoré", sector: "Agriculture", validation_status: "validated", isDecisionMaker: true, lastContact: "Il y a 2j" },
  { id: "c-012", full_name: "Boubacar Barry", company: "SIGG", role: "Chef de Projet", professional_email: "b.barry@sigg.gouv.gn", professional_phone: "+224 632 00 00 12", region: "Conakry", sector: "Industrie", validation_status: "validated", isDecisionMaker: false, lastContact: "Il y a 8j" },
  { id: "c-013", full_name: "Mamadou Bah", company: "Compagnie des Bauxites de Kindia", role: "Directeur Achats", professional_email: "m.bah@cbk.gouv.gn", professional_phone: "+224 633 00 00 13", region: "Kindia", sector: "Mines", validation_status: "pending", isDecisionMaker: true, lastContact: "Il y a 15j" },
  { id: "c-014", full_name: "Djenabou Diallo", company: "Préfecture de Kankan", role: "Secrétaire Générale", professional_email: "d.diallo@kankan.gouv.gn", professional_phone: "+224 634 00 00 14", region: "Kankan", sector: "Administration", validation_status: "validated", isDecisionMaker: true, lastContact: "Il y a 3j" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const regions = useMemo(() => [...new Set(contacts.map((c) => c.region))], []);

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const matchSearch = !search.trim() ||
        c.full_name.toLowerCase().includes(search.toLowerCase()) ||
        c.company.toLowerCase().includes(search.toLowerCase()) ||
        c.role.toLowerCase().includes(search.toLowerCase());
      const matchRegion = filterRegion === "all" || c.region === filterRegion;
      return matchSearch && matchRegion;
    });
  }, [search, filterRegion]);

  const totalContacts = filtered.length;
  const addedThisMonth = contacts.filter((c) => c.validation_status === "pending").length;
  const keyDecisionMakers = filtered.filter((c) => c.isDecisionMaker).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitions.normal}
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Contacts professionnels
          </h1>
          <p className="text-muted-foreground mt-1">
            {totalContacts} contacts · {keyDecisionMakers} décideurs clés
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau contact professionnel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Nom complet</Label>
                    <Input placeholder="Nom Prénom" />
                  </div>
                  <div className="space-y-2">
                    <Label>Entreprise</Label>
                    <Input placeholder="Organisation" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fonction</Label>
                  <Input placeholder="Directeur, Chef de service..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Email professionnel</Label>
                    <Input placeholder="prenom.nom@org.gn" />
                  </div>
                  <div className="space-y-2">
                    <Label>Téléphone professionnel</Label>
                    <Input placeholder="+224 6XX XX XX XX" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Seules les données professionnelles sont collectées (conformité RGPD)
                </p>
                <Button className="w-full">Ajouter le contact</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-3 gap-4"
        variants={motionVariants.staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={motionVariants.staggerItem}>
          <StatCard
            title="Total contacts"
            value={totalContacts}
            icon={Users}
            trend={{ direction: "up", label: "+5" }}
            sparklineData={[8, 9, 10, 11, 12, 13, 13, 14]}
            delay={0}
          />
        </motion.div>
        <motion.div variants={motionVariants.staggerItem}>
          <StatCard
            title="Ajoutés ce mois"
            value={addedThisMonth}
            icon={Plus}
            trend={{ direction: "up", label: "+2" }}
            sparklineData={[1, 2, 2, 3, 3, 3, 3, 3]}
            delay={0.06}
          />
        </motion.div>
        <motion.div variants={motionVariants.staggerItem}>
          <StatCard
            title="Décideurs clés"
            value={keyDecisionMakers}
            suffix=""
            icon={UserCheck}
            trend={{ direction: "up", label: "+1" }}
            sparklineData={[5, 6, 6, 7, 7, 8, 8, 8]}
            delay={0.12}
          />
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">Toutes régions</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center border rounded-lg overflow-hidden">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            className="rounded-none h-8 px-3"
            onClick={() => setViewMode("grid")}
          >
            Grille
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            className="rounded-none h-8 px-3"
            onClick={() => setViewMode("list")}
          >
            Liste
          </Button>
        </div>
      </motion.div>

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

      {/* Grid View */}
      {viewMode === "grid" ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          variants={motionVariants.staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {filtered.map((contact) => (
            <motion.div key={contact.id} variants={motionVariants.staggerItem}>
              <ContactCard contact={contact} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="rounded-xl border bg-card overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="grid grid-cols-[1fr_160px_120px_80px_80px] gap-2 px-4 py-2.5 border-b bg-muted/30 text-xs font-medium text-muted-foreground">
            <span>Contact</span>
            <span className="hidden sm:block">Organisation</span>
            <span className="hidden md:block">Fonction</span>
            <span className="text-center">Statut</span>
            <span className="text-center">Décideur</span>
          </div>
          {filtered.map((contact, i) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="grid grid-cols-[1fr_160px_120px_80px_80px] gap-2 px-4 py-3 border-b last:border-b-0 hover:bg-accent/30 transition-colors items-center"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {contact.full_name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{contact.full_name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{contact.professional_email}</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground truncate hidden sm:block">{contact.company}</span>
              <span className="text-xs text-muted-foreground truncate hidden md:block">{contact.role}</span>
              <div className="flex justify-center">
                {contact.validation_status === "validated" ? (
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-[10px] border-0">
                    <CheckCircle className="w-3 h-3 mr-0.5" /> Validé
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-[10px] border-0">
                    <Clock className="w-3 h-3 mr-0.5" /> En attente
                  </Badge>
                )}
              </div>
              <div className="flex justify-center">
                {contact.isDecisionMaker ? (
                  <GradientBadge variant="success" size="sm">Oui</GradientBadge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ─── Contact Card Sub-Component ──────────────────────────────────────────────

function ContactCard({ contact }: { contact: Contact }) {
  const initials = contact.full_name.split(" ").map((n) => n[0]).join("");

  return (
    <AnimatedCard variant="default" className="p-4 gap-3">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground truncate">{contact.full_name}</h3>
            {contact.isDecisionMaker && (
              <GradientBadge variant="success" size="sm">Décideur</GradientBadge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{contact.role}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              <Building2 className="w-2.5 h-2.5 mr-0.5" />
              {contact.company.length > 25 ? contact.company.slice(0, 25) + "…" : contact.company}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 pt-2 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="w-3 h-3 shrink-0" />
          <span className="truncate">{contact.professional_email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Phone className="w-3 h-3 shrink-0" />
          <span>{contact.professional_phone}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          {contact.validation_status === "validated" ? (
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-[10px] border-0">
              <CheckCircle className="w-3 h-3 mr-0.5" /> Validé
            </Badge>
          ) : (
            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-[10px] border-0">
              <Clock className="w-3 h-3 mr-0.5" /> En attente
            </Badge>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">{contact.lastContact}</span>
      </div>
    </AnimatedCard>
  );
}
