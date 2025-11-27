'use client'

import Image from 'next/image'
import { FlippDeal } from '@/lib/flipp'

// Store affiliate links - clicking flyer deals goes through affiliate + search
const STORE_AFFILIATE_LINKS: Record<string, string> = {
  'sephora': 'https://shopstyle.it/l/cw4bZ',
  'lululemon': 'https://shopstyle.it/l/cwE20',
  'roots': 'https://shopstyle.it/l/cwE2E',
  'aritzia': 'https://shopstyle.it/l/cwE2N',
  'ardene': 'https://shopstyle.it/l/cwE8W',
}

// Build affiliate search URL if available
function getAffiliateUrl(storeSlug: string, productTitle: string): string | null {
  const baseUrl = STORE_AFFILIATE_LINKS[storeSlug]
  if (!baseUrl) return null
  // Append search query to affiliate link
  const searchQuery = encodeURIComponent(productTitle)
  return `${baseUrl}?searchText=${searchQuery}`
}

interface FlippDealCardProps {
  deal: FlippDeal
}

export function FlippDealCard({ deal }: FlippDealCardProps) {
  const hasPriceData = deal.price !== null && deal.price > 0
  const hasDiscount = deal.discountPercent !== null && deal.discountPercent > 0
  const hasSavings = deal.originalPrice && deal.price && deal.originalPrice > deal.price

  // Format expiry date
  const expiresDate = new Date(deal.validTo)
  const isExpiringSoon = expiresDate.getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000 // 2 days

  // Check if this store has an affiliate link
  const affiliateUrl = getAffiliateUrl(deal.storeSlug, deal.title)

  const cardClasses = `
    group block
    bg-white rounded-xl shadow-md overflow-hidden
    transition-all duration-200
    hover:shadow-xl hover:-translate-y-1
    ${affiliateUrl ? 'cursor-pointer' : ''}
  `

  const cardContent = (
    <>
      {/* Image Container - with overflow hidden to crop borders */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 right-2 z-10">
            <span className="
              bg-red-600 text-white
              px-2 py-1 rounded-lg
              font-bold text-sm
              shadow-md
            ">
              -{deal.discountPercent}%
            </span>
          </div>
        )}

        {/* Sale Story Badge */}
        {deal.saleStory && !hasDiscount && (
          <div className="absolute top-2 right-2 z-10">
            <span className="
              bg-orange-500 text-white
              px-2 py-1 rounded-lg
              font-bold text-xs
              shadow-md
            ">
              {deal.saleStory}
            </span>
          </div>
        )}

        {/* Expiring Soon Badge */}
        {isExpiringSoon && (
          <div className="absolute top-2 left-2 z-10">
            <span className="
              bg-yellow-400 text-yellow-900
              px-2 py-1 rounded-lg
              font-bold text-xs
            ">
              ENDS SOON
            </span>
          </div>
        )}

        {/* Flipp Source Badge */}
        <div className="absolute bottom-2 left-2 z-10">
          <span className="
            bg-blue-600 text-white
            px-2 py-0.5 rounded
            font-medium text-xs
          ">
            Flyer Deal
          </span>
        </div>

        {/* Image - scale up slightly and use object-cover to crop borders */}
        <Image
          src={deal.imageUrl || '/placeholder-deal.jpg'}
          alt={deal.title}
          fill
          className="object-cover scale-110 group-hover:scale-115 transition-transform duration-200"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized // Flipp images are external
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Store */}
        <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
          {deal.store}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {deal.title}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          {hasPriceData ? (
            <>
              <span className="text-xl font-bold text-green-600">
                ${deal.price?.toFixed(2)}
              </span>
              {hasSavings && (
                <span className="text-sm text-gray-400 line-through">
                  ${deal.originalPrice?.toFixed(2)}
                </span>
              )}
            </>
          ) : (
            <span className="text-lg font-semibold text-orange-600">
              See Flyer
            </span>
          )}
        </div>

        {/* Sale Story */}
        {deal.saleStory && (
          <div className="text-sm text-red-600 font-medium mt-1">
            {deal.saleStory}
          </div>
        )}

        {/* Expiry */}
        <div className="text-xs text-gray-400 mt-2">
          Valid until {expiresDate.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
        </div>
      </div>
    </>
  )

  // If we have an affiliate link, wrap in anchor tag
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

  // Otherwise, just a div (no link)
  return (
    <div className={cardClasses}>
      {cardContent}
    </div>
  )
}

// Grid wrapper for Flipp deal cards
export function FlippDealGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {children}
    </div>
  )
}
