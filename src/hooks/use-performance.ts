'use client';
import { useCallback, useRef } from 'react';

export interface PerformanceStats {
  FCP: number | null; LCP: number | null; CLS: number | null;
  FID: number | null; TTFB: number | null; INP: number | null;
  entryCount: number;
}

interface UsePerformanceOptions {
  enabled?: boolean;
  onMetric?: (metric: { name: string; value: number; rating: string; delta: number; navigationType: string }) => void;
}

const initialStats: PerformanceStats = {
  FCP: null, LCP: null, CLS: null, FID: null,
  TTFB: null, INP: null, entryCount: 0
};

export function usePerformance(_options: UsePerformanceOptions = {}) {
  const statsRef = useRef<PerformanceStats>(initialStats);
  const getStats = useCallback(() => statsRef.current, []);
  return { stats: statsRef.current, getStats };
}

export function PerformanceLogger() { return null; }
export default usePerformance;
