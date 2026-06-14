import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const requests = await db.verificationRequest.findMany({
      where: { status: 'pending' },
      include: {
        profile: {
          include: {
            user: { select: { email: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(requests)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, adminNotes } = body

    if (!id || !status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'id and status (approved/rejected) required' }, { status: 400 })
    }

    const verification = await db.verificationRequest.update({
      where: { id },
      data: { status, adminNotes: adminNotes || null },
    })

    if (status === 'approved') {
      await db.profile.update({
        where: { id: verification.profileId },
        data: { isBadgeApproved: true },
      })
    }

    return NextResponse.json(verification)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
