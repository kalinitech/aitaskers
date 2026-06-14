'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Search, ShieldCheck, MessageCircle, Globe, CheckCircle2, XCircle, ArrowRight, Sparkles, Users, Award, Zap, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TaskerCard } from '@/components/tasker-card'
import { CardSkeleton } from '@/components/loading-skeleton'
import { useStore } from '@/lib/store'

function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 2000
    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, target])

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

function FadeInUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function HomePage() {
  const { setView, setSelectedProfileId } = useStore()
  const [featuredTaskers, setFeaturedTaskers] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/profiles?verification=premium&sort=most_viewed&limit=6')
      .then((r) => r.json())
      .then((data) => {
        setFeaturedTaskers(data.profiles || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const goToBrowse = () => setView('browse')
  const goToDashboard = () => {
    const user = useStore.getState().user
    if (user) {
      setView('dashboard')
    } else {
      useStore.getState().setIsLoginOpen(true)
    }
  }

  return (
    <div className="overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 overflow-hidden">
        {/* Animated background dots */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles size={14} className="text-emerald-400" />
              <span className="text-emerald-300 text-sm font-medium">The #1 AI Trainer Directory</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6">
              Stop Searching Telegram.{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                Start Hiring Proven AI Trainers.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              The only directory where every badge is backed by real proof of work on Outlier, Handshake, DataAnnotation, RWS and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 text-base" onClick={goToBrowse}>
                <Search size={18} className="mr-2" />
                Find a Tasker
              </Button>
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 h-12 px-8 text-base" onClick={goToDashboard}>
                Create Profile
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* Animated Counters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-3xl mx-auto"
          >
            {[
              { label: 'Verified Taskers', value: 1200, suffix: '+', icon: Users },
              { label: 'Platforms Supported', value: 10, suffix: '+', icon: Globe },
              { label: 'Countries', value: 40, suffix: '+', icon: Award },
              { label: 'Tasks Completed', value: 50000, suffix: '+', icon: Zap },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <stat.icon size={16} className="text-emerald-400 mr-1.5" />
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== PROBLEM/AGITATION SECTION ===== */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            <FadeInUp>
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-red-900 dark:text-red-300 mb-4">
                  The old way is broken
                </h2>
                <ul className="space-y-3">
                  {[
                    'Spamming WhatsApp groups begging for referrals',
                    'No way to verify someone actually works on a platform',
                    'Unverified profiles with fake success rates',
                    'Wasted days onboarding untested freelancers',
                    'Scammers posing as experienced AI trainers',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-red-800 dark:text-red-200">
                      <XCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.2}>
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mb-4">
                  The AITaskers way
                </h2>
                <ul className="space-y-3">
                  {[
                    'Verified badges backed by screenshot evidence',
                    'Portfolio of real work on Outlier, Handshake, RWS',
                    'Direct contact with proven AI trainers',
                    'Browse, compare, and hire in minutes',
                    'Ratings and reviews from real employers',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-emerald-800 dark:text-emerald-200">
                      <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <FadeInUp>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Why Choose AITaskers?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We are not a freelancer marketplace. We are a verified directory where reputation is earned, not bought.
              </p>
            </div>
          </FadeInUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Verified Profiles',
                description: 'Every verified badge requires screenshot proof of platform work and admin review.',
                color: 'emerald',
              },
              {
                icon: Award,
                title: 'Proven Experience',
                description: 'See which platforms and projects each trainer works on, with portfolio evidence.',
                color: 'amber',
              },
              {
                icon: MessageCircle,
                title: 'Direct Contact',
                description: 'Reach trainers directly via WhatsApp, Telegram, or email. No middleman fees.',
                color: 'sky',
              },
              {
                icon: Globe,
                title: 'Global Talent',
                description: 'Access AI trainers from Kenya, Nigeria, India, Philippines, and 40+ countries.',
                color: 'violet',
              },
            ].map((item, i) => (
              <FadeInUp key={item.title} delay={i * 0.1}>
                <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
                  <Card className="h-full text-center p-6 hover:shadow-lg transition-shadow">
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                      item.color === 'emerald' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' :
                      item.color === 'amber' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400' :
                      item.color === 'sky' ? 'bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400' :
                      'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400'
                    }`}>
                      <item.icon size={28} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </Card>
                </motion.div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PREMIUM TASKERS ===== */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <FadeInUp>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Premium Taskers</h2>
                <p className="text-muted-foreground">Top-rated verified AI trainers available now</p>
              </div>
              <Button variant="outline" onClick={goToBrowse} className="hidden sm:flex">
                View All <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </FadeInUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)
            ) : featuredTaskers.length > 0 ? (
              featuredTaskers.map((profile: unknown) => (
                <TaskerCard key={(profile as { id: string }).id} profile={profile as Parameters<typeof TaskerCard>[0]['profile']} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No featured taskers yet. Be the first!
              </div>
            )}
          </div>

          <div className="text-center mt-6 sm:hidden">
            <Button variant="outline" onClick={goToBrowse}>
              View All Taskers <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* ===== PLATFORM LOGOS ===== */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="max-w-6xl mx-auto px-4">
          <FadeInUp>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Platforms We Support</h2>
              <p className="text-muted-foreground text-sm">AI trainers from all major RLHF and data annotation platforms</p>
            </div>
          </FadeInUp>
          <div className="flex flex-wrap justify-center gap-3">
            {['Outlier AI', 'Handshake AI', 'DataAnnotation', 'Alignerr', 'RWS', 'Afterquery', 'Appen', 'Scale AI', 'UHRS', 'Micro1'].map((name, i) => (
              <FadeInUp key={name} delay={i * 0.05}>
                <div className="px-4 py-2.5 bg-background border rounded-lg text-sm font-medium hover:border-emerald-300 hover:shadow-sm transition-all cursor-default">
                  {name}
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING SECTION ===== */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4">
          <FadeInUp>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Start free. Upgrade when you are ready to stand out and get hired faster.
              </p>
            </div>
          </FadeInUp>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Free',
                price: '0',
                period: '',
                description: 'Get started with a basic profile',
                features: ['Basic profile listing', 'Up to 3 skills', '1 platform', 'Community access'],
                cta: 'Create Free Profile',
                highlight: false,
                color: 'slate',
              },
              {
                name: 'Verified',
                price: '499',
                period: '/mo',
                description: 'Stand out with a verified badge',
                features: ['Verified badge with proof', 'Contact info visible', 'Profile priority', 'Up to 5 portfolio items', 'All platforms & skills'],
                cta: 'Get Verified',
                highlight: true,
                color: 'emerald',
                badge: 'Most Popular',
              },
              {
                name: 'Premium',
                price: '999',
                period: '/mo',
                description: 'Maximum visibility and features',
                features: ['Premium gold badge', 'All Verified features', 'Featured in browse', 'Unlimited portfolio', 'Priority support', 'Analytics dashboard'],
                cta: 'Go Premium',
                highlight: false,
                color: 'amber',
              },
            ].map((plan, i) => (
              <FadeInUp key={plan.name} delay={i * 0.15}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <Card className={`h-full relative overflow-hidden ${plan.highlight ? 'border-emerald-500 border-2 shadow-lg shadow-emerald-100 dark:shadow-emerald-950/30' : ''}`}>
                    {plan.badge && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        {plan.badge}
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                      <div className="mb-6">
                        <span className="text-sm text-muted-foreground">KES </span>
                        <span className="text-4xl font-bold">{plan.price}</span>
                        {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                      </div>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 size={14} className={plan.color === 'emerald' ? 'text-emerald-500' : plan.color === 'amber' ? 'text-amber-500' : 'text-slate-400'} />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full"
                        variant={plan.highlight ? 'default' : 'outline'}
                        onClick={goToDashboard}
                      >
                        {plan.cta}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOR TASKERS CTA ===== */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-emerald-950 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FadeInUp>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              You have the skills. Get hired for them.
            </h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of AI trainers who have already built their verified profiles on AITaskers.
            </p>
            <ul className="text-left max-w-md mx-auto space-y-3 mb-8">
              {[
                'Showcase your work across 10+ AI platforms',
                'Get a verified badge that employers trust',
                'Receive direct inquiries from serious employers',
                'Build your reputation with reviews and ratings',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-200">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8" onClick={goToDashboard}>
              Create Your Profile <ArrowRight size={18} className="ml-2" />
            </Button>
          </FadeInUp>
        </div>
      </section>

      {/* ===== TRUST SECTION ===== */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FadeInUp>
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-full px-4 py-1.5 mb-6">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">Trust & Verification</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Verified by evidence, not just payment</h2>
            <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
              Unlike other platforms where anyone can pay for a badge, AITaskers requires real proof of work.
            </p>
          </FadeInUp>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Submit Evidence', description: 'Upload screenshots from your platform dashboard showing active projects and performance.' },
              { step: '2', title: 'Admin Review', description: 'Our team reviews each submission to verify authenticity and work quality.' },
              { step: '3', title: 'Get Badge', description: 'Once approved, your verified badge is displayed on your profile for all employers to see.' },
            ].map((item, i) => (
              <FadeInUp key={item.step} delay={i * 0.15}>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
