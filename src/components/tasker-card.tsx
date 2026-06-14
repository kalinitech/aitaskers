'use client'

import { motion } from 'framer-motion'
import { MapPin, Eye } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { VerifiedBadge, PremiumBadge } from '@/components/badge-icon'
import { StarRating } from '@/components/star-rating'
import { useStore } from '@/lib/store'

interface TaskerCardProps {
  profile: {
    id: string
    fullName: string
    photoUrl: string | null
    country: string | null
    subscriptionTier: string
    isBadgeApproved: boolean
    profileViews: number
    successRate: number | null
    avgRating: number
    reviewCount: number
    skills: { id: string; name: string; slug: string; category: string | null }[]
    platformProjects: { id: string; name: string; slug: string; platform: { id: string; name: string; slug: string } }[]
    isFeatured: boolean
  }
}

export function TaskerCard({ profile }: TaskerCardProps) {
  const { setView, setSelectedProfileId } = useStore()

  const handleViewProfile = () => {
    setSelectedProfileId(profile.id)
    setView('profile')
  }

  const uniquePlatforms = Array.from(
    new Map(
      profile.platformProjects.map((pp) => [pp.platform.id, pp.platform])
    ).values()
  ).slice(0, 3)

  const displaySkills = profile.skills.slice(0, 3)

  const initials = profile.fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border hover:shadow-lg transition-shadow h-full flex flex-col">
        {profile.isFeatured && (
          <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />
        )}
        <CardContent className="p-4 flex flex-col flex-1">
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
              <AvatarImage src={profile.photoUrl || undefined} alt={profile.fullName} />
              <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm truncate">{profile.fullName}</h3>
                {profile.subscriptionTier === 'premium' && <PremiumBadge size={14} />}
                {profile.subscriptionTier === 'verified' && profile.isBadgeApproved && <VerifiedBadge size={14} />}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {profile.country && (
                  <span className="flex items-center gap-0.5">
                    <MapPin size={10} />
                    {profile.country}
                  </span>
                )}
                <span className="flex items-center gap-0.5">
                  <Eye size={10} />
                  {profile.profileViews}
                </span>
              </div>
            </div>
          </div>

          {/* Skills */}
          {displaySkills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {displaySkills.map((skill) => (
                <Badge key={skill.id} variant="secondary" className="text-[10px] px-1.5 py-0">
                  {skill.name}
                </Badge>
              ))}
              {profile.skills.length > 3 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  +{profile.skills.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Platforms */}
          {uniquePlatforms.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {uniquePlatforms.map((platform) => (
                <span
                  key={platform.id}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {platform.name}
                </span>
              ))}
            </div>
          )}

          {/* Rating & Success Rate */}
          <div className="flex items-center justify-between mb-3">
            <StarRating rating={profile.avgRating} size={12} />
            {profile.successRate !== null && profile.successRate > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Success</span>
                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.min(profile.successRate, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{profile.successRate}%</span>
              </div>
            )}
          </div>

          <div className="mt-auto">
            <Button
              onClick={handleViewProfile}
              className="w-full text-sm h-8"
              variant={profile.subscriptionTier === 'premium' ? 'default' : 'outline'}
            >
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
