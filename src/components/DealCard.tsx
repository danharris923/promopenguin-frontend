import Image from 'next/image'
import Link from 'next/link'
import { DealCardProps } from '@/types/deal'
import { toNumber, formatPrice, calculateSavings } from '@/lib/price-utils'
import { cleanTitle } from '@/lib/content-generator'

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

// Featured badge variants with different colors
const BADGE_VARIANTS = [
  { text: 'HOT', bg: 'bg-red-500', textColor: 'text-white' },
  { text: 'Trending', bg: 'bg-orange-500', textColor: 'text-white' },
  { text: 'Popular', bg: 'bg-pink-500', textColor: 'text-white' },
  { text: 'Limited', bg: 'bg-purple-500', textColor: 'text-white' },
  { text: 'Top Pick', bg: 'bg-blue-500', textColor: 'text-white' },
  { text: 'Best Deal', bg: 'bg-green-500', textColor: 'text-white' },
]

// Get a consistent but varied value based on id
function getHashedIndex(id: string, arrayLength: number): number {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return hash % arrayLength
}

// Determine if this deal should show a badge (roughly 1/3)
function shouldShowBadge(id: string): boolean {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return hash % 3 === 0
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

  // Clean noise from title (only for non-Amazon deals)
  const displayTitle = cleanTitle(title, store)

  // Only show price if we have real data (not 0 or null)
  const hasPriceData = priceNum !== null && priceNum > 0
  const hasDiscount = discountPercent && discountPercent > 0
  const hasSavings = savings && parseFloat(savings) > 0

  // Check if this is an Amazon deal with a direct affiliate link
  const isAmazon = store.toLowerCase().includes('amazon')
  const hasDirectAffiliateLink = affiliateUrl && affiliateUrl.length > 0

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
          {/* Store */}
          <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
            {store}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {displayTitle}
          </h3>

          {/* Price - don't show "Check Price" for Amazon cards with button */}
          <div className="flex items-baseline gap-2">
            {hasPriceData ? (
              <>
                <span className="text-xl font-bold text-green-600">
                  {"$" + formatPrice(priceNum)}
                </span>
                {originalPriceNum !== null && originalPriceNum > priceNum && (
                  <span className="text-sm text-gray-400 line-through">
                    {"$" + formatPrice(originalPriceNum)}
                  </span>
                )}
              </>
            ) : (
              // Only show "Check Price" for non-Amazon deals
              !isAmazon && (
                <span className="text-lg font-semibold text-orange-600">
                  Check Price
                </span>
              )
            )}
          </div>

          {/* Savings - only show if actually saving money */}
          {hasSavings && (
            <div className="text-sm text-red-600 font-medium mt-1">
              {"Save $" + savings}
            </div>
          )}
        </div>
      </Link>

      {/* Amazon Direct Buy Button - separate link, goes straight to Amazon */}
      {isAmazon && hasDirectAffiliateLink && (
        <div className="px-4 pb-4">
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              block w-full text-center
              bg-[#FF9900] hover:bg-[#e88b00]
              text-white font-bold
              py-2 px-3 rounded-lg
              text-sm
              transition-colors
              shadow-sm
            "
          >
            {AMAZON_CTA_VARIANTS[getHashedIndex(id, AMAZON_CTA_VARIANTS.length)]}
          </a>
        </div>
      )}
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
