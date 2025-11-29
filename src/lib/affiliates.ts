/**
 * Affiliate Links Configuration
 *
 * Central config for all store affiliate links.
 * Supports multiple networks: ShopStyle, Rakuten, etc.
 */

// =============================================================================
// AMAZON AFFILIATE CONFIG
// =============================================================================

// PromoPenguin Amazon Associates tag
const AMAZON_AFFILIATE_TAG = 'promopenguin-20'

/**
 * Clean an Amazon URL and replace any existing affiliate tag with ours
 */
export function cleanAmazonUrl(url: string): string {
  if (!url) return url

  // Check if it's an Amazon URL
  if (!url.includes('amazon.ca') && !url.includes('amazon.com') && !url.includes('amzn.')) {
    return url
  }

  try {
    const urlObj = new URL(url)

    // Remove any existing tag parameter
    urlObj.searchParams.delete('tag')

    // Add our affiliate tag
    urlObj.searchParams.set('tag', AMAZON_AFFILIATE_TAG)

    return urlObj.toString()
  } catch {
    // If URL parsing fails, try simple regex replacement
    // Remove existing tag parameter
    let cleanUrl = url.replace(/[?&]tag=[^&]+/gi, '')

    // Add our tag
    const separator = cleanUrl.includes('?') ? '&' : '?'
    return `${cleanUrl}${separator}tag=${AMAZON_AFFILIATE_TAG}`
  }
}

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
    mid: '50435',  // Bass Pro Shops & Cabela's Canada
    domain: 'https://www.basspro.com',
    searchPath: '/shop/en/bps/search?q=',
  },
  'cabelas': {
    mid: '50435',  // Same merchant ID as Bass Pro
    domain: 'https://www.cabelas.ca',
    searchPath: '/search?q=',
  },
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
  'michael-kors': 'https://shopstyle.it/l/cw4L3',

  // Beauty
  'sephora': 'https://shopstyle.it/l/cw4bZ',

  // Big Box
  'walmart': 'https://shopstyle.it/l/cw4cc',
}

