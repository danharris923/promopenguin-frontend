/**
 * Centralized configuration constants for PromoPenguin
 *
 * This file contains all site-wide configuration values that may be reused
 * across multiple components and pages. Import from here instead of
 * hardcoding values throughout the codebase.
 */

// =============================================================================
// REVALIDATION INTERVALS
// =============================================================================

/**
 * Default revalidation interval for ISR pages (in seconds)
 * 900 seconds = 15 minutes
 */
export const REVALIDATE_INTERVAL = 900

/**
 * No cache - for pages that should always be fresh (e.g., search results)
 */
export const REVALIDATE_NEVER = 0

// =============================================================================
// SITE URLs
// =============================================================================

/**
 * Base site URL - used for canonical URLs, Open Graph, and sitemaps
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://promopenguin.ca'

// =============================================================================
// SOCIAL MEDIA LINKS
// =============================================================================

export const SOCIAL_LINKS = {
  // Add social links as they become available
} as const

// =============================================================================
// FEATURED STORES
// =============================================================================

/**
 * Store slugs featured on the homepage (major retailers section)
 * These are the major retail partners shown in the store logo grid
 */
export const FEATURED_STORE_SLUGS = [
  'amazon',
  'walmart',
  'costco',
  'best-buy',
  'canadian-tire',
  'shoppers',
] as const
