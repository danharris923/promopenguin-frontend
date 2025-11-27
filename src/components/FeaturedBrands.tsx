// Server component - no hooks needed

import { AFFILIATE_BRANDS, AffiliateBrand, getStoreAffiliateLink } from '@/lib/affiliates'

// Re-export for backwards compatibility
export { AFFILIATE_BRANDS as FEATURED_BRANDS }

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

// Grid of all featured brands
export function FeaturedBrandsGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {AFFILIATE_BRANDS.map(brand => (
        <FeaturedBrandCard key={brand.slug} brand={brand} size="md" />
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

// Section wrapper with title
export function FeaturedBrandsSection() {
  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Featured Stores
          </h2>
          <span className="text-sm text-gray-500">Shop the best Canadian retailers</span>
        </div>
        <FeaturedBrandsGrid />
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
