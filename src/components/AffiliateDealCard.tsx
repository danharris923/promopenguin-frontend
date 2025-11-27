'use client'

import Image from 'next/image'
import { AffiliateBrand, getStoreAffiliateLink } from '@/lib/affiliates'

// =============================================================================
// AFFILIATE IMAGES CONFIG
// =============================================================================

// Images for each affiliate brand - add more as you get them
// Path: /images/affiliates/{slug}/1.jpg, 2.jpg, etc.
const AFFILIATE_IMAGES: Record<string, string[]> = {
  'lululemon': [
    // Add images when available:
    // '/images/affiliates/lululemon/1.jpg',
    // '/images/affiliates/lululemon/2.jpg',
  ],
  'roots': [],
  'aritzia': [],
  'ardene': [],
  'sephora': [],
  'walmart': [],
  'bass-pro': [],
  'cabelas': [],
}

/**
 * Get a random image for a brand, or null if none available
 */
function getRandomBrandImage(slug: string, seed?: number): string | null {
  const images = AFFILIATE_IMAGES[slug] || []
  if (images.length === 0) return null

  // Use seed for consistent randomness (so same card shows same image on re-render)
  const index = seed !== undefined
    ? Math.abs(seed) % images.length
    : Math.floor(Math.random() * images.length)

  return images[index]
}

// =============================================================================
// AFFILIATE DEAL CARD
// =============================================================================

interface AffiliateDealCardProps {
  brand: AffiliateBrand
  seed?: number  // For consistent "random" image selection
}

/**
 * Affiliate promo card that looks like a deal card
 * Mix these into deal grids to drive affiliate clicks
 */
export function AffiliateDealCard({ brand, seed }: AffiliateDealCardProps) {
  const affiliateUrl = getStoreAffiliateLink(brand.slug)
  const imageUrl = getRandomBrandImage(brand.slug, seed)

  return (
    <a
      href={affiliateUrl || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group block
        bg-white rounded-xl shadow-md overflow-hidden
        transition-all duration-200
        hover:shadow-xl hover:-translate-y-1
        cursor-pointer
      "
    >
      {/* Image Container */}
      <div className={`relative aspect-square overflow-hidden ${!imageUrl ? `bg-gradient-to-br ${brand.color}` : 'bg-gray-100'}`}>
        {/* Sale Badge */}
        <div className="absolute top-2 right-2 z-10">
          <span className="
            bg-yellow-400 text-yellow-900
            px-2 py-1 rounded-lg
            font-bold text-xs
            shadow-md
          ">
            SALE
          </span>
        </div>

        {/* Sponsored Badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className={`
            ${imageUrl ? 'bg-black/40' : 'bg-white/20'} text-white
            px-2 py-0.5 rounded
            font-medium text-xs
            backdrop-blur-sm
          `}>
            Sponsored
          </span>
        </div>

        {/* Image or Emoji fallback */}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${brand.name} deal`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-8xl opacity-90 group-hover:scale-110 transition-transform duration-200">
              {brand.emoji}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Store */}
        <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
          {brand.name}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {brand.tagline}
        </h3>

        {/* CTA instead of price */}
        <div className="flex items-baseline gap-2">
          <span className={`text-lg font-bold ${brand.textColor}`}>
            Shop Now →
          </span>
        </div>

        {/* Description */}
        <div className="text-sm text-gray-500 mt-1 line-clamp-1">
          {brand.description}
        </div>
      </div>
    </a>
  )
}

// =============================================================================
// HELPER FUNCTIONS FOR MIXING INTO DEAL GRIDS
// =============================================================================

/**
 * Get positions to insert affiliate cards into a deal grid
 * Spreads them out evenly with some randomness
 */
export function getAffiliatePositions(totalDeals: number, affiliateCount: number): number[] {
  if (totalDeals < 8 || affiliateCount === 0) return []

  const positions: number[] = []
  const spacing = Math.floor(totalDeals / (affiliateCount + 1))

  for (let i = 0; i < affiliateCount; i++) {
    // Base position with some variance
    const basePos = spacing * (i + 1)
    const variance = Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
    const pos = Math.max(4, Math.min(totalDeals - 1, basePos + variance))
    positions.push(pos)
  }

  return positions
}

/**
 * Mix affiliate cards into a deal array
 * Returns new array with affiliate cards inserted at calculated positions
 */
export function mixAffiliateCards<T>(
  deals: T[],
  brands: AffiliateBrand[],
  maxAffiliates: number = 3
): (T | { type: 'affiliate'; brand: AffiliateBrand; seed: number })[] {
  if (deals.length < 8 || brands.length === 0) return deals

  const affiliateCount = Math.min(maxAffiliates, Math.floor(deals.length / 8))
  const positions = getAffiliatePositions(deals.length, affiliateCount)

  const result: (T | { type: 'affiliate'; brand: AffiliateBrand; seed: number })[] = [...deals]

  // Insert affiliate cards at positions (in reverse to maintain indices)
  positions.reverse().forEach((pos, i) => {
    const brand = brands[i % brands.length]
    result.splice(pos, 0, {
      type: 'affiliate',
      brand,
      seed: pos * 1000 + i,  // Consistent seed for image selection
    })
  })

  return result
}

/**
 * Check if an item is an affiliate card
 */
export function isAffiliateCard(item: unknown): item is { type: 'affiliate'; brand: AffiliateBrand; seed: number } {
  return typeof item === 'object' && item !== null && 'type' in item && (item as any).type === 'affiliate'
}
