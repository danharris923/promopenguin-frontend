/**
 * Affiliate Links Configuration
 *
 * Central config for all store affiliate links.
 * Supports multiple networks: ShopStyle, Rakuten, etc.
 */

// =============================================================================
// RAKUTEN CONFIG
// =============================================================================

// Your Rakuten publisher ID (constant across all merchants)
const RAKUTEN_PUBLISHER_ID = 'sUVpAjRtGL4'

// Rakuten merchant configs: { mid, searchPath }
interface RakutenMerchant {
  mid: string           // Merchant ID from Rakuten dashboard
  domain: string        // Merchant's website domain
  searchPath: string    // Path to search page with query param
}

const RAKUTEN_MERCHANTS: Record<string, RakutenMerchant> = {
  'bass-pro': {
    mid: '46158',  // TODO: Find actual mid in Rakuten dashboard under Programs > My Advertisers > Bass Pro
    domain: 'https://www.basspro.com',
    searchPath: '/shop/en/bps/search?q=',
  },
  // Add more Rakuten merchants here...
  // 'cabelas': { mid: 'xxxxx', domain: 'https://www.cabelas.ca', searchPath: '/search?q=' },
}

/**
 * Build Rakuten deep link with search query
 */
function buildRakutenDeepLink(merchantSlug: string, searchQuery: string): string | null {
  const merchant = RAKUTEN_MERCHANTS[merchantSlug]
  if (!merchant) return null

  const targetUrl = `${merchant.domain}${merchant.searchPath}${encodeURIComponent(searchQuery)}`
  const encodedUrl = encodeURIComponent(targetUrl)

  return `https://click.linksynergy.com/deeplink?id=${RAKUTEN_PUBLISHER_ID}&mid=${merchant.mid}&murl=${encodedUrl}`
}

// =============================================================================
// SHOPSTYLE CONFIG (simple URL + searchText param)
// =============================================================================

const SHOPSTYLE_LINKS: Record<string, string> = {
  // Fashion & Apparel
  'lululemon': 'https://shopstyle.it/l/cwE20',
  'roots': 'https://shopstyle.it/l/cwE2E',
  'aritzia': 'https://shopstyle.it/l/cwE2N',
  'ardene': 'https://shopstyle.it/l/cwE8W',

  // Beauty
  'sephora': 'https://shopstyle.it/l/cw4bZ',

  // Big Box
  'walmart': 'https://shopstyle.it/l/cw4cc',
}

/**
 * Build ShopStyle link with search query
 */
function buildShopStyleLink(storeSlug: string, searchQuery: string): string | null {
  const baseUrl = SHOPSTYLE_LINKS[storeSlug]
  if (!baseUrl) return null
  return `${baseUrl}?searchText=${encodeURIComponent(searchQuery)}`
}

// =============================================================================
// UNIFIED API
// =============================================================================

/**
 * Get affiliate link for a store (base URL without search)
 */
export function getStoreAffiliateLink(storeSlug: string | null): string | null {
  if (!storeSlug) return null

  // Check ShopStyle first
  if (SHOPSTYLE_LINKS[storeSlug]) {
    return SHOPSTYLE_LINKS[storeSlug]
  }

  // Check Rakuten (return base link to homepage)
  const rakutenMerchant = RAKUTEN_MERCHANTS[storeSlug]
  if (rakutenMerchant) {
    const encodedUrl = encodeURIComponent(rakutenMerchant.domain)
    return `https://click.linksynergy.com/deeplink?id=${RAKUTEN_PUBLISHER_ID}&mid=${rakutenMerchant.mid}&murl=${encodedUrl}`
  }

  return null
}

/**
 * Get affiliate link with product search query appended
 */
export function getAffiliateSearchUrl(storeSlug: string | null, productTitle: string): string | null {
  if (!storeSlug) return null

  // Try ShopStyle first
  const shopStyleUrl = buildShopStyleLink(storeSlug, productTitle)
  if (shopStyleUrl) return shopStyleUrl

  // Try Rakuten
  const rakutenUrl = buildRakutenDeepLink(storeSlug, productTitle)
  if (rakutenUrl) return rakutenUrl

  return null
}

/**
 * Get the best affiliate URL for a deal:
 * 1. Use deal's affiliate_url if it exists
 * 2. Fall back to store affiliate link + product search
 * 3. Return null if no affiliate available
 */
export function getDealAffiliateUrl(
  dealAffiliateUrl: string | null | undefined,
  storeSlug: string | null,
  productTitle: string
): string | null {
  // If deal has its own affiliate URL, use that
  if (dealAffiliateUrl) {
    return dealAffiliateUrl
  }

  // Otherwise, try to build one from store affiliate + search
  return getAffiliateSearchUrl(storeSlug, productTitle)
}

/**
 * Check if a store has an affiliate link
 */
export function hasStoreAffiliate(storeSlug: string | null): boolean {
  if (!storeSlug) return false
  return storeSlug in SHOPSTYLE_LINKS || storeSlug in RAKUTEN_MERCHANTS
}

/**
 * Get list of all stores with affiliate links
 */
export function getAffiliateStores(): string[] {
  return [...Object.keys(SHOPSTYLE_LINKS), ...Object.keys(RAKUTEN_MERCHANTS)]
}

// =============================================================================
// FEATURED BRANDS (for Header ticker, Featured section)
// =============================================================================

export const FEATURED_BRANDS = [
  { name: 'Lululemon', slug: 'lululemon', emoji: '🧘', tagline: 'We Made Too Much Sale!' },
  { name: 'Roots', slug: 'roots', emoji: '🍁', tagline: 'Roots Sale On Now!' },
  { name: 'Aritzia', slug: 'aritzia', emoji: '✨', tagline: 'Aritzia Sale On Now!' },
  { name: 'Ardene', slug: 'ardene', emoji: '💃', tagline: 'Ardene Sale On Now!' },
  { name: 'Sephora', slug: 'sephora', emoji: '💄', tagline: 'Sephora Sale On Now!' },
  { name: 'Bass Pro', slug: 'bass-pro', emoji: '🎣', tagline: 'Outdoor Deals!' },
]
