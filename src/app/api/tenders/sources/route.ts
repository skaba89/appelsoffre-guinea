import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ─── Mock fallback data for crawl sources ──────────────────────────────────────

const mockCrawlSources = [
  {
    id: "cs-001",
    name: "Journal Officiel de la République de Guinée",
    url: "https://journal-officiel.gouv.gn",
    type: "government",
    sector: null,
    region: null,
    refreshInterval: 3600,
    status: "active",
    description: "Source officielle des publications légales et appels d'offres",
    health: 98,
    successRate: 0.95,
    lastCrawledAt: new Date().toISOString(),
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
    _count: { tenders: 42 },
  },
  {
    id: "cs-002",
    name: "Direction Nationale des Marchés Publics",
    url: "https://marches-publics.gouv.gn",
    type: "government",
    sector: null,
    region: null,
    refreshInterval: 1800,
    status: "active",
    description: "Portail national des marchés publics",
    health: 92,
    successRate: 0.88,
    lastCrawledAt: new Date().toISOString(),
    createdAt: "2026-01-05T00:00:00Z",
    updatedAt: new Date().toISOString(),
    _count: { tenders: 28 },
  },
  {
    id: "cs-003",
    name: "Banque Mondiale — Projets Guinée",
    url: "https://projects.worldbank.org/fr/country/guinea",
    type: "international",
    sector: null,
    region: null,
    refreshInterval: 7200,
    status: "active",
    description: "Projets financés par la Banque Mondiale en Guinée",
    health: 100,
    successRate: 0.99,
    lastCrawledAt: new Date().toISOString(),
    createdAt: "2026-01-10T00:00:00Z",
    updatedAt: new Date().toISOString(),
    _count: { tenders: 15 },
  },
  {
    id: "cs-004",
    name: "BAD — Appels d'offres Guinée",
    url: "https://www.afdb.org/fr/procurement/guinea",
    type: "international",
    sector: null,
    region: null,
    refreshInterval: 7200,
    status: "active",
    description: "Appels d'offres de la Banque Africaine de Développement",
    health: 95,
    successRate: 0.92,
    lastCrawledAt: new Date().toISOString(),
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
    _count: { tenders: 8 },
  },
  {
    id: "cs-005",
    name: "SOGUIPAMI — Appels d'offres miniers",
    url: "https://soguipami.gouv.gn/appels-offres",
    type: "enterprise",
    sector: "Mines",
    region: "Conakry",
    refreshInterval: 3600,
    status: "active",
    description: "Appels d'offres du secteur minier guinéen",
    health: 85,
    successRate: 0.80,
    lastCrawledAt: new Date().toISOString(),
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: new Date().toISOString(),
    _count: { tenders: 5 },
  },
];

// ─── GET /api/tenders/sources ──────────────────────────────────────────────────
// Liste les sources de veille (crawl sources)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    const where: Record<string, unknown> = {}
    if (activeOnly) where.status = 'active'

    const sources = await db.crawlSource.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    if (sources.length > 0) {
      // Get tender counts per source
      const sourcesWithCount = await Promise.all(
        sources.map(async (source) => {
          const tenderCount = await db.tender.count({
            where: { sourceUrl: { contains: new URL(source.url).hostname } },
          })
          return {
            id: source.id,
            name: source.name,
            url: source.url,
            type: source.type,
            sector: source.sector,
            region: source.region,
            refreshInterval: source.refreshInterval,
            status: source.status,
            description: source.description,
            health: source.health,
            successRate: source.successRate,
            lastCrawledAt: source.lastCrawledAt?.toISOString() ?? null,
            createdAt: source.createdAt.toISOString(),
            updatedAt: source.updatedAt.toISOString(),
            _count: { tenders: tenderCount },
          }
        })
      )
      return NextResponse.json({ sources: sourcesWithCount })
    }

    // DB returned empty, fall back to mock
    let filtered = [...mockCrawlSources]
    if (activeOnly) filtered = filtered.filter((s) => s.status === 'active')
    return NextResponse.json({ sources: filtered })
  } catch (error) {
    console.error('[Tender Sources] Erreur base de données:', error)
    // Fallback to mock data
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    let filtered = [...mockCrawlSources]
    if (activeOnly) filtered = filtered.filter((s) => s.status === 'active')
    return NextResponse.json({ sources: filtered })
  }
}

// ─── POST /api/tenders/sources ─────────────────────────────────────────────────
// Crée une nouvelle source de veille

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, url, type, description, isActive } = body
    if (!name || !url) return NextResponse.json({ error: 'name et url sont requis' }, { status: 400 })

    try {
      const existing = await db.crawlSource.findFirst({ where: { url } })
      if (existing) return NextResponse.json({ error: 'Une source avec cette URL existe déjà' }, { status: 409 })

      const source = await db.crawlSource.create({
        data: {
          name,
          url,
          type: type || 'web',
          description: description || null,
          status: isActive !== undefined ? (isActive ? 'active' : 'paused') : 'active',
        }
      })
      return NextResponse.json({ source }, { status: 201 })
    } catch (dbError) {
      console.error('[Tender Sources] Erreur base de données (POST):', dbError)
      return NextResponse.json({ error: 'Échec de la création de la source en base de données' }, { status: 500 })
    }
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }
}
