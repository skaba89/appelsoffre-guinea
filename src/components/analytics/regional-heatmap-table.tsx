"use client";

import { motion } from "framer-motion";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";

const sectors = ["BTP & Infra", "IT & Digital", "Mines", "Santé", "Énergie", "Éducation", "Télécom", "Finance"];
const regions = ["Conakry", "Kankan", "Nzérékoré", "Kindia", "Boké", "Labé", "Faranah", "Mamou"];

const heatmapData: number[][] = [
  [18, 5, 3, 4, 2, 1, 1, 0],
  [12, 2, 1, 1, 1, 0, 1, 0],
  [3, 8, 2, 4, 6, 0, 0, 1],
  [2, 1, 4, 1, 0, 1, 0, 1],
  [5, 3, 2, 2, 1, 1, 3, 0],
  [1, 2, 0, 0, 0, 3, 0, 2],
  [4, 1, 1, 2, 1, 0, 1, 0],
  [3, 1, 0, 1, 0, 1, 0, 0],
];

function getHeatColor(value: number, max: number): string {
  if (value === 0) return "bg-muted/20";
  const ratio = value / max;
  if (ratio > 0.7) return "bg-blue-600/80 text-white";
  if (ratio > 0.5) return "bg-blue-500/60 text-white";
  if (ratio > 0.3) return "bg-blue-400/40 text-foreground";
  if (ratio > 0.1) return "bg-blue-300/25 text-foreground";
  return "bg-blue-200/15 text-foreground";
}

export function RegionalHeatmapTable() {
  const maxVal = Math.max(...heatmapData.flat());

  return (
    <AnimatedCard hoverLift={false}>
      <AnimatedCardHeader className="pb-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Tableau croisé régional</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Secteurs × Régions — Nombre d&apos;appels d&apos;offres</p>
        </div>
      </AnimatedCardHeader>
      <AnimatedCardContent className="pt-0">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="p-2 text-left text-muted-foreground font-semibold sticky left-0 bg-card">Secteur</th>
                {regions.map((r) => (
                  <th key={r} className="p-2 text-center text-muted-foreground font-semibold whitespace-nowrap">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sectors.map((sector, si) => (
                <motion.tr
                  key={sector}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: si * 0.03 }}
                  className="border-t border-border/30"
                >
                  <td className="p-2 font-medium text-foreground sticky left-0 bg-card whitespace-nowrap">{sector}</td>
                  {heatmapData[si]?.map((val, ri) => (
                    <td key={ri} className="p-1 text-center">
                      <div
                        className={`w-full min-w-[32px] h-7 rounded flex items-center justify-center text-[11px] font-medium ${getHeatColor(val, maxVal)}`}
                      >
                        {val > 0 ? val : "—"}
                      </div>
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3 mt-3 justify-center">
          <span className="text-[10px] text-muted-foreground">Peu d&apos;AO</span>
          <div className="flex items-center gap-1">
            <div className="w-5 h-3 rounded bg-blue-200/15" />
            <div className="w-5 h-3 rounded bg-blue-300/25" />
            <div className="w-5 h-3 rounded bg-blue-400/40" />
            <div className="w-5 h-3 rounded bg-blue-500/60" />
            <div className="w-5 h-3 rounded bg-blue-600/80" />
          </div>
          <span className="text-[10px] text-muted-foreground">Beaucoup d&apos;AO</span>
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  );
}
