/**
 * Flipp API Client
 *
 * Unofficial API for fetching Canadian flyer deals.
 * Endpoint: https://backflipp.wishabi.com/flipp/items/search
 */

import type { Deal } from '@/types/deal'
import { getAffiliateSearchUrl } from './affiliates'

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

export interface FlippSearchResponse {
  items: FlippItem[]
  ecom_items: unknown[]
  merchants: unknown[]
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
  'The Source': 'the-source',
  'Walmart Canada': 'walmart',
  'Amazon.ca': 'amazon',
  'Indigo': 'indigo',
  'Old Navy': 'old-navy',
  'Gap': 'gap',
  'Rexall': 'rexall',
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

async function searchFlippDeals(
  query: string,
  limit: number = 50,
  postalCode: string = DEFAULT_POSTAL_CODE
): Promise<FlippDeal[]> {
  try {
    const response = await searchFlipp(query, postalCode, limit * 2)
    return transformFlippItems(response.items).slice(0, limit)
  } catch (error) {
    console.error(`Error searching Flipp for ${query}:`, error)
    return []
  }
}

// =============================================================================
// TRANSFORM FUNCTIONS
// =============================================================================

/**
 * Transform Flipp items to our deal format
 */
function transformFlippItems(items: FlippItem[]): FlippDeal[] {
  return items
    .filter(item => {
      // Must have name and price
      if (!item.name || item.current_price === null) return false
      // Skip items under $1
      if (item.current_price < 1) return false
      // Must have an image
      if (!item.clean_image_url && !item.clipping_image_url) return false
      // Skip if name is just the store name
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
  return name.replace(/\s+/g, ' ').trim()
}

function generateSlug(name: string, id: number): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
  return `flipp-${base}-${id}`
}

// =============================================================================
// STORE LIST
// =============================================================================

/**
 * Check if a store slug has Flipp flyer support
 */
export function hasFlippSupport(slug: string): boolean {
  return Object.values(STORE_SLUGS).includes(slug)
}

// Adapt a FlippDeal to the shared Deal shape so it can be rendered through
// DealCard alongside DB-sourced deals. The affiliate_url points to the
// retailer's own search for the product title (same pattern as retagged RFD
// rows). Amazon tag injection happens inside getAffiliateSearchUrl.
export function flippToDeal(f: FlippDeal): Deal | null {
  const searchUrl = getAffiliateSearchUrl(f.storeSlug, f.title)
  if (!searchUrl) return null
  return {
    id: f.id,
    title: f.title,
    slug: f.slug,
    image_url: f.imageUrl,
    image_blob_url: null,
    price: f.price,
    original_price: f.originalPrice,
    discount_percent: f.discountPercent,
    store: f.store,
    category: f.category,
    description: null,
    affiliate_url: searchUrl,
    source_url: null,
    featured: false,
    date_added: f.validFrom,
    date_updated: f.validFrom,
    is_active: true,
  }
}

// Fetch a generic pool of Flipp flyer items and return them as Deals.
// Used by the homepage / search / mix helper.
export async function getFlippDealsAsDeals(query: string, limit: number): Promise<Deal[]> {
  const flipp = await searchFlippDeals(query, limit)
  return flipp.map(flippToDeal).filter((d): d is Deal => d !== null).slice(0, limit)
}
