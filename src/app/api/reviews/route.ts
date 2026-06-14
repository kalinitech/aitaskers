import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reviewedProfileId, reviewerName, rating, comment } = body

    if (!reviewedProfileId || !reviewerName || !rating) {
      return NextResponse.json(
        { error: 'reviewedProfileId, reviewerName, and rating are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const review = await db.review.create({
      data: {
        reviewedProfileId,
        reviewerName,
        rating,
        comment: comment || null,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
