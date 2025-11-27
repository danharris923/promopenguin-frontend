// Server component - no hooks needed

import Image from 'next/image'

// Featured brand affiliate links (ShopStyle)
export const FEATURED_BRANDS = [
  {
    name: 'Lululemon',
    slug: 'lululemon',
    emoji: '🧘',
    tagline: 'We Made Too Much Sale!',
    description: 'Premium athletic wear from Vancouver',
    url: 'https://shopstyle.it/l/cwE20',
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700',
  },
  {
    name: 'Roots',
    slug: 'roots',
    emoji: '🍁',
    tagline: 'Roots Sale On Now!',
    description: 'Canadian heritage leather & apparel',
    url: 'https://shopstyle.it/l/cwE2E',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
  },
  {
    name: 'Aritzia',
    slug: 'aritzia',
    emoji: '✨',
    tagline: 'Aritzia Sale On Now!',
    description: 'Elevated everyday fashion from Vancouver',
    url: 'https://shopstyle.it/l/cwE2N',
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
  },
  {
    name: 'Ardene',
    slug: 'ardene',
    emoji: '💃',
    tagline: 'Ardene Sale On Now!',
    description: 'Affordable trend-forward fashion from Montreal',
    url: 'https://shopstyle.it/l/cwE8W',
    color: 'from-teal-500 to-cyan-600',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
  },
  {
    name: 'Sephora',
    slug: 'sephora',
    emoji: '💄',
    tagline: 'Sephora Sale On Now!',
    description: 'Premium beauty and cosmetics',
    url: 'https://shopstyle.it/l/cw4bZ',
    color: 'from-black to-gray-800',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-900',
  },
]

// Single brand card - can be used anywhere
export function FeaturedBrandCard({ brand, size = 'md' }: { brand: typeof FEATURED_BRANDS[0], size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  return (
    <a
      href={brand.url}
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
      {FEATURED_BRANDS.map(brand => (
        <FeaturedBrandCard key={brand.slug} brand={brand} size="md" />
      ))}
    </div>
  )
}

// Horizontal scrolling row of brands
export function FeaturedBrandsRow() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {FEATURED_BRANDS.map(brand => (
        <div key={brand.slug} className="flex-shrink-0 w-64">
          <FeaturedBrandCard brand={brand} size="md" />
        </div>
      ))}
    </div>
  )
}

// Random single brand card (for sprinkling in deal grids)
export function RandomBrandCard() {
  const randomBrand = FEATURED_BRANDS[Math.floor(Math.random() * FEATURED_BRANDS.length)]
  return <FeaturedBrandCard brand={randomBrand} size="md" />
}

// Section wrapper with title
export function FeaturedBrandsSection() {
  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            🇨🇦 Featured Canadian Brands
          </h2>
          <span className="text-sm text-gray-500">Shop the best Canadian retailers</span>
        </div>
        <FeaturedBrandsGrid />
      </div>
    </section>
  )
}

// Inline brand banner (for between deal sections)
export function BrandBanner({ brand }: { brand: typeof FEATURED_BRANDS[0] }) {
  return (
    <a
      href={brand.url}
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
