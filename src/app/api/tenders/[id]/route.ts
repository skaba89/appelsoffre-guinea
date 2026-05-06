import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mockTenders } from "@/lib/mock-data";

// ─── GET /api/tenders/[id] ────────────────────────────────────────────────────
// Récupère les détails complets d'un appel d'offres par son ID

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let tender: Record<string, unknown> | null = null;

  try {
    // Try Prisma first
    const dbTender = await db.tender.findUnique({ where: { id } });

    if (dbTender) {
      tender = {
        id: dbTender.id,
        reference: dbTender.reference,
        title: dbTender.title,
        description: dbTender.description,
        sector: dbTender.sector,
        region: dbTender.region,
        status: dbTender.status,
        tender_type: dbTender.tenderType,
        deadline_date: dbTender.deadlineDate.toISOString().split("T")[0],
        budget_min: dbTender.budgetMin,
        budget_max: dbTender.budgetMax,
        publishing_authority: dbTender.publishingAuthority,
        source_url: dbTender.sourceUrl,
        priority_score: dbTender.priorityScore,
        compatibility_score: dbTender.compatibilityScore,
        feasibility_score: dbTender.feasibilityScore,
        win_probability_score: dbTender.winProbabilityScore,
        strategy_recommendation: dbTender.strategyRecommendation,
        created_at: dbTender.createdAt.toISOString(),
        updated_at: dbTender.updatedAt.toISOString(),
      };
    }
  } catch (error) {
    console.error("[Tender Detail] Erreur base de données:", error);
  }

  // Fallback to mock data
  if (!tender) {
    const mockTender = mockTenders.find((t) => t.id === id);
    if (mockTender) {
      tender = { ...mockTender };
    }
  }

  if (!tender) {
    return NextResponse.json(
      { error: "Appel d'offres introuvable", code: 404 },
      { status: 404 }
    );
  }

  // Compute a composite score
  const computedScore = Math.round(
    ((tender.priority_score as number) * 0.3 +
      (tender.compatibility_score as number) * 0.3 +
      (tender.feasibility_score as number) * 0.25 +
      (tender.win_probability_score as number) * 0.15) *
      100
  );

  return NextResponse.json({
    ...tender,
    computed_score: computedScore,
  });
}
