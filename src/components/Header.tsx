import Link from 'next/link'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-penguin.png" alt="" className="h-7 w-auto" />
            <span className="font-bold text-xl text-gray-900">
              Promo<span className="text-brand-navy">Penguin</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/stores"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Stores
            </Link>
            <Link
              href="/deals"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Trending
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-2 gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm text-gray-400">Search deals...</span>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <div className="border-t border-gray-100 bg-gray-50 py-2">
        <div className="max-w-6xl mx-auto px-4 flex justify-center gap-8 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-brand-blue" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Updated Daily
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-brand-blue" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Hand-Picked Deals
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <svg className="w-4 h-4 text-brand-blue" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Top Retailers Only
          </span>
        </div>
      </div>
    </header>
  )
}
