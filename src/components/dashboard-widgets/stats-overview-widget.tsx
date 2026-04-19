"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { FileText, Activity, BarChart3, Clock } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { mockDashboardStats, mockTenders } from "@/lib/mock-data";
import { daysUntil } from "@/lib/tenderflow-utils";

interface StatsOverviewWidgetProps {
  isCustomizing?: boolean;
}

export function StatsOverviewWidget({ isCustomizing }: StatsOverviewWidgetProps) {
  const stats = useMemo(() => {
    const activeStatuses = ["new", "qualifying", "qualified", "go", "responding"];
    const activeCount = mockTenders.filter((t) => activeStatuses.includes(t.status)).length;
    const avgScore = Math.round(mockDashboardStats.avg_priority_score * 100);
    const soonCount = mockTenders.filter((t) => {
      const d = daysUntil(t.deadline_date);
      return d !== null && d >= 0 && d <= 7;
    }).length;

    return [
      {
        title: "Total AO",
        value: mockDashboardStats.total_tenders,
        icon: FileText,
        trend: { direction: "up" as const, label: `+${mockDashboardStats.new_today} aujourd'hui` },
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-500/10",
      },
      {
        title: "Actifs",
        value: activeCount,
        icon: Activity,
        trend: { direction: "up" as const, label: "En cours" },
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500/10",
      },
      {
        title: "Score moyen",
        value: avgScore,
        suffix: "/100",
        icon: BarChart3,
        trend: { direction: "up" as const, label: avgScore >= 70 ? "Bon" : "Moyen" },
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-500/10",
      },
      {
        title: "Échéances proches",
        value: soonCount,
        icon: Clock,
        trend: { direction: soonCount > 3 ? "down" as const : "neutral" as const, label: soonCount > 3 ? "Attention" : "Sous contrôle" },
        color: soonCount > 3 ? "text-red-600 dark:text-red-400" : "text-muted-foreground",
        bgColor: soonCount > 3 ? "bg-red-500/10" : "bg-muted",
      },
    ];
  }, []);

  return (
    <motion.div
      className={isCustomizing ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-background rounded-xl" : ""}
      layout
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="rounded-xl border bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground truncate">{stat.title}</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bgColor} shrink-0`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <AnimatedNumber
                  value={stat.value}
                  className="text-2xl font-bold tracking-tight"
                />
                {stat.suffix && (
                  <span className="text-sm font-medium text-muted-foreground">{stat.suffix}</span>
                )}
              </div>
              {stat.trend && (
                <p className={`text-[11px] mt-1.5 font-medium ${stat.color}`}>
                  {stat.trend.label}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
