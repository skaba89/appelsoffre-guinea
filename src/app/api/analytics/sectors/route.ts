import { NextRequest, NextResponse } from "next/server";
import { mockTenders } from "@/lib/mock-data";

// ─── GET /api/analytics/sectors ────────────────────────────────────────────────
// Retourne les statistiques par secteur

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get("sortBy") ?? "count";
  const order = searchParams.get("order") ?? "desc";

  // Validate sortBy
  const validSortBy = ["count", "avgScore", "avgBudget", "winRate"];
  if (!validSortBy.includes(sortBy)) {
    return NextResponse.json(
      { error: `Tri invalide. Valeurs acceptées : ${validSortBy.join(", ")}` },
      { status: 400 }
    );
  }

  // Aggregate by sector
  const sectorMap = new Map<string, {
    sector: string;
    tenderCount: number;
    totalScore: number;
    totalBudget: number;
    wonCount: number;
    activeCount: number;
  }>();

  mockTenders.forEach((t) => {
    const existing = sectorMap.get(t.sector) || {
      sector: t.sector,
      tenderCount: 0,
      totalScore: 0,
      totalBudget: 0,
      wonCount: 0,
      activeCount: 0,
    };

    existing.tenderCount += 1;
    existing.totalScore += t.priority_score * 100;
    existing.totalBudget += (t.budget_min + t.budget_max) / 2;
    if (t.status === "won") existing.wonCount += 1;
    if (!["expired", "won", "lost"].includes(t.status)) existing.activeCount += 1;

    sectorMap.set(t.sector, existing);
  });

  let sectors = Array.from(sectorMap.values()).map((s) => ({
    sector: s.sector,
    tenderCount: s.tenderCount,
    averageScore: Math.round(s.totalScore / s.tenderCount),
    averageBudget: Math.round(s.totalBudget / s.tenderCount),
    winRate: s.activeCount > 0 ? +(s.wonCount / s.tenderCount).toFixed(2) : 0,
  }));

  // Sort
  const sortKey: Record<string, keyof (typeof sectors)[0]> = {
    count: "tenderCount",
    avgScore: "averageScore",
    avgBudget: "averageBudget",
    winRate: "winRate",
  };

  const key = sortKey[sortBy];
  sectors.sort((a, b) => {
    const valA = a[key];
    const valB = b[key];
    if (typeof valA === "number" && typeof valB === "number") {
      return order === "desc" ? valB - valA : valA - valB;
    }
    return 0;
  });

  return NextResponse.json({
    sectors,
    totalSectors: sectors.length,
  });
}
