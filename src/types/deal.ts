/**
 * Core deal type - matches database schema
 */
export interface Deal {
  id: string
  title: string
  slug: string
  image_url: string | null
  image_blob_url: string | null
  price: number | null
  original_price: number | null
  discount_percent: number | null
  store: string | null
  category: string | null
  description: string | null
  affiliate_url: string
  source_url: string | null
  featured: boolean
  date_added: string
  date_updated: string
  is_active: boolean
}

/**
 * Mixed deal type - handles deals from multiple sources (DB, Flipp API, Fashion API)
 * Use this when combining deals from different sources where extra fields may exist
 */
export interface MixedDeal extends Deal {
  // Source identifier
  source?: 'flipp' | 'fashion' | 'database' | string
  // Flipp API fields
  storeSlug?: string
  storeLogo?: string
  validTo?: string
  saleStory?: string | null
  // Alternate naming (some APIs use camelCase)
  imageUrl?: string
  originalPrice?: number | null
  discountPercent?: number | null
}

/**
 * Store type - includes all store metadata and policies
 * Compatible with both old (stores) and new (retailers) schema
 */
export interface Store {
  id: string | number  // UUID in new schema, SERIAL in old
  name: string
  slug: string
  type: 'store' | 'brand'
  logo_url: string | null
  website_url: string | null
  affiliate_url: string | null
  color: string | null
  tagline: string | null
  keywords: string[]
  description: string | null
  badges: string[]
  top_categories: string[]
  is_canadian: boolean
  province: string | null
  return_policy: string | null
  loyalty_program_name: string | null
  loyalty_program_desc: string | null
  shipping_info: string | null
  price_match_policy: string | null
  affiliate_network: string | null
  screenshot_url: string | null
  deal_count: number
}

/**
 * Minimal store data for deal cards - reduces payload size
 */
export interface StoreCardData {
  name: string
  slug: string
  logo_url: string | null
  color: string | null
  badges: string[]
  return_policy: string | null
  shipping_info: string | null
}

/**
 * Category type
 * Compatible with both old and new (Deal Empire) schema
 */
export interface Category {
  id: string | number  // UUID in new schema, SERIAL in old
  name: string
  slug: string
  deal_count: number
}

/**
 * Deal card display props (simplified for components)
 * Supports both regular deals and Flipp flyer deals via variant prop
 */
export interface DealCardProps {
  id: string
  title: string
  slug: string
  imageUrl: string
  price: number | null
  originalPrice: number | null
  discountPercent: number | null
  store: string | null  // Can be null - component should handle gracefully
  affiliateUrl: string
  featured?: boolean
  isCanadian?: boolean
  directAffiliate?: boolean  // If true, click goes directly to affiliate link
  // Store data from database (passed from server component)
  storeData?: StoreCardData | null
  // Variant support for Flipp deals
  variant?: 'default' | 'flipp'
  // Flipp-specific props (only used when variant='flipp')
  storeSlug?: string
  storeLogo?: string
  validTo?: string
  saleStory?: string | null
}

/**
 * Urgency data for psychological triggers
 */
export interface UrgencyData {
  viewerCount: number
  purchaseCount: number
  stockLevel: 'high' | 'medium' | 'low' | 'critical'
  stockCount?: number
  expiresAt?: Date
  isPriceDrop?: boolean
  isLowestEver?: boolean
}

/**
 * Content generation context
 */
export interface ContentContext {
  category: string
  store: string
  brand?: string
  priceRange: 'budget' | 'mid' | 'premium'
  dealType: 'sale' | 'clearance' | 'coupon' | 'lightning'
}
