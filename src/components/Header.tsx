import Link from 'next/link'
import { AFFILIATE_BRANDS, getStoreAffiliateLink } from '@/lib/affiliates'

export function Header() {
  // Triple the brands for seamless scrolling
  const tickerItems = [...AFFILIATE_BRANDS, ...AFFILIATE_BRANDS, ...AFFILIATE_BRANDS]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      {/* Top deals ticker - AFFILIATE BRANDS */}
      <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white py-2 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center">
          {tickerItems.map((brand, i) => (
            <a
              key={`${brand.slug}-${i}`}
              href={getStoreAffiliateLink(brand.slug) || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center mx-6 hover:text-yellow-300 transition-colors"
            >
              <span className="mr-1">{brand.emoji}</span>
              <span className="font-bold">{brand.name}:</span>
              <span className="ml-1 uppercase text-yellow-200">{brand.tagline}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🐧</span>
            <span className="font-bold text-xl text-gray-900">
              Promo<span className="text-orange-500">Penguin</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/deals" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              All Deals
            </Link>
            <Link href="/stores" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Stores
            </Link>
            <Link href="/deals/today" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Today
            </Link>
          </nav>

          {/* Show first 2 brands as chips on desktop */}
          <div className="hidden lg:flex items-center gap-2">
            {AFFILIATE_BRANDS.slice(0, 2).map(brand => (
              <a
                key={brand.slug}
                href={getStoreAffiliateLink(brand.slug) || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-3 py-1.5 rounded-full ${brand.bgColor} ${brand.textColor} text-xs font-bold hover:opacity-80 transition-opacity`}
              >
                {brand.emoji} {brand.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/deals/today"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors">
              <span>🔥</span>
              <span>Hot Deals</span>
            </Link>
            <button className="md:hidden p-2 text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
