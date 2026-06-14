import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const profile = await db.profile.findUnique({
      where: { id },
      include: {
        skills: { include: { skill: true } },
        platformProjects: {
          include: {
            project: { include: { platform: true } },
          },
        },
        portfolioItems: { orderBy: { sortOrder: 'asc' } },
        verificationRequest: true,
        reviews: { orderBy: { createdAt: 'desc' } },
        user: { select: { email: true, role: true } },
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const avgRating = profile.reviews.length > 0
      ? profile.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / profile.reviews.length
      : 0

    const enriched = {
      ...profile,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: profile.reviews.length,
      skills: profile.skills.map((s: { skill: { id: string; name: string; slug: string; category: string | null } }) => s.skill),
      platformProjects: profile.platformProjects.map((pp: { project: { id: string; name: string; slug: string; platform: { id: string; name: string; slug: string } } }) => pp.project),
    }

    return NextResponse.json(enriched)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'fullName', 'photoUrl', 'country', 'languages', 'successRate',
      'bio', 'contactWhatsapp', 'contactTelegram', 'contactEmail', 'contactLinkedin',
      'subscriptionTier', 'isBadgeApproved', 'isFeatured', 'isActive',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const profile = await db.profile.update({
      where: { id },
      data: updateData,
    })

    if (body.skillIds) {
      await db.profileSkill.deleteMany({ where: { profileId: id } })
      if (body.skillIds.length > 0) {
        await db.profileSkill.createMany({
          data: body.skillIds.map((skillId: string) => ({ profileId: id, skillId })),
        })
      }
    }

    if (body.projectIds) {
      await db.profilePlatformProject.deleteMany({ where: { profileId: id } })
      if (body.projectIds.length > 0) {
        await db.profilePlatformProject.createMany({
          data: body.projectIds.map((projectId: string) => ({ profileId: id, projectId })),
        })
      }
    }

    return NextResponse.json(profile)
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
    await db.profile.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
