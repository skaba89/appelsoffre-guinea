"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

// ===== Region data =====
interface RegionDatum {
  id: string;
  name: string;
  path: string;
  labelX: number;
  labelY: number;
}

const REGIONS: RegionDatum[] = [
  {
    id: "boké",
    name: "Boké",
    path: "M 40 70 L 70 50 L 130 45 L 170 55 L 190 80 L 180 120 L 165 160 L 140 180 L 100 175 L 60 150 L 35 110 Z",
    labelX: 110,
    labelY: 115,
  },
  {
    id: "conakry",
    name: "Conakry",
    path: "M 35 175 L 60 165 L 80 180 L 75 210 L 55 220 L 30 210 L 25 190 Z",
    labelX: 52,
    labelY: 195,
  },
  {
    id: "kindia",
    name: "Kindia",
    path: "M 60 150 L 100 175 L 140 180 L 155 210 L 140 250 L 110 270 L 80 260 L 55 230 L 50 210 L 80 180 L 60 165 Z",
    labelX: 105,
    labelY: 220,
  },
  {
    id: "labe",
    name: "Labé",
    path: "M 170 55 L 220 40 L 280 50 L 310 80 L 300 130 L 280 160 L 240 175 L 190 160 L 165 160 L 180 120 L 190 80 Z",
    labelX: 245,
    labelY: 110,
  },
  {
    id: "mamou",
    name: "Mamou",
    path: "M 165 160 L 190 160 L 240 175 L 260 210 L 240 250 L 200 260 L 155 250 L 140 250 L 155 210 L 140 180 Z",
    labelX: 200,
    labelY: 215,
  },
  {
    id: "faranah",
    name: "Faranah",
    path: "M 240 175 L 310 165 L 370 170 L 400 200 L 380 250 L 340 270 L 290 260 L 260 250 L 240 250 L 260 210 Z",
    labelX: 320,
    labelY: 220,
  },
  {
    id: "kankan",
    name: "Kankan",
    path: "M 310 80 L 380 60 L 450 70 L 500 100 L 510 160 L 490 210 L 450 250 L 400 260 L 370 250 L 380 250 L 400 200 L 370 170 L 310 165 L 280 160 L 300 130 Z",
    labelX: 410,
    labelY: 165,
  },
  {
    id: "nzerekore",
    name: "Nzérékoré",
    path: "M 400 260 L 450 250 L 490 210 L 530 240 L 550 300 L 530 370 L 490 410 L 440 430 L 380 420 L 330 390 L 310 340 L 320 290 L 340 270 L 380 250 L 370 250 Z",
    labelX: 430,
    labelY: 330,
  },
];

// ===== Props =====
export interface GuineaMapProps {
  data: Array<{ region: string; count: number; label?: string }>;
  onRegionClick?: (region: string) => void;
  selectedRegion?: string | null;
  className?: string;
}

