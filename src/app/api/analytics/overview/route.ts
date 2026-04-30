import { NextRequest, NextResponse } from "next/server";
import { mockTenders, mockDashboardStats } from "@/lib/mock-data";

// ─── GET /api/analytics/overview ───────────────────────────────────────────────
// Retourne les KPIs du tableau de bord analytique

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "12m";

  // Validate period
  const validPeriods = ["1m", "3m", "6m", "12m"];
  if (!validPeriods.includes(period)) {
    return NextResponse.json(
      { error: "Période invalide. Valeurs acceptées : 1m, 3m, 6m, 12m" },
      { status: 400 }
    );
  }

  // Compute KPIs from mock data
  const totalTenders = mockTenders.length;
  const activeTenders = mockTenders.filter(
    (t) => !["expired", "won", "lost"].includes(t.status)
  ).length;
  const averageScore = Math.round(
    mockTenders.reduce((sum, t) => sum + t.priority_score * 100, 0) / totalTenders
  );
  const expiringCount = mockTenders.filter((t) => {
    const deadline = new Date(t.deadline_date);
    const now = new Date();
    const diffDays = Math.ceil(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays > 0 && diffDays <= 7 && !["expired", "won", "lost"].includes(t.status);
  }).length;

  // Sector distribution
  const sectorDistribution: Record<string, number> = {};
  mockTenders.forEach((t) => {
    sectorDistribution[t.sector] = (sectorDistribution[t.sector] || 0) + 1;
  });

  // Region distribution
  const regionDistribution: Record<string, number> = {};
  mockTenders.forEach((t) => {
    regionDistribution[t.region] = (regionDistribution[t.region] || 0) + 1;
  });

  // Monthly trend (last 12 months)
  const monthlyTrend = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyTrend.push({
      month: monthStr,
      count: Math.floor(Math.random() * 20) + 5,
      avgScore: Math.floor(Math.random() * 25) + 65,
    });
  }

  return NextResponse.json({
    kpis: {
      totalTenders,
      activeTenders,
      averageScore,
      expiringCount,
    },
    sectorDistribution,
    regionDistribution,
    monthlyTrend,
    period,
  });
}
