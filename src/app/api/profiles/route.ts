import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')?.split(',').filter(Boolean) || []
    const skill = searchParams.get('skill')?.split(',').filter(Boolean) || []
    const country = searchParams.get('country')?.split(',').filter(Boolean) || []
    const verification = searchParams.get('verification') || 'all'
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || 'newest'

    const where: Record<string, unknown> = {
      isActive: true,
    }

    if (platform.length > 0) {
      where.platformProjects = {
        some: {
          project: {
            platform: {
              slug: { in: platform },
            },
          },
        },
      }
    }

    if (skill.length > 0) {
      where.skills = {
        some: {
          skill: {
            slug: { in: skill },
          },
        },
      }
    }

    if (country.length > 0) {
      where.country = { in: country }
    }

    if (verification === 'verified') {
      where.subscriptionTier = { in: ['verified', 'premium'] }
      where.isBadgeApproved = true
    } else if (verification === 'premium') {
      where.subscriptionTier = 'premium'
      where.isBadgeApproved = true
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { bio: { contains: search } },
        { country: { contains: search } },
        { skills: { some: { skill: { name: { contains: search } } } } },
      ]
    }

    const orderBy: Record<string, string> = {}
    if (sort === 'newest') orderBy.createdAt = 'desc'
    else if (sort === 'highest_rated') orderBy.reviews = { _count: 'desc' }
    else if (sort === 'most_viewed') orderBy.profileViews = 'desc'
    else if (sort === 'premium_first') orderBy.subscriptionTier = 'desc'

    const [profiles, total] = await Promise.all([
      db.profile.findMany({
        where,
        include: {
          skills: { include: { skill: true } },
          platformProjects: {
            include: {
              project: { include: { platform: true } },
            },
          },
          reviews: true,
          user: { select: { email: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.profile.count({ where }),
    ])

    const enriched = profiles.map((p) => {
      const avgRating = p.reviews.length > 0
        ? p.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / p.reviews.length
        : 0
      return {
        ...p,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: p.reviews.length,
        skills: p.skills.map((s: { skill: { id: string; name: string; slug: string; category: string | null } }) => s.skill),
        platformProjects: p.platformProjects.map((pp: { project: { id: string; name: string; slug: string; platform: { id: string; name: string; slug: string } } }) => pp.project),
      }
    })

    return NextResponse.json({
      profiles: enriched,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Profiles GET error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const profile = await db.profile.create({
      data: {
        userId: body.userId,
        fullName: body.fullName,
        photoUrl: body.photoUrl,
        country: body.country,
        languages: body.languages,
        successRate: body.successRate,
        bio: body.bio,
        contactWhatsapp: body.contactWhatsapp,
        contactTelegram: body.contactTelegram,
        contactEmail: body.contactEmail,
        contactLinkedin: body.contactLinkedin,
      },
    })
    return NextResponse.json(profile, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
