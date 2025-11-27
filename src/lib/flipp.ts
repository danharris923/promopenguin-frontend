/**
 * Flipp API Client
 *
 * Unofficial API for fetching Canadian flyer deals.
 * Endpoint: https://backflipp.wishabi.com/flipp/items/search
 */

// =============================================================================
// TYPES
// =============================================================================

export interface FlippItem {
  id: number
  flyer_item_id: number
  flyer_id: number
  name: string
  current_price: number | null
  original_price: number | null
  sale_story: string | null
  merchant_id: number
  merchant_name: string
  merchant_logo: string
  clean_image_url: string
  clipping_image_url: string
  valid_from: string
  valid_to: string
  _L1: string | null  // Category level 1
  _L2: string | null  // Category level 2
  item_type: 'flyer' | 'ecom'
  pre_price_text: string | null
  post_price_text: string | null
}

export interface FlippEcomItem {
  id: number
  global_id: string
  name: string
  description: string
  current_price: number | null
  original_price: number | null
  merchant: string
  merchant_id: number
  merchant_logo: string
  image_url: string
  item_id: string
  sku: string
  average_rating: number | null
  total_reviews: number
  item_type: 'ecom'
}

export interface FlippMerchant {
  id: number
  name: string
  name_identifier: string
  us_based: boolean
  storefront_logo: string
}

export interface FlippSearchResponse {
  items: FlippItem[]
  ecom_items: FlippEcomItem[]
  merchants: FlippMerchant[]
  flyers: unknown[]
  facets: unknown
  normalized_query: string
}

export interface FlippDeal {
  id: string
  title: string
  slug: string
  imageUrl: string
  price: number | null
  originalPrice: number | null
  discountPercent: number | null
  store: string
  storeSlug: string
  storeLogo: string
  category: string | null
  saleStory: string | null
  validFrom: string
  validTo: string
  source: 'flipp'
}

// =============================================================================
// CONFIG
// =============================================================================

const FLIPP_API_URL = 'https://backflipp.wishabi.com/flipp/items/search'
const DEFAULT_LOCALE = 'en-ca'
const DEFAULT_POSTAL_CODE = 'M5V1J2' // Toronto

// Store name to slug mapping
const STORE_SLUGS: Record<string, string> = {
  'Walmart': 'walmart',
  'Costco': 'costco',
  'Best Buy': 'best-buy',
  'Canadian Tire': 'canadian-tire',
  'The Brick': 'the-brick',
  'Leon\'s': 'leons',
  'Shoppers Drug Mart': 'shoppers',
  'No Frills': 'no-frills',
  'Real Canadian Superstore': 'superstore',
  'Loblaws': 'loblaws',
  'Metro': 'metro',
  'Food Basics': 'food-basics',
  'FreshCo': 'freshco',
  'Sobeys': 'sobeys',
  'Safeway': 'safeway',
  'Save-On-Foods': 'save-on-foods',
  'London Drugs': 'london-drugs',
  'Staples': 'staples',
  'Home Depot': 'home-depot',
  'RONA': 'rona',
  'Home Hardware': 'home-hardware',
  'Princess Auto': 'princess-auto',
  'Peavey Mart': 'peavey-mart',
  'Sport Chek': 'sport-chek',
  'Mark\'s': 'marks',
  'Atmosphere': 'atmosphere',
  'PetSmart': 'petsmart',
  'Pet Valu': 'pet-valu',
  'Toys R Us': 'toys-r-us',
  'Giant Tiger': 'giant-tiger',
  'Dollarama': 'dollarama',
  'IKEA': 'ikea',
  'Hudson\'s Bay': 'the-bay',
  'Winners': 'winners',
  'HomeSense': 'homesense',
  'Bed Bath & Beyond': 'bed-bath-beyond',
  'Kitchen Stuff Plus': 'kitchen-stuff-plus',
  'Long & McQuade Musical Instruments': 'long-mcquade',
  '2001 Audio Video': '2001-audio-video',
  'TeleTime': 'teletime',
  'Visions Electronics': 'visions',
  'Bass Pro Shops': 'bass-pro',
  'Cabela\'s': 'cabelas',
  // Additional stores from Flipp
  'Wholesale Club and Club Entrepôt': 'wholesale-club',
  'Wholesale Club': 'wholesale-club',
  'Club Entrepôt': 'wholesale-club',
  'EB Games Canada': 'eb-games',
  'EB Games': 'eb-games',
  'Adonis': 'adonis',
  'Old Navy': 'old-navy',
  'Old Navy Canada': 'old-navy',
  'Gap': 'gap',
  'Gap Canada': 'gap',
  'Cabela\'s & Bass Pro': 'bass-pro',
  'CABELA\'S & BASS PRO': 'bass-pro',
  'Rexall': 'rexall',
  'Jean Coutu': 'jean-coutu',
  'Pharmaprix': 'pharmaprix',
  'IGA': 'iga',
  'Maxi': 'maxi',
  'Provigo': 'provigo',
  'Super C': 'super-c',
  'Walmart Canada': 'walmart',
  'Amazon.ca': 'amazon',
  'Indigo': 'indigo',
  'Chapters': 'indigo',
  'Michaels': 'michaels',
  'Party City': 'party-city',
  'Lowe\'s': 'lowes',
  'Lowes': 'lowes',
  'Reno-Depot': 'reno-depot',
  'TSC Stores': 'tsc-stores',
  'Tractor Supply': 'tractor-supply',
  'Marshalls': 'marshalls',
  'Structube': 'structube',
  'Sleep Country': 'sleep-country',
  'The Source': 'the-source',
  'Bureau en Gros': 'staples',
  'Tiger Direct': 'tiger-direct',
}

