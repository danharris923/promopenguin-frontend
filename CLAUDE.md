# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **npm** (`package-lock.json` is the lockfile).

- `npm run dev` — Next.js dev server
- `npm run build` — production build (`next build`)
- `npm run start` — serve production build
- `npm run lint` — `next lint`

No test suite is configured (`npm test` is a stub).

## High-level architecture

Next.js 16 App Router + React 19 + TypeScript, Tailwind v4 (CSS-first via `@theme` in `globals.css`). Path alias `@/*` → `./src/*`. Deployed on Vercel at `promopenguin.ca`. ISR is the norm — `REVALIDATE_INTERVAL` (`src/lib/config.ts`) is 900s and most server components export `revalidate = 900`. Analytics is Umami (`analytics.promopenguin.ca`), not GA.

### Sister sites — shared code, shared DB

This is one of three consolidated Canadian deal sites that share a single Supabase Postgres ("deal-empire" project) and converge on the same code — **only visuals should differ**:

- `danharris923/shopcanada` — clickandsavecanada.com
- `danharris923/livingonaloonie` — livingonaloonie.ca
- `danharris923/promopenguin-frontend` — this repo (promopenguin.ca)

Only the `deals` and `stores` tables are read at runtime. The DB doubles as a price-tracking warehouse (`canonical_products`, `retailer_products_*`, append-only `price_history_*` partitions) populated by a DigitalOcean droplet scraper; this frontend is read-only against it.

### No Stores section on this site

**Do not add a Stores menu, `/stores` route, `/stores/[slug]` page, or homepage "Shop by Store" / "Popular Stores" block to this site.** That section lives only on shopcanada (which carries the brand-story markdown corpus). Breadcrumbs on deal pages must not link to `/stores/...`. `getStores()` / `getAllStoreSlugs()` in `src/lib/db.ts` may still be called for non-link usage (retailer count on `/deals`, internal joins) — but never to generate a user-visible store link.

### Data layer — `src/lib/db.ts`

All runtime DB access goes through `pg.Pool` against `POSTGRES_URL`. No ORM. Queries are parameterized raw SQL, and every row returned to React Server Components passes through a row-transformer that coerces PG types (Date, DECIMAL, JSONB, BigInt) to JSON-serializable primitives — RSC payloads will throw on raw PG types, so any new query must run its rows through the same transform.

Unlike `livingonaloonie`, this site does **not** apply a `normalizeDeal` affiliate-rewrite pipeline, does **not** use the `AMAZON_FIRST` sort prefix, and does **not** filter out homepage-URL deals. Search uses trigram similarity (typo-resilient). If you add a deal-listing query, match the existing style (direct SQL, transform rows, return typed `Deal[]`).

### Homepage deal mix — `src/lib/mix-deals.ts`

The homepage feed interleaves three sources via round-robin: Flipp (live flyer deals from `src/lib/flipp.ts`) + RFD + Guru, with a 30-day freshness window. Keep `STORE_SLUGS` in `src/lib/flipp.ts` in sync with the store list when adding retailers.

### Affiliate handling — `src/lib/affiliates.ts`

Strips competitor tracking tags (CJ, UTM, ShareASale, Rakuten, Impact, Awin, Pepperjam, FlexOffers) and injects the Amazon Associates tag **`promopenguin-20`** (branded per site — do not use another site's tag). The `/api/go` route (`src/app/api/go/route.ts`) fires a tracking pixel via hidden `<img>` and then JS-redirects the user; it keeps a whitelist of ~80 allowed redirect domains.

### Routes — `src/app/`

- `page.tsx` — homepage, 3-source mix + featured carousel
- `deals/page.tsx` — all-deals listing (`getDeals({ orderBy: 'random', limit: 100 })`)
- `deals/[slug]/page.tsx` — single deal: breadcrumbs, JSON-LD product schema, FAQ, related deals, urgency data
- `search/page.tsx` — trigram-similarity search (`?q=...`)
- `api/go/route.ts` — affiliate pixel + redirect
- `sitemap.ts`, `robots.ts` — SEO

### Content generation

- `src/lib/content-generator.ts` — 8 description template variations per category, FAQs, store descriptions, breadcrumbs
- `src/lib/schema.ts` — JSON-LD (Product, BreadcrumbList, FAQPage, WebSite, Organization, ItemList)
- `src/lib/urgency.ts` — deterministic viewer-count / stock-level triggers derived from deal ID

### Types — `src/types/deal.ts`

`Deal`, `Store` (rich metadata: badges, top_categories, policies, shipping_info, affiliate_network, screenshot_url, deal_count), `StoreCardData`, `DealCardProps`, `UrgencyData`.

### Styling

Tailwind v4 with brand tokens in `globals.css` `@theme` block: `--color-brand-navy: #1a365d`, `--color-brand-blue: #2b6cb0`, `--color-brand-light: #ebf4ff`, `--color-savings: #16a34a`. Font is Inter via `next/font/google`. Per the consolidation rule, the visual skin stays put even when logic is shared with sister sites.

### Environment

Required: `POSTGRES_URL` (shared deal-empire DB), `NEXT_PUBLIC_SITE_URL`, `BLOB_READ_WRITE_TOKEN`.

### Image remote patterns

Configured in `next.config.js`: Vercel Blob, Amazon CDN, Walmart.ca, Best Buy, Canadian Tire, Costco, Shoppers, Home Depot, Cloudinary, CloudFront, Akamai, placeholder hosts, Unsplash. Add a pattern here before importing retailer images.
