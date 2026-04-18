"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Search,
  Users,
  Globe,
  MapPin,
  TrendingUp,
  UserPlus,
  Briefcase,
  BarChart3,
} from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { AnimatedCard } from "@/components/ui/animated-card";
import { motionVariants, transitions, chartColors } from "@/lib/design-tokens";
import { cn, formatCurrency } from "@/lib/tenderflow-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Account {
  id: string;
  name: string;
  sector: string;
  region: string;
  website: string;
  contactCount: number;
  opportunityValue: number;
  isActive: boolean;
  isNew: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const accounts: Account[] = [
  { id: "a-001", name: "Ministère des Travaux Publics", sector: "BTP", region: "Conakry", website: "mpw.gouv.gn", contactCount: 3, opportunityValue: 70_000_000_000, isActive: true, isNew: false },
  { id: "a-002", name: "Direction Nationale de l'Énergie", sector: "Énergie", region: "Conakry", website: "dne.gouv.gn", contactCount: 2, opportunityValue: 6_500_000_000, isActive: true, isNew: false },
  { id: "a-003", name: "SOGUIPAMI", sector: "Mines", region: "Conakry", website: "soguipami.gouv.gn", contactCount: 2, opportunityValue: 5_300_000_000, isActive: true, isNew: false },
  { id: "a-004", name: "Société des Eaux de Guinée", sector: "Eau / Assainissement", region: "Conakry", website: "seg.gouv.gn", contactCount: 1, opportunityValue: 27_500_000_000, isActive: true, isNew: true },
  { id: "a-005", name: "Ministère de l'Éducation", sector: "Éducation", region: "Conakry", website: "education.gouv.gn", contactCount: 2, opportunityValue: 5_500_000_000, isActive: true, isNew: false },
  { id: "a-006", name: "AGUIPE", sector: "IT / Digital", region: "Conakry", website: "aguipe.gouv.gn", contactCount: 2, opportunityValue: 3_250_000_000, isActive: true, isNew: false },
  { id: "a-007", name: "Compagnie des Bauxites de Kindia", sector: "Mines", region: "Kindia", website: "cbk.gouv.gn", contactCount: 1, opportunityValue: 5_000_000_000, isActive: false, isNew: false },
  { id: "a-008", name: "Ministère de la Santé", sector: "Santé", region: "Conakry", website: "ms.gouv.gn", contactCount: 1, opportunityValue: 2_250_000_000, isActive: true, isNew: false },
  { id: "a-009", name: "ARTP", sector: "Télécom", region: "Conakry", website: "artp.gouv.gn", contactCount: 2, opportunityValue: 15_000_000_000, isActive: true, isNew: true },
  { id: "a-010", name: "Ministère des Finances", sector: "Finance", region: "Conakry", website: "mf.gouv.gn", contactCount: 1, opportunityValue: 1_150_000_000, isActive: true, isNew: false },
  { id: "a-011", name: "Ministère de l'Agriculture", sector: "Agriculture", region: "Nzérékoré", website: "agriculture.gouv.gn", contactCount: 1, opportunityValue: 10_000_000_000, isActive: true, isNew: true },
  { id: "a-012", name: "ONGUI", sector: "Conseil", region: "Conakry", website: "ongui.gouv.gn", contactCount: 2, opportunityValue: 850_000_000, isActive: true, isNew: false },
  { id: "a-013", name: "SIGG", sector: "Industrie", region: "Conakry", website: "sigg.gouv.gn", contactCount: 1, opportunityValue: 800_000_000, isActive: false, isNew: false },
  { id: "a-014", name: "Secrétariat Général du Gouvernement", sector: "Sécurité", region: "Kankan", website: "sgg.gouv.gn", contactCount: 1, opportunityValue: 2_750_000_000, isActive: true, isNew: true },
];

// ─── Sector colors for chart ──────────────────────────────────────────────────

