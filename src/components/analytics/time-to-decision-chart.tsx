"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";

const timeData = [
  { sector: "BTP & Infra", days: 85, color: "#3b82f6" },
  { sector: "IT & Digital", days: 52, color: "#8b5cf6" },
  { sector: "Mines", days: 95, color: "#f59e0b" },
  { sector: "Santé", days: 68, color: "#ef4444" },
  { sector: "Énergie", days: 78, color: "#10b981" },
  { sector: "Éducation", days: 60, color: "#06b6d4" },
  { sector: "Télécom", days: 55, color: "#ec4899" },
  { sector: "Finance", days: 42, color: "#84cc16" },
];

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--foreground)",
};

function getDelayColor(days: number): string {
  if (days >= 80) return "#ef4444";
  if (days >= 60) return "#f59e0b";
  return "#10b981";
}

export function TimeToDecisionChart() {
  return (
    <AnimatedCard hoverLift={false}>
      <AnimatedCardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Délai de décision par secteur</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Nombre moyen de jours publication → attribution</p>
          </div>
          <GradientBadge variant="warning" size="sm">Moy. 67j</GradientBadge>
        </div>
      </AnimatedCardHeader>
      <AnimatedCardContent className="pt-0">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={timeData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis type="category" dataKey="sector" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" width={100} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} jours`, "Délai moyen"]} />
              <Bar dataKey="days" radius={[0, 4, 4, 0]} maxBarSize={24} animationDuration={800}>
                {timeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getDelayColor(entry.days)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-muted-foreground">&lt; 60j</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-[10px] text-muted-foreground">60–80j</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-[10px] text-muted-foreground">&gt; 80j</span>
          </div>
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  );
}
