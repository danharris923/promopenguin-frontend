/**
 * Affiliate Links Configuration
 *
 * Central config for all store affiliate links.
 * Add new stores here as we onboard them.
 */

// =============================================================================
// STORE AFFILIATE LINKS
// =============================================================================

export const STORE_AFFILIATES: Record<string, string> = {
  // Fashion & Apparel
  'lululemon': 'https://shopstyle.it/l/cwE20',
  'roots': 'https://shopstyle.it/l/cwE2E',
  'aritzia': 'https://shopstyle.it/l/cwE2N',
  'ardene': 'https://shopstyle.it/l/cwE8W',

  // Beauty
  'sephora': 'https://shopstyle.it/l/cw4bZ',

  // Big Box
  'walmart': 'https://shopstyle.it/l/cw4cc',

  // Add more stores here as we get affiliate links...
  // 'costco': 'https://...',
  // 'best-buy': 'https://...',
  // 'canadian-tire': 'https://...',
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get affiliate link for a store (base URL without search)
 */
export function getStoreAffiliateLink(storeSlug: string | null): string | null {
  if (!storeSlug) return null
  return STORE_AFFILIATES[storeSlug] || null
}

/**
 * Get affiliate link with product search query appended
 */
export function getAffiliateSearchUrl(storeSlug: string | null, productTitle: string): string | null {
  const baseUrl = getStoreAffiliateLink(storeSlug)
  if (!baseUrl) return null
  const searchQuery = encodeURIComponent(productTitle)
  return `${baseUrl}?searchText=${searchQuery}`
}

/**
 * Get the best affiliate URL for a deal:
 * 1. Use deal's affiliate_url if it exists
 * 2. Fall back to store's ShopStyle link + product search
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
  return storeSlug in STORE_AFFILIATES
}

/**
 * Get list of all stores with affiliate links
 */
export function getAffiliateStores(): string[] {
  return Object.keys(STORE_AFFILIATES)
}
