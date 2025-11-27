import Link from 'next/link'

// Featured brand affiliate links (ShopStyle)
const FEATURED_BRANDS = [
  { name: 'Lululemon', emoji: '🧘', text: 'We Made Too Much Sale!', url: 'https://shopstyle.it/l/cwE20' },
  { name: 'Roots', emoji: '🍁', text: 'Roots Sale On Now!', url: 'https://shopstyle.it/l/cwE2E' },
  { name: 'Aritzia', emoji: '✨', text: 'Aritzia Sale On Now!', url: 'https://shopstyle.it/l/cwE2N' },
  { name: 'Ardene', emoji: '💃', text: 'Ardene Sale On Now!', url: 'https://shopstyle.it/l/cwE8W' },
  { name: 'Sephora', emoji: '💄', text: 'Sephora Sale On Now!', url: 'https://shopstyle.it/l/cw4bZ' },
]

export function Header() {
  const tickerItems = [...FEATURED_BRANDS, ...FEATURED_BRANDS, ...FEATURED_BRANDS]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      {/* Top deals ticker - AFFILIATE BRANDS */}
      <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white py-2 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center">
          {tickerItems.map((brand, i) => (
            <a
              key={i}
              href={brand.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center mx-6 hover:text-yellow-300 transition-colors"
            >
              <span className="mr-1">{brand.emoji}</span>
              <span className="font-bold">{brand.name}:</span>
              <span className="ml-1 uppercase text-yellow-200">{brand.text}</span>
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

          <div className="hidden lg:flex items-center gap-2">
            <a href="https://shopstyle.it/l/cwE20" target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full bg-pink-100 text-pink-700 text-xs font-bold hover:bg-pink-200 transition-colors">
              🧘 Lululemon
            </a>
            <a href="https://shopstyle.it/l/cwE2E" target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold hover:bg-amber-200 transition-colors">
              🍁 Roots
            </a>
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
