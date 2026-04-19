"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";

const winRateData = [
  { sector: "BTP & Infra", won: 8, lost: 5, rate: 62 },
  { sector: "IT & Digital", won: 6, lost: 2, rate: 75 },
  { sector: "Mines", won: 2, lost: 4, rate: 33 },
  { sector: "Santé", won: 3, lost: 3, rate: 50 },
  { sector: "Énergie", won: 4, lost: 1, rate: 80 },
  { sector: "Éducation", won: 1, lost: 3, rate: 25 },
  { sector: "Télécom", won: 2, lost: 2, rate: 50 },
  { sector: "Finance", won: 3, lost: 1, rate: 75 },
];

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--foreground)",
};

export function WinRateSectorChart() {
  return (
    <AnimatedCard hoverLift={false}>
      <AnimatedCardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Taux de réussite par secteur</h3>
            <p className="text-xs text-muted-foreground mt-0.5">AO remportés vs perdus</p>
          </div>
          <GradientBadge variant="success" size="sm">Moy. 56%</GradientBadge>
        </div>
      </AnimatedCardHeader>
      <AnimatedCardContent className="pt-0">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={winRateData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="sector" tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="won" fill="#10b981" radius={[4, 4, 0, 0]} name="Remportés" />
              <Bar dataKey="lost" fill="#ef4444" radius={[4, 4, 0, 0]} name="Perdus" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  );
}
