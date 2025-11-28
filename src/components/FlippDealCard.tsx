'use client'

import Image from 'next/image'
import { FlippDeal } from '@/lib/flipp'
import { getAffiliateSearchUrl } from '@/lib/affiliates'

interface FlippDealCardProps {
  deal: FlippDeal
}

// Compact horizontal bar style for flyer deals
export function FlippDealCard({ deal }: FlippDealCardProps) {
  const hasDiscount = deal.discountPercent !== null && deal.discountPercent > 0
  const hasPriceData = deal.price !== null && deal.price > 0

  // Check if this store has an affiliate link
  const affiliateUrl = getAffiliateSearchUrl(deal.storeSlug, deal.title)

  const cardClasses = `
    group flex items-center gap-3
    bg-white rounded-lg shadow-sm overflow-hidden
    p-2 pr-4
    transition-all duration-200
    hover:shadow-md hover:bg-gray-50
    ${affiliateUrl ? 'cursor-pointer' : ''}
  `

  const cardContent = (
    <>
      {/* Thumbnail - small square */}
      <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
        <Image
          src={deal.imageUrl || '/placeholder-deal.jpg'}
          alt={deal.title}
          fill
          className="object-cover scale-110"
          sizes="64px"
          unoptimized
        />
      </div>

      {/* Content - title and store */}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-400 uppercase tracking-wide">
          {deal.store}
        </div>
        <h3 className="font-medium text-gray-900 text-sm line-clamp-1 group-hover:text-orange-600 transition-colors">
          {deal.title}
        </h3>
      </div>

      {/* Price/Discount - right side */}
      <div className="flex-shrink-0 text-right">
        {hasDiscount ? (
          <span className="bg-red-600 text-white px-2 py-1 rounded font-bold text-sm">
            -{deal.discountPercent}%
          </span>
        ) : hasPriceData ? (
          <span className="text-emerald-600 font-bold">
            ${deal.price?.toFixed(2)}
          </span>
        ) : deal.saleStory ? (
          <span className="text-orange-500 font-medium text-sm">
            {deal.saleStory.length > 12 ? deal.saleStory.slice(0, 12) + '...' : deal.saleStory}
          </span>
        ) : (
          <span className="text-slate-600 text-xs font-medium">
            Flyer
          </span>
        )}
      </div>
    </>
  )

  if (affiliateUrl) {
    return (
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClasses}
      >
        {cardContent}
      </a>
    )
  }

  return (
    <div className={cardClasses}>
      {cardContent}
    </div>
  )
}

// 2-column grid on desktop, single column on mobile
export function FlippDealGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {children}
    </div>
  )
}
