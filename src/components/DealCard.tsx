'use client'

import Link from 'next/link'
import { useState } from 'react'
import { DealCardProps } from '@/types/deal'
import { toNumber, formatPrice, calculateSavings } from '@/lib/price-utils'

const PLACEHOLDER_IMAGE = '/placeholder-deal.svg'

const getStoreLogoPath = (store: string | null | undefined): string | null => {
  if (!store) return null
  const slug = store.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `/images/stores/${slug}.png`
}

// RFD-sourced Amazon deals don't carry reliable product images (the scraped
// image_url is often a hotlink that 403s from non-amazon origins). Skip the
// broken-image flash and render the Amazon logo directly. Non-RFD rows
// (guru-prefixed slugs) come with real product images in blob storage.
const isRfdAmazon = (store: string | null | undefined, slug: string): boolean => {
  if (!store) return false
  return /amazon/i.test(store) && !slug.startsWith('guru-')
}

/**
 * Featured deal card — large format matching DealRadar style.
 * Store logo top-left, product image right, price prominent, "View Deal" button.
 */
export function FeaturedDealCard({
  title,
  slug,
  imageUrl,
  price,
  originalPrice,
  discountPercent,
  store,
  featured,
}: DealCardProps) {
  const storeLogoFallback = getStoreLogoPath(store)
  const skipToLogo = isRfdAmazon(store, slug) && !!storeLogoFallback
  const initialImageUrl = imageUrl && imageUrl !== PLACEHOLDER_IMAGE ? imageUrl : ''

  // Try product image → fall back to the store logo → if both fail (or
  // there was no usable image to begin with) drop the card from the grid.
  // Never render a dead/broken image placeholder.
  const initialSrc = skipToLogo
    ? storeLogoFallback!
    : (initialImageUrl || storeLogoFallback || '')
  const [imgSrc, setImgSrc] = useState(initialSrc)
  const [triedFallback, setTriedFallback] = useState(skipToLogo || !initialImageUrl)
  const [hideCard, setHideCard] = useState(!initialSrc)

  const priceNum = toNumber(price)
  const originalPriceNum = toNumber(originalPrice)
  const savings = calculateSavings(originalPrice, price)

  const handleImageError = () => {
    if (!triedFallback && storeLogoFallback) {
      setTriedFallback(true)
      setImgSrc(storeLogoFallback)
    } else {
      setHideCard(true)
    }
  }

  if (hideCard) return null

  // Generate a short description
  const description = savings
    ? `Save $${savings} on this deal.`
    : 'Great price — shop now.'

  // Badge logic
  const showEndsSoon = featured && discountPercent && discountPercent >= 30
  const savingsBadgeText = discountPercent && discountPercent > 0
    ? `${discountPercent}% Off`
    : savings
      ? `Save $${savings}`
      : null

  return (
    <Link
      href={`/deals/${slug}`}
      className="
        group block bg-white rounded-xl border border-gray-200
        hover:shadow-lg transition-shadow duration-200
        overflow-hidden
      "
    >
      <div className="p-5 flex flex-col h-full">
        {/* Top row: store logo + badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="h-6">
            {storeLogoFallback ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={storeLogoFallback}
                alt={store || ''}
                className="h-6 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  if (target.nextElementSibling) {
                    (target.nextElementSibling as HTMLElement).style.display = 'block'
                  }
                }}
              />
            ) : null}
            <span
              className="text-sm font-bold text-gray-700"
              style={storeLogoFallback ? { display: 'none' } : {}}
            >
              {store}
            </span>
          </div>
          {showEndsSoon && (
            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
              Ends Soon
            </span>
          )}
        </div>

        {/* Content: title + price left, image right */}
        <div className="flex gap-4 flex-1 min-h-0">
          <div className="flex-1 flex flex-col min-w-0">
            {/* Title */}
            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-3">
              {title}
            </h3>

            {/* Price */}
            <div className="mb-2">
              {priceNum !== null ? (
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl font-bold text-gray-900">
                    ${formatPrice(priceNum)}
                  </span>
                  {originalPriceNum !== null && (
                    <span className="text-sm text-gray-400 line-through">
                      ${formatPrice(originalPriceNum)}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-lg font-semibold text-gray-900">
                  See Deal
                </span>
              )}
            </div>

            {/* Savings badge */}
            {savingsBadgeText && (
              <span className="inline-block text-xs font-semibold text-white bg-savings px-2.5 py-1 rounded w-fit mb-2">
                {savingsBadgeText}
              </span>
            )}

            {/* Description */}
            <p className="text-xs text-gray-500 mt-auto line-clamp-2">
              {description}
            </p>
          </div>

          {/* Product image */}
          <div className="w-28 h-28 md:w-36 md:h-36 flex-shrink-0 self-center flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc}
              alt={title}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
              onError={handleImageError}
              loading="lazy"
            />
          </div>
        </div>

        {/* View Deal button */}
        <div className="mt-4">
          <span className="btn-deal">View Deal</span>
        </div>
      </div>
    </Link>
  )
}

/**
 * Standard compact deal card for grids (used on listing pages).
 */
export function DealCard({
  title,
  slug,
  imageUrl,
  price,
  originalPrice,
  discountPercent,
  store,
  featured,
}: DealCardProps) {
  const storeLogoFallback = getStoreLogoPath(store)
  const skipToLogo = isRfdAmazon(store, slug) && !!storeLogoFallback
  const initialImageUrl = imageUrl && imageUrl !== PLACEHOLDER_IMAGE ? imageUrl : ''

  // Try product image → fall back to the store logo → if both fail (or
  // there was no usable image to begin with) drop the card from the grid.
  // Never render a dead/broken image placeholder.
  const initialSrc = skipToLogo
    ? storeLogoFallback!
    : (initialImageUrl || storeLogoFallback || '')
  const [imgSrc, setImgSrc] = useState(initialSrc)
  const [triedFallback, setTriedFallback] = useState(skipToLogo || !initialImageUrl)
  const [hideCard, setHideCard] = useState(!initialSrc)

  const priceNum = toNumber(price)
  const originalPriceNum = toNumber(originalPrice)
  const savings = calculateSavings(originalPrice, price)

  const handleImageError = () => {
    if (!triedFallback && storeLogoFallback) {
      setTriedFallback(true)
      setImgSrc(storeLogoFallback)
    } else {
      setHideCard(true)
    }
  }

  if (hideCard) return null

  return (
    <Link
      href={`/deals/${slug}`}
      className="
        group block
        bg-white rounded-xl border border-gray-200 overflow-hidden
        transition-all duration-200
        hover:shadow-lg hover:-translate-y-0.5
      "
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50">
        {discountPercent != null && discountPercent > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-savings text-white px-2 py-0.5 rounded text-xs font-semibold">
              -{discountPercent}%
            </span>
          </div>
        )}

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
        <div className="text-xs text-gray-400 mb-1 font-medium">
          {store}
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm group-hover:text-brand-blue transition-colors">
          {title}
        </h3>

        <div className="flex items-baseline gap-2">
          {priceNum !== null ? (
            <>
              <span className="text-lg font-bold text-gray-900">
                ${formatPrice(priceNum)}
              </span>
              {originalPriceNum !== null && (
                <span className="text-sm text-gray-400 line-through">
                  ${formatPrice(originalPriceNum)}
                </span>
              )}
            </>
          ) : (
            <span className="text-base font-semibold text-gray-800">
              See Deal
            </span>
          )}
        </div>

        {savings && (
          <div className="text-xs text-savings font-semibold mt-1">
            Save ${savings}
          </div>
        )}
      </div>
    </Link>
  )
}

export function DealGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {children}
    </div>
  )
}
