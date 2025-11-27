import { Metadata } from 'next'
import Link from 'next/link'

import { getStores, getStoreStats } from '@/lib/db'
import { formatStoreName } from '@/lib/content-generator'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const revalidate = 900

export const metadata: Metadata = {
  title: 'All Stores - Shop Canadian Retailers | PromoPenguin',
  description: 'Browse deals from all Canadian retailers including Amazon.ca, Walmart, Costco, Best Buy, Canadian Tire and more. Find the best sales and discounts.',
}

// Store emoji mapping
const storeEmojis: Record<string, string> = {
  'amazon': '📦',
  'walmart': '🛒',
  'costco': '🏬',
  'best-buy': '💻',
  'canadian-tire': '🔧',
  'shoppers': '💊',
  'loblaws': '🍎',
  'sobeys': '🛍️',
  'home-depot': '🏠',
  'ikea': '🪑',
  'staples': '📎',
  'sport-chek': '⚽',
  'hudson-bay': '🏪',
  'indigo': '📚',
  'old-navy': '👕',
  'gap': '👖',
  'sephora': '💄',
}

export default async function StoresPage() {
  const [stores, storeStats] = await Promise.all([
    getStores(),
    getStoreStats(),
  ])

  // Merge store data with stats
  const storesWithStats = storeStats.map(stat => ({
    slug: stat.store,
    name: formatStoreName(stat.store),
    count: stat.count,
    emoji: storeEmojis[stat.store] || '🏪',
  }))

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            All Stores
          </h1>
          <p className="text-gray-600">
            Browse deals from {storesWithStats.length} Canadian retailers
          </p>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {storesWithStats.map(store => (
            <Link
              key={store.slug}
              href={`/stores/${store.slug}`}
              className="
                flex flex-col items-center justify-center
                p-6 rounded-xl
                bg-white border border-gray-200
                hover:border-orange-300 hover:shadow-lg
                transition-all duration-200
                group
              "
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {store.emoji}
              </span>
              <span className="font-semibold text-gray-900 text-center mb-1">
                {store.name}
              </span>
              <span className="text-sm text-gray-500">
                {store.count} deals
              </span>
            </Link>
          ))}
        </div>

        {/* Popular Stores Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Popular Canadian Retailers
          </h2>
          <div className="prose max-w-none text-gray-600">
            <p>
              PromoPenguin aggregates deals from Canada's most popular retailers.
              We monitor prices and promotions from major stores like Amazon.ca,
              Walmart Canada, Costco, Best Buy, Canadian Tire, and many more.
            </p>
            <p className="mt-4">
              Our automated system updates every 4 hours to ensure you always
              have access to the latest deals and discounts. Click on any store
              above to see their current offers.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
