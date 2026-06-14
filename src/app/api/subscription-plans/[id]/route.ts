import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const plan = await db.subscriptionPlan.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        tier: body.tier,
        duration: body.duration,
        price: body.price,
        currency: body.currency,
        features: typeof body.features === 'string' ? body.features : JSON.stringify(body.features || []),
        isActive: body.isActive,
        sortOrder: body.sortOrder,
      },
    })
    return NextResponse.json(plan)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.subscriptionPlan.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
