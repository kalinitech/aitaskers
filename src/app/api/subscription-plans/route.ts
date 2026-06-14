import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const plans = await db.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(plans)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const plan = await db.subscriptionPlan.create({
      data: {
        name: body.name,
        slug: body.slug,
        tier: body.tier,
        duration: body.duration,
        price: body.price,
        currency: body.currency || 'KES',
        features: typeof body.features === 'string' ? body.features : JSON.stringify(body.features || []),
        isActive: body.isActive !== undefined ? body.isActive : true,
        sortOrder: body.sortOrder || 0,
      },
    })
    return NextResponse.json(plan, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
