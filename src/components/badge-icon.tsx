'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Star } from 'lucide-react'

export function VerifiedBadge({ size = 20, showText = false }: { size?: number; showText?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1">
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <CheckCircle size={size} className="text-emerald-500 fill-emerald-500/20" />
      </motion.div>
      {showText && <span className="text-emerald-600 font-semibold text-sm">Verified</span>}
    </span>
  )
}

export function PremiumBadge({ size = 20, showText = false }: { size?: number; showText?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1">
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <Star size={size} className="text-amber-500 fill-amber-500" />
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Star size={size} className="text-amber-300 fill-amber-300" />
        </motion.div>
      </motion.div>
      {showText && <span className="text-amber-600 font-semibold text-sm">Premium</span>}
    </span>
  )
}

export function TierBadge({ tier, size = 20 }: { tier: string; size?: number }) {
  if (tier === 'premium') return <PremiumBadge size={size} showText />
  if (tier === 'verified') return <VerifiedBadge size={size} showText />
  return <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Free</span>
}
