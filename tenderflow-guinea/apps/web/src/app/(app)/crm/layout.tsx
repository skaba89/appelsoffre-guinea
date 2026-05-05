"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Building2, Users, TrendingUp, LayoutDashboard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { crmApi } from "@/lib/api";

const crmTabs = [
  { name: "Vue d'ensemble", href: "/crm", icon: LayoutDashboard },
  { name: "Comptes", href: "/crm/accounts", icon: Building2 },
  { name: "Contacts", href: "/crm/contacts", icon: Users },
  { name: "Pipeline", href: "/crm/opportunities", icon: TrendingUp },
];

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Fetch pipeline stats for the overview badge
  const { data: statsData } = useQuery({
    queryKey: ["crm-pipeline-stats"],
    queryFn: async () => {
      const res = await crmApi.pipelineStats();
      return res.data;
    },
  });

  const stats = statsData?.data;

  return (
    <div className="space-y-6">
      {/* CRM Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            CRM Guinée
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestion des relations avec les acheteurs publics et partenaires en Guinée
          </p>
        </div>
        {stats && (
          <div className="flex gap-3">
            <div className="bg-card rounded-lg border border-border px-4 py-2 text-center">
              <p className="text-2xl font-bold text-primary">{stats.total_accounts || 0}</p>
              <p className="text-xs text-muted-foreground">Comptes</p>
            </div>
            <div className="bg-card rounded-lg border border-border px-4 py-2 text-center">
              <p className="text-2xl font-bold text-primary">{stats.total_contacts || 0}</p>
              <p className="text-xs text-muted-foreground">Contacts</p>
            </div>
          </div>
        )}
      </div>

      {/* CRM Tabs */}
      <nav className="flex gap-1 bg-muted/50 p-1 rounded-lg">
        {crmTabs.map((tab) => {
          const isActive =
            tab.href === "/crm"
              ? pathname === "/crm"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </Link>
          );
        })}
      </nav>

      {/* Page Content */}
      {children}
    </div>
  );
}
