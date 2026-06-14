'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxStars?: number
  size?: number
  interactive?: boolean
  onRatingChange?: (rating: number) => void
}

export function StarRating({ rating, maxStars = 5, size = 16, interactive = false, onRatingChange }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const displayRating = hoverRating || rating

  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1
        const isFilled = starValue <= displayRating
        const isHalf = starValue - 0.5 <= displayRating && starValue > displayRating

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            className={cn(
              'relative transition-colors',
              interactive && 'cursor-pointer hover:scale-110',
              !interactive && 'cursor-default'
            )}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && onRatingChange?.(starValue)}
          >
            <Star
              size={size}
              className={cn(
                'transition-colors',
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : isHalf
                    ? 'text-amber-400 fill-amber-400/50'
                    : 'text-gray-300'
              )}
            />
          </button>
        )
      })}
      <span className="ml-1 text-sm text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  )
}
