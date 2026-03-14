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

// =============================================================================
// SITE URLs
// =============================================================================

/**
 * Base site URL - used for canonical URLs, Open Graph, and sitemaps
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://promopenguin.ca'
