'use client'

import Link from 'next/link'
import { useState } from 'react'
import { DealCardProps } from '@/types/deal'
import { toNumber, formatPrice, calculateSavings } from '@/lib/price-utils'

// Helper to generate store logo path from store name
const getStoreLogoPath = (store: string | null | undefined): string | null => {
  if (!store) return null
  const slug = store.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `/images/stores/${slug}.png`
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
  // Get store logo path for fallback
  const storeLogoFallback = getStoreLogoPath(store)

  // Determine initial image: use deal image, or store logo if no deal image
  const getInitialImage = () => {
    if (imageUrl) return imageUrl
    if (storeLogoFallback) return storeLogoFallback
    return '/placeholder-deal.svg'
  }

  const [imgSrc, setImgSrc] = useState(getInitialImage())
  const [imgError, setImgError] = useState(false)
  const [triedStoreLogo, setTriedStoreLogo] = useState(!imageUrl)

  const priceNum = toNumber(price)
  const originalPriceNum = toNumber(originalPrice)
  const savings = calculateSavings(originalPrice, price)

  const handleImageError = () => {
    if (!imgError && !triedStoreLogo && storeLogoFallback) {
      // First error: try store logo
      setTriedStoreLogo(true)
      setImgSrc(storeLogoFallback)
    } else if (!imgError) {
      // Final fallback: placeholder
      setImgError(true)
      setImgSrc('/placeholder-deal.svg')
    }
  }

  return (
    <Link
      href={`/deals/${slug}`}
      className="
        group block
        bg-white rounded-xl shadow-md overflow-hidden
        transition-all duration-200
        hover:shadow-xl hover:-translate-y-1
      "
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100">
        {/* Discount Badge */}
        {discountPercent && discountPercent > 0 && (
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={title}
          className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-200"
          onError={handleImageError}
          loading="lazy"
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
          {title}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          {priceNum !== null ? (
            <>
              <span className="text-xl font-bold text-green-600">
                ${formatPrice(priceNum)}
              </span>
              {originalPriceNum !== null && (
                <span className="text-sm text-gray-400 line-through">
                  ${formatPrice(originalPriceNum)}
                </span>
              )}
            </>
          ) : (
            <span className="text-lg font-semibold text-gray-800">
              See Deal
            </span>
          )}
        </div>

        {/* Savings */}
        {savings && (
          <div className="text-sm text-red-600 font-medium mt-1">
            Save ${savings}
          </div>
        )}
      </div>
    </Link>
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