const SECTOR_COLORS: Record<string, string> = {
  "BTP": chartColors.primary[0],
  "Énergie": chartColors.primary[1],
  "Mines": chartColors.primary[2],
  "IT / Digital": chartColors.primary[3],
  "Santé": chartColors.primary[4],
  "Éducation": chartColors.primary[0],
  "Finance": chartColors.primary[1],
  "Télécom": chartColors.primary[2],
  "Agriculture": chartColors.primary[3],
  "Conseil": chartColors.primary[4],
  "Eau / Assainissement": chartColors.primary[0],
  "Industrie": chartColors.primary[1],
  "Sécurité": chartColors.primary[2],
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AccountsPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return accounts;
    const q = search.toLowerCase();
    return accounts.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.sector.toLowerCase().includes(q) ||
        a.region.toLowerCase().includes(q)
    );
  }, [search]);

  // Stats
  const totalAccounts = filtered.length;
  const activeThisQuarter = filtered.filter((a) => a.isActive).length;
  const newThisMonth = filtered.filter((a) => a.isNew).length;

  // Sector distribution for chart
  const sectorData = useMemo(() => {
    const map: Record<string, { sector: string; count: number; value: number }> = {};
    for (const a of filtered) {
      if (!map[a.sector]) {
        map[a.sector] = { sector: a.sector, count: 0, value: 0 };
      }
      map[a.sector].count += 1;
      map[a.sector].value += a.opportunityValue;
    }
    return Object.values(map).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [filtered]);

  // Sector abbreviation for chart labels
  const sectorAbbr = (s: string) => {
    const map: Record<string, string> = {
      "BTP": "BTP",
      "Énergie": "Éner.",
      "Mines": "Mines",
      "IT / Digital": "IT",
      "Santé": "Santé",
      "Éducation": "Éduc.",
      "Finance": "Fin.",
      "Télécom": "Téléc.",
      "Agriculture": "Agric.",
      "Conseil": "Cons.",
      "Eau / Assainissement": "Eau",
      "Industrie": "Indus.",
      "Sécurité": "Séc.",
    };
    return map[s] || s.slice(0, 6);
  };

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
            Comptes organisations
          </h1>
          <p className="text-muted-foreground mt-1">
            {totalAccounts} organisations ·{" "}
            {formatCurrency(filtered.reduce((s, a) => s + a.opportunityValue, 0))} valeur pipeline
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une organisation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 w-64 h-9"
          />
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
            title="Total comptes"
            value={totalAccounts}
            icon={Building2}
            trend={{ direction: "up", label: "+3" }}
            sparklineData={[8, 9, 10, 11, 12, 13, 13, 14]}
            delay={0}
          />
        </motion.div>
        <motion.div variants={motionVariants.staggerItem}>
          <StatCard
            title="Actifs ce trimestre"
            value={activeThisQuarter}
            icon={TrendingUp}
            trend={{ direction: "up", label: "+2" }}
            sparklineData={[6, 7, 8, 8, 9, 10, 10, 11]}
            delay={0.06}
          />
        </motion.div>
        <motion.div variants={motionVariants.staggerItem}>
          <StatCard
            title="Nouveaux ce mois"
            value={newThisMonth}
            icon={UserPlus}
            trend={{ direction: "up", label: "+4" }}
            sparklineData={[0, 1, 1, 2, 2, 3, 3, 4]}
            delay={0.12}
          />
        </motion.div>
      </motion.div>

      {/* Sector distribution chart */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transitions.normal, delay: 0.2 }}
      >
        <AnimatedCard variant="outline" className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Distribution sectorielle
            </h3>
            <Badge variant="secondary" className="text-[10px] ml-auto">
              Valeur pipeline
            </Badge>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis
                  dataKey="sector"
                  tickFormatter={sectorAbbr}
                  tick={{ fontSize: 11, fill: "oklch(0.556 0 0)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Valeur"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid oklch(0.922 0 0)",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                  fill={chartColors.primary[1]}
                >
                  {sectorData.map((entry, idx) => (
                    <rect
                      key={entry.sector}
                      fill={SECTOR_COLORS[entry.sector] || chartColors.primary[idx % 5]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>
      </motion.div>

      {/* Accounts grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        variants={motionVariants.staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {filtered.map((account) => (
          <motion.div key={account.id} variants={motionVariants.staggerItem}>
            <AccountCard account={account} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Account Card Sub-Component ───────────────────────────────────────────────

function AccountCard({ account }: { account: Account }) {
  const sectorIcon = Building2;

  return (
    <AnimatedCard variant="default" className="p-4 gap-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <sectorIcon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground truncate leading-snug">
              {account.name}
            </h3>
            {account.isNew && (
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px] px-1.5 py-0 shrink-0 border-0">
                Nouveau
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {account.sector}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              <MapPin className="w-2.5 h-2.5 mr-0.5" />
              {account.region}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-1 pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="w-3 h-3" />
          <span>{account.contactCount} contacts</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Briefcase className="w-3 h-3" />
          <span>{formatCurrency(account.opportunityValue)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
        <Globe className="w-3 h-3" />
        <span className="truncate">{account.website}</span>
      </div>

      {/* Activity indicator bar */}
      <div
        className={cn(
          "h-1 rounded-full mt-1",
          account.isActive
            ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
            : "bg-muted"
        )}
      />
    </AnimatedCard>
  );
}
