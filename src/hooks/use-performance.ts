"use client";

import { useEffect, useRef, useState } from "react";

// ─── Web Vitals Types ─────────────────────────────────────────────────────────

interface WebVitalMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  navigationType: string;
}

interface PerformanceStats {
  /** First Contentful Paint */
  fcp: number | null;
  /** Largest Contentful Paint */
  lcp: number | null;
  /** First Input Delay */
  fid: number | null;
  /** Cumulative Layout Shift */
  cls: number | null;
  /** Time to First Byte */
  ttfb: number | null;
  /** Interaction to Next Paint */
  inp: number | null;
  /** Page load time */
  pageLoad: number | null;
  /** DOM content loaded */
  domContentLoaded: number | null;
  /** Memory usage (if available) */
  memoryUsed: number | null;
  /** Memory limit (if available) */
  memoryLimit: number | null;
  /** Number of performance entries */
  entryCount: number;
}

// ─── Rating Thresholds ────────────────────────────────────────────────────────

function getRating(name: string, value: number): "good" | "needs-improvement" | "poor" {
  const thresholds: Record<string, [number, number]> = {
    FCP: [1800, 3000],
    LCP: [2500, 4000],
    FID: [100, 300],
    CLS: [0.1, 0.25],
    TTFB: [800, 1800],
    INP: [200, 500],
  };
  const [good, poor] = thresholds[name] ?? [1000, 3000];
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * usePerformance — Monitors Web Vitals and page performance metrics.
 *
 * This hook observes browser Performance APIs and computes key metrics
 * useful for debugging and performance optimization. It only runs in
 * development mode by default.
 *
 * @param options.enabled - Whether to enable monitoring (default: process.env.NODE_ENV === 'development')
 * @param options.onMetric - Callback when a new metric is recorded
 * @returns Current performance stats
 */
export function usePerformance(options?: {
  enabled?: boolean;
  onMetric?: (metric: WebVitalMetric) => void;
}): PerformanceStats {
  const { enabled = process.env.NODE_ENV === "development", onMetric } = options ?? {};

  const [stats, setStats] = useState<PerformanceStats>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    inp: null,
    pageLoad: null,
    domContentLoaded: null,
    memoryUsed: null,
    memoryLimit: null,
    entryCount: 0,
  });

  const observerRef = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handleMetric = (name: string, value: number, delta: number = 0) => {
      const rating = getRating(name, value);
      const navigationType =
        performance.getEntriesByType("navigation")[0]?.type ?? "unknown";

      onMetric?.({ name, value, rating, delta, navigationType });

      setStats((prev) => {
        const updated = { ...prev, entryCount: prev.entryCount + 1 };
        switch (name) {
          case "FCP":
            updated.fcp = value;
            break;
          case "LCP":
            updated.lcp = value;
            break;
          case "FID":
            updated.fid = value;
            break;
          case "CLS":
            updated.cls = value;
            break;
          case "TTFB":
            updated.ttfb = value;
            break;
          case "INP":
            updated.inp = value;
            break;
        }
        return updated;
      });
    };

    // Observe paint, layout-shift, and event timing entries
    try {
      observerRef.current = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "paint" && entry.name === "first-contentful-paint") {
            handleMetric("FCP", entry.startTime);
          }
          if (entry.entryType === "largest-contentful-paint") {
            handleMetric("LCP", entry.startTime);
          }
          if (entry.entryType === "layout-shift") {
            const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
            if (!layoutShift.hadRecentInput) {
              handleMetric("CLS", layoutShift.value);
            }
          }
          if (entry.entryType === "first-input") {
            const fidEntry = entry as PerformanceEntry & { processingStart: number };
            handleMetric("FID", fidEntry.processingStart - entry.startTime);
          }
          if (entry.entryType === "event") {
            const eventEntry = entry as PerformanceEntry & { duration: number };
            handleMetric("INP", eventEntry.duration);
          }
        }
      });

      observerRef.current.observe({
        type: "largest-contentful-paint",
        buffered: true,
      });
      observerRef.current.observe({ type: "paint", buffered: true });
      observerRef.current.observe({ type: "layout-shift", buffered: true });
      observerRef.current.observe({ type: "first-input", buffered: true });
      observerRef.current.observe({ type: "event", buffered: true });
    } catch {
      // Some browsers don't support all entry types — that's fine
    }

    // Collect TTFB from navigation timing
    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries.length > 0) {
      const nav = navEntries[0] as PerformanceNavigationTiming;
      handleMetric("TTFB", nav.responseStart - nav.requestStart);

      setStats((prev) => ({
        ...prev,
        pageLoad: nav.loadEventEnd - nav.startTime,
        domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
      }));
    }

    // Collect memory stats (Chrome only)
    const perf = performance as Performance & {
      memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number };
    };
    if (perf.memory) {
      setStats((prev) => ({
        ...prev,
        memoryUsed: Math.round(perf.memory!.usedJSHeapSize / 1048576),
        memoryLimit: Math.round(perf.memory!.jsHeapSizeLimit / 1048576),
      }));
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [enabled, onMetric]);

  return stats;
}

// ─── Performance Logger Component ─────────────────────────────────────────────

/**
 * PerformanceLogger — Silent component that logs Web Vitals to console in dev.
 * Drop this into any layout to enable performance monitoring.
 */
export function PerformanceLogger() {
  usePerformance({
    enabled: process.env.NODE_ENV === "development",
    onMetric: (metric) => {
      const emoji =
        metric.rating === "good" ? "✅" : metric.rating === "needs-improvement" ? "⚠️" : "❌";
      console.log(
        `[Perf] ${emoji} ${metric.name}: ${metric.value.toFixed(0)}ms (${metric.rating})`
      );
    },
  });

  return null;
}
