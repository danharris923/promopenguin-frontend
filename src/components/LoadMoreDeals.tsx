'use client'

import { useState, useTransition, useMemo } from 'react'
import { DealCard, DealGrid } from '@/components/DealCard'
import { AffiliateDealCard } from '@/components/AffiliateDealCard'
import { Deal } from '@/types/deal'
import { AffiliateBrand, AFFILIATE_BRANDS } from '@/lib/affiliates'

interface LoadMoreDealsProps {
  initialDeals: Deal[]
  totalCount: number
  pageSize?: number
}

// Mix affiliate cards into deals - 1 affiliate every 6 deals
function mixInAffiliates(deals: Deal[]): (Deal | { type: 'affiliate'; brand: AffiliateBrand; seed: number })[] {
  const result: (Deal | { type: 'affiliate'; brand: AffiliateBrand; seed: number })[] = []
  const affiliateInterval = 6 // Insert affiliate every 6 deals

  deals.forEach((deal, index) => {
    result.push(deal)

    // After every 6 deals, insert an affiliate card
    if ((index + 1) % affiliateInterval === 0) {
      const brandIndex = Math.floor((index + 1) / affiliateInterval) - 1
      const brand = AFFILIATE_BRANDS[brandIndex % AFFILIATE_BRANDS.length]
      result.push({
        type: 'affiliate',
        brand,
        seed: index * 1000 + brandIndex,
      })
    }
  })

  return result
}

function isAffiliateCard(item: unknown): item is { type: 'affiliate'; brand: AffiliateBrand; seed: number } {
  return typeof item === 'object' && item !== null && 'type' in item && (item as any).type === 'affiliate'
}

export function LoadMoreDeals({
  initialDeals,
  totalCount,
  pageSize = 24
}: LoadMoreDealsProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  const [offset, setOffset] = useState(initialDeals.length)
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)

  const hasMore = offset < totalCount

  // Mix affiliates into deals on every render
  const mixedDeals = useMemo(() => mixInAffiliates(deals), [deals])

  const loadMore = async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/deals?offset=${offset}&limit=${pageSize}`)
      const newDeals: Deal[] = await response.json()

      startTransition(() => {
        setDeals(prev => [...prev, ...newDeals])
        setOffset(prev => prev + newDeals.length)
      })
    } catch (error) {
      console.error('Failed to load more deals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DealGrid>
        {mixedDeals.map((item, index) => {
          if (isAffiliateCard(item)) {
            return (
              <AffiliateDealCard
                key={`affiliate-${item.brand.slug}-${index}`}
                brand={item.brand}
                seed={item.seed}
              />
            )
          }
          const deal = item
          return (
            <DealCard
              key={deal.id}
              id={deal.id}
              title={deal.title}
              slug={deal.slug}
              imageUrl={deal.image_blob_url || deal.image_url || '/placeholder-deal.jpg'}
              price={deal.price}
              originalPrice={deal.original_price}
              discountPercent={deal.discount_percent}
              store={deal.store || 'Unknown'}
              affiliateUrl={deal.affiliate_url}
              featured={deal.featured}
            />
          )
        })}
      </DealGrid>

      {hasMore && (
        <div className="mt-10 text-center">
          <button
            onClick={loadMore}
            disabled={isLoading || isPending}
            className="
              inline-flex items-center gap-2
              px-8 py-4 rounded-lg
              bg-orange-500
              text-white font-bold text-lg
              hover:bg-orange-600
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors shadow-lg
            "
          >
            {isLoading || isPending ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </>
            ) : (
              <>Load More Deals</>
            )}
          </button>
          <p className="mt-3 text-sm text-gray-500">
            Showing {deals.length} of {totalCount} deals
          </p>
        </div>
      )}

      {!hasMore && deals.length > 0 && (
        <div className="mt-10 text-center">
          <p className="text-gray-500">
            You've seen all {totalCount} deals!
          </p>
        </div>
      )}
    </>
  )
}
