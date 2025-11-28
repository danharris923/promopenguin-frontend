import Image from 'next/image'
import Link from 'next/link'
import { DealCardProps } from '@/types/deal'
import { toNumber, formatPrice, calculateSavings } from '@/lib/price-utils'
import { cleanTitle } from '@/lib/content-generator'
import { detectStoreFromTitle } from '@/lib/store-detector'
import { cleanAmazonUrl } from '@/lib/affiliates'

// Amazon CTA button text variants
const AMAZON_CTA_VARIANTS = [
  'Shop on Amazon',
  'View on Amazon',
  'Get This Deal',
  'See on Amazon',
  'Buy on Amazon',
  'Check it Out',
  'Grab This Deal',
  'Shop Now',
]

// Featured badge variants - clean, professional (for featured=true deals)
const BADGE_VARIANTS = [
  { text: 'HOT', bg: 'bg-orange-500', textColor: 'text-white' },
  { text: 'Trending', bg: 'bg-slate-700', textColor: 'text-white' },
  { text: 'Popular', bg: 'bg-slate-700', textColor: 'text-white' },
  { text: 'Limited', bg: 'bg-orange-500', textColor: 'text-white' },
  { text: 'Top Pick', bg: 'bg-slate-700', textColor: 'text-white' },
  { text: 'Best Deal', bg: 'bg-emerald-600', textColor: 'text-white' },
]

// Affiliate badge variants - shown sparingly on deals with affiliate links
const AFFILIATE_BADGE_VARIANTS = [
  { text: 'New Price', bg: 'bg-emerald-600', textColor: 'text-white' },
  { text: 'Live Now', bg: 'bg-blue-600', textColor: 'text-white' },
  { text: 'Today Only', bg: 'bg-red-500', textColor: 'text-white' },
  { text: 'Sale', bg: 'bg-orange-500', textColor: 'text-white' },
  { text: 'Deal', bg: 'bg-purple-600', textColor: 'text-white' },
  { text: 'Save Now', bg: 'bg-emerald-500', textColor: 'text-white' },
  { text: 'Price Drop', bg: 'bg-cyan-600', textColor: 'text-white' },
  { text: 'Hot Deal', bg: 'bg-red-600', textColor: 'text-white' },
]

// Get a consistent but varied value based on id
function getHashedIndex(id: string, arrayLength: number): number {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return hash % arrayLength
}

// Determine if this deal should show a featured badge (roughly 1/3)
function shouldShowBadge(id: string): boolean {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return hash % 3 === 0
}

// Determine if this deal should show an affiliate badge (roughly 40%)
function shouldShowAffiliateBadge(id: string): boolean {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return hash % 5 < 2  // 2 out of 5 = 40%
}

