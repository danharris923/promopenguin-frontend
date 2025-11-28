'use client'

import { useState, useTransition } from 'react'
import { DealCard, DealGrid } from '@/components/DealCard'
import { Deal } from '@/types/deal'

interface LoadMoreDealsProps {
  initialDeals: Deal[]
  totalCount: number
  pageSize?: number
}

export function LoadMoreDeals({
  initialDeals,
  totalCount,
  pageSize = 20
}: LoadMoreDealsProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  const [offset, setOffset] = useState(initialDeals.length)
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)

  const hasMore = offset < totalCount

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
        {deals.map(deal => (
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
        ))}
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
