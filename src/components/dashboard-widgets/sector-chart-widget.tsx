"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { mockDashboardStats } from "@/lib/mock-data";

interface SectorChartWidgetProps {
  isCustomizing?: boolean;
}

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--foreground)",
};

export function SectorChartWidget({ isCustomizing }: SectorChartWidgetProps) {
  const sectorData = useMemo(() => {
    return Object.entries(mockDashboardStats.by_sector)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, []);

  return (
    <AnimatedCard hoverLift={false} className={isCustomizing ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-background" : ""}>
      <AnimatedCardHeader className="pb-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Appels d&apos;offres par secteur</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Distribution horizontale des AO actifs</p>
        </div>
      </AnimatedCardHeader>
      <AnimatedCardContent className="pt-0">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sectorData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="sectorGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" width={120} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} AO`, "Appels d'offres"]} />
              <Bar dataKey="value" fill="url(#sectorGrad)" radius={[0, 4, 4, 0]} maxBarSize={22} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  );
}
