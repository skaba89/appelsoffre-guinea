"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";

const budgetData = [
  { name: "BTP & Infra", value: 45, amount: "25 Mrd GNF", color: "#3b82f6" },
  { name: "Mines", value: 20, amount: "11 Mrd GNF", color: "#f59e0b" },
  { name: "Énergie", value: 12, amount: "6.5 Mrd GNF", color: "#10b981" },
  { name: "IT & Digital", value: 8, amount: "4.5 Mrd GNF", color: "#8b5cf6" },
  { name: "Santé", value: 6, amount: "3 Mrd GNF", color: "#ef4444" },
  { name: "Éducation", value: 4, amount: "2 Mrd GNF", color: "#06b6d4" },
  { name: "Autres", value: 5, amount: "3 Mrd GNF", color: "#ec4899" },
];

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--foreground)",
};

export function BudgetDistributionChart() {
  return (
    <AnimatedCard hoverLift={false}>
      <AnimatedCardHeader className="pb-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Distribution budgétaire par secteur</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Répartition des montants estimés</p>
        </div>
      </AnimatedCardHeader>
      <AnimatedCardContent className="pt-0">
        <div className="h-72 flex items-center">
          <div className="w-1/2 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {budgetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number, name: string, props: { payload: { amount: string } }) => [
                    `${value}% (${props.payload.amount})`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 space-y-2 pl-2">
            {budgetData.map((sector) => (
              <div key={sector.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sector.color }} />
                <span className="text-xs text-muted-foreground flex-1 truncate">{sector.name}</span>
                <span className="text-xs font-semibold text-foreground">{sector.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  );
}
