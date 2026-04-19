"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ChevronRight, Search, BarChart3 } from "lucide-react";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { LazyGuineaMap } from "@/components/lazy-components";

interface GuineaMapWidgetProps {
  isCustomizing?: boolean;
}

const regionData = [
  { region: "conakry", count: 58, label: "Conakry" },
  { region: "kankan", count: 23, label: "Kankan" },
  { region: "nzerekore", count: 18, label: "Nzérékoré" },
  { region: "kindia", count: 15, label: "Kindia" },
  { region: "boke", count: 12, label: "Boké" },
  { region: "labe", count: 9, label: "Labé" },
  { region: "faranah", count: 7, label: "Faranah" },
  { region: "mamou", count: 5, label: "Mamou" },
];

const regionDetails: Record<string, { topSectors: string[]; trend: string }> = {
  conakry: { topSectors: ["IT & Digital", "Services", "BTP"], trend: "+8%" },
  kankan: { topSectors: ["BTP & Infra", "Mines", "Éducation"], trend: "+12%" },
  nzerekore: { topSectors: ["Agriculture", "Santé", "BTP"], trend: "+5%" },
  kindia: { topSectors: ["Agriculture", "Mines", "Transport"], trend: "+3%" },
  boke: { topSectors: ["Mines", "BTP & Infra", "Transport"], trend: "+15%" },
  labe: { topSectors: ["Agriculture", "Éducation", "Santé"], trend: "+2%" },
  faranah: { topSectors: ["Agriculture", "BTP", "Énergie"], trend: "+6%" },
  mamou: { topSectors: ["Agriculture", "Transport", "Santé"], trend: "+4%" },
};

export function GuineaMapWidget({ isCustomizing }: GuineaMapWidgetProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  return (
    <AnimatedCard hoverLift={false} className={isCustomizing ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-background" : ""}>
      <AnimatedCardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Couverture géographique</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Cliquez sur une région pour voir les détails</p>
          </div>
          <GradientBadge variant="primary" size="sm" animated>8 régions</GradientBadge>
        </div>
      </AnimatedCardHeader>
      <AnimatedCardContent className="pt-0">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <LazyGuineaMap
              data={regionData.map((r) => ({ region: r.region, count: r.count, label: r.label }))}
              onRegionClick={(regionId: string) => setSelectedRegion(selectedRegion === regionId ? null : regionId)}
              selectedRegion={selectedRegion ?? undefined}
            />
          </div>
          <div className="lg:w-64 shrink-0">
            <AnimatePresence mode="wait">
              {selectedRegion ? (
                <motion.div
                  key={selectedRegion}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 rounded-xl border border-border bg-muted/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground">
                      {regionData.find((r) => r.region === selectedRegion)?.label}
                    </h4>
                    <button
                      onClick={() => setSelectedRegion(null)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span className="text-lg font-bold text-foreground">
                      {regionData.find((r) => r.region === selectedRegion)?.count}
                    </span>
                    <span className="text-xs text-muted-foreground">appels d&apos;offres actifs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-600">
                      {regionDetails[selectedRegion]?.trend}
                    </span>
                    <span className="text-xs text-muted-foreground">ce mois</span>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Secteurs principaux</p>
                    {regionDetails[selectedRegion]?.topSectors.map((sector) => (
                      <div key={sector} className="flex items-center gap-2 text-xs text-foreground">
                        <ChevronRight className="h-3 w-3 text-primary" />
                        {sector}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-2 min-h-[120px]"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Sélectionnez une région sur la carte pour voir les détails</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  );
}
