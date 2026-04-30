"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";

const monthlyData = [
  { month: "Mai 25", newTenders: 32, wonTenders: 5, budget: 12.5 },
  { month: "Jun 25", newTenders: 28, wonTenders: 4, budget: 9.8 },
  { month: "Jul 25", newTenders: 35, wonTenders: 6, budget: 15.2 },
  { month: "Aoû 25", newTenders: 22, wonTenders: 3, budget: 8.1 },
  { month: "Sep 25", newTenders: 40, wonTenders: 7, budget: 18.4 },
  { month: "Oct 25", newTenders: 42, wonTenders: 8, budget: 19.2 },
  { month: "Nov 25", newTenders: 38, wonTenders: 6, budget: 14.8 },
  { month: "Déc 25", newTenders: 30, wonTenders: 5, budget: 11.3 },
  { month: "Jan 26", newTenders: 45, wonTenders: 9, budget: 22.1 },
  { month: "Fév 26", newTenders: 52, wonTenders: 10, budget: 24.5 },
  { month: "Mar 26", newTenders: 58, wonTenders: 11, budget: 27.3 },
  { month: "Avr 26", newTenders: 48, wonTenders: 8, budget: 21.6 },
];

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--foreground)",
};

export function MonthlyTrendChart() {
  return (
    <AnimatedCard hoverLift={false}>
      <AnimatedCardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Tendance mensuelle</h3>
            <p className="text-xs text-muted-foreground mt-0.5">12 derniers mois — AO, gains et budget</p>
          </div>
          <GradientBadge variant="info" size="sm">12 mois</GradientBadge>
        </div>
      </AnimatedCardHeader>
      <AnimatedCardContent className="pt-0">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="budgetFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="newTenders" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Nouveaux AO" />
              <Line yAxisId="left" type="monotone" dataKey="wonTenders" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="AO remportés" />
              <Area yAxisId="right" type="monotone" dataKey="budget" stroke="#8b5cf6" strokeWidth={1.5} fill="url(#budgetFill)" name="Budget (Mrd GNF)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  );
}
