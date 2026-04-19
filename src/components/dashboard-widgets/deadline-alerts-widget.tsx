"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockTenders } from "@/lib/mock-data";
import { daysUntil, formatDate } from "@/lib/tenderflow-utils";

interface DeadlineAlertsWidgetProps {
  isCustomizing?: boolean;
}

function getUrgencyConfig(daysLeft: number) {
  if (daysLeft <= 0) return { bg: "bg-red-500/5 border-red-500/20", text: "text-red-600 dark:text-red-400", badge: "destructive" as const, label: "Expiré" };
  if (daysLeft <= 3) return { bg: "bg-red-500/5 border-red-500/20", text: "text-red-600 dark:text-red-400", badge: "destructive" as const, label: "Urgent" };
  if (daysLeft <= 7) return { bg: "bg-amber-500/5 border-amber-500/20", text: "text-amber-600 dark:text-amber-400", badge: "warning" as const, label: "Attention" };
  return { bg: "bg-yellow-500/5 border-yellow-500/20", text: "text-yellow-600 dark:text-yellow-400", badge: "info" as const, label: "À surveiller" };
}

export function DeadlineAlertsWidget({ isCustomizing }: DeadlineAlertsWidgetProps) {
  const deadlineAlerts = useMemo(() => {
    return mockTenders
      .map((t) => ({
        id: t.id,
        reference: t.reference,
        title: t.title,
        deadline: t.deadline_date,
        daysLeft: daysUntil(t.deadline_date),
        sector: t.sector,
      }))
      .filter((t) => t.daysLeft !== null && t.daysLeft <= 7 && t.daysLeft >= 0)
      .sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0));
  }, []);

  return (
    <AnimatedCard hoverLift={false} className={isCustomizing ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-background" : ""}>
      <AnimatedCardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">Alertes échéances</h3>
          </div>
          <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
            Toutes <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </AnimatedCardHeader>
      <AnimatedCardContent className="pt-0">
        {deadlineAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-sm text-muted-foreground">Aucune échéance imminente</p>
            <p className="text-xs text-muted-foreground">Tous les appels d&apos;offres ont des délais confortables</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar">
            {deadlineAlerts.map((alert, i) => {
              const urgency = getUrgencyConfig(alert.daysLeft ?? 0);
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className={`p-3 rounded-lg border ${urgency.bg} space-y-1.5`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[11px] text-muted-foreground">{alert.reference}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                          {alert.sector}
                        </Badge>
                      </div>
                    </div>
                    <GradientBadge variant={urgency.badge} size="sm">
                      {urgency.label}
                    </GradientBadge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className={`h-3.5 w-3.5 ${urgency.text}`} />
                    <span className={`text-xs font-semibold ${urgency.text}`}>
                      {alert.daysLeft !== null && alert.daysLeft <= 0 ? "Expiré !" : `J-${alert.daysLeft}`}
                    </span>
                    <span className="text-[11px] text-muted-foreground">— {formatDate(alert.deadline)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatedCardContent>
    </AnimatedCard>
  );
}
