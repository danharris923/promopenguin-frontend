import Link from 'next/link'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🐧</span>
            <span className="font-bold text-xl text-gray-900">
              Promo<span className="text-orange-500">Penguin</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/deals"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              All Deals
            </Link>
            <Link
              href="/stores"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Stores
            </Link>
            <Link
              href="/category"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Categories
            </Link>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/deals/today"
              className="
                hidden sm:inline-flex
                items-center gap-1.5
                px-4 py-2 rounded-lg
                bg-orange-500 hover:bg-orange-600
                text-white font-semibold text-sm
                transition-colors
              "
            >
              <span>🔥</span>
              <span>Today's Deals</span>
            </Link>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Top deals ticker (optional) */}
      <div className="bg-gray-900 text-white py-1.5 text-center text-sm overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          🔥 Hot: Sony WH-1000XM5 40% OFF at Amazon.ca •
          🛒 Costco: Instant Pot $49.99 •
          ⚡ Flash Sale: Lululemon Align Leggings 50% OFF •
          🔥 Hot: Sony WH-1000XM5 40% OFF at Amazon.ca •
        </div>
      </div>
    </header>
  )
}
