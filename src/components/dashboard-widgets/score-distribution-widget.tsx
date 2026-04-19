"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { mockTenders } from "@/lib/mock-data";

interface ScoreDistributionWidgetProps {
  isCustomizing?: boolean;
}

const RANGES = [
  { range: "0–20", min: 0, max: 20, color: "#ef4444" },
  { range: "21–40", min: 21, max: 40, color: "#f97316" },
  { range: "41–60", min: 41, max: 60, color: "#f59e0b" },
  { range: "61–80", min: 61, max: 80, color: "#10b981" },
  { range: "81–100", min: 81, max: 100, color: "#3b82f6" },
];

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--foreground)",
};

export function ScoreDistributionWidget({ isCustomizing }: ScoreDistributionWidgetProps) {
  const scoreData = useMemo(() => {
    return RANGES.map((r) => {
      const count = mockTenders.filter((t) => {
        const score = Math.round(t.priority_score * 100);
        return score >= r.min && score <= r.max;
      }).length;
      return { range: r.range, count, color: r.color };
    });
  }, []);

  return (
    <AnimatedCard hoverLift={false} className={isCustomizing ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-background" : ""}>
      <AnimatedCardHeader className="pb-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Distribution des scores</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Répartition par tranche de score</p>
        </div>
      </AnimatedCardHeader>
      <AnimatedCardContent className="pt-0">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} AO`, "Nombre"]} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={800}>
                {scoreData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-2">
          {scoreData.map((d) => (
            <div key={d.range} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-[10px] text-muted-foreground">{d.range}</span>
            </div>
          ))}
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  );
}
