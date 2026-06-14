'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Eye, Mail, MessageCircle, Phone, Linkedin, ExternalLink, Lock, Star, Flag, Send, Globe, Award } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { VerifiedBadge, PremiumBadge, TierBadge } from '@/components/badge-icon'
import { StarRating } from '@/components/star-rating'
import { ProfileSkeleton } from '@/components/loading-skeleton'
import { useStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'

interface ProfileData {
  id: string
  fullName: string
  photoUrl: string | null
  country: string | null
  languages: string | null
  successRate: number | null
  bio: string | null
  subscriptionTier: string
  isBadgeApproved: boolean
  isFeatured: boolean
  profileViews: number
  contactWhatsapp: string | null
  contactTelegram: string | null
  contactEmail: string | null
  contactLinkedin: string | null
  createdAt: string
  avgRating: number
  reviewCount: number
  skills: { id: string; name: string; slug: string; category: string | null }[]
  platformProjects: { id: string; name: string; slug: string; platform: { id: string; name: string; slug: string } }[]
  portfolioItems: { id: string; title: string | null; description: string | null; mediaUrl: string; mediaType: string }[]
  reviews: { id: string; reviewerName: string; rating: number; comment: string | null; createdAt: string }[]
  user: { email: string; role: string }
}

export function ProfilePage() {
  const { selectedProfileId, setView } = useStore()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewName, setReviewName] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!selectedProfileId) {
      setView('browse')
      return
    }
    setLoading(true)
    fetch(`/api/profiles/${selectedProfileId}`)
      .then((r) => r.json())
      .then((data) => {
        setProfile(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    // Increment views
    fetch(`/api/profiles/${selectedProfileId}/views`, { method: 'POST' }).catch(() => {})
  }, [selectedProfileId, setView])

  const handleSubmitReview = async () => {
    if (!profile || !reviewName || reviewRating === 0) {
      toast({ title: 'Error', description: 'Name and rating are required', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewedProfileId: profile.id,
          reviewerName: reviewName,
          rating: reviewRating,
          comment: reviewComment,
        }),
      })
      if (res.ok) {
        toast({ title: 'Review Submitted!', description: 'Thank you for your feedback' })
        setReviewName('')
        setReviewRating(0)
        setReviewComment('')
        // Refresh profile
        const data = await fetch(`/api/profiles/${profile.id}`).then((r) => r.json())
        setProfile(data)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to submit review', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8"><ProfileSkeleton /></div>
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
        <Button onClick={() => setView('browse')}>Back to Browse</Button>
      </div>
    )
  }

  const isVerifiedOrPremium = profile.subscriptionTier === 'verified' || profile.subscriptionTier === 'premium'
  const uniquePlatforms = Array.from(
    new Map(profile.platformProjects.map((pp) => [pp.platform.id, pp.platform])).values()
  )

  const groupedProjects: Record<string, { id: string; name: string; slug: string }[]> = {}
  profile.platformProjects.forEach((pp) => {
    const platformName = pp.platform.name
    if (!groupedProjects[platformName]) groupedProjects[platformName] = []
    if (!groupedProjects[platformName].find((p) => p.id === pp.id)) {
      groupedProjects[platformName].push({ id: pp.id, name: pp.name, slug: pp.slug })
    }
  })

  const initials = profile.fullName.split(' ').map((n) => n[0]).join('').toUpperCase()
  const languages = profile.languages ? profile.languages.split(',').map((l) => l.trim()) : []

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden">
          {profile.isFeatured && (
            <div className="h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />
          )}
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                <AvatarImage src={profile.photoUrl || undefined} alt={profile.fullName} />
                <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{profile.fullName}</h1>
                  {profile.subscriptionTier === 'premium' && <PremiumBadge size={22} showText />}
                  {profile.subscriptionTier === 'verified' && profile.isBadgeApproved && <VerifiedBadge size={22} showText />}
                  {profile.subscriptionTier === 'free' && <Badge variant="outline" className="text-xs">Free</Badge>}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                  {profile.country && <span className="flex items-center gap-1"><MapPin size={14} />{profile.country}</span>}
                  <span className="flex items-center gap-1"><Eye size={14} />{profile.profileViews} views</span>
                  {profile.avgRating > 0 && <span className="flex items-center gap-1"><Star size={14} className="text-amber-400 fill-amber-400" />{profile.avgRating} ({profile.reviewCount})</span>}
                </div>
                {profile.successRate !== null && profile.successRate > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-muted-foreground">Success Rate:</span>
                    <Progress value={profile.successRate} className="w-32 h-2" />
                    <span className="text-sm font-semibold">{profile.successRate}%</span>
                  </div>
                )}
                {languages.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Globe size={12} className="text-muted-foreground" />
                    {languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-xs">{lang}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          {profile.bio && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader><CardTitle className="text-lg">About</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile.bio}</p></CardContent>
              </Card>
            </motion.div>
          )}

          {/* Skills */}
          {profile.skills.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader><CardTitle className="text-lg">Skills</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill.id} variant="secondary" className="text-sm">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Platforms & Projects */}
          {uniquePlatforms.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader><CardTitle className="text-lg">Platforms & Projects</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(groupedProjects).map(([platformName, projects]) => (
                    <div key={platformName} className="border rounded-lg p-3">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Award size={14} className="text-emerald-500" />
                        {platformName}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {projects.map((project) => (
                          <Badge key={project.id} variant="outline" className="text-xs">{project.name}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Portfolio */}
          {profile.portfolioItems.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader><CardTitle className="text-lg">Portfolio</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {profile.portfolioItems.map((item) => (
                      <div key={item.id} className="border rounded-lg overflow-hidden group">
                        <div className="aspect-video bg-muted flex items-center justify-center relative">
                          <img
                            src={item.mediaUrl}
                            alt={item.title || 'Portfolio item'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <ExternalLink size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        {(item.title || item.description) && (
                          <div className="p-2">
                            {item.title && <p className="text-sm font-medium">{item.title}</p>}
                            {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Reviews */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Reviews ({profile.reviewCount})
                  {profile.avgRating > 0 && <StarRating rating={profile.avgRating} size={14} />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.reviews.length > 0 ? (
                  profile.reviews.map((review) => (
                    <div key={review.id} className="border-b last:border-0 pb-3 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{review.reviewerName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mb-1">
                        <StarRating rating={review.rating} size={12} />
                      </div>
                      {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No reviews yet</p>
                )}

                <Separator />

                {/* Leave Review */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Leave a Review</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="reviewerName" className="text-xs">Your Name</Label>
                      <Input
                        id="reviewerName"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="Your name"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Rating</Label>
                      <StarRating rating={reviewRating} interactive onRatingChange={setReviewRating} size={18} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reviewComment" className="text-xs">Comment (optional)</Label>
                    <Textarea
                      id="reviewComment"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  <Button size="sm" onClick={handleSubmitReview} disabled={submitting}>
                    <Send size={14} className="mr-1" />
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader><CardTitle className="text-lg">Contact</CardTitle></CardHeader>
              <CardContent>
                {isVerifiedOrPremium ? (
                  <div className="space-y-2">
                    {profile.contactWhatsapp && (
                      <a href={`https://wa.me/${profile.contactWhatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors">
                        <Phone size={16} className="text-emerald-500" /> WhatsApp
                      </a>
                    )}
                    {profile.contactTelegram && (
                      <a href={`https://t.me/${profile.contactTelegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-colors">
                        <MessageCircle size={16} className="text-sky-500" /> Telegram
                      </a>
                    )}
                    {profile.contactEmail && (
                      <a href={`mailto:${profile.contactEmail}`} className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-muted transition-colors">
                        <Mail size={16} /> {profile.contactEmail}
                      </a>
                    )}
                    {profile.contactLinkedin && (
                      <a href={`https://${profile.contactLinkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                        <Linkedin size={16} className="text-blue-600" /> LinkedIn
                      </a>
                    )}
                    {!profile.contactWhatsapp && !profile.contactTelegram && !profile.contactEmail && !profile.contactLinkedin && (
                      <p className="text-sm text-muted-foreground">No contact info provided</p>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <div className="blur-sm space-y-2">
                      <div className="h-8 bg-muted rounded" />
                      <div className="h-8 bg-muted rounded" />
                      <div className="h-8 bg-muted rounded" />
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Lock size={20} className="text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground text-center mb-2">Contact info is for verified members only</p>
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => setView('dashboard')}>
                        Upgrade to View
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader><CardTitle className="text-lg">Quick Stats</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tier</span>
                  <TierBadge tier={profile.subscriptionTier} size={16} />
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Skills</span>
                  <span className="font-medium">{profile.skills.length}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Platforms</span>
                  <span className="font-medium">{uniquePlatforms.length}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Portfolio Items</span>
                  <span className="font-medium">{profile.portfolioItems.length}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-medium">{new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Report */}
          <div className="text-center">
            <button className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 mx-auto">
              <Flag size={10} /> Report this profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
