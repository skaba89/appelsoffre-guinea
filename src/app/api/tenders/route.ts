import { NextResponse } from "next/server";

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

  // Mock data — in production, this would query Prisma
  const tenders = [
    {
      id: "t-001", reference: "AO/MTP/2026/001",
      title: "Construction de la route Nationale 1 — Section Conakry-Kindia",
      sector: "BTP", region: "Conakry", status: "new",
      authority: "Ministère des Travaux Publics",
      budgetMin: 20_000_000_000, budgetMax: 30_000_000_000,
      deadline: "2026-07-15", score: 72,
    },
    {
      id: "t-002", reference: "AO/DGSI/2026/003",
      title: "Fourniture d'équipements informatiques pour l'administration publique",
      sector: "IT / Digital", region: "Conakry", status: "qualifying",
      authority: "Direction Générale des Systèmes d'Information",
      budgetMin: 5_000_000_000, budgetMax: 10_000_000_000,
      deadline: "2026-06-30", score: 85,
    },
    {
      id: "t-003", reference: "AO/EDG/2026/007",
      title: "Électrification rurale — 50 villages dans la préfecture de Labé",
      sector: "Énergie", region: "Labé", status: "qualified",
      authority: "Énergie de Guinée (EDG)",
      budgetMin: 8_000_000_000, budgetMax: 15_000_000_000,
      deadline: "2026-08-01", score: 68,
    },
    {
      id: "t-004", reference: "AO/MMG/2026/012",
      title: "Services de consulting en gouvernance minière",
      sector: "Conseil", region: "Conakry", status: "go",
      authority: "Ministère des Mines et de la Géologie",
      budgetMin: 2_000_000_000, budgetMax: 4_000_000_000,
      deadline: "2026-05-20", score: 78,
    },
    {
      id: "t-005", reference: "AO/MS/2026/005",
      title: "Construction du Centre Hospitalier Régional de Nzérékoré",
      sector: "Santé", region: "Nzérékoré", status: "new",
      authority: "Ministère de la Santé",
      budgetMin: 15_000_000_000, budgetMax: 22_000_000_000,
      deadline: "2026-09-15", score: 62,
    },
  ];

  // Apply filters
  let filtered = tenders;
  if (sector) filtered = filtered.filter((t) => t.sector === sector);
  if (region) filtered = filtered.filter((t) => t.region === region);
  if (status) filtered = filtered.filter((t) => t.status === status);
  if (q) {
    const lower = q.toLowerCase();
    filtered = filtered.filter(
      (t) => t.title.toLowerCase().includes(lower) || t.authority.toLowerCase().includes(lower)
    );
  }

  // Pagination
  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return NextResponse.json({
    data: paginated,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    filters: { sector, region, status, q },
  });
}
