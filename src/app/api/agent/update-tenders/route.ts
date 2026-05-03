import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenders } = body

    if (!tenders || !Array.isArray(tenders)) {
      return NextResponse.json({ error: 'tenders array is required' }, { status: 400 })
    }

    let created = 0
    let updated = 0
    let skipped = 0

    for (const tender of tenders) {
      try {
        const { title, source, sourceUrl, deadline, description, organization, category, status } = tender

        if (!title || !sourceUrl) {
          skipped++
          continue
        }

        const existing = await prisma.tender.findFirst({ where: { sourceUrl } })

        if (existing) {
          await prisma.tender.update({
            where: { id: existing.id },
            data: {
              title,
              description: description || existing.description,
              organization: organization || existing.organization,
              category: category || existing.category,
              status: status || existing.status,
              deadline: deadline ? new Date(deadline) : existing.deadline,
              source: source || existing.source,
              updatedAt: new Date(),
            }
          })
          updated++
        } else {
          await prisma.tender.create({
            data: {
              title,
              description: description || '',
              organization: organization || '',
              category: category || 'Autre',
              status: status || 'active',
              source: source || 'Unknown',
              sourceUrl,
              deadline: deadline ? new Date(deadline) : null,
            }
          })
          created++
        }
      } catch (itemError) {
        console.error('[Update Tenders] Error processing tender:', itemError)
        skipped++
      }
    }

    return NextResponse.json({
      success: true,
      result: { total: tenders.length, created, updated, skipped }
    })
  } catch (error) {
    console.error('[Update Tenders] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update tenders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
