'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface FashionCard {
  slug: string
  name: string
  title: string
  imageUrl: string
  affiliateUrl: string
}

interface FashionCarouselProps {
  cards: FashionCard[]
  autoPlayInterval?: number // milliseconds, default 60000 (1 minute)
}

export function FashionCarousel({ cards, autoPlayInterval = 60000 }: FashionCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Number of cards visible - fewer than deal cards so they appear bigger
  const getVisibleCount = useCallback(() => {
    if (typeof window === 'undefined') return 2
    if (window.innerWidth < 640) return 1   // Mobile: 1
    if (window.innerWidth < 768) return 2   // Tablet: 2
    if (window.innerWidth < 1024) return 2  // Small desktop: 2
    return 3                                 // Desktop: 3
  }, [])

  const [visibleCount, setVisibleCount] = useState(4)

  useEffect(() => {
    setVisibleCount(getVisibleCount())
    const handleResize = () => setVisibleCount(getVisibleCount())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [getVisibleCount])

  const maxIndex = Math.max(0, cards.length - visibleCount)

  // Auto-advance carousel
  useEffect(() => {
    if (isHovered || cards.length <= visibleCount) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1))
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [isHovered, maxIndex, autoPlayInterval, cards.length, visibleCount])

  const goToNext = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1))
  }

  const goToPrev = () => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1))
  }

  if (cards.length === 0) return null

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Navigation arrows - only show on hover and when there are more cards than visible */}
      {cards.length > visibleCount && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white w-10 h-10 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
            style={{ opacity: isHovered ? 1 : 0 }}
            aria-label="Previous"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white w-10 h-10 flex items-center justify-center transition-opacity"
            style={{ opacity: isHovered ? 1 : 0 }}
            aria-label="Next"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Carousel container */}
      <div className="overflow-hidden" ref={containerRef}>
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
          }}
        >
          {cards.map((card, index) => (
            <div
              key={card.slug}
              className="flex-shrink-0 px-1"
              style={{ width: `${100 / visibleCount}%` }}
            >
              <Link
                href={card.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative aspect-square overflow-hidden group"
              >
                {/* Image - flat, square corners */}
                <Image
                  src={card.imageUrl}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  loading={index < visibleCount ? 'eager' : 'lazy'}
                />

                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Text overlay - title and store */}
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <p className="text-xs font-medium uppercase tracking-wide opacity-90 mb-1">
                    {card.name}
                  </p>
                  <h3 className="text-sm font-semibold leading-tight line-clamp-2">
                    {card.title}
                  </h3>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Progress dots - using PromoPenguin orange */}
      {cards.length > visibleCount && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-cta-primary' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
