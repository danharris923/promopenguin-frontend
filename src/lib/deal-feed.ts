export const DEAL_FEED_URL =
  "https://danharris923.github.io/canadadealsdaily/deals.json"

export const REQUIRED_AFFILIATE_TAG = "tag=f10a7654-20"

export interface FeedDeal {
  id: string
  title: string
  main_affiliate_url: string
  source: string | null
  description: string | null
  price: number | null
  original_price: number | null
  currency: string | null
  valid_until: string | null
  image: string | null
  image_source: string | null
  category: string | null
  seller: string | null
  related_affiliate_urls: string[] | null
  lastmod: string | null
}

type Raw = Partial<Record<keyof FeedDeal, unknown>> & { [k: string]: unknown }

function str(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function strArr(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null
  const out = v.filter((x): x is string => typeof x === "string" && x.length > 0)
  return out.length > 0 ? out : null
}

function coerce(raw: Raw): FeedDeal | null {
  const id = str(raw.id)
  const title = str(raw.title)
  const main_affiliate_url = str(raw.main_affiliate_url)
  if (!id || !title || !main_affiliate_url) return null
  return {
    id,
    title,
    main_affiliate_url,
    source: str(raw.source),
    description: str(raw.description),
    price: num(raw.price),
    original_price: num(raw.original_price),
    currency: str(raw.currency),
    valid_until: str(raw.valid_until),
    image: str(raw.image),
    image_source: str(raw.image_source),
    category: str(raw.category),
    seller: str(raw.seller),
    related_affiliate_urls: strArr(raw.related_affiliate_urls),
    lastmod: str(raw.lastmod),
  }
}

export async function fetchFeed(signal?: AbortSignal): Promise<FeedDeal[]> {
  const res = await fetch(DEAL_FEED_URL, {
    next: { revalidate: 3600 },
    signal,
  })
  if (!res.ok) {
    throw new Error(`deal-feed fetch failed: ${res.status} ${res.statusText}`)
  }
  const body = (await res.json()) as unknown
  if (!Array.isArray(body)) return []
  return body.flatMap((r) => {
    if (!r || typeof r !== "object") return []
    const coerced = coerce(r as Raw)
    if (!coerced) return []
    if (!coerced.main_affiliate_url.includes(REQUIRED_AFFILIATE_TAG)) {
      console.warn(
        `[deal-feed] skipping ${coerced.id}: main_affiliate_url missing ${REQUIRED_AFFILIATE_TAG}`,
      )
      return []
    }
    return [coerced]
  })
}

export function computeDiscountPercent(
  price: number | null,
  original: number | null,
): number | null {
  if (price === null || original === null) return null
  if (original <= 0 || price < 0 || price >= original) return null
  return Math.round((1 - price / original) * 100)
}

export function daysUntilExpiry(validUntil: string | null): number | null {
  if (!validUntil) return null
  const t = Date.parse(validUntil)
  if (!Number.isFinite(t)) return null
  const ms = t - Date.now()
  if (ms < 0) return -1
  return Math.ceil(ms / (24 * 60 * 60 * 1000))
}

export function isExpired(validUntil: string | null): boolean {
  const d = daysUntilExpiry(validUntil)
  return d !== null && d < 0
}

export interface FeedFilters {
  category?: string
  minDiscount?: number
}

export function applyFilters(deals: FeedDeal[], f: FeedFilters): FeedDeal[] {
  return deals.filter((d) => {
    if (isExpired(d.valid_until)) return false
    if (!d.image && !d.image_source) return false
    if (f.category && d.category !== f.category) return false
    if (f.minDiscount && f.minDiscount > 0) {
      const disc = computeDiscountPercent(d.price, d.original_price) ?? 0
      if (disc < f.minDiscount) return false
    }
    return true
  })
}

export function sortDeals(deals: FeedDeal[]): FeedDeal[] {
  return [...deals].sort((a, b) => {
    const da = computeDiscountPercent(a.price, a.original_price) ?? 0
    const db = computeDiscountPercent(b.price, b.original_price) ?? 0
    if (db !== da) return db - da
    const la = a.lastmod ? Date.parse(a.lastmod) : 0
    const lb = b.lastmod ? Date.parse(b.lastmod) : 0
    return lb - la
  })
}

export function uniqueCategories(deals: FeedDeal[]): string[] {
  const set = new Set<string>()
  for (const d of deals) if (d.category) set.add(d.category)
  return [...set].sort()
}
