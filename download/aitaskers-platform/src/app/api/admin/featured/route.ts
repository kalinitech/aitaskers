import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { profileId, isFeatured, featuredUntil } = body

    if (!profileId) {
      return NextResponse.json({ error: 'profileId required' }, { status: 400 })
    }

    const profile = await db.profile.update({
      where: { id: profileId },
      data: {
        isFeatured,
        featuredUntil: featuredUntil ? new Date(featuredUntil) : null,
      },
    })

    return NextResponse.json(profile)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
