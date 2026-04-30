"use client";

import { motion } from "framer-motion";
import { Trophy, Swords, Building2 } from "lucide-react";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { Progress } from "@/components/ui/progress";

const competitors = [
  {
    name: "Consortium Sinohydro",
    sector: "BTP & Infra",
    winRate: 42,
    activeBids: 8,
    marketShare: 18,
    threat: "critique" as const,
  },
  {
    name: "Veolia / Eiffage",
    sector: "Eau & BTP",
    winRate: 35,
    activeBids: 5,
    marketShare: 12,
    threat: "élevé" as const,
  },
  {
    name: "Orange Business",
    sector: "IT & Télécom",
    winRate: 55,
    activeBids: 6,
    marketShare: 22,
    threat: "critique" as const,
  },
  {
    name: "Turc Yapi Merkezi",
    sector: "BTP & Infra",
    winRate: 28,
    activeBids: 4,
    marketShare: 9,
    threat: "modéré" as const,
  },
  {
    name: "Deloitte Guinée",
    sector: "Finance & Conseil",
    winRate: 62,
    activeBids: 3,
    marketShare: 15,
    threat: "élevé" as const,
  },
];

function getThreatConfig(threat: string) {
  switch (threat) {
    case "critique": return { variant: "destructive" as const, label: "Critique", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/5 border-red-500/20" };
    case "élevé": return { variant: "warning" as const, label: "Élevé", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/5 border-amber-500/20" };
    case "modéré": return { variant: "info" as const, label: "Modéré", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/5 border-blue-500/20" };
    default: return { variant: "info" as const, label: "Faible", color: "text-muted-foreground", bg: "bg-muted/30" };
  }
}

export function CompetitorAnalysisCard() {
  return (
    <AnimatedCard hoverLift={false}>
      <AnimatedCardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-semibold text-foreground">Analyse concurrentielle</h3>
          </div>
          <GradientBadge variant="destructive" size="sm">Top 5</GradientBadge>
        </div>
      </AnimatedCardHeader>
      <AnimatedCardContent className="pt-0">
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          {competitors.map((comp, i) => {
            const threatConfig = getThreatConfig(comp.threat);
            return (
              <motion.div
                key={comp.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.06 }}
                className={`p-3 rounded-lg border ${threatConfig.bg} space-y-2`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{comp.name}</p>
                      <p className="text-[11px] text-muted-foreground">{comp.sector}</p>
                    </div>
                  </div>
                  <GradientBadge variant={threatConfig.variant} size="sm">
                    {threatConfig.label}
                  </GradientBadge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-1.5 rounded bg-muted/30">
                    <p className="text-[10px] text-muted-foreground">Taux de gain</p>
                    <p className="text-sm font-bold text-foreground">{comp.winRate}%</p>
                  </div>
                  <div className="p-1.5 rounded bg-muted/30">
                    <p className="text-[10px] text-muted-foreground">AO actifs</p>
                    <p className="text-sm font-bold text-foreground">{comp.activeBids}</p>
                  </div>
                  <div className="p-1.5 rounded bg-muted/30">
                    <p className="text-[10px] text-muted-foreground">Part marché</p>
                    <p className="text-sm font-bold text-foreground">{comp.marketShare}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground shrink-0">Influence</span>
                  <Progress value={comp.marketShare} className="h-1.5 flex-1" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  );
}
