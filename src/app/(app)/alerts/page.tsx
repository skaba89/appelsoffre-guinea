"use client";

import { useState } from "react";
import { mockAlerts } from "@/lib/mock-data";
import { cn, formatDateTime } from "@/lib/tenderflow-utils";
import {
  Bell, Clock, FileText, Target, Zap, Shield, CheckCheck,
  AlertTriangle, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  deadline: { icon: Clock, color: "text-red-500 bg-red-100 dark:bg-red-900/30", label: "Échéance" },
  new_tender: { icon: FileText, color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30", label: "Nouvel AO" },
  score: { icon: Target, color: "text-green-500 bg-green-100 dark:bg-green-900/30", label: "Score" },
  match: { icon: TrendingUp, color: "text-purple-500 bg-purple-100 dark:bg-purple-900/30", label: "Correspondance" },
  system: { icon: Shield, color: "text-gray-500 bg-gray-100 dark:bg-gray-900/30", label: "Système" },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filtered = filter === "unread" ? alerts.filter(a => !a.is_read) : alerts;
  const unreadCount = alerts.filter(a => !a.is_read).length;

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
  };

  const markRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alertes</h1>
          <p className="text-muted-foreground mt-1">{unreadCount} non lue(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className={cn(filter === "all" && "bg-accent")} onClick={() => setFilter("all")}>
            Toutes
          </Button>
          <Button variant="outline" size="sm" className={cn(filter === "unread" && "bg-accent")} onClick={() => setFilter("unread")}>
            Non lues ({unreadCount})
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4" /> Tout marquer lu
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map(alert => {
          const config = typeConfig[alert.type] || typeConfig.system;
          const Icon = config.icon;
          return (
            <Card
              key={alert.id}
              className={cn(
                "hover:shadow-sm transition-shadow cursor-pointer",
                !alert.is_read && "border-l-4 border-l-primary"
              )}
              onClick={() => markRead(alert.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", config.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm font-medium", !alert.is_read ? "text-foreground" : "text-muted-foreground")}>
                        {alert.title}
                      </p>
                      <Badge className={cn("text-[10px]", config.color)} variant="secondary">{config.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{formatDateTime(alert.created_at)}</p>
                  </div>
                  {!alert.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">Aucune alerte</p>
          </div>
        )}
      </div>
    </div>
  );
}
