import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-penguin.png" alt="" className="h-6 w-auto" />
              <span className="font-bold text-lg text-white">
                PromoPenguin
              </span>
            </Link>
            <p className="text-sm text-gray-400">
              Your destination for the best Canadian deals and discounts.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/deals" className="hover:text-white transition-colors">All Deals</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} PromoPenguin. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-600 text-center">
          As an affiliate, PromoPenguin earns from qualifying purchases.
          Prices and availability are subject to change.
        </div>
      </div>
    </footer>
  )
}
