import { NextResponse } from "next/server";
import { search as searchEngine, getSuggestions } from "@/lib/search-engine";

// ─── GET /api/search ──────────────────────────────────────────────────────────
// Recherche full-text avec filtres et suggestions

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q") ?? "";
  const mode = searchParams.get("mode") ?? "search"; // "search" or "suggest"
  const sectors = searchParams.get("sectors")?.split(",").filter(Boolean);
  const regions = searchParams.get("regions")?.split(",").filter(Boolean);
  const types = searchParams.get("types")?.split(",").filter(Boolean) as SearchFilter["type"];
  const scoreMin = searchParams.get("scoreMin")
    ? Number(searchParams.get("scoreMin"))
    : undefined;
  const budgetMin = searchParams.get("budgetMin")
    ? Number(searchParams.get("budgetMin"))
    : undefined;
  const budgetMax = searchParams.get("budgetMax")
    ? Number(searchParams.get("budgetMax"))
    : undefined;
  const limit = parseInt(searchParams.get("limit") ?? "20");

  // Suggestion mode
  if (mode === "suggest") {
    const suggestions = getSuggestions(q);
    return NextResponse.json({ suggestions });
  }

  // Search mode
  const filters: import("@/lib/search-engine").SearchFilter = {
    sectors,
    regions,
    type: types,
    scoreMin,
    budgetMin,
    budgetMax,
  };

  const results = searchEngine(q, filters, { maxResults: limit });

  return NextResponse.json({
    query: q,
    total: results.length,
    results: results.map((r) => ({
      id: r.document.id,
      type: r.document.type,
      title: r.document.title,
      description: r.document.description,
      sector: r.document.sector,
      region: r.document.region,
      status: r.document.status,
      authority: r.document.authority,
      budget: r.document.budget,
      deadline: r.document.deadline,
      score: r.document.score,
      tags: r.document.tags,
      relevance: Math.round(r.relevance * 100),
      highlights: r.highlights,
    })),
    filters,
  });
}
