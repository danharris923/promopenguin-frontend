# PromoPenguin Frontend

High-converting Canadian deals aggregator built with Next.js 14.

## Features

- **CTR Optimized Deal Pages** - Urgency banners, social proof, psychological triggers
- **SEO Machine** - Programmatic pages for deals, stores, categories, comparisons
- **Schema Markup** - Rich snippets for Google search results
- **Content Generation** - Unique descriptions for every deal page
- **Exit Intent Capture** - Email collection modal
- **Mobile-First** - Sticky CTAs, responsive design

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Vercel Postgres
- Vercel Blob (images)

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Homepage
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   ├── sitemap.ts               # Dynamic sitemap
│   ├── deals/
│   │   └── [slug]/page.tsx      # Individual deal pages
│   ├── category/
│   │   └── [...slug]/page.tsx   # Category pages
│   └── stores/
│       └── [slug]/page.tsx      # Store pages
├── components/
│   ├── deal/                    # Deal page components
│   │   ├── UrgencyBanner.tsx
│   │   ├── SocialProofBanner.tsx
│   │   ├── PriceDisplay.tsx
│   │   ├── CTAButton.tsx
│   │   └── ...
│   ├── DealCard.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ExitIntentModal.tsx
├── lib/
│   ├── db.ts                    # Database queries
│   ├── content-generator.ts     # SEO content generation
│   ├── schema.ts                # JSON-LD schemas
│   └── urgency.ts               # Psychological triggers
└── types/
    └── deal.ts                  # TypeScript interfaces
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Fill in your Vercel Postgres and Blob credentials
```

### 3. Initialize Database

Run the scraper's `--init-db` command to create tables, or manually:

```sql
CREATE TABLE deals (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  image_url TEXT,
  image_blob_url TEXT,
  price DECIMAL(10,2),
  original_price DECIMAL(10,2),
  discount_percent INT,
  store VARCHAR(100),
  category VARCHAR(100),
  description TEXT,
  affiliate_url TEXT NOT NULL,
  source_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  date_added TIMESTAMP DEFAULT NOW(),
  date_updated TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Deployment

### Deploy to Vercel

```bash
vercel
```

### Link Storage

1. Go to Vercel Dashboard
2. Create Postgres database (Storage > Create > Postgres)
3. Create Blob store (Storage > Create > Blob)
4. Environment variables auto-populate

## Page Types

| URL Pattern | Description | SEO Value |
|-------------|-------------|-----------|
| `/` | Homepage | High |
| `/deals/[slug]` | Individual deal pages | High (money pages) |
| `/category/[...slug]` | Category pages | Medium-High |
| `/stores/[slug]` | Store pages | Medium-High |
| `/deals/today` | Today's deals | High (freshness) |
| `/sitemap.xml` | Dynamic sitemap | SEO critical |

## Psychological CTR Elements

### Deal Pages Include:

1. **Urgency Banner** - Countdown timer + viewer count
2. **Social Proof** - "X sold today" + live viewers
3. **Price Display** - Strikethrough + savings
4. **Stock Warnings** - "Only 3 left!"
5. **Trust Badges** - Free shipping, returns, secure
6. **Sticky CTA** - Mobile bottom bar
7. **Exit Intent** - Email capture modal

## Content Generation

Every deal page gets unique content via templates:

- 8 description variations per category
- Category-specific benefits
- Store descriptions
- Auto-generated FAQs
- Schema.org markup

## Performance

- Static generation (SSG) for deal pages
- ISR (revalidate: 900) for freshness
- Image optimization via Vercel
- Critical CSS inlining via Tailwind

## Integration with Scraper

This frontend reads from the same Vercel Postgres database that the scraper writes to:

```
DO Droplet (Scraper)
    ↓ writes deals
Vercel Postgres
    ↓ reads deals
Next.js Frontend (Vercel)
    ↓ serves
Users
```

Make sure the scraper is running on your DO droplet with the same `POSTGRES_URL`.
