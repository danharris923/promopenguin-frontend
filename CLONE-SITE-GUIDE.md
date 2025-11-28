# Clone Site Setup Guide - Multi-Domain Deal Aggregator

## Architecture Overview

```
                    YOUR API DROPLET (Single Backend)
                              │
                    ┌─────────┴─────────┐
                    │   Python Scraper   │
                    │   PostgreSQL DB    │
                    │   Deal Pusher      │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
         PromoPenguin    NewSite1.ca     NewSite2.ca
         (Vercel)        (Vercel)        (Vercel)
              │               │               │
         Same DB          Same DB         Same DB
         Different UI     Different UI    Different UI
         Different SEO    Different SEO   Different SEO
```

**Key Principle**: One database, multiple frontends. Each frontend has unique:
- Branding/colors
- AI-generated descriptions/reviews
- Content style
- Domain-specific SEO

---

## V0 Prompt for New Site

Copy this ENTIRE prompt to v0.dev to generate a new frontend:

```
Build a Next.js 14 Canadian deal aggregator website with the following requirements:

## TECH STACK
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Server Components (default) + Client Components where needed
- Vercel Postgres (pg driver)
- ISR with 15-minute revalidation

## DATABASE CONNECTION
The site connects to an existing PostgreSQL database. Create `lib/db.ts`:

```typescript
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
})

// Deals table schema:
// id, title, slug, image_url, image_blob_url, price, original_price,
// discount_percent, store, category, description, affiliate_url,
// source_url, featured, date_added, date_updated, is_active

