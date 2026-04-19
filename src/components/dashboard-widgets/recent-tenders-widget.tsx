"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockTenders } from "@/lib/mock-data";
import { daysUntil, strategyLabel, strategyColor, statusLabel } from "@/lib/tenderflow-utils";

interface RecentTendersWidgetProps {
  isCustomizing?: boolean;
}

function getUrgencyColor(daysLeft: number | null) {
  if (daysLeft === null) return "text-muted-foreground";
  if (daysLeft <= 3) return "text-red-600 dark:text-red-400";
  if (daysLeft <= 7) return "text-amber-600 dark:text-amber-400";
  if (daysLeft <= 14) return "text-yellow-600 dark:text-yellow-400";
  return "text-muted-foreground";
}

function getUrgencyBg(daysLeft: number | null) {
  if (daysLeft === null) return "bg-muted/30";
  if (daysLeft <= 3) return "bg-red-500/5";
  if (daysLeft <= 7) return "bg-amber-500/5";
  return "bg-muted/30";
}

export function RecentTendersWidget({ isCustomizing }: RecentTendersWidgetProps) {
  const recentTenders = useMemo(() => {
    return [...mockTenders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, []);

  return (
    <AnimatedCard hoverLift={false} className={isCustomizing ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-background" : ""}>
      <AnimatedCardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Appels d&apos;offres récents</h3>
          <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
            Voir tout <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </AnimatedCardHeader>
      <AnimatedCardContent className="pt-0">
        <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
          {recentTenders.map((tender, i) => {
            const daysLeft = daysUntil(tender.deadline_date);
            const score = Math.round(tender.priority_score * 100);
            const isGo = tender.strategy_recommendation === "go";

            return (
              <motion.div
                key={tender.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className={`flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors ${getUrgencyBg(daysLeft)}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  isGo ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                }`}>
                  {score}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tender.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[11px] text-muted-foreground">{tender.reference}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                      {tender.sector}
                    </Badge>
                    <span className={`text-[11px] flex items-center gap-0.5 ${getUrgencyColor(daysLeft)}`}>
                      <Clock className="h-3 w-3" />
                      {daysLeft !== null && daysLeft <= 0 ? "Expiré" : daysLeft !== null ? `J-${daysLeft}` : "—"}
                    </span>
                  </div>
                </div>
                <GradientBadge
                  variant={isGo ? "success" : tender.strategy_recommendation === "no_go" ? "destructive" : "warning"}
                  size="sm"
                >
                  {strategyLabel(tender.strategy_recommendation)}
                </GradientBadge>
              </motion.div>
            );
          })}
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  );
}