export function DealCard({
  id,
  title,
  slug,
  imageUrl,
  price,
  originalPrice,
  discountPercent,
  store,
  affiliateUrl,
  featured,
}: DealCardProps) {
  const priceNum = toNumber(price)
  const originalPriceNum = toNumber(originalPrice)
  const savings = calculateSavings(originalPrice, price)

  // Detect store from title if not provided or "Unknown"
  const detectedStore = detectStoreFromTitle(title, store)
  const displayStore = detectedStore.name || store
  const storeSearchUrl = detectedStore.searchUrl

  // Clean noise from title (only for non-Amazon deals)
  const displayTitle = cleanTitle(title, displayStore)

  // Only show price if we have real data (not 0 or null)
  const hasPriceData = priceNum !== null && priceNum > 0
  const hasDiscount = discountPercent && discountPercent > 0
  const hasSavings = savings && parseFloat(savings) > 0

  // Check if this is an Amazon deal with a direct affiliate link
  const isAmazon = displayStore.toLowerCase().includes('amazon')
  const hasDirectAffiliateLink = affiliateUrl && affiliateUrl.length > 0

  // Clean Amazon URLs to use our affiliate tag
  const cleanedAffiliateUrl = affiliateUrl ? cleanAmazonUrl(affiliateUrl) : null

  // Get badge info - only show on ~1/3 of featured items
  const showBadge = featured && shouldShowBadge(id)
  const badge = showBadge ? BADGE_VARIANTS[getHashedIndex(id, BADGE_VARIANTS.length)] : null

  return (
    <div className="
      group
      bg-white rounded-xl shadow-md overflow-hidden
      transition-all duration-200
      hover:shadow-xl hover:-translate-y-1
    ">
      {/* Card links to deal page */}
      <Link href={`/deals/${slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-100">
          {/* Discount Badge - only show if > 0 */}
          {hasDiscount && (
            <div className="absolute top-2 right-2 z-10">
              <span className="
                bg-red-600 text-white
                px-2 py-1 rounded-lg
                font-bold text-sm
                shadow-md
              ">
                -{discountPercent}%
              </span>
            </div>
          )}

          {/* Featured Badge - varied text and colors */}
          {badge && (
            <div className="absolute top-2 left-2 z-10">
              <span className={`
                ${badge.bg} ${badge.textColor}
                px-2 py-1 rounded-lg
                font-bold text-xs
                shadow-sm
              `}>
                {badge.text}
              </span>
            </div>
          )}

          {/* Affiliate Badge - varied colors/text, shown sparingly (~40%) when deal has affiliate link but no featured badge */}
          {!badge && hasDirectAffiliateLink && shouldShowAffiliateBadge(id) && (() => {
            const affiliateBadge = AFFILIATE_BADGE_VARIANTS[getHashedIndex(id, AFFILIATE_BADGE_VARIANTS.length)]
            return (
              <div className="absolute top-2 left-2 z-10">
                <span className={`
                  ${affiliateBadge.bg} ${affiliateBadge.textColor}
                  px-2 py-1 rounded-lg
                  font-bold text-xs
                  shadow-sm
                `}>
                  {affiliateBadge.text}
                </span>
              </div>
            )
          })()}

          {/* Image */}
          <Image
            src={imageUrl || '/placeholder-deal.jpg'}
            alt={displayTitle}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Store - clickable link to search */}
          {displayStore && displayStore !== 'Unknown' && (
            <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
              {displayStore}
            </div>
          )}

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {displayTitle}
          </h3>

          {/* Price - only show if we have real data */}
          {hasPriceData && (
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-emerald-600">
                {"$" + formatPrice(priceNum)}
              </span>
              {originalPriceNum !== null && originalPriceNum > priceNum && (
                <span className="text-sm text-gray-400 line-through">
                  {"$" + formatPrice(originalPriceNum)}
                </span>
              )}
            </div>
          )}

          {/* Savings - only show if actually saving money */}
          {hasSavings && (
            <div className="text-sm text-emerald-600 font-semibold mt-1">
              {"Save $" + savings}
            </div>
          )}
        </div>
      </Link>

      {/* CTA Button - Always show one */}
      {/* Priority: affiliate links (orange with shimmer) > store search (slate) > fallback */}
      <div className="px-4 pb-4">
        {hasDirectAffiliateLink ? (
          // Affiliate link button - ALWAYS orange with shimmer (Amazon or any other)
          <a
            href={cleanedAffiliateUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="
              relative overflow-hidden
              block w-full text-center
              bg-orange-600 hover:bg-orange-700
              text-white font-bold
              py-2 px-3 rounded-lg
              text-sm
              transition-colors
              shadow-sm
              before:absolute before:inset-0
              before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent
              before:translate-x-[-200%] hover:before:translate-x-[200%]
              before:transition-transform before:duration-700
            "
          >
            {isAmazon
              ? AMAZON_CTA_VARIANTS[getHashedIndex(id, AMAZON_CTA_VARIANTS.length)]
              : displayStore && displayStore !== 'Unknown'
                ? `Shop at ${displayStore} →`
                : 'View Deal →'
            }
          </a>
        ) : storeSearchUrl && displayStore && displayStore !== 'Unknown' ? (
          // Store Search Button - slate (no shimmer - NOT an affiliate link)
          <a
            href={storeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              block w-full text-center
              bg-slate-600 hover:bg-slate-700
              text-white font-bold
              py-2 px-3 rounded-lg
              text-sm
              transition-colors
            "
          >
            Shop at {displayStore} →
          </a>
        ) : (
          // Fallback: View deal on detail page - slate (no shimmer - not affiliate)
          <Link
            href={`/deals/${slug}`}
            className="
              block w-full text-center
              bg-slate-600 hover:bg-slate-700
              text-white font-bold
              py-2 px-3 rounded-lg
              text-sm
              transition-colors
            "
          >
            View Deal →
          </Link>
        )}
      </div>
    </div>
  )
}

// Grid wrapper for deal cards
export function DealGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {children}
    </div>
  )
}
