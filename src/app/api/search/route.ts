import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { search as searchEngine, getSuggestions } from "@/lib/search-engine";

// ─── GET /api/search ──────────────────────────────────────────────────────────
// Recherche full-text avec filtres et suggestions

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q") ?? "";
  const mode = searchParams.get("mode") ?? "search"; // "search" or "suggest"
  const sectors = searchParams.get("sectors")?.split(",").filter(Boolean);
  const regions = searchParams.get("regions")?.split(",").filter(Boolean);
  const types = searchParams.get("types")?.split(",").filter(Boolean) as import("@/lib/search-engine").SearchFilter["type"];
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

  // Suggestion mode — always from search engine (in-memory)
  if (mode === "suggest") {
    try {
      // Enrich suggestions from DB if available
      if (q) {
        const dbTenders = await db.tender.findMany({
          where: {
            OR: [
              { title: { contains: q } },
              { reference: { contains: q } },
            ],
          },
          take: 5,
          select: { id: true, title: true, sector: true },
        });
        if (dbTenders.length > 0) {
          const dbSuggestions = dbTenders.map((t) => ({
            text: t.title,
            type: "completion" as const,
            icon: "FileText",
          }));
          const engineSuggestions = getSuggestions(q);
          // Merge and deduplicate
          const seen = new Set<string>();
          const merged = [...dbSuggestions, ...engineSuggestions].filter((s) => {
            if (seen.has(s.text.toLowerCase())) return false;
            seen.add(s.text.toLowerCase());
            return true;
          }).slice(0, 10);
          return NextResponse.json({ suggestions: merged });
        }
      }
    } catch (error) {
      console.error("[Search] Erreur base de données (suggestions):", error);
    }

    const suggestions = getSuggestions(q);
    return NextResponse.json({ suggestions });
  }

  // Search mode — try DB first, fallback to search engine
  try {
    // Build Prisma where clause for tenders
    const where: Record<string, unknown> = {};
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { reference: { contains: q } },
        { publishingAuthority: { contains: q } },
        { description: { contains: q } },
      ];
    }
    if (sectors && sectors.length > 0) {
      where.sector = { in: sectors };
    }
    if (regions && regions.length > 0) {
      where.region = { in: regions };
    }
    if (budgetMin !== undefined || budgetMax !== undefined) {
      const budgetFilter: Record<string, number> = {};
      if (budgetMin !== undefined) budgetFilter.gte = budgetMin;
      if (budgetMax !== undefined) budgetFilter.lte = budgetMax;
      where.budgetMax = budgetFilter;
    }

    const dbTenders = await db.tender.findMany({
      where,
      orderBy: { priorityScore: "desc" },
      take: limit,
    });

    if (dbTenders.length > 0) {
      const results = dbTenders.map((t) => {
        const computedScore = Math.round(
          (t.priorityScore * 0.3 +
            t.compatibilityScore * 0.3 +
            t.feasibilityScore * 0.25 +
            t.winProbabilityScore * 0.15) *
            100
        );

        // Simple relevance calculation based on query match
        let relevance = 0.5;
        if (q) {
          const lower = q.toLowerCase();
          if (t.title.toLowerCase().includes(lower)) relevance += 0.3;
          if (t.publishingAuthority.toLowerCase().includes(lower)) relevance += 0.1;
          if (t.reference.toLowerCase().includes(lower)) relevance += 0.1;
        }
        relevance = Math.min(relevance, 1);

        return {
          id: t.id,
          type: "tender" as const,
          title: t.title,
          description: t.description,
          sector: t.sector,
          region: t.region,
          status: t.status,
          authority: t.publishingAuthority,
          budget: (t.budgetMin + t.budgetMax) / 2,
          deadline: t.deadlineDate.toISOString().split("T")[0],
          score: computedScore,
          tags: [] as string[],
          relevance: Math.round(relevance * 100),
          highlights: [] as Array<{ field: string; snippet: string; start: number; end: number }>,
        };
      }).filter((r) => {
        // Apply scoreMin filter if provided
        if (scoreMin !== undefined && r.score < scoreMin) return false;
        // Apply type filter (DB only has tenders)
        if (types && types.length > 0 && !types.includes("tender")) return false;
        return true;
      });

      return NextResponse.json({
        query: q,
        total: results.length,
        results,
        filters: { sectors, regions, type: types, scoreMin, budgetMin, budgetMax },
      });
    }
  } catch (error) {
    console.error("[Search] Erreur base de données (search):", error);
  }

  // Fallback to search engine
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