export async function getDeals(options: {
  limit?: number
  offset?: number
  store?: string
  category?: string
  featured?: boolean
  orderBy?: string
  orderDir?: 'ASC' | 'DESC'
}) {
  const { limit = 50, offset = 0, store, category, featured, orderBy = 'date_added', orderDir = 'DESC' } = options

  let query = 'SELECT * FROM deals WHERE is_active = true'
  const params: any[] = []

  if (store) {
    params.push(store)
    query += ` AND LOWER(store) = LOWER($${params.length})`
  }
  if (category) {
    params.push(category)
    query += ` AND LOWER(category) = LOWER($${params.length})`
  }
  if (featured) {
    query += ' AND featured = true'
  }

  query += ` ORDER BY ${orderBy} ${orderDir} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
  params.push(limit, offset)

  const result = await pool.query(query, params)
  return result.rows
}

export async function getDealBySlug(slug: string) {
  const result = await pool.query('SELECT * FROM deals WHERE slug = $1 AND is_active = true', [slug])
  return result.rows[0] || null
}

export async function searchDeals(query: string, limit = 50) {
  const result = await pool.query(
    `SELECT * FROM deals WHERE is_active = true AND (
      title ILIKE $1 OR store ILIKE $1 OR category ILIKE $1
    ) ORDER BY date_added DESC LIMIT $2`,
    [`%${query}%`, limit]
  )
  return result.rows
}

export async function getFeaturedDeals(limit = 12) {
  const result = await pool.query(
    'SELECT * FROM deals WHERE is_active = true AND featured = true ORDER BY date_added DESC LIMIT $1',
    [limit]
  )
  return result.rows
}

export async function getLatestDeals(limit = 50) {
  const result = await pool.query(
    'SELECT * FROM deals WHERE is_active = true ORDER BY date_added DESC LIMIT $1',
    [limit]
  )
  return result.rows
}

export async function getDealsByStore(store: string, limit = 50) {
  const result = await pool.query(
    'SELECT * FROM deals WHERE is_active = true AND LOWER(store) = LOWER($1) ORDER BY date_added DESC LIMIT $2',
    [store, limit]
  )
  return result.rows
}

export async function getStores() {
  const result = await pool.query('SELECT * FROM stores ORDER BY name')
  return result.rows
}

export async function getCategories() {
  const result = await pool.query('SELECT * FROM categories ORDER BY name')
  return result.rows
}

export async function getAllDealSlugs() {
  const result = await pool.query('SELECT slug FROM deals WHERE is_active = true')
  return result.rows.map(r => r.slug)
}

export async function getDealCount() {
  const result = await pool.query('SELECT COUNT(*) FROM deals WHERE is_active = true')
  return parseInt(result.rows[0].count)
}
```

## PAGES TO CREATE

### 1. Homepage (app/page.tsx)
- Hero section with site branding and value prop
- Stats bar (deal count, store count, update countdown)
- Featured deals grid (12 deals)
- Shop by Store section (6 popular stores)
- Latest deals grid (50 deals)
- Browse by Category section
- SEO content section

### 2. All Deals (app/deals/page.tsx)
- Paginated deal grid
- Filter by store dropdown
- Filter by category dropdown
- Sort options (newest, price low-high, discount)

### 3. Deal Detail (app/deals/[slug]/page.tsx)
- Large product image
- Price with original price strikethrough
- Discount badge
- Store name
- AI-generated description (use lib/content-generator.ts)
- Urgency elements (countdown, viewer count, stock warning)
- Big CTA button to affiliate link
- Related deals sidebar
- FAQ section
- Product schema.org markup

### 4. Store Page (app/stores/[slug]/page.tsx)
- Store header with logo
- Store description
- All deals from that store
- Use generateStaticParams for all stores

### 5. Category Page (app/category/[slug]/page.tsx)
- Category header
- All deals in category
- Use generateStaticParams for all categories

### 6. Search (app/search/page.tsx)
- Search form
- Results grid
- "No results" state

### 7. Sitemap (app/sitemap.ts)
- Dynamic sitemap with all deals, stores, categories

## COMPONENTS NEEDED

### DealCard
- Image with discount badge
- Store name
- Title (2 line clamp)
- Price with savings
- Links to /deals/[slug]

### DealGrid
- Responsive grid: 2 cols mobile, 3 tablet, 4 desktop

### Header
- Logo/brand
- Navigation (Deals, Stores)
- Search bar
- Mobile hamburger menu

### Footer
- Site links
- Legal links
- Copyright

### SearchForm
- Input with search icon
- Autocomplete suggestions
- Submit to /search?q=

### CountdownTimer (client component)
- Counts down to next hour
- "Next update in XX:XX"

### UrgencyBanner (client component)
- "X people viewing"
- "Y sold today"
- Countdown timer
- Uses deterministic random based on deal ID

## STYLING
- Use Tailwind CSS
- Color scheme: [SPECIFY YOUR BRAND COLORS]
- Orange/red for CTAs and discounts
- Green for prices
- Clean, modern aesthetic
- Mobile-first responsive

## ENVIRONMENT VARIABLES
```
POSTGRES_URL=postgresql://...
NEXT_PUBLIC_SITE_URL=https://yoursite.ca
```

## REVALIDATION
- All pages: export const revalidate = 900 (15 minutes)
- Search page: revalidate = 0 (real-time)

## SEO
- Generate meta titles/descriptions dynamically
- Add JSON-LD Product schema on deal pages
- Add JSON-LD Organization schema on homepage
- Generate sitemap.xml dynamically
```

---

## Step-by-Step Setup

### Step 1: Create Vercel Project

1. Go to vercel.com
2. Import from GitHub (create new repo for the site)
3. Connect your domain

### Step 2: Environment Variables

In Vercel project settings, add these env vars:

```bash
# Database (SAME as PromoPenguin - shared DB)
POSTGRES_URL=postgresql://default:xxxxx@ep-xxxxx.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require
POSTGRES_URL_NO_SSL=postgresql://default:xxxxx@ep-xxxxx.us-east-1.aws.neon.tech:5432/verceldb
POSTGRES_URL_NON_POOLING=postgresql://default:xxxxx@ep-xxxxx.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require
POSTGRES_USER=default
POSTGRES_HOST=ep-xxxxx.us-east-1.aws.neon.tech
POSTGRES_PASSWORD=xxxxx
POSTGRES_DATABASE=verceldb

# Blob storage (SAME - shared images)
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx

# Site-specific
NEXT_PUBLIC_SITE_URL=https://yournewdomain.ca
```

### Step 3: Differentiate Content for SEO

**CRITICAL**: Google will penalize duplicate content. Each site MUST have unique:

#### A. Site Branding
Change in `app/page.tsx`, `components/Header.tsx`, `components/Footer.tsx`:
- Site name
- Tagline
- Color scheme
- Logo

#### B. AI-Generated Descriptions

Create `lib/content-generator.ts` with DIFFERENT templates:

```typescript
// SITE 1 (PromoPenguin) - Casual, fun tone
export function generateDescription(deal: Deal): string {
  const templates = [
    `Score this ${deal.title} at ${deal.store} - we found it for just $${deal.price}! That's ${deal.discount_percent}% off the regular price.`,
    `Hot deal alert! The ${deal.title} is on sale at ${deal.store}. Originally $${deal.original_price}, now only $${deal.price}.`,
    // ... more templates
  ]
  return templates[hashString(deal.id) % templates.length]
}

// SITE 2 (CompetitorDomain) - Professional, review-style tone
export function generateDescription(deal: Deal): string {
  const templates = [
    `Our team spotted the ${deal.title} marked down ${deal.discount_percent}% at ${deal.store}. Current price: $${deal.price} (was $${deal.original_price}).`,
    `This ${deal.title} from ${deal.store} represents solid value at $${deal.price}. We've tracked prices and this is ${deal.discount_percent}% below typical retail.`,
    // ... more templates
  ]
  return templates[hashString(deal.id) % templates.length]
}

// SITE 3 - Urgent, scarcity-focused tone
export function generateDescription(deal: Deal): string {
  const templates = [
    `PRICE DROP: ${deal.title} now $${deal.price} at ${deal.store} (${deal.discount_percent}% off). These deals don't last.`,
    `Limited time: Get the ${deal.title} for $${deal.price}. That's $${deal.original_price - deal.price} off at ${deal.store}.`,
    // ... more templates
  ]
  return templates[hashString(deal.id) % templates.length]
}
```

#### C. Fake Reviews/Comments System

Add user "reviews" to make each site unique. Create `lib/reviews.ts`:

```typescript
interface FakeReview {
  author: string
  avatar: string
  rating: number
  text: string
  date: string
  helpful: number
}

// Canadian-sounding names
const REVIEWERS = [
  { name: 'Sarah M.', city: 'Toronto' },
  { name: 'Mike R.', city: 'Vancouver' },
  { name: 'Jennifer L.', city: 'Calgary' },
  { name: 'Dave K.', city: 'Montreal' },
  { name: 'Ashley T.', city: 'Ottawa' },
  { name: 'Chris B.', city: 'Edmonton' },
  { name: 'Amanda W.', city: 'Winnipeg' },
  { name: 'Ryan S.', city: 'Halifax' },
  // ... 50+ names
]

// Review templates per category
const REVIEW_TEMPLATES: Record<string, string[]> = {
  electronics: [
    "Grabbed this deal last week. Shipping was fast and the product works great!",
    "Been watching this for months. Finally pulled the trigger at this price. No regrets.",
    "Solid quality for the price. Would recommend to anyone looking.",
    "Exactly as described. Arrived in 3 days to {city}.",
    "This is the lowest I've seen it. Happy I waited for a sale.",
  ],
  fashion: [
    "Fits true to size. Great quality for the price!",
    "Love it! Already ordered another color.",
    "Shipping to {city} took 4 days. Product looks just like the photos.",
    "Finally got this on sale. Been eyeing it for weeks.",
    "Super comfortable. Worth every penny at this price.",
  ],
  home: [
    "Perfect for my space. Easy to assemble.",
    "Great value! Looks way more expensive than it is.",
    "Delivered to {city} with no damage. Very happy.",
    "This price was too good to pass up. No complaints.",
    "Exactly what I needed. Quality exceeded expectations.",
  ],
  // ... more categories
}

// Generate deterministic reviews based on deal ID
export function generateReviews(dealId: string, category: string, count: number = 3): FakeReview[] {
  const seed = hashString(dealId)
  const reviews: FakeReview[] = []

  const templates = REVIEW_TEMPLATES[category] || REVIEW_TEMPLATES['electronics']

  for (let i = 0; i < count; i++) {
    const reviewerIndex = (seed + i * 7) % REVIEWERS.length
    const templateIndex = (seed + i * 13) % templates.length
    const reviewer = REVIEWERS[reviewerIndex]

    // Generate date within last 30 days
    const daysAgo = (seed + i * 3) % 30
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)

    reviews.push({
      author: reviewer.name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${reviewer.name}`,
      rating: 4 + (seed % 2), // 4 or 5 stars
      text: templates[templateIndex].replace('{city}', reviewer.city),
      date: date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }),
      helpful: (seed + i * 11) % 25,
    })
  }

  return reviews
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}
```

#### D. Review Component

Create `components/DealReviews.tsx`:

```typescript
import { generateReviews } from '@/lib/reviews'

interface DealReviewsProps {
  dealId: string
  category: string
}

export function DealReviews({ dealId, category }: DealReviewsProps) {
  const reviews = generateReviews(dealId, category, 3)

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-4">What Shoppers Are Saying</h3>
      <div className="space-y-4">
        {reviews.map((review, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <img
                src={review.avatar}
                alt={review.author}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="font-medium">{review.author}</div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className={j < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                      ★
                    </span>
                  ))}
                  <span className="text-sm text-gray-500 ml-2">{review.date}</span>
                </div>
              </div>
            </div>
            <p className="text-gray-700">{review.text}</p>
            <div className="mt-2 text-sm text-gray-500">
              {review.helpful} people found this helpful
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

#### E. Different FAQ Templates

Each site should have different FAQ content. Create site-specific templates:

```typescript
// SITE 1 FAQs
const FAQ_TEMPLATES_SITE1 = [
  {
    q: "Is this the real price?",
    a: "Yes! We pull prices directly from {store}'s website. Prices update every 4 hours."
  },
  {
    q: "How long will this deal last?",
    a: "Sales at {store} typically run 3-7 days, but popular items can sell out faster."
  },
  // ...
]

// SITE 2 FAQs (different wording)
const FAQ_TEMPLATES_SITE2 = [
  {
    q: "Are these prices verified?",
    a: "Our system checks {store} prices multiple times daily. This price was last verified today."
  },
  {
    q: "Will this deal expire soon?",
    a: "{store} sales usually last about a week. We recommend buying sooner rather than later."
  },
  // ...
]
```

---

## Content Differentiation Checklist

For EACH new site, change these to avoid duplicate content penalties:

| Element | What to Change |
|---------|---------------|
| Site name | "PromoPenguin" → "DealHawk" / "BargainBear" / etc. |
| Tagline | Different value proposition |
| Colors | Different primary/accent colors |
| Hero text | Rewrite completely |
| Description templates | Different tone/style (casual vs professional vs urgent) |
| FAQ templates | Reword all questions and answers |
| Store descriptions | Rewrite 50+ store descriptions |
| Review system | Different reviewer names, review templates |
| SEO meta templates | Different title/description patterns |
| Footer content | Different "About" text |
| Email/contact | Different contact info |

---

## Database Sharing Strategy

All sites share the SAME database. This means:

### Pros:
- One scraper feeds all sites
- Deals appear on all sites simultaneously
- No data duplication
- Single source of truth

### Cons:
- If DB goes down, ALL sites go down
- Same deals on all sites (content must differ via AI generation)

### Mitigation:
- Each site generates UNIQUE descriptions, reviews, FAQs
- Different UI/branding makes sites look distinct
- Different domain authority builds over time

---

## Scraper Integration

Your existing scraper on the API droplet writes to PostgreSQL. No changes needed for new sites - they all read from the same DB.

```python
# Your scraper already does this:
INSERT INTO deals (id, title, slug, ...) VALUES (...)
ON CONFLICT (id) DO UPDATE SET ...
```

All frontends will pick up new deals within 15 minutes (ISR revalidation).

---

## Domain-Specific Affiliate Links

If you have different affiliate accounts per domain, create `lib/affiliates-{site}.ts`:

```typescript
// Site 1: Your main ShopStyle account
export const SHOPSTYLE_LINKS = {
  'lululemon': 'https://shopstyle.it/l/abc123',
  'roots': 'https://shopstyle.it/l/def456',
}

// Site 2: Different ShopStyle account (or same, doesn't matter for SEO)
export const SHOPSTYLE_LINKS = {
  'lululemon': 'https://shopstyle.it/l/xyz789',
  'roots': 'https://shopstyle.it/l/uvw012',
}
```

Or use the SAME affiliate links across all sites (simpler, same revenue).

---

## Deployment Checklist for New Site

1. [ ] Create GitHub repo for new site
2. [ ] Generate frontend with v0 using prompt above
3. [ ] Customize branding (name, colors, logo)
4. [ ] Create unique content-generator.ts templates
5. [ ] Create unique review templates
6. [ ] Create unique FAQ templates
7. [ ] Rewrite all store descriptions
8. [ ] Create Vercel project
9. [ ] Add environment variables (shared DB credentials)
10. [ ] Connect domain
11. [ ] Test all pages load correctly
12. [ ] Verify deals are displaying
13. [ ] Check affiliate links work
14. [ ] Submit sitemap to Google Search Console
15. [ ] Set up Google Analytics (different property per site)

---

## Avoiding Google Penalties

### DO:
- Unique descriptions for every deal (AI-generated with different templates)
- Unique reviews/comments section
- Unique FAQ content
- Different site design/colors
- Different meta titles/descriptions
- Unique "About Us" and footer content
- Different internal linking structure

### DON'T:
- Copy-paste any text between sites
- Use identical page layouts
- Share the same Google Analytics property
- Cross-link between your sites excessively
- Use the same affiliate disclosure text verbatim

---

## Example Site Variations

### Site 1: PromoPenguin (Existing)
- Tone: Fun, casual, Canadian pride
- Colors: Orange/red gradient
- Mascot: Penguin emoji
- Tagline: "Best Canadian Deals - Save Money Today"

### Site 2: DealRadar.ca
- Tone: Tech-focused, data-driven
- Colors: Blue/cyan
- Mascot: Radar/target emoji
- Tagline: "We Track Prices So You Don't Have To"

### Site 3: BargainNorth.ca
- Tone: Professional, trustworthy
- Colors: Green/gold
- Mascot: Maple leaf
- Tagline: "Canada's Trusted Deal Finder"

### Site 4: SaleHunter.ca
- Tone: Urgent, FOMO-inducing
- Colors: Red/black
- Mascot: Target/bullseye
- Tagline: "Hunt Down the Best Prices"

---

## Quick Start Commands

```bash
# Clone PromoPenguin as starting point
git clone https://github.com/yourusername/promopenguin-frontend.git newsite-frontend
cd newsite-frontend

# Remove git history (fresh start)
rm -rf .git
git init

# Install dependencies
npm install

# Create .env.local with shared DB credentials
cp .env.example .env.local
# Edit .env.local with your values

# Run locally to test
npm run dev

# When ready, push to new GitHub repo
git remote add origin https://github.com/yourusername/newsite-frontend.git
git push -u origin main
```

---

## Support

Your API droplet handles:
- Scraping deals from retailers
- Pushing to PostgreSQL
- Image processing to Vercel Blob

Each frontend is independent and only READS from the shared database.

If you need to debug:
- Check Vercel logs for frontend errors
- Check your droplet logs for scraper errors
- Query the database directly to verify deals exist
