"use client";

import { useQuery } from "@tanstack/react-query";
import { crmApi } from "@/lib/api";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Building2,
  Users,
  TrendingUp,
  ArrowRight,
  Globe,
  MapPin,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

const STAGE_LABELS: Record<string, string> = {
  prospecting: "Prospection",
  qualification: "Qualification",
  proposal: "Proposition",
  negotiation: "Négociation",
  won: "Gagné",
  lost: "Perdu",
};
const STAGE_COLORS: Record<string, string> = {
  prospecting: "bg-blue-500",
  qualification: "bg-yellow-500",
  proposal: "bg-purple-500",
  negotiation: "bg-amber-500",
  won: "bg-green-500",
  lost: "bg-red-500",
};

export default function CrmOverviewPage() {
  const { data: statsData } = useQuery({
    queryKey: ["crm-pipeline-stats"],
    queryFn: async () => {
      const res = await crmApi.pipelineStats();
      return res.data;
    },
  });

  const { data: accountsData } = useQuery({
    queryKey: ["crm-accounts-recent"],
    queryFn: async () => {
      const res = await crmApi.listAccounts({ page_size: 5 });
      return res.data;
    },
  });

  const { data: opportunitiesData } = useQuery({
    queryKey: ["crm-opportunities-recent"],
    queryFn: async () => {
      const res = await crmApi.listOpportunities({ page_size: 5 });
      return res.data;
    },
  });

  const stats = statsData?.data;
  const accounts = accountsData?.items || [];
  const opportunities = opportunitiesData?.items || [];
  const pipeline = stats?.pipeline || {};

  // Calculate total pipeline value
  const totalPipelineValue = Object.values(pipeline).reduce(
    (sum: number, stage: any) => sum + (stage.total_amount || 0),
    0
  );

  const typeLabels: Record<string, string> = {
    buyer: "Acheteur public",
    company: "Entreprise",
    partner: "Partenaire",
    competitor: "Concurrent",
  };
  const typeColors: Record<string, string> = {
    buyer: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    company: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    partner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    competitor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Comptes</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {stats?.total_accounts || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Contacts</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {stats?.total_contacts || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pipeline total</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {formatCurrency(totalPipelineValue, "GNF")}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Gagné</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(pipeline?.won?.total_amount || 0, "GNF")}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Pipeline par étape
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(STAGE_LABELS).map(([stage, label]) => {
            const stageData = pipeline[stage] || { count: 0, total_amount: 0 };
            return (
              <div
                key={stage}
                className="bg-muted/50 rounded-lg p-3 text-center space-y-1"
              >
                <div
                  className={cn(
                    "w-3 h-3 rounded-full mx-auto",
                    STAGE_COLORS[stage]
                  )}
                />
                <p className="text-xs font-medium text-foreground">{label}</p>
                <p className="text-lg font-bold text-foreground">
                  {stageData.count}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatCurrency(stageData.total_amount, "GNF")}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Accounts */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Derniers comptes
            </h2>
            <Link
              href="/crm/accounts"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {accounts.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              Aucun compte
            </p>
          ) : (
            <div className="space-y-3">
              {accounts.map((account: any) => (
                <div
                  key={account.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {account.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-medium",
                          typeColors[account.type] ||
                            "bg-gray-100 text-gray-800"
                        )}
                      >
                        {typeLabels[account.type] || account.type}
                      </span>
                      {account.city && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          {account.city}
                        </span>
                      )}
                    </div>
                  </div>
                  {account.website && (
                    <a
                      href={account.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Opportunities */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Dernières opportunités
            </h2>
            <Link
              href="/crm/opportunities"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {opportunities.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              Aucune opportunité
            </p>
          ) : (
            <div className="space-y-3">
              {opportunities.map((opp: any) => (
                <div
                  key={opp.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full shrink-0",
                      STAGE_COLORS[opp.stage]
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {opp.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {STAGE_LABELS[opp.stage] || opp.stage}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(opp.amount, opp.currency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Guinea-specific info */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20 p-5">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Marchés publics en Guinée
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Les principaux acheteurs publics en Guinée sont régis par l&apos;ARMP
              (Autorité de Régulation des Marchés Publics), la DNDMP (Direction
              Nationale des Marchés Publics) et l&apos;ANAF (Agence Nationale des
              Achats Financiers). Les appels d&apos;offres sont publiés selon le
              code des marchés publics guinéen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
