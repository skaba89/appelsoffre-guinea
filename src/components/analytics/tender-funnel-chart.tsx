"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";

const funnelData = [
  { stage: "Nouveau", count: 42, color: "#3b82f6" },
  { stage: "En analyse", count: 28, color: "#8b5cf6" },
  { stage: "Qualifié", count: 18, color: "#06b6d4" },
  { stage: "Soumission", count: 12, color: "#f59e0b" },
  { stage: "Attribué", count: 5, color: "#10b981" },
  { stage: "Perdu", count: 3, color: "#ef4444" },
];

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--foreground)",
};

export function TenderFunnelChart() {
  return (
    <AnimatedCard hoverLift={false}>
      <AnimatedCardHeader className="pb-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Entonnoir des appels d&apos;offres</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Progression par statut</p>
        </div>
      </AnimatedCardHeader>
      <AnimatedCardContent className="pt-0">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} AO`, "Nombre"]} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={800}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Conversion rates */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/30">
            <p className="text-[10px] text-muted-foreground">Qualification</p>
            <p className="text-sm font-bold text-foreground">43%</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/30">
            <p className="text-[10px] text-muted-foreground">Soumission</p>
            <p className="text-sm font-bold text-foreground">29%</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-[10px] text-muted-foreground">Taux de gain</p>
            <p className="text-sm font-bold text-emerald-600">12%</p>
          </div>
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  );
}
