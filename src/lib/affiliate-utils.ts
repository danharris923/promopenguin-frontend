import { AffiliateBrand } from './affiliates'

/**
 * Get positions to insert affiliate cards into a deal grid
 * Uses deterministic positioning (no Math.random) for SSR compatibility
 */
export function getAffiliatePositions(totalDeals: number, affiliateCount: number): number[] {
  if (totalDeals < 8 || affiliateCount === 0) return []

  const positions: number[] = []
  const spacing = Math.floor(totalDeals / (affiliateCount + 1))

  for (let i = 0; i < affiliateCount; i++) {
    // Deterministic position - no random variance for SSR
    const pos = Math.max(4, Math.min(totalDeals - 1, spacing * (i + 1)))
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
