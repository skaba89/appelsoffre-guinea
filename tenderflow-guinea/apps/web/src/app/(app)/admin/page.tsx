"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Shield, Users, FileText, Database, Activity } from "lucide-react";

export default function AdminPage() {
  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: async () => { const res = await adminApi.stats(); return res.data?.data; } });
  const { data: auditLogs } = useQuery({ queryKey: ["audit-logs"], queryFn: async () => { const res = await adminApi.auditLogs({ page_size: 20 }); return res.data?.items; } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Administration</h1>
        <p className="text-muted-foreground mt-1">Gestion et supervision de la plateforme</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Utilisateurs", value: stats?.total_users || 0, icon: Users, color: "blue" },
          { label: "Appels d'offres", value: stats?.total_tenders || 0, icon: FileText, color: "green" },
          { label: "Sources", value: stats?.total_sources || 0, icon: Database, color: "purple" },
          { label: "Contacts CRM", value: stats?.total_crm_contacts || 0, icon: Users, color: "amber" },
          { label: "Comptes CRM", value: stats?.total_crm_accounts || 0, icon: Users, color: "indigo" },
          { label: "Opportunités", value: stats?.total_opportunities || 0, icon: Activity, color: "pink" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4 text-center">
            <s.icon className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Audit logs */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Journal d'audit</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border"><th className="text-left py-2 text-muted-foreground font-medium">Action</th><th className="text-left py-2 text-muted-foreground font-medium">Ressource</th><th className="text-left py-2 text-muted-foreground font-medium">Date</th><th className="text-left py-2 text-muted-foreground font-medium">IP</th></tr></thead>
            <tbody>
              {(auditLogs || []).map((log: any, i: number) => (
                <tr key={i} className="border-b border-border/50 hover:bg-accent/50">
                  <td className="py-2 text-foreground font-mono text-xs">{log.action}</td>
                  <td className="py-2 text-muted-foreground text-xs">{log.resource_type} {log.resource_id ? `(${log.resource_id.slice(0, 8)}...)` : ""}</td>
                  <td className="py-2 text-muted-foreground text-xs">{log.created_at}</td>
                  <td className="py-2 text-muted-foreground text-xs">{log.ip_address || "—"}</td>
                </tr>
              ))}
              {(!auditLogs || auditLogs.length === 0) && <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">Aucun log</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
