import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mockTenders } from "@/lib/mock-data";

// ─── GET /api/tenders ─────────────────────────────────────────────────────────
// Liste les appels d'offres avec pagination et filtres

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const sector = searchParams.get("sector");
  const region = searchParams.get("region");
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  // Build Prisma where clause
  const where: Record<string, unknown> = {};

  if (sector) where.sector = sector;
  if (region) where.region = region;
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { publishingAuthority: { contains: q } },
    ];
  }

  let tenders: Record<string, unknown>[] = [];
  let total = 0;
  let fromDb = false;

  try {
    // Try Prisma first
    const [dbTenders, dbCount] = await Promise.all([
      db.tender.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.tender.count({ where }),
    ]);

    if (dbCount > 0) {
      tenders = dbTenders.map((t) => ({
        id: t.id,
        reference: t.reference,
        title: t.title,
        sector: t.sector,
        region: t.region,
        status: t.status,
        authority: t.publishingAuthority,
        budgetMin: t.budgetMin,
        budgetMax: t.budgetMax,
        deadline: t.deadlineDate.toISOString().split("T")[0],
        score: Math.round(
          (t.priorityScore * 0.3 +
            t.compatibilityScore * 0.3 +
            t.feasibilityScore * 0.25 +
            t.winProbabilityScore * 0.15) *
            100
        ),
        tenderType: t.tenderType,
        publishingAuthority: t.publishingAuthority,
        sourceUrl: t.sourceUrl,
        priorityScore: t.priorityScore,
        compatibilityScore: t.compatibilityScore,
        feasibilityScore: t.feasibilityScore,
        winProbabilityScore: t.winProbabilityScore,
        strategyRecommendation: t.strategyRecommendation,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }));
      total = dbCount;
      fromDb = true;
    }
  } catch (error) {
    console.error("[Tenders] Erreur base de données:", error);
  }

  // Fallback to mock data if DB returned nothing
  if (!fromDb) {
    let filtered = mockTenders.map((t) => ({
      id: t.id,
      reference: t.reference,
      title: t.title,
      sector: t.sector,
      region: t.region,
      status: t.status,
      authority: t.publishing_authority,
      budgetMin: t.budget_min,
      budgetMax: t.budget_max,
      deadline: t.deadline_date,
      score: Math.round(
        (t.priority_score * 0.3 +
          t.compatibility_score * 0.3 +
          t.feasibility_score * 0.25 +
          t.win_probability_score * 0.15) *
          100
      ),
      tenderType: t.tender_type,
      publishingAuthority: t.publishing_authority,
      sourceUrl: t.source_url,
      priorityScore: t.priority_score,
      compatibilityScore: t.compatibility_score,
      feasibilityScore: t.feasibility_score,
      winProbabilityScore: t.win_probability_score,
      strategyRecommendation: t.strategy_recommendation,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }));

    // Apply filters
    if (sector) filtered = filtered.filter((t) => t.sector === sector);
    if (region) filtered = filtered.filter((t) => t.region === region);
    if (status) filtered = filtered.filter((t) => t.status === status);
    if (q) {
      const lower = q.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.title as string).toLowerCase().includes(lower) ||
          (t.publishingAuthority as string).toLowerCase().includes(lower)
      );
    }

    total = filtered.length;
    const start = (page - 1) * limit;
    tenders = filtered.slice(start, start + limit);
  }

  return NextResponse.json({
    data: tenders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    filters: { sector, region, status, q },
  });
}