// Direct retailer search URLs (non-affiliate fallback)
// Used when we don't have an affiliate program for the store
const RETAILER_SEARCH_URLS: Record<string, string> = {
  'costco': 'https://www.costco.ca/CatalogSearch?keyword=',
  'best-buy': 'https://www.bestbuy.ca/en-ca/search?search=',
  'canadian-tire': 'https://www.canadiantire.ca/en/search.html?q=',
  'the-brick': 'https://www.thebrick.com/search?q=',
  'leons': 'https://www.leons.ca/search?q=',
  'shoppers': 'https://shop.shoppersdrugmart.ca/Shop/Search?q=',
  'no-frills': 'https://www.nofrills.ca/search?search-bar=',
  'superstore': 'https://www.realcanadiansuperstore.ca/search?search-bar=',
  'loblaws': 'https://www.loblaws.ca/search?search-bar=',
  'metro': 'https://www.metro.ca/en/online-grocery/search?filter=',
  'food-basics': 'https://www.foodbasics.ca/search?filter=',
  'freshco': 'https://www.freshco.com/search?q=',
  'sobeys': 'https://www.sobeys.com/en/search/?q=',
  'safeway': 'https://www.safeway.ca/search?q=',
  'save-on-foods': 'https://www.saveonfoods.com/search?q=',
  'london-drugs': 'https://www.londondrugs.com/search/?q=',
  'staples': 'https://www.staples.ca/search?query=',
  'home-depot': 'https://www.homedepot.ca/search?q=',
  'rona': 'https://www.rona.ca/en/search?q=',
  'home-hardware': 'https://www.homehardware.ca/en/search?q=',
  'princess-auto': 'https://www.princessauto.com/search?q=',
  'sport-chek': 'https://www.sportchek.ca/search.html?q=',
  'marks': 'https://www.marks.com/en/search.html?q=',
  'atmosphere': 'https://www.atmosphere.ca/search.html?q=',
  'petsmart': 'https://www.petsmart.ca/search/?q=',
  'pet-valu': 'https://www.petvalu.ca/search?q=',
  'toys-r-us': 'https://www.toysrus.ca/en/toysrus/search?q=',
  'giant-tiger': 'https://www.gianttiger.com/search?q=',
  'ikea': 'https://www.ikea.com/ca/en/search/?q=',
  'the-bay': 'https://www.thebay.com/search?q=',
  'winners': 'https://www.winners.ca/en', // No search, just homepage
  'dollarama': 'https://www.dollarama.com/en-CA/search?q=',
  'visions': 'https://www.visions.ca/Catalogue/Search?keywords=',
  // Additional retailers
  'wholesale-club': 'https://www.wholesaleclub.ca/search?search-bar=',
  'eb-games': 'https://www.ebgames.ca/SearchResult/QuickSearch?q=',
  'adonis': 'https://www.marchesadonis.com/en/search?q=',
  'old-navy': 'https://oldnavy.gapcanada.ca/browse/search.do?searchText=',
  'gap': 'https://www.gapcanada.ca/browse/search.do?searchText=',
  'rexall': 'https://www.rexall.ca/search?q=',
  'jean-coutu': 'https://www.jeancoutu.com/en/search/?q=',
  'pharmaprix': 'https://www1.pharmaprix.ca/fr/search?q=',
  'iga': 'https://www.iga.net/en/search?q=',
  'maxi': 'https://www.maxi.ca/search?search-bar=',
  'provigo': 'https://www.provigo.ca/search?search-bar=',
  'super-c': 'https://www.superc.ca/search?search-bar=',
  'walmart': 'https://www.walmart.ca/search?q=',
  'amazon': 'https://www.amazon.ca/s?k=',
  'indigo': 'https://www.indigo.ca/en-ca/search/?q=',
  'michaels': 'https://canada.michaels.com/en/search?q=',
  'party-city': 'https://www.partycity.ca/en/catalogsearch/result/?q=',
  'lowes': 'https://www.lowes.ca/search?searchTerm=',
  'reno-depot': 'https://www.renodepot.com/en/search?q=',
  'tsc-stores': 'https://www.tscstores.com/search?q=',
  'marshalls': 'https://www.marshalls.ca/en', // No search
  'structube': 'https://www.structube.com/en_ca/catalogsearch/result/?q=',
  'sleep-country': 'https://www.sleepcountry.ca/search?q=',
  'the-source': 'https://www.thesource.ca/en-ca/search?text=',
  'homesense': 'https://www.homesense.ca/en', // No search
  'cabelas': 'https://www.cabelas.ca/search?q=',
  'bass-pro': 'https://www.basspro.com/shop/en/bps/search?q=',
  'peavey-mart': 'https://www.peaveymart.com/search?q=',
  // Common RFD store name variations
  'amazon-ca': 'https://www.amazon.ca/s?k=',
  'amazon-canada': 'https://www.amazon.ca/s?k=',
  'amazonca': 'https://www.amazon.ca/s?k=',
  'bestbuy': 'https://www.bestbuy.ca/en-ca/search?search=',
  'canadiantire': 'https://www.canadiantire.ca/en/search.html?q=',
  'homedepot': 'https://www.homedepot.ca/search?q=',
  'shoppers-drug-mart': 'https://shop.shoppersdrugmart.ca/Shop/Search?q=',
  'real-canadian-superstore': 'https://www.realcanadiansuperstore.ca/search?search-bar=',
  'hudsons-bay': 'https://www.thebay.com/search?q=',
  'hudson-s-bay': 'https://www.thebay.com/search?q=',
  'sportchek': 'https://www.sportchek.ca/search.html?q=',
  'toysrus': 'https://www.toysrus.ca/en/toysrus/search?q=',
  'toys-r-us-canada': 'https://www.toysrus.ca/en/toysrus/search?q=',
  'dell': 'https://www.dell.com/en-ca/search/laptop?p=1&q=',
  'dell-canada': 'https://www.dell.com/en-ca/search/laptop?p=1&q=',
  'lenovo': 'https://www.lenovo.com/ca/en/search?text=',
  'lenovo-canada': 'https://www.lenovo.com/ca/en/search?text=',
  'newegg': 'https://www.newegg.ca/p/pl?d=',
  'newegg-canada': 'https://www.newegg.ca/p/pl?d=',
  'memory-express': 'https://www.memoryexpress.com/Search/Products?Search=',
  'memoryexpress': 'https://www.memoryexpress.com/Search/Products?Search=',
  'canada-computers': 'https://www.canadacomputers.com/search.php?search=',
  'canadacomputers': 'https://www.canadacomputers.com/search.php?search=',
  'apple': 'https://www.apple.com/ca/shop/search/',
  'apple-canada': 'https://www.apple.com/ca/shop/search/',
  'microsoft': 'https://www.microsoft.com/en-ca/search?q=',
  'microsoft-store': 'https://www.microsoft.com/en-ca/search?q=',
  'google-store': 'https://store.google.com/ca/search?q=',
  'samsung': 'https://www.samsung.com/ca/search/?searchvalue=',
  'samsung-canada': 'https://www.samsung.com/ca/search/?searchvalue=',
  'wayfair': 'https://www.wayfair.ca/keyword.html?keyword=',
  'wayfair-canada': 'https://www.wayfair.ca/keyword.html?keyword=',
  'uniqlo': 'https://www.uniqlo.com/ca/en/search?q=',
  'uniqlo-canada': 'https://www.uniqlo.com/ca/en/search?q=',
  'h-m': 'https://www2.hm.com/en_ca/search-results.html?q=',
  'zara': 'https://www.zara.com/ca/en/search?searchTerm=',
  'simons': 'https://www.simons.ca/en/search?q=',
  'la-maison-simons': 'https://www.simons.ca/en/search?q=',
  'sportinglife': 'https://www.sportinglife.ca/en-CA/search?q=',
  'sporting-life': 'https://www.sportinglife.ca/en-CA/search?q=',
  'running-room': 'https://www.runningroom.com/hm/inside.php?searchString=',
  'mec': 'https://www.mec.ca/en/search?text=',
  'sail': 'https://www.sail.ca/en/catalogsearch/result/?q=',
  'decathlon': 'https://www.decathlon.ca/en/search?Ntt=',
  'costco-canada': 'https://www.costco.ca/CatalogSearch?keyword=',
  'lee-valley': 'https://www.leevalley.com/en-ca/search#q=',
  'leevalley': 'https://www.leevalley.com/en-ca/search#q=',
  'lee-valley-tools': 'https://www.leevalley.com/en-ca/search#q=',
}


