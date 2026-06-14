import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await prisma.review.deleteMany()
  await prisma.verificationRequest.deleteMany()
  await prisma.portfolioItem.deleteMany()
  await prisma.profilePlatformProject.deleteMany()
  await prisma.profileSkill.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()
  await prisma.project.deleteMany()
  await prisma.platform.deleteMany()
  await prisma.skill.deleteMany()
  await prisma.subscriptionPlan.deleteMany()
  await prisma.siteSetting.deleteMany()

  // ============ PLATFORMS & PROJECTS ============
  const platformsData = [
    { name: 'Outlier AI', slug: 'outlier-ai', projects: ['Aether', 'Bulba', 'Flamingo', 'Guitar', 'Dolphin', 'T-Rex', 'Oneroi'] },
    { name: 'Handshake AI', slug: 'handshake-ai', projects: ['Hedgehog', 'Ivy', 'Cedar', 'Marigold'] },
    { name: 'DataAnnotation', slug: 'dataannotation', projects: ['Oasis Series', 'Crux/Coding Series', 'Walnut', 'Gold/Verification'] },
    { name: 'Alignerr', slug: 'alignerr', projects: ['Orion', 'Fireweed', 'Spearmint', 'LLM Voyager'] },
    { name: 'RWS', slug: 'rws', projects: ['Project Diamond'] },
    { name: 'Afterquery', slug: 'afterquery', projects: ['Blueprint Project'] },
    { name: 'Appen', slug: 'appen', projects: ['Crescent', 'Nile'] },
    { name: 'Scale AI', slug: 'scale-ai', projects: ['Remotasks', 'Outlier Legacy'] },
    { name: 'UHRS', slug: 'uhrs', projects: ['Search Evaluation', 'Relevance Rating'] },
    { name: 'Micro1', slug: 'micro1', projects: ['Developer Tasks'] },
  ]

  const platforms: Record<string, string> = {}
  const projectsMap: Record<string, string> = {}

  for (let i = 0; i < platformsData.length; i++) {
    const p = platformsData[i]
    const platform = await prisma.platform.create({
      data: {
        name: p.name,
        slug: p.slug,
        isActive: true,
        sortOrder: i,
      },
    })
    platforms[p.slug] = platform.id

    for (let j = 0; j < p.projects.length; j++) {
      const projName = p.projects[j]
      const project = await prisma.project.create({
        data: {
          platformId: platform.id,
          name: projName,
          slug: projName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, ''),
          isActive: true,
          sortOrder: j,
        },
      })
      projectsMap[`${p.slug}-${projName}`] = project.id
    }
  }

  // ============ SKILLS ============
  const skillsData = [
    { name: 'Coding', slug: 'coding', category: 'technical' },
    { name: 'Math', slug: 'math', category: 'technical' },
    { name: 'Physics', slug: 'physics', category: 'domain' },
    { name: 'Chemistry', slug: 'chemistry', category: 'domain' },
    { name: 'Biology', slug: 'biology', category: 'domain' },
    { name: 'Translation', slug: 'translation', category: 'language' },
    { name: 'Linguistics', slug: 'linguistics', category: 'language' },
    { name: 'Reasoning', slug: 'reasoning', category: 'technical' },
    { name: 'Creative Writing', slug: 'creative-writing', category: 'language' },
    { name: 'Data Annotation', slug: 'data-annotation', category: 'technical' },
    { name: 'RLHF', slug: 'rlhf', category: 'technical' },
    { name: 'Multimodal', slug: 'multimodal', category: 'technical' },
    { name: 'Search Evaluation', slug: 'search-evaluation', category: 'technical' },
    { name: 'Fact Verification', slug: 'fact-verification', category: 'technical' },
  ]

  const skills: Record<string, string> = {}
  for (const s of skillsData) {
    const skill = await prisma.skill.create({ data: s })
    skills[s.slug] = skill.id
  }

  // ============ SUBSCRIPTION PLANS ============
  const plansData = [
    { name: 'Verified Monthly', slug: 'verified-monthly', tier: 'verified', duration: 'monthly', price: 499, features: '["Verified badge","Contact info visible","Profile priority","Portfolio uploads (up to 5)"]', sortOrder: 0 },
    { name: 'Verified Yearly', slug: 'verified-yearly', tier: 'verified', duration: 'yearly', price: 4999, features: '["Verified badge","Contact info visible","Profile priority","Portfolio uploads (up to 5)","Save 16% vs monthly"]', sortOrder: 1 },
    { name: 'Premium Monthly', slug: 'premium-monthly', tier: 'premium', duration: 'monthly', price: 999, features: '["Premium badge","All verified features","Featured in browse","Unlimited portfolio","Priority support","Analytics dashboard"]', sortOrder: 2 },
    { name: 'Premium Yearly', slug: 'premium-yearly', tier: 'premium', duration: 'yearly', price: 9999, features: '["Premium badge","All verified features","Featured in browse","Unlimited portfolio","Priority support","Analytics dashboard","Save 17% vs monthly"]', sortOrder: 3 },
    { name: 'Featured Weekly', slug: 'featured-weekly', tier: 'featured', duration: 'weekly', price: 300, features: '["Featured placement for 7 days","Homepage spotlight","Top of browse results"]', sortOrder: 4 },
    { name: 'Featured Monthly', slug: 'featured-monthly', tier: 'featured', duration: 'monthly', price: 1000, features: '["Featured placement for 30 days","Homepage spotlight","Top of browse results","Save 17% vs weekly"]', sortOrder: 5 },
  ]

  for (const plan of plansData) {
    await prisma.subscriptionPlan.create({ data: plan })
  }

  // ============ ADMIN USER ============
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@aitaskers.com',
      name: 'Admin',
      passwordHash: 'admin123',
      role: 'admin',
    },
  })

  // ============ DEMO TASKER USERS & PROFILES ============
  const taskersData = [
    {
      email: 'grace@aitaskers.com',
      name: 'Grace Wanjiku',
      passwordHash: 'password123',
      profile: {
        fullName: 'Grace Wanjiku',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Grace',
        country: 'Kenya',
        languages: 'English, Swahili, French',
        successRate: 94.5,
        bio: 'Experienced AI trainer specializing in coding and math tasks on Outlier AI. Over 2 years of consistent high-quality RLHF work with expertise in Python, JavaScript, and algorithm design. Top performer on Aether and Bulba projects.',
        subscriptionTier: 'premium',
        isBadgeApproved: true,
        isFeatured: true,
        profileViews: 1247,
        contactWhatsapp: '+254712345678',
        contactTelegram: '@gracewanjiku',
        contactEmail: 'grace@aitaskers.com',
        contactLinkedin: 'linkedin.com/in/gracewanjiku',
      },
      skills: ['coding', 'math', 'reasoning', 'rlhf'],
      platformProjects: ['outlier-ai-Aether', 'outlier-ai-Bulba', 'outlier-ai-Flamingo', 'scale-ai-Remotasks'],
      portfolioItems: [
        { title: 'Aether Project Stats', description: 'My performance dashboard on Aether project', mediaUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=aether1', mediaType: 'image' },
        { title: 'Bulba Task Examples', description: 'Sample completed tasks from Bulba', mediaUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=bulba1', mediaType: 'image' },
      ],
      reviews: [
        { reviewerName: 'TechCorp Ltd', rating: 5, comment: 'Outstanding work on our coding tasks. Very professional and reliable.' },
        { reviewerName: 'AI Solutions Inc', rating: 5, comment: 'Grace consistently delivers high-quality RLHF annotations. Highly recommended!' },
        { reviewerName: 'DataDriven Co', rating: 4, comment: 'Great communication and excellent results on math reasoning tasks.' },
      ],
    },
    {
      email: 'raj@aitaskers.com',
      name: 'Raj Patel',
      passwordHash: 'password123',
      profile: {
        fullName: 'Raj Patel',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raj',
        country: 'India',
        languages: 'English, Hindi, Gujarati',
        successRate: 91.2,
        bio: 'Multilingual AI trainer with expertise in linguistics and translation. Working across Handshake AI and DataAnnotation platforms. Specialized in multilingual RLHF and cross-cultural reasoning tasks.',
        subscriptionTier: 'verified',
        isBadgeApproved: true,
        isFeatured: false,
        profileViews: 856,
        contactWhatsapp: '+919876543210',
        contactTelegram: '@rajpatel',
        contactEmail: 'raj@aitaskers.com',
        contactLinkedin: 'linkedin.com/in/rajpatel',
      },
      skills: ['linguistics', 'translation', 'reasoning', 'rlhf'],
      platformProjects: ['handshake-ai-Hedgehog', 'handshake-ai-Ivy', 'dataannotation-Oasis Series', 'dataannotation-Walnut'],
      portfolioItems: [
        { title: 'Translation Quality Report', description: 'Quality metrics for Hindi-English translations', mediaUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=trans1', mediaType: 'image' },
      ],
      reviews: [
        { reviewerName: 'LinguaAI', rating: 5, comment: 'Exceptional translation quality. Raj understands cultural nuances perfectly.' },
        { reviewerName: 'GlobalData Corp', rating: 4, comment: 'Very reliable for multilingual annotation tasks.' },
      ],
    },
    {
      email: 'amara@aitaskers.com',
      name: 'Amara Okonkwo',
      passwordHash: 'password123',
      profile: {
        fullName: 'Amara Okonkwo',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amara',
        country: 'Nigeria',
        languages: 'English, Yoruba, Igbo',
        successRate: 88.7,
        bio: 'AI trainer specializing in creative writing and fact verification. Experienced with Alignerr and RWS platforms. Strong background in content evaluation and quality assurance for LLM training data.',
        subscriptionTier: 'verified',
        isBadgeApproved: true,
        isFeatured: true,
        profileViews: 634,
        contactWhatsapp: '+2348123456789',
        contactTelegram: '@amaraokonkwo',
        contactEmail: 'amara@aitaskers.com',
        contactLinkedin: 'linkedin.com/in/amaraokonkwo',
      },
      skills: ['creative-writing', 'fact-verification', 'data-annotation', 'reasoning'],
      platformProjects: ['alignerr-Orion', 'alignerr-Fireweed', 'rws-Project Diamond'],
      portfolioItems: [
        { title: 'Creative Writing Samples', description: 'Example RLHF responses for creative tasks', mediaUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=creative1', mediaType: 'image' },
      ],
      reviews: [
        { reviewerName: 'ContentAI Ltd', rating: 5, comment: 'Amara creative writing evaluations are top-notch!' },
        { reviewerName: 'VerifyAI', rating: 4, comment: 'Thorough and accurate fact-checking work.' },
      ],
    },
    {
      email: 'maria@aitaskers.com',
      name: 'Maria Santos',
      passwordHash: 'password123',
      profile: {
        fullName: 'Maria Santos',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
        country: 'Philippines',
        languages: 'English, Filipino, Spanish',
        successRate: 92.1,
        bio: 'Specialized in search evaluation and data annotation with 3+ years on UHRS and Appen. Known for consistency and high throughput. Expert in relevance rating and quality assessment.',
        subscriptionTier: 'premium',
        isBadgeApproved: true,
        isFeatured: true,
        profileViews: 1089,
        contactWhatsapp: '+639171234567',
        contactTelegram: '@mariasantos',
        contactEmail: 'maria@aitaskers.com',
        contactLinkedin: 'linkedin.com/in/mariasantos',
      },
      skills: ['search-evaluation', 'data-annotation', 'multimodal', 'rlhf'],
      platformProjects: ['uhrs-Search Evaluation', 'uhrs-Relevance Rating', 'appen-Crescent', 'appen-Nile'],
      portfolioItems: [
        { title: 'UHRS Performance Metrics', description: 'Weekly performance dashboard from UHRS', mediaUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=uhrs1', mediaType: 'image' },
        { title: 'Appen Task Completion', description: 'Task completion and quality scores', mediaUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=appen1', mediaType: 'image' },
      ],
      reviews: [
        { reviewerName: 'SearchQuality Inc', rating: 5, comment: 'Maria is our go-to evaluator. Always consistent and accurate.' },
        { reviewerName: 'DataLabel Pro', rating: 5, comment: 'Incredible throughput without sacrificing quality!' },
        { reviewerName: 'AIEval Corp', rating: 4, comment: 'Very reliable for search relevance tasks.' },
      ],
    },
    {
      email: 'james@aitaskers.com',
      name: 'James Ochieng',
      passwordHash: 'password123',
      profile: {
        fullName: 'James Ochieng',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
        country: 'Kenya',
        languages: 'English, Swahili, Luo',
        successRate: 78.3,
        bio: 'Starting my AI training journey on Outlier AI and Scale AI. Focused on coding and reasoning tasks. Looking to build my portfolio and gain more experience in RLHF work.',
        subscriptionTier: 'free',
        isBadgeApproved: false,
        isFeatured: false,
        profileViews: 234,
        contactWhatsapp: '+254798765432',
        contactEmail: 'james@aitaskers.com',
      },
      skills: ['coding', 'reasoning'],
      platformProjects: ['outlier-ai-Guitar', 'outlier-ai-Dolphin', 'scale-ai-Remotasks'],
      portfolioItems: [],
      reviews: [
        { reviewerName: 'StartupAI', rating: 4, comment: 'Good potential, improving quickly with each task.' },
      ],
    },
    {
      email: 'chen@aitaskers.com',
      name: 'Chen Wei',
      passwordHash: 'password123',
      profile: {
        fullName: 'Chen Wei',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chen',
        country: 'Global',
        languages: 'English, Mandarin, Japanese',
        successRate: 96.3,
        bio: 'Senior AI trainer with expertise in STEM subjects. PhD in Physics with extensive experience on Outlier AI and Alignerr. Specialized in math, physics, and chemistry evaluation tasks. Premium member with verified track record.',
        subscriptionTier: 'premium',
        isBadgeApproved: true,
        isFeatured: true,
        profileViews: 2103,
        contactWhatsapp: '+8613812345678',
        contactTelegram: '@chenwei',
        contactEmail: 'chen@aitaskers.com',
        contactLinkedin: 'linkedin.com/in/chenwei',
      },
      skills: ['math', 'physics', 'chemistry', 'coding', 'reasoning'],
      platformProjects: ['outlier-ai-Aether', 'outlier-ai-T-Rex', 'outlier-ai-Oneroi', 'alignerr-LLM Voyager', 'alignerr-Spearmint'],
      portfolioItems: [
        { title: 'Physics Evaluation Samples', description: 'Example physics problem evaluations', mediaUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=physics1', mediaType: 'image' },
        { title: 'Math Reasoning Tasks', description: 'Completed math reasoning examples', mediaUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=math1', mediaType: 'image' },
        { title: 'Chemistry Annotations', description: 'Chemistry domain annotation work', mediaUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=chem1', mediaType: 'image' },
      ],
      reviews: [
        { reviewerName: 'STEMAI Corp', rating: 5, comment: 'Chen is exceptional. PhD-level understanding makes a real difference in quality.' },
        { reviewerName: 'ReasonLab', rating: 5, comment: 'The best math/physics evaluator we have worked with.' },
        { reviewerName: 'DeepMind Eval', rating: 5, comment: 'Outstanding quality across all STEM domains.' },
        { reviewerName: 'AlgebraAI', rating: 4, comment: 'Very thorough and precise in all evaluations.' },
      ],
    },
  ]

  for (const tasker of taskersData) {
    const user = await prisma.user.create({
      data: {
        email: tasker.email,
        name: tasker.name,
        passwordHash: tasker.passwordHash,
        role: 'tasker',
      },
    })

    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        ...tasker.profile,
      },
    })

    // Add skills
    for (const skillSlug of tasker.skills) {
      if (skills[skillSlug]) {
        await prisma.profileSkill.create({
          data: {
            profileId: profile.id,
            skillId: skills[skillSlug],
          },
        })
      }
    }

    // Add platform projects
    for (const ppKey of tasker.platformProjects) {
      if (projectsMap[ppKey]) {
        await prisma.profilePlatformProject.create({
          data: {
            profileId: profile.id,
            projectId: projectsMap[ppKey],
          },
        })
      }
    }

    // Add portfolio items
    for (let i = 0; i < tasker.portfolioItems.length; i++) {
      const item = tasker.portfolioItems[i]
      await prisma.portfolioItem.create({
        data: {
          profileId: profile.id,
          title: item.title,
          description: item.description,
          mediaUrl: item.mediaUrl,
          mediaType: item.mediaType,
          sortOrder: i,
        },
      })
    }

    // Add reviews
    for (const review of tasker.reviews) {
      await prisma.review.create({
        data: {
          reviewedProfileId: profile.id,
          reviewerName: review.reviewerName,
          rating: review.rating,
          comment: review.comment,
        },
      })
    }
  }

  // ============ SITE SETTINGS ============
  const siteSettings = [
    { key: 'site_name', value: 'AITaskers' },
    { key: 'tagline', value: 'Verified by evidence, not just payment' },
    { key: 'hero_title', value: 'Stop Searching Telegram. Start Hiring Proven AI Trainers.' },
    { key: 'hero_subtitle', value: 'The only directory where every badge is backed by real proof of work on Outlier, Handshake, DataAnnotation, RWS and more.' },
    { key: 'featured_count', value: '1200+' },
    { key: 'verified_count', value: '850+' },
    { key: 'platforms_count', value: '10+' },
    { key: 'countries_count', value: '40+' },
    { key: 'contact_email', value: 'hello@aitaskers.com' },
    { key: 'whatsapp_link', value: 'https://wa.me/254712345678' },
  ]

  for (const setting of siteSettings) {
    await prisma.siteSetting.create({ data: setting })
  }

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
