import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [
      totalProfiles,
      verifiedProfiles,
      premiumProfiles,
      pendingVerifications,
      totalReviews,
      totalPayments,
      profilesByPlatform,
    ] = await Promise.all([
      db.profile.count({ where: { isActive: true } }),
      db.profile.count({ where: { isActive: true, isBadgeApproved: true, subscriptionTier: { in: ['verified', 'premium'] } } }),
      db.profile.count({ where: { isActive: true, subscriptionTier: 'premium' } }),
      db.verificationRequest.count({ where: { status: 'pending' } }),
      db.review.count(),
      db.payment.aggregate({ where: { status: 'completed' }, _sum: { amount: true } }),
      db.platform.findMany({
        where: { isActive: true },
        include: { _count: { select: { projects: true } } },
        orderBy: { name: 'asc' },
      }),
    ])

    const revenue = totalPayments._sum.amount || 0

    return NextResponse.json({
      totalProfiles,
      verifiedProfiles,
      premiumProfiles,
      pendingVerifications,
      totalReviews,
      revenue,
      profilesByPlatform,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
