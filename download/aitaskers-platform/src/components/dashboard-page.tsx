'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Eye, Edit2, Shield, Upload, Star, CheckCircle2, X, Plus, Trash2, Save, ExternalLink } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { TierBadge, VerifiedBadge, PremiumBadge } from '@/components/badge-icon'
import { useStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'

interface Skill {
  id: string
  name: string
  slug: string
  category: string | null
}

interface Platform {
  id: string
  name: string
  slug: string
  projects: { id: string; name: string; slug: string }[]
}

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
  skills: { id: string; name: string; slug: string; category: string | null }[]
  platformProjects: { id: string; name: string; slug: string; platform: { id: string; name: string; slug: string } }[]
  portfolioItems: { id: string; title: string | null; description: string | null; mediaUrl: string; mediaType: string }[]
  avgRating: number
  reviewCount: number
}

export function DashboardPage() {
  const { user, setView, setSelectedProfileId } = useStore()
  const { toast } = useToast()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editCountry, setEditCountry] = useState('')
  const [editLanguages, setEditLanguages] = useState('')
  const [editSuccessRate, setEditSuccessRate] = useState('')
  const [editWhatsapp, setEditWhatsapp] = useState('')
  const [editTelegram, setEditTelegram] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editLinkedin, setEditLinkedin] = useState('')
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([])
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])
  const [portfolioTitle, setPortfolioTitle] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [portfolioDesc, setPortfolioDesc] = useState('')

  const loadData = useCallback(async () => {
    if (!user?.profileId) {
      setLoading(false)
      return
    }
    try {
      const [profileRes, skillsRes, platformsRes] = await Promise.all([
        fetch(`/api/profiles/${user.profileId}`),
        fetch('/api/skills'),
        fetch('/api/platforms'),
      ])
      const profileData = await profileRes.json()
      const skillsData = await skillsRes.json()
      const platformsData = await platformsRes.json()

      setProfile(profileData)
      setSkills(skillsData || [])
      setPlatforms(platformsData || [])

      setEditName(profileData.fullName || '')
      setEditBio(profileData.bio || '')
      setEditCountry(profileData.country || '')
      setEditLanguages(profileData.languages || '')
      setEditSuccessRate(profileData.successRate?.toString() || '')
      setEditWhatsapp(profileData.contactWhatsapp || '')
      setEditTelegram(profileData.contactTelegram || '')
      setEditEmail(profileData.contactEmail || '')
      setEditLinkedin(profileData.contactLinkedin || '')
      setSelectedSkillIds(profileData.skills?.map((s: Skill) => s.id) || [])
      setSelectedProjectIds(profileData.platformProjects?.map((pp: { id: string }) => pp.id) || [])
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.profileId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSaveProfile = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const res = await fetch(`/api/profiles/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editName,
          bio: editBio,
          country: editCountry,
          languages: editLanguages,
          successRate: editSuccessRate ? parseFloat(editSuccessRate) : null,
          contactWhatsapp: editWhatsapp,
          contactTelegram: editTelegram,
          contactEmail: editEmail,
          contactLinkedin: editLinkedin,
          skillIds: selectedSkillIds,
          projectIds: selectedProjectIds,
        }),
      })
      if (res.ok) {
        toast({ title: 'Profile Updated!', description: 'Your changes have been saved' })
        loadData()
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save profile', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleAddPortfolio = async () => {
    if (!profile || !portfolioUrl) return
    try {
      const res = await fetch(`/api/profiles/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioItems: [
            ...profile.portfolioItems.map((item, i) => ({ ...item, sortOrder: i })),
            { title: portfolioTitle, description: portfolioDesc, mediaUrl: portfolioUrl, mediaType: 'url', sortOrder: profile.portfolioItems.length },
          ],
        }),
      })
      if (res.ok) {
        toast({ title: 'Portfolio item added!' })
        setPortfolioTitle('')
        setPortfolioUrl('')
        setPortfolioDesc('')
        loadData()
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to add portfolio item', variant: 'destructive' })
    }
  }

  const handleRequestVerification = async () => {
    if (!profile) return
    try {
      // Create a verification request
      await fetch('/api/profiles/' + profile.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBadgeApproved: false }),
      })
      toast({ title: 'Verification Request Submitted', description: 'Our team will review your profile shortly' })
    } catch {
      toast({ title: 'Error', description: 'Failed to submit verification request', variant: 'destructive' })
    }
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Shield size={48} className="mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Login Required</h2>
        <p className="text-muted-foreground mb-4">Please log in to access your dashboard</p>
        <Button onClick={() => useStore.getState().setIsLoginOpen(true)}>Login</Button>
      </div>
    )
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8"><div className="animate-pulse space-y-4"><div className="h-40 bg-muted rounded-xl" /><div className="h-60 bg-muted rounded-xl" /></div></div>
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold mb-2">No Profile Found</h2>
        <p className="text-muted-foreground mb-4">Create a profile to get started</p>
      </div>
    )
  }

  const completionFields = [
    !!editName, !!editBio, !!editCountry, !!editLanguages,
    selectedSkillIds.length > 0, selectedProjectIds.length > 0,
  ]
  const completionPercent = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100)

  const initials = editName.split(' ').map((n) => n[0]).join('').toUpperCase()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-bold mb-6">Tasker Dashboard</h1>

      {/* Profile Overview Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Avatar className="h-16 w-16 border-2 border-background shadow">
                <AvatarImage src={profile.photoUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white text-xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">{profile.fullName}</h2>
                  <TierBadge tier={profile.subscriptionTier} size={16} />
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Eye size={14} />{profile.profileViews} views</span>
                  <span className="flex items-center gap-1"><Star size={14} className="text-amber-400 fill-amber-400" />{profile.avgRating} ({profile.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 max-w-xs">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Profile Completion</span>
                      <span className="font-medium">{completionPercent}%</span>
                    </div>
                    <Progress value={completionPercent} className="h-2" />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { setSelectedProfileId(profile.id); setView('profile') }}>
                    <ExternalLink size={14} className="mr-1" /> Preview
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Edit Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Edit2 size={18} /> Edit Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Full Name</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Bio</Label>
                <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3} className="text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Country</Label>
                  <Input value={editCountry} onChange={(e) => setEditCountry(e.target.value)} className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Success Rate (%)</Label>
                  <Input type="number" value={editSuccessRate} onChange={(e) => setEditSuccessRate(e.target.value)} className="h-8 text-sm" min="0" max="100" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Languages (comma-separated)</Label>
                <Input value={editLanguages} onChange={(e) => setEditLanguages(e.target.value)} className="h-8 text-sm" placeholder="English, Swahili" />
              </div>
              <Separator />
              <h4 className="font-semibold text-sm">Contact Info</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">WhatsApp</Label>
                  <Input value={editWhatsapp} onChange={(e) => setEditWhatsapp(e.target.value)} className="h-8 text-sm" placeholder="+254..." />
                </div>
                <div>
                  <Label className="text-xs">Telegram</Label>
                  <Input value={editTelegram} onChange={(e) => setEditTelegram(e.target.value)} className="h-8 text-sm" placeholder="@username" />
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">LinkedIn</Label>
                  <Input value={editLinkedin} onChange={(e) => setEditLinkedin(e.target.value)} className="h-8 text-sm" placeholder="linkedin.com/in/..." />
                </div>
              </div>
              <Button className="w-full" onClick={handleSaveProfile} disabled={saving}>
                <Save size={14} className="mr-1" /> {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Skills Manager */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Star size={18} /> Skills</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedSkillIds.map((skillId) => {
                  const skill = skills.find((s) => s.id === skillId)
                  if (!skill) return null
                  return (
                    <Badge key={skillId} variant="secondary" className="gap-1">
                      {skill.name}
                      <button onClick={() => setSelectedSkillIds(selectedSkillIds.filter((id) => id !== skillId))}>
                        <X size={10} />
                      </button>
                    </Badge>
                  )
                })}
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                {skills.filter((s) => !selectedSkillIds.includes(s.id)).map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => setSelectedSkillIds([...selectedSkillIds, skill.id])}
                    className="flex items-center gap-1.5 w-full text-left text-sm p-1.5 rounded hover:bg-muted transition-colors"
                  >
                    <Plus size={12} className="text-emerald-500" />
                    {skill.name}
                    {skill.category && <span className="text-xs text-muted-foreground">({skill.category})</span>}
                  </button>
                ))}
              </div>
              <Button className="w-full mt-4" onClick={handleSaveProfile} disabled={saving}>
                <Save size={14} className="mr-1" /> Save Skills
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Platform & Projects Manager */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CheckCircle2 size={18} /> Platforms & Projects</CardTitle></CardHeader>
            <CardContent className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
              {platforms.map((platform) => (
                <div key={platform.id} className="border rounded-lg p-3">
                  <h4 className="font-semibold text-sm mb-2">{platform.name}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {platform.projects.map((project) => {
                      const isSelected = selectedProjectIds.includes(project.id)
                      return (
                        <button
                          key={project.id}
                          onClick={() => {
                            setSelectedProjectIds(
                              isSelected
                                ? selectedProjectIds.filter((id) => id !== project.id)
                                : [...selectedProjectIds, project.id]
                            )
                          }}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            isSelected
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-300'
                              : 'bg-muted border-transparent hover:border-muted-foreground/30'
                          }`}
                        >
                          {project.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
              <Button className="w-full" onClick={handleSaveProfile} disabled={saving}>
                <Save size={14} className="mr-1" /> Save Platforms
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Portfolio & Subscription */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Upload size={18} /> Portfolio</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {profile.portfolioItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <span className="truncate">{item.title || item.mediaUrl}</span>
                </div>
              ))}
              {profile.portfolioItems.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">No portfolio items yet</p>
              )}
              <Separator />
              <h4 className="font-semibold text-sm">Add Portfolio Item</h4>
              <div>
                <Label className="text-xs">Title</Label>
                <Input value={portfolioTitle} onChange={(e) => setPortfolioTitle(e.target.value)} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">URL</Label>
                <Input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} className="h-8 text-sm" placeholder="https://..." />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Input value={portfolioDesc} onChange={(e) => setPortfolioDesc(e.target.value)} className="h-8 text-sm" />
              </div>
              <Button size="sm" onClick={handleAddPortfolio} disabled={!portfolioUrl}>
                <Plus size={14} className="mr-1" /> Add Item
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subscription & Verification */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">Subscription & Verification</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { tier: 'free', name: 'Free', price: 'KES 0', features: ['Basic profile', '3 skills', '1 platform'] },
                  { tier: 'verified', name: 'Verified', price: 'KES 499/mo', features: ['Verified badge', 'Contact info', '5 portfolio items'] },
                  { tier: 'premium', name: 'Premium', price: 'KES 999/mo', features: ['Premium badge', 'Featured listing', 'Unlimited portfolio'] },
                ].map((plan) => (
                  <div
                    key={plan.tier}
                    className={`border rounded-lg p-4 text-center ${
                      profile.subscriptionTier === plan.tier ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : ''
                    }`}
                  >
                    {profile.subscriptionTier === plan.tier && (
                      <Badge className="mb-2 bg-emerald-600">Current Plan</Badge>
                    )}
                    <h4 className="font-semibold">{plan.name}</h4>
                    <p className="text-sm font-bold text-emerald-600 my-2">{plan.price}</p>
                    <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                      {plan.features.map((f) => <li key={f}>{f}</li>)}
                    </ul>
                    {profile.subscriptionTier !== plan.tier && plan.tier !== 'free' && (
                      <Button size="sm" variant="outline" className="w-full">Upgrade</Button>
                    )}
                  </div>
                ))}
              </div>

              {!profile.isBadgeApproved && (
                <div className="mt-6 p-4 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Shield size={16} className="text-amber-500" />
                    Get Verified
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">
                    Submit evidence of your AI training work to get a verified badge that employers trust.
                  </p>
                  <Button size="sm" onClick={handleRequestVerification}>
                    Request Verification
                  </Button>
                </div>
              )}

              {profile.isBadgeApproved && (
                <div className="mt-6 p-4 border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg flex items-center gap-3">
                  {profile.subscriptionTier === 'premium' ? <PremiumBadge size={24} showText /> : <VerifiedBadge size={24} showText />}
                  <div>
                    <p className="font-semibold text-sm">You are verified!</p>
                    <p className="text-xs text-muted-foreground">Your badge is active and visible to employers</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
