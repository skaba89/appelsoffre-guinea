import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    const where: Record<string, unknown> = {}
    if (activeOnly) where.isActive = true

    const sources = await prisma.tenderSource.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { _count: { select: { tenders: true } } }
    })
    return NextResponse.json({ sources })
  } catch (error) {
    console.error('[Tender Sources] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch tender sources' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, url, type, description, isActive } = body
    if (!name || !url) return NextResponse.json({ error: 'name and url are required' }, { status: 400 })

    const existing = await prisma.tenderSource.findFirst({ where: { url } })
    if (existing) return NextResponse.json({ error: 'Source with this URL already exists' }, { status: 409 })

    const source = await prisma.tenderSource.create({
      data: { name, url, type: type || 'web', description: description || null, isActive: isActive !== undefined ? isActive : true }
    })
    return NextResponse.json({ source }, { status: 201 })
  } catch (error) {
    console.error('[Tender Sources] POST error:', error)
    return NextResponse.json({ error: 'Failed to create tender source' }, { status: 500 })
  }
}
