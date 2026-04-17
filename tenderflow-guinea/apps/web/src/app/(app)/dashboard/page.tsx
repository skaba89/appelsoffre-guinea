"use client";

import { useQuery } from "@tanstack/react-query";
import { tendersApi, crmApi, alertsApi } from "@/lib/api";
import { cn, formatCurrency, strategyColor, strategyLabel, statusColor, daysUntil } from "@/lib/utils";
import {
  FileText, TrendingUp, Clock, CheckCircle, AlertTriangle,
  Users, Building2, Target,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await tendersApi.dashboardStats();
      return res.data?.data;
    },
  });

  const { data: pipelineStats } = useQuery({
    queryKey: ["pipeline-stats"],
    queryFn: async () => {
      const res = await crmApi.pipelineStats();
      return res.data?.data;
    },
  });

  const { data: alertData } = useQuery({
    queryKey: ["unread-count"],
    queryFn: async () => {
      const res = await alertsApi.unreadCount();
      return res.data?.data;
    },
  });

  const { data: recentTenders } = useQuery({
    queryKey: ["recent-tenders"],
    queryFn: async () => {
      const res = await tendersApi.list({ page_size: 5, sort_by: "created_at", sort_order: "desc" });
      return res.data?.items || [];
    },
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">
          Vue d'ensemble de vos appels d'offres et activités
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total AO"
          value={stats?.total_tenders || 0}
          icon={FileText}
          subtitle="Appels d'offres actifs"
          color="blue"
        />
        <KPICard
          title="Nouveaux aujourd'hui"
          value={stats?.new_today || 0}
          icon={TrendingUp}
          subtitle="Collectés aujourd'hui"
          color="green"
        />
        <KPICard
          title="Échéances proches"
          value={stats?.deadline_soon || 0}
          icon={Clock}
          subtitle="Dans les 7 prochains jours"
          color="amber"
        />
        <KPICard
          title="Score moyen"
          value={stats?.avg_priority_score ? (stats.avg_priority_score * 100).toFixed(0) + "%" : "—"}
          icon={Target}
          subtitle="Priorité moyenne"
          color="purple"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategy breakdown */}
        <div className="lg:col-span-1 bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recommandations stratégiques</h2>
          <div className="space-y-3">
            {Object.entries(stats?.by_strategy || {}).map(([strategy, count]: [string, any]) => (
              <div key={strategy} className="flex items-center justify-between">
                <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", strategyColor(strategy))}>
                  {strategyLabel(strategy)}
                </span>
                <span className="text-sm font-medium text-foreground">{count}</span>
              </div>
            ))}
            {(!stats?.by_strategy || Object.keys(stats.by_strategy).length === 0) && (
              <p className="text-sm text-muted-foreground">Aucune évaluation pour le moment</p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">Par statut</h3>
            <div className="space-y-2">
              {Object.entries(stats?.by_status || {}).map(([status, count]: [string, any]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium", statusColor(status))}>
                    {status.replace("_", " ")}
                  </span>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent tenders */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Appels d'offres récents</h2>
            <Link href="/tenders" className="text-sm text-primary hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentTenders?.map((tender: any) => (
              <Link
                key={tender.id}
                href={`/tenders/${tender.id}`}
                className="flex items-center gap-4 py-3 hover:bg-accent/50 rounded-lg px-2 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tender.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{tender.reference}</span>
                    {tender.sector && (
                      <span className="text-xs text-muted-foreground">{tender.sector}</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {tender.deadline_date && (
                    <p className={cn(
                      "text-xs font-medium",
                      (daysUntil(tender.deadline_date) ?? 999) < 7 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {daysUntil(tender.deadline_date) ?? "—"}j restants
                    </p>
                  )}
                  {tender.strategy_recommendation && (
                    <span className={cn("inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold", strategyColor(tender.strategy_recommendation))}>
                      {strategyLabel(tender.strategy_recommendation)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
            {(!recentTenders || recentTenders.length === 0) && (
              <div className="py-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground/30" />
                <p className="mt-2 text-sm text-muted-foreground">Aucun appel d'offres pour le moment</p>
                <Link href="/tenders" className="mt-2 inline-block text-sm text-primary hover:underline">
                  Explorer les appels d'offres
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sector breakdown + CRM pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector breakdown */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Par secteur</h2>
          <div className="space-y-2">
            {Object.entries(stats?.by_sector || {})
              .sort(([, a]: any, [, b]: any]) => b - a)
              .slice(0, 8)
              .map(([sector, count]: [string, any]) => {
                const maxCount = Math.max(...Object.values(stats?.by_sector || {}) as number[]);
                const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={sector} className="flex items-center gap-3">
                    <span className="text-sm text-foreground w-32 truncate">{sector}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm font-medium text-foreground w-8 text-right">{count}</span>
                  </div>
                );
              })}
            {(!stats?.by_sector || Object.keys(stats.by_sector).length === 0) && (
              <p className="text-sm text-muted-foreground">Aucune donnée sectorielle</p>
            )}
          </div>
        </div>

        {/* CRM Pipeline */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Pipeline CRM</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {pipelineStats?.total_contacts || 0} contacts</span>
              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {pipelineStats?.total_accounts || 0} comptes</span>
            </div>
          </div>
          <div className="space-y-2">
            {Object.entries(pipelineStats?.pipeline || {}).map(([stage, data]: [string, any]) => (
              <div key={stage} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors">
                <span className="text-sm text-foreground capitalize">{stage.replace("_", " ")}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{data.count} opportunités</span>
                  <span className="text-sm font-medium text-foreground">{formatCurrency(data.total_amount)}</span>
                </div>
              </div>
            ))}
            {(!pipelineStats?.pipeline || Object.keys(pipelineStats.pipeline).length === 0) && (
              <p className="text-sm text-muted-foreground">Aucune opportunité CRM</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  title,
  value,
  icon: Icon,
  subtitle,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  subtitle: string;
  color: "blue" | "green" | "amber" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className={cn("p-2.5 rounded-lg", colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
