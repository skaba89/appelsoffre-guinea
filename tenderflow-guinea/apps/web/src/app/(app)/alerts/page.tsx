"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertsApi } from "@/lib/api";
import { formatDateTime, cn } from "@/lib/utils";
import { Bell, CheckCheck, Trash2 } from "lucide-react";

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["alerts"], queryFn: async () => { const res = await alertsApi.list({ page_size: 50 }); return res.data; } });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => alertsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });
  const markAllMutation = useMutation({
    mutationFn: () => alertsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const alerts = data?.items || [];
  const priorityColors: Record<string, string> = { low: "border-l-gray-400", medium: "border-l-blue-400", high: "border-l-amber-400", critical: "border-l-red-500" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alertes</h1>
          <p className="text-muted-foreground mt-1">{alerts.filter((a: any) => !a.is_read).length} non lues</p>
        </div>
        <button onClick={() => markAllMutation.mutate()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent"><CheckCheck className="w-4 h-4" /> Tout marquer comme lu</button>
      </div>
      {alerts.length === 0 ? (
        <div className="text-center py-12"><Bell className="w-16 h-16 mx-auto text-muted-foreground/20" /><p className="mt-4 text-muted-foreground">Aucune alerte</p></div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert: any) => (
            <div key={alert.id} className={cn("bg-card rounded-lg border border-border border-l-4 p-4", priorityColors[alert.priority] || "", !alert.is_read ? "bg-primary/5" : "opacity-70")}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={cn("text-sm font-semibold text-foreground", !alert.is_read && "text-primary")}>{alert.title}</h3>
                  {alert.message && <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>}
                  <p className="text-xs text-muted-foreground mt-2">{formatDateTime(alert.created_at)}</p>
                </div>
                {!alert.is_read && (
                  <button onClick={() => markReadMutation.mutate(alert.id)} className="px-2 py-1 rounded text-xs text-primary hover:bg-primary/10">Marquer lu</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
