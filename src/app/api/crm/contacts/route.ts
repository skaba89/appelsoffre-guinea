import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const accountId = searchParams.get('accountId') || ''
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (accountId) where.accountId = accountId

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { account: { select: { id: true, name: true } } } }),
      prisma.contact.count({ where })
    ])

    return NextResponse.json({ contacts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  } catch (error) {
    console.error('[CRM Contacts] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, position, company, accountId } = body
    if (!firstName || !lastName) return NextResponse.json({ error: 'firstName and lastName are required' }, { status: 400 })

    if (email) {
      const existing = await prisma.contact.findFirst({ where: { email } })
      if (existing) return NextResponse.json({ error: 'Contact with this email already exists' }, { status: 409 })
    }

    const contact = await prisma.contact.create({
      data: { firstName, lastName, email: email || null, phone: phone || null, position: position || null, company: company || null, accountId: accountId || null },
      include: { account: { select: { id: true, name: true } } }
    })
    return NextResponse.json({ contact }, { status: 201 })
  } catch (error) {
    console.error('[CRM Contacts] POST error:', error)
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, firstName, lastName, email, phone, position, company, accountId } = body
    if (!id) return NextResponse.json({ error: 'Contact id is required' }, { status: 400 })

    const existing = await prisma.contact.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })

    const contact = await prisma.contact.update({
      where: { id },
      data: { ...(firstName !== undefined && { firstName }), ...(lastName !== undefined && { lastName }), ...(email !== undefined && { email }), ...(phone !== undefined && { phone }), ...(position !== undefined && { position }), ...(company !== undefined && { company }), ...(accountId !== undefined && { accountId }), updatedAt: new Date() },
      include: { account: { select: { id: true, name: true } } }
    })
    return NextResponse.json({ contact })
  } catch (error) {
    console.error('[CRM Contacts] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Contact id is required' }, { status: 400 })

    const existing = await prisma.contact.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })

    await prisma.contact.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[CRM Contacts] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 })
  }
}
