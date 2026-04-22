'use client'

import { useState } from 'react'
import {
  computeDiscountPercent,
  daysUntilExpiry,
  type FeedDeal,
} from '@/lib/deal-feed'

interface DealFeedCardProps {
  deal: FeedDeal
}

export function DealFeedCard({ deal }: DealFeedCardProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(
    deal.image ?? deal.image_source,
  )
  const [triedFallback, setTriedFallback] = useState(
    !deal.image || !deal.image_source || deal.image === deal.image_source,
  )
  const [hidden, setHidden] = useState(false)

  if (hidden || !imgSrc) return null

  const handleImageError = () => {
    if (!triedFallback && deal.image_source && imgSrc !== deal.image_source) {
      setTriedFallback(true)
      setImgSrc(deal.image_source)
      return
    }
    setHidden(true)
  }

  const discount = computeDiscountPercent(deal.price, deal.original_price)
  const daysLeft = daysUntilExpiry(deal.valid_until)
  const endsSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7
  const price = deal.price
  const original = deal.original_price

  const priceSrText =
    price !== null && original !== null && original > price
      ? `sale price $${price.toFixed(2)}, was $${original.toFixed(2)}`
      : price !== null
      ? `price $${price.toFixed(2)}`
      : null

  return (
    <a
      href={deal.main_affiliate_url}
      target="_blank"
      rel="sponsored nofollow noopener"
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
    >
      <div className="relative aspect-square bg-gray-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={deal.title}
          loading="lazy"
          decoding="async"
          onError={handleImageError}
          className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-200"
        />
        {discount !== null && (
          <span className="absolute top-2 right-2 bg-savings text-white px-2 py-0.5 rounded text-xs font-semibold shadow-sm">
            -{discount}%
          </span>
        )}
        {deal.category && (
          <span className="absolute top-2 left-2 bg-brand-light text-brand-navy px-2 py-0.5 rounded text-[10px] font-semibold">
            {deal.category}
          </span>
        )}
      </div>

      <div className="p-4">
        {deal.seller && (
          <div className="text-xs text-gray-400 mb-1 font-medium">
            {deal.seller}
          </div>
        )}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-snug group-hover:text-brand-blue transition-colors min-h-[2.5rem]">
          {deal.title}
        </h3>

        {price !== null && (
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900" aria-hidden>
              ${price.toFixed(2)}
            </span>
            {original !== null && original > price && (
              <span className="text-sm text-gray-400 line-through" aria-hidden>
                ${original.toFixed(2)}
              </span>
            )}
            {priceSrText && <span className="sr-only">{priceSrText}</span>}
          </div>
        )}

        {endsSoon && (
          <div className="mt-2 text-[11px] font-medium text-savings">
            {daysLeft === 0
              ? 'Ends today'
              : `Ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`}
          </div>
        )}
      </div>
    </a>
  )
}
