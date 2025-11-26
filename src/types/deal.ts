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
 * Store type
 */
export interface Store {
  id: number
  name: string
  slug: string
  logo_url: string | null
  affiliate_url: string | null
  deal_count: number
}

/**
 * Category type
 */
export interface Category {
  id: number
  name: string
  slug: string
  deal_count: number
}

/**
 * Deal card display props (simplified for components)
 */
export interface DealCardProps {
  id: string
  title: string
  slug: string
  imageUrl: string
  price: number | null
  originalPrice: number | null
  discountPercent: number | null
  store: string
  affiliateUrl: string
  featured?: boolean
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
