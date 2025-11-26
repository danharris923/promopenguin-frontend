'use client'

import { useEffect, useState } from 'react'
import { CTAButton } from './CTAButton'

interface StickyMobileCTAProps {
  href: string
  price: number | null
  storeName?: string
}

export function StickyMobileCTA({ href, price, storeName }: StickyMobileCTAProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero section (approx 400px)
      setIsVisible(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="
      fixed bottom-0 left-0 right-0 z-50
      bg-white border-t border-gray-200
      p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]
      md:hidden
      animate-slide-up
    ">
      <div className="flex items-center gap-3">
        {/* Price summary */}
        <div className="flex-shrink-0">
          {price ? (
            <div className="text-xl font-black text-green-600">
              ${price.toFixed(2)}
            </div>
          ) : (
            <div className="text-lg font-bold text-gray-800">
              See Price
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex-1">
          <CTAButton
            href={href}
            storeName={storeName}
            size="md"
            animate={false}
          />
        </div>
      </div>
    </div>
  )
}