// ===== Color helpers =====
function getHeatColor(count: number, maxCount: number, isDark: boolean): string {
  const ratio = maxCount > 0 ? count / maxCount : 0;
  if (isDark) {
    const r = Math.round(80 + ratio * 50);
    const g = Math.round(100 + ratio * 80);
    const b = Math.round(200 + ratio * 55);
    const a = 0.35 + ratio * 0.55;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  } else {
    const r = Math.round(30 + (1 - ratio) * 60);
    const g = Math.round(60 + (1 - ratio) * 80);
    const b = Math.round(180 + ratio * 60);
    const a = 0.25 + ratio * 0.6;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
}

function getHoverColor(count: number, maxCount: number, isDark: boolean): string {
  const ratio = maxCount > 0 ? count / maxCount : 0;
  if (isDark) {
    const r = Math.round(100 + ratio * 50);
    const g = Math.round(140 + ratio * 60);
    const b = Math.round(220 + ratio * 35);
    return `rgba(${r}, ${g}, ${b}, 0.9)`;
  } else {
    const r = Math.round(40 + (1 - ratio) * 30);
    const g = Math.round(80 + (1 - ratio) * 40);
    const b = Math.round(210 + ratio * 30);
    return `rgba(${r}, ${g}, ${b}, 0.85)`;
  }
}

// ===== Component =====
export function GuineaMap({ data, onRegionClick, selectedRegion, className }: GuineaMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const getCount = useCallback(
    (regionId: string) => {
      const entry = data.find((d) => d.region === regionId);
      return entry?.count ?? 0;
    },
    [data]
  );

  return (
    <div className={className}>
      <svg
        viewBox="0 0 580 460"
        className="w-full h-auto"
        style={{ maxHeight: "420px" }}
      >
        <defs>
          <filter id="regionGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.1)" />
          </filter>
          <linearGradient id="legendGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={isDark ? "rgba(80,100,200,0.35)" : "rgba(90,140,240,0.25)"} />
            <stop offset="100%" stopColor={isDark ? "rgba(130,180,255,0.9)" : "rgba(70,120,240,0.85)"} />
          </linearGradient>
        </defs>

        {/* Region paths */}
        {REGIONS.map((region) => {
          const count = getCount(region.id);
          const isHovered = hoveredRegion === region.id;
          const isSelected = selectedRegion === region.id;
          const fillColor = getHeatColor(count, maxCount, isDark);
          const hoverColor = getHoverColor(count, maxCount, isDark);

          return (
            <g key={region.id}>
              <motion.path
                d={region.path}
                fill={isHovered ? hoverColor : isSelected ? hoverColor : fillColor}
                stroke={isSelected ? "var(--primary)" : isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.8)"}
                strokeWidth={isSelected ? 2 : 1}
                style={{ cursor: "pointer" }}
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setHoveredRegion(region.id)}
                onHoverEnd={() => setHoveredRegion(null)}
                onClick={() => onRegionClick?.(region.id)}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                filter={isSelected ? "url(#regionGlow)" : undefined}
              />

              {/* Region label */}
              <text
                x={region.labelX}
                y={region.labelY}
                textAnchor="middle"
                className="text-[10px] font-semibold pointer-events-none select-none"
                fill={isDark ? "rgba(255,255,255,0.85)" : "rgba(30,30,60,0.8)"}
              >
                {region.name}
              </text>

              {/* Count badge */}
              {count > 0 && (
                <text
                  x={region.labelX}
                  y={region.labelY + 16}
                  textAnchor="middle"
                  className="text-[9px] font-bold pointer-events-none select-none"
                  fill={isDark ? "rgba(255,255,255,0.7)" : "rgba(50,50,80,0.6)"}
                >
                  {count} AO
                </text>
              )}

              {/* Hover tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.g
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                  >
                    <rect
                      x={region.labelX - 55}
                      y={region.labelY - 40}
                      width={110}
                      height={30}
                      rx={6}
                      fill={isDark ? "rgba(30,30,50,0.95)" : "rgba(255,255,255,0.95)"}
                      stroke={isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"}
                      strokeWidth={1}
                    />
                    <text
                      x={region.labelX}
                      y={region.labelY - 20}
                      textAnchor="middle"
                      className="text-[11px] font-semibold pointer-events-none"
                      fill={isDark ? "#fff" : "#1a1a2e"}
                    >
                      {region.name}: {count} appel{count > 1 ? "s" : ""} d&apos;offres
                    </text>
                  </motion.g>
                )}
              </AnimatePresence>
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(20, 440)">
          <rect x={0} y={0} width={150} height={8} rx={4} fill="url(#legendGradient)" />
          <text x={0} y={20} className="text-[9px]" fill={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"}>
            Peu d&apos;AO
          </text>
          <text x={150} y={20} textAnchor="end" className="text-[9px]" fill={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"}>
            Beaucoup d&apos;AO
          </text>
        </g>
      </svg>
    </div>
  );
}
