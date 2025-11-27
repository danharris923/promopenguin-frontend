// Server component - no hooks needed

import Image from 'next/image'
import { AFFILIATE_BRANDS, AffiliateBrand, getStoreAffiliateLink } from '@/lib/affiliates'

// Re-export for backwards compatibility
export { AFFILIATE_BRANDS as FEATURED_BRANDS }

// Canadian fashion brands to feature prominently
const CANADIAN_FASHION_BRANDS = ['lululemon', 'roots', 'ardene', 'aritzia']

// Images for featured brand cards (subset for hero section)
const FEATURED_BRAND_IMAGES: Record<string, string[]> = {
  'lululemon': [
    '/images/affiliates/lululemon/1.avif',
    '/images/affiliates/lululemon/2.webp',
  ],
  'roots': [
    '/images/affiliates/roots/1.jpg',
    '/images/affiliates/roots/2.jpg',
    '/images/affiliates/roots/3.jpg',
    '/images/affiliates/roots/4.png',
  ],
  'aritzia': [
    '/images/affiliates/aritzia/1.jpg',
    '/images/affiliates/aritzia/2.webp',
    '/images/affiliates/aritzia/3.jpg',
    '/images/affiliates/aritzia/4.webp',
    '/images/affiliates/aritzia/5.avif',
    '/images/affiliates/aritzia/6.webp',
    '/images/affiliates/aritzia/7.jpg',
  ],
  'ardene': [
    '/images/affiliates/ardene/1.webp',
    '/images/affiliates/ardene/2.webp',
    '/images/affiliates/ardene/3.webp',
  ],
}

// Get deterministic image based on brand index
function getBrandImage(slug: string, index: number): string | null {
  const images = FEATURED_BRAND_IMAGES[slug] || []
  if (images.length === 0) return null
  return images[index % images.length]
}

// Single brand card - can be used anywhere
export function FeaturedBrandCard({ brand, size = 'md' }: { brand: AffiliateBrand, size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const affiliateUrl = getStoreAffiliateLink(brand.slug)

  return (
    <a
      href={affiliateUrl || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        block rounded-xl overflow-hidden
        bg-gradient-to-br ${brand.color}
        text-white
        ${sizeClasses[size]}
        hover:scale-105 hover:shadow-xl
        transition-all duration-200
        group
      `}
    >
      <div className="flex items-center gap-3">
        <span className={`${size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-3xl' : 'text-2xl'}`}>
          {brand.emoji}
        </span>
        <div>
          <div className={`font-bold ${size === 'lg' ? 'text-xl' : 'text-lg'}`}>
            {brand.name}
          </div>
          <div className={`text-white/90 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
            {brand.tagline}
          </div>
        </div>
      </div>
      {size !== 'sm' && (
        <div className="mt-3 flex items-center justify-between">
          <span className="text-white/80 text-xs">{brand.description}</span>
          <span className="text-white font-bold group-hover:translate-x-1 transition-transform">→</span>
        </div>
      )}
    </a>
  )
}

// Grid of all featured brands - show 6 for even grid (2x3 mobile, 3x2 or 6 desktop)
export function FeaturedBrandsGrid() {
  // Take first 6 for clean grid layout
  const brandsToShow = AFFILIATE_BRANDS.slice(0, 6)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
      {brandsToShow.map(brand => (
        <FeaturedBrandCard key={brand.slug} brand={brand} size="sm" />
      ))}
    </div>
  )
}

// Horizontal scrolling row of brands
export function FeaturedBrandsRow() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {AFFILIATE_BRANDS.map(brand => (
        <div key={brand.slug} className="flex-shrink-0 w-64">
          <FeaturedBrandCard brand={brand} size="md" />
        </div>
      ))}
    </div>
  )
}

// Random single brand card (for sprinkling in deal grids)
export function RandomBrandCard() {
  const randomBrand = AFFILIATE_BRANDS[Math.floor(Math.random() * AFFILIATE_BRANDS.length)]
  return <FeaturedBrandCard brand={randomBrand} size="md" />
}

// Canadian Brand Deal Card - looks like a deal card with image
function CanadianBrandDealCard({ brand, index }: { brand: AffiliateBrand, index: number }) {
  const affiliateUrl = getStoreAffiliateLink(brand.slug)
  const imageUrl = getBrandImage(brand.slug, index)

  return (
    <a
      href={affiliateUrl || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group block
        bg-white rounded-xl shadow-md overflow-hidden
        transition-all duration-200
        hover:shadow-xl hover:-translate-y-1
      "
    >
      {/* Image Container */}
      <div className={`relative aspect-square overflow-hidden ${!imageUrl ? `bg-gradient-to-br ${brand.color}` : 'bg-gray-100'}`}>
        {/* Sale Badge */}
        <div className="absolute top-2 right-2 z-10">
          <span className="
            bg-red-600 text-white
            px-2 py-1 rounded-lg
            font-bold text-sm
            shadow-md
          ">
            SALE
          </span>
        </div>

        {/* Canadian Badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className="
            bg-red-700 text-white
            px-2 py-0.5 rounded
            font-medium text-xs
          ">
            Canadian
          </span>
        </div>

        {/* Image or gradient fallback */}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${brand.name} sale`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-8xl opacity-90 group-hover:scale-110 transition-transform duration-200">
              {brand.emoji}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Store */}
        <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
          {brand.name}
        </div>

        {/* Tagline as title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {brand.tagline}
        </h3>

        {/* CTA */}
        <div className="flex items-baseline gap-2">
          <span className={`text-lg font-bold ${brand.textColor}`}>
            Shop Now →
          </span>
        </div>
      </div>
    </a>
  )
}

// Section wrapper with title - shows 4 Canadian fashion brands
export function FeaturedBrandsSection() {
  // Get the 4 Canadian fashion brands
  const canadianBrands = AFFILIATE_BRANDS.filter(b => CANADIAN_FASHION_BRANDS.includes(b.slug))

  return (
    <section className="py-6 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Featured Canadian Brands
          </h2>
          <span className="text-sm text-gray-500">Shop local, save big</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {canadianBrands.map((brand, index) => (
            <CanadianBrandDealCard key={brand.slug} brand={brand} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Inline brand banner (for between deal sections)
export function BrandBanner({ brand }: { brand: AffiliateBrand }) {
  const affiliateUrl = getStoreAffiliateLink(brand.slug)

  return (
    <a
      href={affiliateUrl || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        block w-full py-4 px-6 rounded-xl
        bg-gradient-to-r ${brand.color}
        text-white text-center
        hover:shadow-lg transition-shadow
      `}
    >
      <span className="text-2xl mr-2">{brand.emoji}</span>
      <span className="font-bold text-lg">{brand.name}</span>
      <span className="mx-2">•</span>
      <span className="uppercase">{brand.tagline}</span>
      <span className="ml-2">→</span>
    </a>
  )
}