// Category mapping from Flipp _L1 to our categories
const CATEGORY_MAP: Record<string, string> = {
  'Electronics': 'electronics',
  'Computers & Software': 'electronics',
  'Home & Garden': 'home',
  'Kitchen & Dining': 'home',
  'Furniture': 'home',
  'Apparel & Accessories': 'fashion',
  'Health & Beauty': 'beauty',
  'Food': 'grocery',
  'Beverages': 'grocery',
  'Sports & Outdoors': 'sports',
  'Toys & Games': 'toys',
  'Baby & Kids': 'kids',
  'Automotive': 'automotive',
  'Pet Supplies': 'pets',
  'Office Supplies': 'office',
  'Tools & Hardware': 'home',
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Search Flipp for deals
 */
export async function searchFlipp(
  query: string,
  postalCode: string = DEFAULT_POSTAL_CODE,
  limit: number = 50
): Promise<FlippSearchResponse> {
  const url = new URL(FLIPP_API_URL)
  url.searchParams.set('locale', DEFAULT_LOCALE)
  url.searchParams.set('postal_code', postalCode)
  url.searchParams.set('q', query)
  url.searchParams.set('limit', String(limit))

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'PromoPenguin/1.0',
    },
    next: { revalidate: 900 } // Cache for 15 minutes
  })

  if (!response.ok) {
    throw new Error(`Flipp API error: ${response.status}`)
  }

  return response.json()
}

/**
 * Get deals for a specific store
 */
export async function getFlippStoreDeals(
  storeName: string,
  postalCode: string = DEFAULT_POSTAL_CODE
): Promise<FlippDeal[]> {
  try {
    const response = await searchFlipp(storeName, postalCode)
    // Filter to only include items from the requested store
    // (Flipp search can return items where the query matches product name, not just store)
    const storeNameLower = storeName.toLowerCase()
    const filteredItems = response.items.filter(item =>
      item.merchant_name.toLowerCase().includes(storeNameLower) ||
      storeNameLower.includes(item.merchant_name.toLowerCase())
    )
    return transformFlippItems(filteredItems)
  } catch (error) {
    console.error(`Error fetching Flipp deals for ${storeName}:`, error)
    return []
  }
}

/**
 * Get deals for a product search
 */
