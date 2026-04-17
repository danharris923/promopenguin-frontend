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
// Trim to defend against trailing-newline env-var values set in Vercel
// (a stray newline leaks into robots.txt / sitemap / meta URLs).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://promopenguin.ca').trim()
