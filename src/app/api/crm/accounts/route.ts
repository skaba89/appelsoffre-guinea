import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    if (id) {
      const account = await prisma.cRMAccount.findUnique({ where: { id }, include: { contacts: { orderBy: { createdAt: 'desc' } } } })
      if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 })
      return NextResponse.json({ account })
    }

    const skip = (page - 1) * limit
    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [accounts, total] = await Promise.all([
      prisma.cRMAccount.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { _count: { select: { contacts: true } } } }),
      prisma.cRMAccount.count({ where })
    ])

    return NextResponse.json({ accounts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  } catch (error) {
    console.error('[CRM Accounts] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, industry, website, phone, email, address, description } = body
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

    const account = await prisma.cRMAccount.create({
      data: { name, industry: industry || null, website: website || null, phone: phone || null, email: email || null, address: address || null, description: description || null }
    })
    return NextResponse.json({ account }, { status: 201 })
  } catch (error) {
    console.error('[CRM Accounts] POST error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, industry, website, phone, email, address, description } = body
    if (!id) return NextResponse.json({ error: 'Account id is required' }, { status: 400 })

    const existing = await prisma.cRMAccount.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Account not found' }, { status: 404 })

    const account = await prisma.cRMAccount.update({
      where: { id },
      data: { ...(name !== undefined && { name }), ...(industry !== undefined && { industry }), ...(website !== undefined && { website }), ...(phone !== undefined && { phone }), ...(email !== undefined && { email }), ...(address !== undefined && { address }), ...(description !== undefined && { description }), updatedAt: new Date() },
      include: { contacts: { orderBy: { createdAt: 'desc' } } }
    })
    return NextResponse.json({ account })
  } catch (error) {
    console.error('[CRM Accounts] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Account id is required' }, { status: 400 })

    const existing = await prisma.cRMAccount.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Account not found' }, { status: 404 })

    await prisma.contact.deleteMany({ where: { accountId: id } })
    await prisma.cRMAccount.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[CRM Accounts] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
