import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🐧</span>
              <span className="font-bold text-xl text-white">
                Promo<span className="text-orange-500">Penguin</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              AI-powered deal aggregator. We scan 50+ Canadian retailers every 4 hours.
              
            </p>
            <p className="text-xs text-gray-500">
              Built in Canada
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/deals" className="hover:text-white transition-colors">All Deals</Link></li>
              <li><Link href="/deals/today" className="hover:text-white transition-colors">Today's Deals</Link></li>
              <li><Link href="/stores" className="hover:text-white transition-colors">Stores</Link></li>
              <li><Link href="/category" className="hover:text-white transition-colors">Categories</Link></li>
            </ul>
          </div>

          {/* Popular Stores */}
          <div>
            <h3 className="font-semibold text-white mb-4">Popular Stores</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/stores/amazon" className="hover:text-white transition-colors">Amazon.ca</Link></li>
              <li><Link href="/stores/walmart" className="hover:text-white transition-colors">Walmart Canada</Link></li>
              <li><Link href="/stores/costco" className="hover:text-white transition-colors">Costco</Link></li>
              <li><Link href="/stores/best-buy" className="hover:text-white transition-colors">Best Buy</Link></li>
              <li><Link href="/stores/canadian-tire" className="hover:text-white transition-colors">Canadian Tire</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-white mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/category/electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link href="/category/fashion" className="hover:text-white transition-colors">Fashion</Link></li>
              <li><Link href="/category/home" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/category/grocery" className="hover:text-white transition-colors">Grocery</Link></li>
              <li><Link href="/category/beauty" className="hover:text-white transition-colors">Beauty</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} PromoPenguin. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <a href="https://shopcanada.cc" className="hover:text-white transition-colors" target="_blank" rel="noopener">ShopCanada</a>
          </div>
        </div>

        {/* Affiliate Disclosure */}
        <div className="mt-6 text-xs text-gray-600 text-center">
          <p>
            As an affiliate, PromoPenguin earns from qualifying purchases.
            Prices and availability are subject to change.
          </p>
        </div>
      </div>
    </footer>
  )
}
