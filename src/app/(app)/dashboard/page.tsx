"use client";

import { mockTenders, mockDashboardStats, mockPipelineStats } from "@/lib/mock-data";
import { cn, formatCurrency, strategyColor, strategyLabel, statusColor, statusLabel, daysUntil } from "@/lib/tenderflow-utils";
import {
  FileText, TrendingUp, Clock, Target, Users, Building2,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#84cc16"];

export default function DashboardPage() {
  const stats = mockDashboardStats;
  const pipeline = mockPipelineStats;
  const recentTenders = mockTenders.slice(0, 6);

  const statusData = Object.entries(stats.by_status).map(([key, value]) => ({
    name: statusLabel(key),
    value: value as number,
  }));

  const sectorData = Object.entries(stats.by_sector)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 8)
    .map(([key, value]) => ({
      name: key,
      count: value as number,
    }));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de vos appels d'offres et activités</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total AO" value={stats.total_tenders} icon={FileText} subtitle="Appels d'offres actifs" color="blue" />
        <KPICard title="Nouveaux aujourd'hui" value={stats.new_today} icon={TrendingUp} subtitle="Collectés aujourd'hui" color="green" />
        <KPICard title="Échéances proches" value={stats.deadline_soon} icon={Clock} subtitle="Dans les 7 prochains jours" color="amber" />
        <KPICard
          title="Score moyen"
          value={stats.avg_priority_score ? (stats.avg_priority_score * 100).toFixed(0) + "%" : "—"}
          icon={Target}
          subtitle="Priorité moyenne"
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tendance mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthly_trend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="tenders" name="Appels d'offres" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="won" name="Gagnés" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Par statut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategy + Sector + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategy breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recommandations stratégiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(stats.by_strategy).map(([strategy, count]) => (
              <div key={strategy} className="flex items-center justify-between">
                <Badge className={strategyColor(strategy)} variant="secondary">
                  {strategyLabel(strategy)}
                </Badge>
                <span className="text-sm font-semibold text-foreground">{count as number}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sector breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Par secteur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* CRM Pipeline */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Pipeline CRM</CardTitle>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {pipeline.total_contacts}</span>
                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {pipeline.total_accounts}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(pipeline.pipeline).map(([stage, data]) => {
              const stageLabels: Record<string, string> = {
                prospect: "Prospect", qualification: "Qualification", proposal: "Proposition",
                negotiation: "Négociation", won: "Gagné", lost: "Perdu",
              };
              const stageColors: Record<string, string> = {
                prospect: "bg-blue-500", qualification: "bg-yellow-500", proposal: "bg-purple-500",
                negotiation: "bg-orange-500", won: "bg-green-500", lost: "bg-gray-400",
              };
              return (
                <div key={stage} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", stageColors[stage] || "bg-gray-400")} />
                    <span className="text-sm text-foreground">{stageLabels[stage] || stage}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{(data as any).count} opp.</span>
                    <span className="text-sm font-medium text-foreground">{formatCurrency((data as any).total_amount)}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent tenders */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Appels d'offres récents</CardTitle>
            <Link href="/tenders" className="text-sm text-primary hover:underline">
              Voir tout
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {recentTenders.map((tender) => (
              <Link
                key={tender.id}
                href={`/tenders/${tender.id}`}
                className="flex items-center gap-4 py-3 hover:bg-accent/50 rounded-lg px-2 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tender.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{tender.reference}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {tender.sector}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {tender.region}
                    </Badge>
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
                  <Badge className={cn("mt-1", strategyColor(tender.strategy_recommendation))} variant="secondary">
                    {strategyLabel(tender.strategy_recommendation)}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KPICard({
  title, value, icon: Icon, subtitle, color,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  subtitle: string;
  color: "blue" | "green" | "amber" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <Card>
      <CardContent className="p-5">
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
      </CardContent>
    </Card>
  );
}
