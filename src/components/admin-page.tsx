'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, CheckCircle2, Star, DollarSign, AlertCircle, Plus, Trash2, Edit2, Save, X, Eye, Clock, Check, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { StatsSkeleton } from '@/components/loading-skeleton'

interface Stats {
  totalProfiles: number
  verifiedProfiles: number
  premiumProfiles: number
  pendingVerifications: number
  totalReviews: number
  revenue: number
}

interface VerificationRequest {
  id: string
  status: string
  adminNotes: string | null
  createdAt: string
  profile: {
    id: string
    fullName: string
    user: { email: string; name: string | null }
  }
}

interface PlatformData {
  id: string
  name: string
  slug: string
  icon: string | null
  isActive: boolean
  projects: { id: string; name: string; slug: string; description: string | null; isActive: boolean }[]
}

interface SkillData {
  id: string
  name: string
  slug: string
  category: string | null
  isActive: boolean
}

interface PlanData {
  id: string
  name: string
  slug: string
  tier: string
  duration: string
  price: number
  currency: string
  features: string
  isActive: boolean
}

export function AdminPage() {
  const { user } = useStore()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'stats' | 'verification' | 'platforms' | 'skills' | 'plans'>('stats')

  const [stats, setStats] = useState<Stats | null>(null)
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([])
  const [platforms, setPlatforms] = useState<PlatformData[]>([])
  const [allSkills, setAllSkills] = useState<SkillData[]>([])
  const [plans, setPlans] = useState<PlanData[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [newPlatformName, setNewPlatformName] = useState('')
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillCategory, setNewSkillCategory] = useState('')
  const [newPlanName, setNewPlanName] = useState('')
  const [newPlanTier, setNewPlanTier] = useState('verified')
  const [newPlanDuration, setNewPlanDuration] = useState('monthly')
  const [newPlanPrice, setNewPlanPrice] = useState('')
  const [newPlanFeatures, setNewPlanFeatures] = useState('')
  const [newProjectPlatformId, setNewProjectPlatformId] = useState('')
  const [newProjectName, setNewProjectName] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, verifRes, platformsRes, skillsRes, plansRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/verification'),
        fetch('/api/platforms'),
        fetch('/api/skills'),
        fetch('/api/subscription-plans'),
      ])
      setStats(await statsRes.json())
      setVerificationRequests(await verifRes.json())
      const p = await platformsRes.json()
      setPlatforms(p || [])
      setAllSkills(await skillsRes.json())
      setPlans(await plansRes.json())
    } catch (error) {
      console.error('Failed to load admin data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Shield size={48} className="mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
        <p className="text-muted-foreground mb-4">Login as admin to access this dashboard</p>
        <Button onClick={() => useStore.getState().setIsLoginOpen(true)}>Login as Admin</Button>
      </div>
    )
  }

  const handleVerification = async (id: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const res = await fetch('/api/admin/verification', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, adminNotes: notes }),
      })
      if (res.ok) {
        toast({ title: `Request ${status}`, description: `Verification request has been ${status}` })
        loadData()
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update verification', variant: 'destructive' })
    }
  }

  const handleAddPlatform = async () => {
    if (!newPlatformName) return
    try {
      const res = await fetch('/api/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlatformName }),
      })
      if (res.ok) {
        toast({ title: 'Platform Added' })
        setNewPlatformName('')
        loadData()
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const handleDeletePlatform = async (id: string) => {
    if (!confirm('Delete this platform and all its projects?')) return
    try {
      await fetch(`/api/platforms/${id}`, { method: 'DELETE' })
      toast({ title: 'Platform Deleted' })
      loadData()
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const handleAddProject = async () => {
    if (!newProjectPlatformId || !newProjectName) return
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformId: newProjectPlatformId, name: newProjectName }),
      })
      if (res.ok) {
        toast({ title: 'Project Added' })
        setNewProjectName('')
        loadData()
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const handleDeleteProject = async (id: string) => {
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      toast({ title: 'Project Deleted' })
      loadData()
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const handleAddSkill = async () => {
    if (!newSkillName) return
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSkillName, category: newSkillCategory || null }),
      })
      if (res.ok) {
        toast({ title: 'Skill Added' })
        setNewSkillName('')
        setNewSkillCategory('')
        loadData()
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const handleDeleteSkill = async (id: string) => {
    try {
      await fetch(`/api/skills/${id}`, { method: 'DELETE' })
      toast({ title: 'Skill Deleted' })
      loadData()
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const handleAddPlan = async () => {
    if (!newPlanName || !newPlanPrice) return
    try {
      const res = await fetch('/api/subscription-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlanName,
          tier: newPlanTier,
          duration: newPlanDuration,
          price: parseFloat(newPlanPrice),
          features: newPlanFeatures,
        }),
      })
      if (res.ok) {
        toast({ title: 'Plan Added' })
        setNewPlanName('')
        setNewPlanPrice('')
        setNewPlanFeatures('')
        loadData()
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const handleDeletePlan = async (id: string) => {
    try {
      await fetch(`/api/subscription-plans/${id}`, { method: 'DELETE' })
      toast({ title: 'Plan Deleted' })
      loadData()
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const handleToggleFeatured = async (profileId: string, isFeatured: boolean) => {
    try {
      await fetch('/api/admin/featured', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, isFeatured }),
      })
      toast({ title: isFeatured ? 'Featured' : 'Unfeatured' })
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const tabs = [
    { key: 'stats' as const, label: 'Stats', icon: Eye },
    { key: 'verification' as const, label: 'Verification', icon: CheckCircle2 },
    { key: 'platforms' as const, label: 'Platforms', icon: Star },
    { key: 'skills' as const, label: 'Skills', icon: Users },
    { key: 'plans' as const, label: 'Plans', icon: DollarSign },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon size={14} />
              {tab.label}
              {tab.key === 'verification' && verificationRequests.length > 0 && (
                <Badge className="h-5 min-w-5 flex items-center justify-center text-[10px] bg-red-500 text-white ml-1">
                  {verificationRequests.length}
                </Badge>
              )}
            </button>
          )
        })}
      </div>

      {loading ? (
        <StatsSkeleton />
      ) : (
        <>
          {/* Stats Tab */}
          {activeTab === 'stats' && stats && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Total Taskers', value: stats.totalProfiles, icon: Users, color: 'text-slate-600' },
                  { label: 'Verified', value: stats.verifiedProfiles, icon: CheckCircle2, color: 'text-emerald-600' },
                  { label: 'Premium', value: stats.premiumProfiles, icon: Star, color: 'text-amber-600' },
                  { label: 'Pending Verif.', value: stats.pendingVerifications, icon: Clock, color: 'text-orange-600' },
                  { label: 'Reviews', value: stats.totalReviews, icon: Star, color: 'text-sky-600' },
                  { label: 'Revenue (KES)', value: stats.revenue, icon: DollarSign, color: 'text-emerald-600' },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="p-4 text-center">
                      <stat.icon size={20} className={`mx-auto mb-2 ${stat.color}`} />
                      <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={async () => {
                      await fetch('/api/seed', { method: 'POST' })
                      toast({ title: 'Database seeded!' })
                      loadData()
                    }}>
                      Re-seed Database
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-lg font-semibold">Pending Verification Requests</h2>
              {verificationRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                    <p className="text-muted-foreground">No pending verification requests</p>
                  </CardContent>
                </Card>
              ) : (
                verificationRequests.map((req) => (
                  <Card key={req.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{req.profile.fullName}</h4>
                          <p className="text-sm text-muted-foreground">{req.profile.user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Submitted: {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleVerification(req.id, 'approved')}>
                            <Check size={14} className="mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleVerification(req.id, 'rejected')}>
                            <XCircle size={14} className="mr-1" /> Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </motion.div>
          )}

          {/* Platforms Tab */}
          {activeTab === 'platforms' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Add Platform */}
              <Card>
                <CardHeader><CardTitle className="text-lg">Add Platform</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input value={newPlatformName} onChange={(e) => setNewPlatformName(e.target.value)} placeholder="Platform name" className="h-8 text-sm" />
                    <Button size="sm" onClick={handleAddPlatform} disabled={!newPlatformName}>
                      <Plus size={14} className="mr-1" /> Add
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Add Project */}
              <Card>
                <CardHeader><CardTitle className="text-lg">Add Project</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <select value={newProjectPlatformId} onChange={(e) => setNewProjectPlatformId(e.target.value)} className="text-sm border rounded-lg px-2 py-1 bg-background">
                      <option value="">Select Platform</option>
                      {platforms.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <Input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="Project name" className="h-8 text-sm" />
                    <Button size="sm" onClick={handleAddProject} disabled={!newProjectPlatformId || !newProjectName}>
                      <Plus size={14} className="mr-1" /> Add
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Platform List */}
              {platforms.map((platform) => (
                <Card key={platform.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{platform.name}</h4>
                        <p className="text-xs text-muted-foreground">/{platform.slug} - {platform.projects.length} projects</p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeletePlatform(platform.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    {platform.projects.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {platform.projects.map((project) => (
                          <Badge key={project.id} variant="outline" className="text-xs gap-1">
                            {project.name}
                            <button onClick={() => handleDeleteProject(project.id)} className="hover:text-destructive">
                              <X size={8} />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Add Skill</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    <Input value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} placeholder="Skill name" className="h-8 text-sm w-40" />
                    <select value={newSkillCategory} onChange={(e) => setNewSkillCategory(e.target.value)} className="text-sm border rounded-lg px-2 py-1 bg-background">
                      <option value="">No category</option>
                      <option value="technical">Technical</option>
                      <option value="language">Language</option>
                      <option value="domain">Domain</option>
                    </select>
                    <Button size="sm" onClick={handleAddSkill} disabled={!newSkillName}>
                      <Plus size={14} className="mr-1" /> Add
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {allSkills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div>
                      <span className="text-sm font-medium">{skill.name}</span>
                      {skill.category && <span className="text-xs text-muted-foreground ml-2">({skill.category})</span>}
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => handleDeleteSkill(skill.id)}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Add Subscription Plan</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Tier</Label>
                      <select value={newPlanTier} onChange={(e) => setNewPlanTier(e.target.value)} className="w-full text-sm border rounded-lg px-2 py-1 bg-background">
                        <option value="verified">Verified</option>
                        <option value="premium">Premium</option>
                        <option value="featured">Featured</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Duration</Label>
                      <select value={newPlanDuration} onChange={(e) => setNewPlanDuration(e.target.value)} className="w-full text-sm border rounded-lg px-2 py-1 bg-background">
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Price (KES)</Label>
                      <Input type="number" value={newPlanPrice} onChange={(e) => setNewPlanPrice(e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-xs">Features (JSON array)</Label>
                      <Input value={newPlanFeatures} onChange={(e) => setNewPlanFeatures(e.target.value)} placeholder='["Feature 1","Feature 2"]' className="h-8 text-sm" />
                    </div>
                  </div>
                  <Button size="sm" className="mt-3" onClick={handleAddPlan} disabled={!newPlanName || !newPlanPrice}>
                    <Plus size={14} className="mr-1" /> Add Plan
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-2">
                {plans.map((plan) => (
                  <Card key={plan.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-sm">{plan.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {plan.tier} / {plan.duration} - {plan.currency} {plan.price}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={plan.isActive ? 'default' : 'secondary'} className="text-xs">
                            {plan.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => handleDeletePlan(plan.id)}>
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