export async function searchFlippDeals(
  query: string,
  limit: number = 50,
  postalCode: string = DEFAULT_POSTAL_CODE
): Promise<FlippDeal[]> {
  try {
    const response = await searchFlipp(query, postalCode, limit * 2)
    const deals = transformFlippItems(response.items)
    return deals.slice(0, limit)
  } catch (error) {
    console.error(`Error searching Flipp for ${query}:`, error)
    return []
  }
}

/**
 * Get deals from multiple stores
 */
export async function getFlippDealsMultiStore(
  storeNames: string[],
  postalCode: string = DEFAULT_POSTAL_CODE
): Promise<FlippDeal[]> {
  const allDeals: FlippDeal[] = []

  for (const store of storeNames) {
    const deals = await getFlippStoreDeals(store, postalCode)
    allDeals.push(...deals)
  }

  // Dedupe by id
  const seen = new Set<string>()
  return allDeals.filter(deal => {
    if (seen.has(deal.id)) return false
    seen.add(deal.id)
    return true
  })
}

// =============================================================================
// TRANSFORM FUNCTIONS
// =============================================================================

/**
 * Transform Flipp items to our deal format
 * Filters out low-quality items (no price, too cheap, no image)
 */
function transformFlippItems(items: FlippItem[]): FlippDeal[] {
  return items
    .filter(item => {
      // Must have name and price
      if (!item.name || item.current_price === null) return false
      // Skip items under $1 (often have bad cropped images)
      if (item.current_price < 1) return false
      // Must have an image
      if (!item.clean_image_url && !item.clipping_image_url) return false
      // Skip if name is just the store name (it's a logo/banner)
      if (item.name.toLowerCase() === item.merchant_name.toLowerCase()) return false
      return true
    })
    .map(item => transformFlippItem(item))
}

/**
 * Transform a single Flipp item
 */
function transformFlippItem(item: FlippItem): FlippDeal {
  const storeSlug = getStoreSlug(item.merchant_name)
  const discountPercent = calculateDiscount(item.original_price, item.current_price)

  return {
    id: `flipp-${item.flyer_item_id || item.id}`,
    title: cleanTitle(item.name),
    slug: generateSlug(item.name, item.flyer_item_id || item.id),
    imageUrl: item.clean_image_url || item.clipping_image_url,
    price: item.current_price,
    originalPrice: item.original_price,
    discountPercent,
    store: item.merchant_name,
    storeSlug,
    storeLogo: item.merchant_logo,
    category: mapCategory(item._L1),
    saleStory: item.sale_story,
    validFrom: item.valid_from,
    validTo: item.valid_to,
    source: 'flipp',
  }
}

// =============================================================================
// HELPERS
// =============================================================================

function getStoreSlug(merchantName: string): string {
  return STORE_SLUGS[merchantName] || merchantName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function mapCategory(flippCategory: string | null): string | null {
  if (!flippCategory) return null
  return CATEGORY_MAP[flippCategory] || 'general'
}

function calculateDiscount(original: number | null, current: number | null): number | null {
  if (!original || !current || original <= current) return null
  return Math.round(((original - current) / original) * 100)
}

function cleanTitle(name: string): string {
  // Remove excessive whitespace
  return name.replace(/\s+/g, ' ').trim()
}

function generateSlug(name: string, id: number): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
  return `${base}-${id}`
}

// =============================================================================
// STORE LIST
// =============================================================================

/**
 * Get list of supported stores for Flipp
 */
export function getFlippStores(): { name: string; slug: string }[] {
  return Object.entries(STORE_SLUGS).map(([name, slug]) => ({ name, slug }))
}

/**
 * Get store name from slug
 */
export function getStoreNameFromSlug(slug: string): string | null {
  for (const [name, s] of Object.entries(STORE_SLUGS)) {
    if (s === slug) return name
  }
  return null
}

/**
 * Check if a store slug has Flipp flyer support
 */
export function hasFlippSupport(slug: string): boolean {
  return Object.values(STORE_SLUGS).includes(slug)
}

/**
 * Get all Flipp-supported store slugs
 */
export function getFlippStoreSlugs(): string[] {
  return Object.values(STORE_SLUGS)
}

