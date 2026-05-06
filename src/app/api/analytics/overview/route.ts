import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mockTenders } from "@/lib/mock-data";

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

  let kpis: Record<string, unknown>;
  let sectorDistribution: Record<string, number>;
  let regionDistribution: Record<string, number>;
  let monthlyTrend: Array<{ month: string; count: number; avgScore: number }>;

  try {
    // Try computing from DB
    const dbTenders = await db.tender.findMany();

    if (dbTenders.length > 0) {
      const totalTenders = dbTenders.length;
      const activeTenders = dbTenders.filter(
        (t) => !["expired", "won", "lost"].includes(t.status)
      ).length;
      const averageScore = Math.round(
        dbTenders.reduce((sum, t) => sum + t.priorityScore * 100, 0) / totalTenders
      );
      const expiringCount = dbTenders.filter((t) => {
        const deadline = new Date(t.deadlineDate);
        const now = new Date();
        const diffDays = Math.ceil(
          (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return diffDays > 0 && diffDays <= 7 && !["expired", "won", "lost"].includes(t.status);
      }).length;

      kpis = { totalTenders, activeTenders, averageScore, expiringCount };

      // Sector distribution from DB
      sectorDistribution = {};
      dbTenders.forEach((t) => {
        sectorDistribution[t.sector] = (sectorDistribution[t.sector] || 0) + 1;
      });

      // Region distribution from DB
      regionDistribution = {};
      dbTenders.forEach((t) => {
        regionDistribution[t.region] = (regionDistribution[t.region] || 0) + 1;
      });

      // Monthly trend from DB
      monthlyTrend = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const monthTenders = dbTenders.filter((t) => {
          const created = new Date(t.createdAt);
          return created.getFullYear() === d.getFullYear() && created.getMonth() === d.getMonth();
        });
        const count = monthTenders.length;
        const avgScore = count > 0
          ? Math.round(monthTenders.reduce((sum, t) => sum + t.priorityScore * 100, 0) / count)
          : 0;
        monthlyTrend.push({ month: monthStr, count, avgScore });
      }

      return NextResponse.json({
        kpis,
        sectorDistribution,
        regionDistribution,
        monthlyTrend,
        period,
      });
    }
  } catch (error) {
    console.error("[Analytics Overview] Erreur base de données:", error);
  }

  // Fallback: compute KPIs from mock data
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

  kpis = { totalTenders, activeTenders, averageScore, expiringCount };

  // Sector distribution
  sectorDistribution = {};
  mockTenders.forEach((t) => {
    sectorDistribution[t.sector] = (sectorDistribution[t.sector] || 0) + 1;
  });

  // Region distribution
  regionDistribution = {};
  mockTenders.forEach((t) => {
    regionDistribution[t.region] = (regionDistribution[t.region] || 0) + 1;
  });

  // Monthly trend (last 12 months)
  monthlyTrend = [];
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
    kpis,
    sectorDistribution,
    regionDistribution,
    monthlyTrend,
    period,
  });
}
