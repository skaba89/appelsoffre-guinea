"use client";

import dynamic from "next/dynamic";

// ─── Lazy-loaded heavy components ─────────────────────────────────────────────
// These components use heavy libraries (recharts, framer-motion, SVG maps)
// and should only be loaded when their page is actually rendered.

/**
 * Interactive Guinea Map — SVG with Framer Motion animations
 * ~15KB gzipped (SVG + motion) — loaded only on dashboard
 */
export const LazyGuineaMap = dynamic(
  () => import("@/components/ui/guinea-map").then((mod) => ({ default: mod.GuineaMap })),
  {
    loading: () => (
      <div className="w-full h-[400px] rounded-xl bg-muted/50 animate-pulse flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Chargement de la carte...</span>
      </div>
    ),
    ssr: false,
  }
);
