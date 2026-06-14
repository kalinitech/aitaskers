# AITaskers - Deployment Guide & System Walkthrough

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Local Development Setup](#local-development-setup)
5. [Production Deployment (Vercel + Supabase)](#production-deployment)
6. [Environment Variables](#environment-variables)
7. [Database Schema](#database-schema)
8. [Seeding the Database](#seeding-the-database)
9. [System Walkthrough](#system-walkthrough)
10. [API Reference](#api-reference)
11. [Admin Guide](#admin-guide)
12. [Monetization Setup](#monetization-setup)
13. [Customization](#customization)
14. [Troubleshooting](#troubleshooting)

---

## Project Overview

**AITaskers** is a verified AI trainer/talent directory platform. It connects employers seeking skilled AI trainers with verified professionals who work on platforms like Outlier, Handshake, DataAnnotation, RWS, Alignerr, Appen, Scale AI, UHRS, Micro1, and Afterquery.

### Key Differentiators
- **NOT a freelancer marketplace** - No payments, escrow, or disputes
- **Verification by evidence** - Badges earned through proof of work, not just payment
- **Direct contact** - Employers contact taskers directly via WhatsApp, Telegram, Email, LinkedIn
- **Platform-specific filtering** - Filter by AI training platform AND specific projects within each

### Monetization Model
| Tier | Price | Features |
|------|-------|----------|
| **Free** | KES 0 | Basic profile, 1 platform, 3 screenshots, limited visibility |
| **Verified** | KES 499/mo or KES 4,999/yr | Verification badge, contact info visible, priority ranking, portfolio |
| **Premium** | KES 999/mo or KES 9,999/yr | Premium badge, homepage featured, top search ranking, analytics |
| **Featured Ad** | KES 300/wk or KES 1,000/mo | Dedicated featured section placement |

---

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | Full-stack React framework |
| **Language** | TypeScript 5 | Type safety |
| **Styling** | Tailwind CSS 4 | Utility-first CSS |
| **UI Components** | shadcn/ui | Professional component library |
| **Database** | SQLite (dev) / PostgreSQL via Supabase (prod) | Data persistence |
| **ORM** | Prisma | Database operations |
| **State Management** | Zustand | Client state |
| **Data Fetching** | TanStack Query | Server state caching |
| **Animations** | Framer Motion | Smooth transitions |
| **Payments** | Paystack (ready to integrate) | KES currency support |
| **Hosting** | Vercel | Free deployment |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  ┌──────┐ ┌────────┐ ┌─────────┐ ┌───────────┐ │
│  │ Home │ │ Browse │ │ Profile │ │ Dashboard  │ │
│  │ Page │ │  Page  │ │  Page   │ │    Page    │ │
│  └──────┘ └────────┘ └─────────┘ └───────────┘ │
│  ┌────────────────┐ ┌──────────────────────────┐│
│  │  Admin Panel   │ │  Shared Components       ││
│  │  (CRUD+Stats)  │ │  (Cards, Badges, etc.)   ││
│  └────────────────┘ └──────────────────────────┘│
├─────────────────────────────────────────────────┤
│              API Layer (Next.js API Routes)       │
│  /api/profiles  /api/platforms  /api/skills      │
│  /api/reviews   /api/auth       /api/admin/*     │
│  /api/subscription-plans  /api/seed              │
├─────────────────────────────────────────────────┤
│              Database (Prisma ORM)                │
│  SQLite (dev) │ PostgreSQL via Supabase (prod)   │
└─────────────────────────────────────────────────┘
```

### View Navigation (Single-Page Architecture)
The app uses Zustand store for client-side view switching:
- `home` → Homepage with hero, featured taskers, pricing
- `browse` → Browse/filter taskers with sidebar filters
- `profile` → Individual tasker profile view
- `dashboard` → Tasker self-service dashboard
- `admin` → Admin panel with CRUD operations

---

## Local Development Setup

### Prerequisites
- Node.js 18+ or Bun runtime
- Git

### Step 1: Clone and Install
```bash
git clone <your-repo-url>
cd aitaskers
bun install  # or npm install
```

### Step 2: Environment Setup
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
DATABASE_URL="file:./db/custom.db"
```

### Step 3: Database Setup
```bash
# Push schema to database
bun run db:push

# Generate Prisma client
bun run db:generate
```

### Step 4: Seed the Database
```bash
# Option A: Via API (after starting dev server)
curl -X POST http://localhost:3000/api/seed

# Option B: Via Prisma
bunx prisma db seed
```

### Step 5: Start Development Server
```bash
bun run dev  # or npm run dev
```

Visit `http://localhost:3000`

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@aitaskers.com | admin123 |
| Tasker | grace@aitaskers.com | password123 |
| Tasker | chen@aitaskers.com | password123 |
| Tasker | maria@aitaskers.com | password123 |

---

## Production Deployment

### Option 1: Vercel (Recommended - Free)

#### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: AITaskers platform"
git remote add origin https://github.com/yourusername/aitaskers.git
git push -u origin main
```

#### Step 2: Setup Supabase
1. Go to [supabase.com](https://supabase.com) and create a free project
2. Get your connection string from Settings > Database
3. Update your Prisma schema for PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

4. Run migrations:
```bash
npx prisma migrate dev --name init
```

#### Step 3: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Import Project" and select your AITaskers repo
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` = your Supabase PostgreSQL connection string
4. Click "Deploy"
5. Your site will be live at `yourproject.vercel.app`

#### Step 4: Custom Domain (Optional)
1. In Vercel dashboard, go to Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed

### Option 2: Cloudflare Pages (Free Alternative)

1. Build the project: `bun run build`
2. Deploy to Cloudflare Pages via GitHub integration
3. Configure environment variables in Cloudflare dashboard

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `file:./db/custom.db` (SQLite) |
| `NEXT_PUBLIC_APP_URL` | Public app URL | `http://localhost:3000` |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key (for payments) | - |
| `PAYSTACK_SECRET_KEY` | Paystack secret key (for webhooks) | - |

For production with Supabase:
```env
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

---

## Database Schema

### Core Models

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **User** | Authentication | email, role (tasker/admin), passwordHash |
| **Profile** | Tasker profiles | fullName, country, subscriptionTier, isBadgeApproved, isFeatured, contactWhatsapp/Telegram/Email/Linkedin |
| **Platform** | AI training platforms | name, slug (outlier-ai, handshake-ai, etc.) |
| **Project** | Platform-specific projects | name, slug, platformId (Aether→Outlier, Hedgehog→Handshake) |
| **Skill** | Tasker skills | name, slug, category (technical/language/domain) |
| **ProfileSkill** | Profile-Skill junction | profileId, skillId |
| **ProfilePlatformProject** | Profile-Project junction | profileId, projectId |
| **PortfolioItem** | Work evidence | mediaUrl, title, description, mediaType |
| **VerificationRequest** | Badge applications | platformScreenshot, workScreenshot, status |
| **Review** | Employer reviews | rating (1-5), comment, reviewerName |
| **Payment** | Payment records | amount, planType, status |
| **SubscriptionPlan** | Pricing tiers | name, tier, duration, price, features |
| **SiteSetting** | Dynamic site config | key-value pairs |

### Platform-Project Hierarchy
```
Outlier AI → Aether, Bulba, Flamingo, Guitar, Dolphin, T-Rex, Oneroi
Handshake AI → Hedgehog, Ivy, Cedar, Marigold
DataAnnotation → Oasis Series, Crux/Coding Series, Walnut, Gold/Verification
Alignerr → Orion, Fireweed, Spearmint, LLM Voyager
RWS → Project Diamond
Afterquery → Blueprint Project
Appen → Crescent, Nile
Scale AI → Remotasks, Outlier Legacy
UHRS → Search Evaluation, Relevance Rating
Micro1 → Developer Tasks
```

---

## Seeding the Database

The seed script (`prisma/seed.ts`) creates:

1. **10 Platforms** with **28 Projects** total
2. **14 Skills** across technical, language, and domain categories
3. **6 Subscription Plans** (Verified Monthly/Yearly, Premium Monthly/Yearly, Featured Weekly/Monthly)
4. **7 Users** (1 admin + 6 taskers)
5. **6 Profiles** (1 free, 2 verified, 3 premium with realistic data)
6. **Portfolio Items** for each profile
7. **15 Reviews** distributed across profiles
8. **Site Settings** for dynamic configuration

To re-seed:
```bash
curl -X POST http://localhost:3000/api/seed
```

---

## System Walkthrough

### 1. Homepage (Visitor Landing)

**What visitors see:**
- **Hero Section**: "Stop Searching Telegram. Start Hiring Proven AI Trainers." with animated background
- **Problem/Agitation**: Comparison of old way (Telegram spam) vs AITaskers way (verified directory)
- **Why Choose Us**: 4 value proposition cards (Verified Profiles, Proven Experience, Direct Contact, Global Talent)
- **Featured Premium Taskers**: Horizontal carousel of top premium taskers
- **Supported Platforms**: Grid of 10 AI training platform logos
- **Pricing Section**: 3-tier pricing cards (Free, Verified KES 499/mo, Premium KES 999/mo)
- **Tasker CTA**: "You have the skills. Get hired for them."
- **Trust Section**: Verification process explanation (Submit Evidence → Admin Review → Get Badge)

**Key interactions:**
- "Find a Tasker" → Navigates to Browse page
- "Create Profile" → Navigates to Dashboard (requires login)
- Click any featured tasker card → Opens their profile

### 2. Browse Taskers (Employer View)

**Filter Sidebar:**
- **Search**: Text search by name or skill
- **Platform Filter**: Checkbox for each of 10 platforms, expandable to show sub-projects
- **Skill Filter**: Checkbox for each of 14 skills
- **Country Filter**: Dropdown selection
- **Verification Filter**: Radio buttons (All / Verified Only / Premium Only)
- **Clear Filters**: Reset all filters

**Results Grid:**
- Sort options: Newest, Highest Rated, Most Viewed, Premium First
- Tasker cards showing: Avatar, Name, Badge (Verified/Premium), Country, Skills tags, Platform icons, Star rating, Success rate bar
- "View Profile" button on each card
- Pagination (12 per page)

**Key interactions:**
- Checking a platform checkbox immediately filters results
- Clicking "View Profile" opens the full tasker profile

### 3. Tasker Profile (Public View)

**Profile Header:**
- Large avatar, full name, country flag
- Badge indicators: Verified (green checkmark with pulse) or Premium (gold star with shimmer)
- Subscription tier indicator

**Contact Information:**
- If Verified/Premium: WhatsApp, Telegram, Email, LinkedIn buttons visible and clickable
- If Free: Contact info blurred with "Upgrade to see contact details" overlay

**About Section:**
- Bio text, languages spoken, success rate progress bar

**Skills Section:**
- Categorized skill tags (Technical, Language, Domain)

**Platforms & Projects:**
- Expandable cards per platform showing specific projects

**Portfolio Gallery:**
- Grid of uploaded screenshots and work samples
- Click to view in lightbox

**Reviews Section:**
- Average star rating with count
- Individual review cards with name, stars, comment, date
- "Leave a Review" form for employers

### 4. Tasker Dashboard (Self-Service)

**Profile Overview Card:**
- Photo, name, current tier badge
- Profile views counter (animated)
- Profile completion percentage with progress ring

**Edit Profile Form:**
- Full name, bio, country, success rate, languages
- Contact information (WhatsApp, Telegram, Email, LinkedIn)
- Save Profile button

**Skills Manager:**
- Clickable skill tags to add/remove skills
- Organized by category
- Save Skills button

**Platform & Projects Manager:**
- Expandable platform cards
- Toggle project buttons within each platform
- Changes save automatically

**Portfolio Upload:**
- Upload area for screenshots/images
- Existing items with delete option
- Title and description for each item

**Subscription Section:**
- Current plan display
- Upgrade options with pricing
- CTA buttons for Verified and Premium

**Verification Request:**
- Upload platform dashboard screenshot
- Upload completed work screenshot
- Enter employer proof/recommendation text
- Submit for admin review

### 5. Admin Dashboard

**Stats Overview:**
- Total Taskers (animated counter)
- Verified Taskers count
- Premium Taskers count
- Pending Verifications count
- Total Reviews count
- Revenue indicator
- Platform breakdown chart

**Tab Sections:**

1. **Stats** - Dashboard overview with all metrics
2. **Verification Queue** - Pending verification requests with evidence preview, Approve/Reject buttons with admin notes
3. **Platforms** - CRUD for platforms and their projects. Expand a platform to manage projects.
4. **Skills** - CRUD for skills with category grouping
5. **Plans** - CRUD for subscription plans (edit pricing, features, toggle active)
6. **Re-seed Database** - Reset all data to demo state

**All admin changes take effect immediately** without redeployment.

---

## API Reference

### Authentication
```
POST /api/auth
Body: { email, password }
Response: { id, email, name, role, profileId }
```

### Profiles
```
GET /api/profiles?platforms=x,y&skills=a,b&countries=Kenya&verification=verified&search=query&sort=newest&page=1&limit=12
GET /api/profiles/[id]
POST /api/profiles
PUT /api/profiles/[id]
DELETE /api/profiles/[id]
POST /api/profiles/[id]/views  (increment view count)
```

### Reviews
```
POST /api/reviews
Body: { reviewedProfileId, reviewerName, rating, comment }
```

### Platforms
```
GET /api/platforms  (includes projects)
POST /api/platforms  (admin)
PUT /api/platforms/[id]  (admin)
DELETE /api/platforms/[id]  (admin)
```

### Projects
```
POST /api/projects  (admin - body: { name, slug, platformId, description })
PUT /api/projects/[id]  (admin)
DELETE /api/projects/[id]  (admin)
```

### Skills
```
GET /api/skills
POST /api/skills  (admin)
PUT /api/skills/[id]  (admin)
DELETE /api/skills/[id]  (admin)
```

### Admin
```
GET /api/admin/stats  (dashboard metrics)
GET /api/admin/verification?status=pending
PUT /api/admin/verification  (approve/reject: { requestId, status, adminNotes })
PUT /api/admin/featured  (toggle: { profileId, isFeatured, featuredUntil })
```

### Subscription Plans
```
GET /api/subscription-plans
POST /api/subscription-plans  (admin)
PUT /api/subscription-plans/[id]  (admin)
DELETE /api/subscription-plans/[id]  (admin)
```

### Seed
```
POST /api/seed  (re-seed the entire database)
```

---

## Admin Guide

### Managing Taskers
1. Login as admin (admin@aitaskers.com)
2. Navigate to Admin panel
3. View all tasker profiles in the stats overview
4. Use the Verification tab to approve/reject badge requests
5. Use the Featured toggle to promote/demote taskers

### Managing Platforms & Projects
1. Go to Admin → Platforms tab
2. Click "Add Platform" to create a new AI training platform
3. Expand any platform to add/edit/delete projects
4. Changes appear immediately on the Browse page filters

### Managing Skills
1. Go to Admin → Skills tab
2. Add new skills with name, slug, and category
3. Edit or deactivate existing skills
4. Changes appear immediately in tasker dashboard skill selector

### Managing Pricing
1. Go to Admin → Plans tab
2. Edit existing plan prices, features, and active status
3. Add new plans (e.g., "Enterprise" tier)
4. Changes appear immediately on the homepage pricing section

### Updating Site Content
Site settings are stored in the database and can be changed via API:
```
PUT /api/site-settings/{key}
Body: { value: "new value" }
```

Current settings: site_name, tagline, hero_title, hero_subtitle, cta_primary, cta_secondary

---

## Monetization Setup

### Integrating Paystack (Kenyan Payments)

1. **Create Paystack Account**: Sign up at [paystack.com](https://paystack.com)
2. **Get API Keys**: From Settings > API Keys
3. **Add Environment Variables**:
   ```env
   PAYSTACK_PUBLIC_KEY=pk_test_...
   PAYSTACK_SECRET_KEY=sk_test_...
   ```
4. **Create Payment API Route** (`/api/payments/initiate`):
   ```typescript
   // Initialize Paystack transaction
   const response = await fetch('https://api.paystack.co/transaction/initialize', {
     method: 'POST',
     headers: {
       Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       email: user.email,
       amount: plan.price * 100, // Paystack uses kobo
       reference: generateReference(),
       callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
       metadata: { userId: user.id, planType: plan.slug },
     }),
   })
   ```

5. **Webhook Handler** (`/api/payments/webhook`):
   - Verify signature
   - Update user subscription tier and end date
   - Create payment record
   - If verification plan, prompt for evidence upload

### Featured Ad Revenue
- Taskers pay KES 300/week or KES 1,000/month for featured placement
- Admin can also manually feature taskers via the admin panel

### Additional Revenue Streams
1. **CV/Profile Review**: KES 500 for professional profile optimization
2. **AI Training Guides**: Sell PDF guides (KES 300 each) for specific platforms
3. **Employer Featured Posts**: KES 500 to pin a job posting for 7 days
4. **Expedited Verification**: KES 200 one-time for faster review

---

## Customization

### Changing Colors
Edit `tailwind.config.ts` and `globals.css`:
- Primary color: Emerald green (emerald-500 to emerald-700)
- Verified badge: Green (emerald-500)
- Premium badge: Amber/Gold (amber-500)
- Background: Dark navy (#0f172a)

### Adding New Platforms
1. Via Admin Panel → Platforms → Add Platform
2. Or via seed script in `prisma/seed.ts`
3. Platform icon can be set via URL

### Changing Pricing
1. Via Admin Panel → Plans → Edit
2. Changes take effect immediately
3. No redeployment needed

### Adding New Languages (i18n)
1. Install `next-intl` package
2. Create translation files in `/messages/en.json`, `/messages/sw.json`, etc.
3. Configure middleware for locale detection

---

## Troubleshooting

### Database Issues
```bash
# Reset database
rm db/custom.db
bun run db:push
curl -X POST http://localhost:3000/api/seed
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
bun run dev
```

### Prisma Client Errors
```bash
bun run db:generate
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Slow Queries
- Ensure proper indexes (Prisma handles this for PostgreSQL)
- Check Prisma query logs in dev mode
- Consider adding caching for platform/skill lists

---

## File Structure

```
aitaskers/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Seed script
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main page (all views)
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles + animations
│   │   └── api/               # API routes
│   │       ├── auth/route.ts
│   │       ├── seed/route.ts
│   │       ├── profiles/[id]/route.ts
│   │       ├── profiles/[id]/views/route.ts
│   │       ├── reviews/route.ts
│   │       ├── platforms/[id]/route.ts
│   │       ├── projects/[id]/route.ts
│   │       ├── skills/[id]/route.ts
│   │       ├── subscription-plans/[id]/route.ts
│   │       ├── admin/
│   │       │   ├── stats/route.ts
│   │       │   ├── verification/route.ts
│   │       │   └── featured/route.ts
│   │       └── ...
│   ├── components/
│   │   ├── navbar.tsx         # Sticky glassmorphism navbar
│   │   ├── footer.tsx         # Site footer
│   │   ├── home-page.tsx      # Homepage with all sections
│   │   ├── browse-page.tsx    # Browse with filter sidebar
│   │   ├── profile-page.tsx   # Individual tasker profile
│   │   ├── dashboard-page.tsx # Tasker self-service dashboard
│   │   ├── admin-page.tsx     # Admin panel with CRUD
│   │   ├── tasker-card.tsx    # Reusable tasker card
│   │   ├── badge-icon.tsx     # Animated badge components
│   │   ├── star-rating.tsx    # Star rating component
│   │   ├── loading-skeleton.tsx # Skeleton loaders
│   │   └── ui/                # shadcn/ui components
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   ├── store.ts           # Zustand store
│   │   └── utils.ts           # Utility functions
│   └── hooks/
│       └── use-toast.ts       # Toast notifications
├── public/                    # Static assets
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
└── DEPLOYMENT_GUIDE.md        # This file
```

---

## Support & Maintenance

### Regular Tasks
- **Weekly**: Review verification requests, approve/reject badges
- **Monthly**: Update platform/project list based on industry changes
- **Quarterly**: Review pricing, adjust subscription amounts
- **As Needed**: Add new platforms, skills, or features

### Backup Strategy
- Supabase provides automatic backups on paid plans
- For free tier, export data periodically:
  ```bash
  pg_dump $DATABASE_URL > backup.sql
  ```

### Monitoring
- Use Vercel Analytics for performance monitoring
- Set up error tracking with Sentry (optional)
- Monitor Supabase dashboard for database metrics

---

Built with ❤️ by the AITaskers team
