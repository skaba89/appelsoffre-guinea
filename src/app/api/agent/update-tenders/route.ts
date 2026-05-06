import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenders } = body

    if (!tenders || !Array.isArray(tenders)) {
      return NextResponse.json({ error: 'Le tableau tenders est requis' }, { status: 400 })
    }

    let created = 0
    let updated = 0
    let skipped = 0

    for (const tender of tenders) {
      try {
        const { title, sourceUrl, deadline, description, sector, region, reference, budgetMin, budgetMax, publishingAuthority } = tender

        if (!title || !sourceUrl) {
          skipped++
          continue
        }

        const existing = await db.tender.findFirst({ where: { sourceUrl } })

        if (existing) {
          await db.tender.update({
            where: { id: existing.id },
            data: {
              title,
              description: description || existing.description,
              sector: sector || existing.sector,
              region: region || existing.region,
              status: tender.status || existing.status,
              deadlineDate: deadline ? new Date(deadline) : existing.deadlineDate,
              updatedAt: new Date(),
            }
          })
          updated++
        } else {
          await db.tender.create({
            data: {
              title,
              description: description || '',
              sector: sector || 'Autre',
              region: region || 'Conakry',
              reference: reference || `AO/${Date.now()}`,
              publishingAuthority: publishingAuthority || 'Inconnu',
              sourceUrl,
              deadlineDate: deadline ? new Date(deadline) : new Date(Date.now() + 30 * 24 * 3600 * 1000),
              budgetMin: budgetMin || 0,
              budgetMax: budgetMax || 0,
            }
          })
          created++
        }
      } catch (itemError) {
        console.error('[Update Tenders] Erreur traitement tender:', itemError)
        skipped++
      }
    }

    return NextResponse.json({
      success: true,
      result: { total: tenders.length, created, updated, skipped }
    })
  } catch (error) {
    console.error('[Update Tenders] Erreur:', error)
    return NextResponse.json(
      { error: 'Échec de la mise à jour des appels d\'offres', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}