// Cookie consent bypass - append after search query for sites with known popups
const COOKIE_BYPASS_PARAMS: Record<string, string> = {
  'metro': '&cookieConsent=accepted',
  'sobeys': '&privacy_policy_accepted=true',
  'safeway': '&privacy_policy_accepted=true',
  'ikea': '&irclickid=bypass',
  'the-bay': '&site_preference=desktop',
  'hudsons-bay': '&site_preference=desktop',
  'sport-chek': '&consent=1',
  'marks': '&consent=1',
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
 * Falls back to direct retailer search if no affiliate available
 */
export function getAffiliateSearchUrl(storeSlug: string | null, productTitle: string): string | null {
  if (!storeSlug) return null

  // Try ShopStyle first (affiliate)
  const shopStyleUrl = buildShopStyleLink(storeSlug, productTitle)
  if (shopStyleUrl) return shopStyleUrl

  // Try Rakuten (affiliate)
  const rakutenUrl = buildRakutenDeepLink(storeSlug, productTitle)
  if (rakutenUrl) return rakutenUrl

  // Fall back to direct retailer search (non-affiliate)
  const retailerSearchUrl = RETAILER_SEARCH_URLS[storeSlug]
  if (retailerSearchUrl) {
    const bypassParam = COOKIE_BYPASS_PARAMS[storeSlug] || ''
    return `${retailerSearchUrl}${encodeURIComponent(productTitle)}${bypassParam}`
  }

  return null
}

/**
 * Get the best affiliate URL for a deal:
 * 1. Use deal's affiliate_url if it exists (cleaned for Amazon)
 * 2. Fall back to store affiliate link + product search
 * 3. Return null if no affiliate available
 */
export function getDealAffiliateUrl(
  dealAffiliateUrl: string | null | undefined,
  storeSlug: string | null,
  productTitle: string
): string | null {
  // If deal has its own affiliate URL, use that (but clean Amazon URLs)
  if (dealAffiliateUrl) {
    return cleanAmazonUrl(dealAffiliateUrl)
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
// AFFILIATE BRAND CONFIG (single source of truth)
// =============================================================================

export interface AffiliateBrand {
  name: string
  slug: string
  emoji: string
  tagline: string
  description: string
  color: string        // Tailwind gradient classes
  bgColor: string      // Light background for chips
  textColor: string    // Text color for chips
  image?: string       // Primary image for the brand
}

// All affiliate brands with full styling config
export const AFFILIATE_BRANDS: AffiliateBrand[] = [
  {
    name: 'Lululemon',
    slug: 'lululemon',
    emoji: '🧘',
    tagline: 'We Made Too Much Sale!',
    description: 'Premium athletic wear from Vancouver',
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    image: '/images/affiliates/lululemon/1.avif',
  },
  {
    name: 'Roots',
    slug: 'roots',
    emoji: '🍁',
    tagline: 'Roots Sale On Now!',
    description: 'Canadian heritage leather & apparel',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    image: '/images/affiliates/roots/1.jpg',
  },
  {
    name: 'Aritzia',
    slug: 'aritzia',
    emoji: '✨',
    tagline: 'Aritzia Sale On Now!',
    description: 'Elevated everyday fashion from Vancouver',
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    image: '/images/affiliates/aritzia/1.jpg',
  },
  {
    name: 'Ardene',
    slug: 'ardene',
    emoji: '💃',
    tagline: 'Ardene Sale On Now!',
    description: 'Affordable trend-forward fashion from Montreal',
    color: 'from-teal-500 to-cyan-600',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    image: '/images/affiliates/ardene/1.webp',
  },
  {
    name: 'Sephora',
    slug: 'sephora',
    emoji: '💄',
    tagline: 'Sephora Sale On Now!',
    description: 'Premium beauty and cosmetics',
    color: 'from-black to-gray-800',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-900',
    image: '/images/affiliates/sephora/1.jpeg',
  },
  {
    name: "Cabela's",
    slug: 'cabelas',
    emoji: '🎣',
    tagline: 'Outdoor Deals!',
    description: 'Fishing, hunting & outdoor gear',
    color: 'from-green-600 to-green-800',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
  },
  {
    name: 'Michael Kors',
    slug: 'michael-kors',
    emoji: '👜',
    tagline: 'Luxury Sale On Now!',
    description: 'Designer handbags, watches & accessories',
    color: 'from-stone-700 to-stone-900',
    bgColor: 'bg-stone-100',
    textColor: 'text-stone-800',
    image: '/images/affiliates/michael-kors/1.webp',
  },
]

/**
 * Get brand by slug
 */
export function getAffiliateBrand(slug: string): AffiliateBrand | null {
  return AFFILIATE_BRANDS.find(b => b.slug === slug) || null
}

/**
 * Get affiliate URL for a brand (base, no search)
 */
export function getBrandAffiliateUrl(slug: string): string | null {
  return getStoreAffiliateLink(slug)
}
