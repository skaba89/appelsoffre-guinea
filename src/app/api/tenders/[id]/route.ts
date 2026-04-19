import { NextRequest, NextResponse } from "next/server";
import { mockTenders } from "@/lib/mock-data";

// ─── GET /api/tenders/[id] ────────────────────────────────────────────────────
// Récupère les détails complets d'un appel d'offres par son ID

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const tender = mockTenders.find((t) => t.id === id);

  if (!tender) {
    return NextResponse.json(
      { error: "Appel d'offres introuvable", code: 404 },
      { status: 404 }
    );
  }

  // Compute a composite score
  const computedScore = Math.round(
    (tender.priority_score * 0.3 +
      tender.compatibility_score * 0.3 +
      tender.feasibility_score * 0.25 +
      tender.win_probability_score * 0.15) *
      100
  );

  return NextResponse.json({
    ...tender,
    computed_score: computedScore,
  });
}
