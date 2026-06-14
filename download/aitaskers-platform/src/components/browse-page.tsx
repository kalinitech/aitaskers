'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { TaskerCard } from '@/components/tasker-card'
import { CardSkeleton } from '@/components/loading-skeleton'
import { useStore } from '@/lib/store'

interface Platform {
  id: string
  name: string
  slug: string
  projects: { id: string; name: string; slug: string }[]
}

interface Skill {
  id: string
  name: string
  slug: string
  category: string | null
}

export function BrowsePage() {
  const { filters, setFilters, clearFilters } = useStore()
  const [profiles, setProfiles] = useState<unknown[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sort, setSort] = useState('newest')
  const [mobileFilters, setMobileFilters] = useState(false)
  const [expandedPlatforms, setExpandedPlatforms] = useState<Record<string, boolean>>({})

  useEffect(() => {
    Promise.all([
      fetch('/api/platforms').then((r) => r.json()),
      fetch('/api/skills').then((r) => r.json()),
    ]).then(([platformsData, skillsData]) => {
      setPlatforms(platformsData || [])
      setSkills(skillsData || [])
    })
  }, [])

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.platforms.length > 0) params.set('platform', filters.platforms.join(','))
      if (filters.skills.length > 0) params.set('skill', filters.skills.join(','))
      if (filters.countries.length > 0) params.set('country', filters.countries.join(','))
      if (filters.verification !== 'all') params.set('verification', filters.verification)
      if (filters.search) params.set('search', filters.search)
      params.set('sort', sort)
      params.set('page', page.toString())
      params.set('limit', '12')

      const res = await fetch(`/api/profiles?${params}`)
      const data = await res.json()
      setProfiles(data.profiles || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch profiles:', error)
    } finally {
      setLoading(false)
    }
  }, [filters, sort, page])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  useEffect(() => {
    setPage(1)
  }, [filters, sort])

  const togglePlatform = (slug: string) => {
    setFilters({
      platforms: filters.platforms.includes(slug)
        ? filters.platforms.filter((p) => p !== slug)
        : [...filters.platforms, slug],
    })
  }

  const toggleSkill = (slug: string) => {
    setFilters({
      skills: filters.skills.includes(slug)
        ? filters.skills.filter((s) => s !== slug)
        : [...filters.skills, slug],
    })
  }

  const toggleCountry = (country: string) => {
    setFilters({
      countries: filters.countries.includes(country)
        ? filters.countries.filter((c) => c !== country)
        : [...filters.countries, country],
    })
  }

  const countries = ['Kenya', 'Nigeria', 'India', 'Philippines', 'USA', 'UK', 'Global']

  const activeFilterCount = filters.platforms.length + filters.skills.length + filters.countries.length + (filters.verification !== 'all' ? 1 : 0)

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or skill..."
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="pl-9"
        />
      </div>

      {/* Verification Filter */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Verification</h3>
        <RadioGroup value={filters.verification} onValueChange={(v) => setFilters({ verification: v })}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="text-sm">All Taskers</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="verified" id="verified" />
            <Label htmlFor="verified" className="text-sm">Verified Only</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="premium" id="premium" />
            <Label htmlFor="premium" className="text-sm">Premium Only</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Platform Filter */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Platforms</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {platforms.map((platform) => (
            <div key={platform.id}>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`platform-${platform.slug}`}
                  checked={filters.platforms.includes(platform.slug)}
                  onCheckedChange={() => togglePlatform(platform.slug)}
                />
                <Label
                  htmlFor={`platform-${platform.slug}`}
                  className="text-sm flex-1 cursor-pointer"
                >
                  {platform.name}
                </Label>
                {platform.projects.length > 0 && (
                  <button
                    onClick={() => setExpandedPlatforms((prev) => ({ ...prev, [platform.id]: !prev[platform.id] }))}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {expandedPlatforms[platform.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}
              </div>
              <AnimatePresence>
                {expandedPlatforms[platform.id] && platform.projects.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ml-6 overflow-hidden"
                  >
                    {platform.projects.map((project) => (
                      <div key={project.id} className="text-xs text-muted-foreground py-0.5">
                        {project.name}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Filter */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Skills</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {skills.map((skill) => (
            <div key={skill.id} className="flex items-center gap-2">
              <Checkbox
                id={`skill-${skill.slug}`}
                checked={filters.skills.includes(skill.slug)}
                onCheckedChange={() => toggleSkill(skill.slug)}
              />
              <Label htmlFor={`skill-${skill.slug}`} className="text-sm cursor-pointer">
                {skill.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Country Filter */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Country</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {countries.map((country) => (
            <div key={country} className="flex items-center gap-2">
              <Checkbox
                id={`country-${country}`}
                checked={filters.countries.includes(country)}
                onCheckedChange={() => toggleCountry(country)}
              />
              <Label htmlFor={`country-${country}`} className="text-sm cursor-pointer">
                {country}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
          <RotateCcw size={14} className="mr-1" />
          Clear All Filters ({activeFilterCount})
        </Button>
      )}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Browse AI Taskers</h1>
          <p className="text-sm text-muted-foreground">
            Showing {total} tasker{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile filter toggle */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileFilters(!mobileFilters)}
          >
            <SlidersHorizontal size={14} className="mr-1" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 bg-background"
          >
            <option value="newest">Newest</option>
            <option value="highest_rated">Highest Rated</option>
            <option value="most_viewed">Most Viewed</option>
            <option value="premium_first">Premium First</option>
          </select>
        </div>
      </div>

      {/* Active Filters Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {filters.platforms.map((slug) => {
            const platform = platforms.find((p) => p.slug === slug)
            return platform ? (
              <Badge key={slug} variant="secondary" className="text-xs gap-1">
                {platform.name}
                <button onClick={() => togglePlatform(slug)}><X size={10} /></button>
              </Badge>
            ) : null
          })}
          {filters.skills.map((slug) => {
            const skill = skills.find((s) => s.slug === slug)
            return skill ? (
              <Badge key={slug} variant="secondary" className="text-xs gap-1">
                {skill.name}
                <button onClick={() => toggleSkill(slug)}><X size={10} /></button>
              </Badge>
            ) : null
          })}
          {filters.countries.map((c) => (
            <Badge key={c} variant="secondary" className="text-xs gap-1">
              {c}
              <button onClick={() => toggleCountry(c)}><X size={10} /></button>
            </Badge>
          ))}
          {filters.verification !== 'all' && (
            <Badge variant="secondary" className="text-xs gap-1">
              {filters.verification === 'verified' ? 'Verified' : 'Premium'}
              <button onClick={() => setFilters({ verification: 'all' })}><X size={10} /></button>
            </Badge>
          )}
        </div>
      )}

      <div className="flex gap-6">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-20 bg-card border rounded-xl p-4">
            <FilterSidebar />
          </div>
        </div>

        {/* Mobile Filters Sheet */}
        <AnimatePresence>
          {mobileFilters && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="fixed inset-0 z-50 lg:hidden"
            >
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilters(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-80 bg-background p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Filters</h2>
                  <Button variant="ghost" size="sm" onClick={() => setMobileFilters(false)}>
                    <X size={18} />
                  </Button>
                </div>
                <FilterSidebar />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : profiles.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {profiles.map((profile: unknown) => (
                  <TaskerCard key={(profile as { id: string }).id} profile={profile as Parameters<typeof TaskerCard>[0]['profile']} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <Search size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-1">No taskers found</h3>
              <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <RotateCcw size={14} className="mr-1" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
