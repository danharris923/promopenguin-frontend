import Image from 'next/image'
import { DealCardProps } from '@/types/deal'
import { toNumber, formatPrice, calculateSavings } from '@/lib/price-utils'
import { cleanTitle } from '@/lib/content-generator'
import { getDealAffiliateUrl } from '@/lib/affiliates'

// Convert store name to slug
function storeNameToSlug(storeName: string): string {
  return storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

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

// Get a consistent but varied CTA based on deal id
function getAmazonCTA(id: string): string {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return AMAZON_CTA_VARIANTS[hash % AMAZON_CTA_VARIANTS.length]
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

  // Get external link - prefer existing affiliate URL, fall back to store search
  const storeSlug = storeNameToSlug(store)
  const externalUrl = getDealAffiliateUrl(affiliateUrl, storeSlug, title)

  // Check if this is an Amazon deal with a direct affiliate link
  const isAmazon = store.toLowerCase().includes('amazon')
  const hasDirectAffiliateLink = affiliateUrl && affiliateUrl.length > 0

  // If we have an external link, use <a>, otherwise fall back to internal page
  const cardProps = externalUrl
    ? { href: externalUrl, target: '_blank', rel: 'noopener noreferrer' }
    : { href: `/deals/${slug}` }

  return (
    <a
      {...cardProps}
      className="
        group block
        bg-white rounded-xl shadow-md overflow-hidden
        transition-all duration-200
        hover:shadow-xl hover:-translate-y-1
      "
    >
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

        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-2 left-2 z-10">
            <span className="
              bg-yellow-400 text-yellow-900
              px-2 py-1 rounded-lg
              font-bold text-xs
            ">
              HOT
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

        {/* Price */}
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
            <span className="text-lg font-semibold text-orange-600">
              Check Price
            </span>
          )}
        </div>

        {/* Savings - only show if actually saving money */}
        {hasSavings && (
          <div className="text-sm text-red-600 font-medium mt-1">
            {"Save $" + savings}
          </div>
        )}

        {/* Amazon Direct Buy Button */}
        {isAmazon && hasDirectAffiliateLink && (
          <div className="mt-3">
            <span className="
              block w-full text-center
              bg-[#FF9900] hover:bg-[#e88b00]
              text-white font-bold
              py-2 px-3 rounded-lg
              text-sm
              transition-colors
              shadow-sm
            ">
              {getAmazonCTA(id)}
            </span>
          </div>
        )}
      </div>
    </a>
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
