import { Metadata } from 'next'
import Link from 'next/link'

import { getStoreStats } from '@/lib/db'
import { hasFlippSupport } from '@/lib/flipp'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const revalidate = 900

export const metadata: Metadata = {
  title: 'All Stores - Shop Canadian Retailers | PromoPenguin',
  description: 'Browse deals from all Canadian retailers including Amazon.ca, Walmart, Costco, Best Buy, Canadian Tire and more. Find the best sales and discounts.',
}

// All Canadian stores we want pages for
const ALL_STORES: { slug: string; name: string; emoji: string; category: string }[] = [
  // Big Box / General
  { slug: 'amazon', name: 'Amazon.ca', emoji: '📦', category: 'General' },
  { slug: 'walmart', name: 'Walmart', emoji: '🛒', category: 'General' },
  { slug: 'costco', name: 'Costco', emoji: '🏬', category: 'General' },
  { slug: 'giant-tiger', name: 'Giant Tiger', emoji: '🐯', category: 'General' },
  { slug: 'dollarama', name: 'Dollarama', emoji: '💵', category: 'General' },

  // Electronics
  { slug: 'best-buy', name: 'Best Buy', emoji: '💻', category: 'Electronics' },
  { slug: 'the-source', name: 'The Source', emoji: '🔌', category: 'Electronics' },
  { slug: 'visions', name: 'Visions Electronics', emoji: '📺', category: 'Electronics' },
  { slug: 'london-drugs', name: 'London Drugs', emoji: '💊', category: 'Electronics' },

  // Home & Hardware
  { slug: 'canadian-tire', name: 'Canadian Tire', emoji: '🔧', category: 'Home' },
  { slug: 'home-depot', name: 'Home Depot', emoji: '🏠', category: 'Home' },
  { slug: 'rona', name: 'RONA', emoji: '🪚', category: 'Home' },
  { slug: 'home-hardware', name: 'Home Hardware', emoji: '🔨', category: 'Home' },
  { slug: 'ikea', name: 'IKEA', emoji: '🪑', category: 'Home' },
  { slug: 'the-brick', name: 'The Brick', emoji: '🛋️', category: 'Home' },
  { slug: 'leons', name: "Leon's", emoji: '🛏️', category: 'Home' },

  // Grocery
  { slug: 'loblaws', name: 'Loblaws', emoji: '🍎', category: 'Grocery' },
  { slug: 'no-frills', name: 'No Frills', emoji: '🛒', category: 'Grocery' },
  { slug: 'superstore', name: 'Real Canadian Superstore', emoji: '🏪', category: 'Grocery' },
  { slug: 'sobeys', name: 'Sobeys', emoji: '🥬', category: 'Grocery' },
  { slug: 'metro', name: 'Metro', emoji: '🍞', category: 'Grocery' },
  { slug: 'food-basics', name: 'Food Basics', emoji: '🥫', category: 'Grocery' },
  { slug: 'freshco', name: 'FreshCo', emoji: '🥗', category: 'Grocery' },
  { slug: 'save-on-foods', name: 'Save-On-Foods', emoji: '🛍️', category: 'Grocery' },
  { slug: 'safeway', name: 'Safeway', emoji: '🧺', category: 'Grocery' },

  // Health & Beauty
  { slug: 'shoppers', name: 'Shoppers Drug Mart', emoji: '💊', category: 'Health' },
  { slug: 'rexall', name: 'Rexall', emoji: '💉', category: 'Health' },
  { slug: 'sephora', name: 'Sephora', emoji: '💄', category: 'Health' },
  { slug: 'well-ca', name: 'Well.ca', emoji: '🧴', category: 'Health' },

  // Fashion
  { slug: 'the-bay', name: "Hudson's Bay", emoji: '🏬', category: 'Fashion' },
  { slug: 'winners', name: 'Winners', emoji: '🏷️', category: 'Fashion' },
  { slug: 'old-navy', name: 'Old Navy', emoji: '👕', category: 'Fashion' },
  { slug: 'gap', name: 'Gap', emoji: '👖', category: 'Fashion' },
  { slug: 'lululemon', name: 'Lululemon', emoji: '🧘', category: 'Fashion' },
  { slug: 'roots', name: 'Roots', emoji: '🍁', category: 'Fashion' },
  { slug: 'aritzia', name: 'Aritzia', emoji: '👗', category: 'Fashion' },
  { slug: 'ardene', name: 'Ardene', emoji: '💃', category: 'Fashion' },
  { slug: 'michael-kors', name: 'Michael Kors', emoji: '👜', category: 'Fashion' },
  { slug: 'marks', name: "Mark's", emoji: '👔', category: 'Fashion' },
  { slug: 'sport-chek', name: 'Sport Chek', emoji: '⚽', category: 'Fashion' },

  // Office & Books
  { slug: 'staples', name: 'Staples', emoji: '📎', category: 'Office' },
  { slug: 'indigo', name: 'Indigo', emoji: '📚', category: 'Office' },

  // Specialty
  { slug: 'petsmart', name: 'PetSmart', emoji: '🐕', category: 'Specialty' },
  { slug: 'pet-valu', name: 'Pet Valu', emoji: '🐱', category: 'Specialty' },
  { slug: 'toys-r-us', name: 'Toys R Us', emoji: '🧸', category: 'Specialty' },
  { slug: 'princess-auto', name: 'Princess Auto', emoji: '🔩', category: 'Specialty' },
  { slug: 'mec', name: 'MEC', emoji: '🏔️', category: 'Specialty' },
  { slug: 'atmosphere', name: 'Atmosphere', emoji: '⛺', category: 'Specialty' },
]

// Group stores by category
const STORE_CATEGORIES = ['General', 'Electronics', 'Home', 'Grocery', 'Health', 'Fashion', 'Office', 'Specialty']

export default async function StoresPage() {
  // Get deal counts from DB
  const storeStats = await getStoreStats()
  const dealCounts = Object.fromEntries(storeStats.map(s => [s.store, s.count]))

  // Merge deal counts with all stores, and check Flipp support
  const storesWithCounts = ALL_STORES.map(store => ({
    ...store,
    count: dealCounts[store.slug] || 0,
    hasFlipp: hasFlippSupport(store.slug),
  }))

  // Group by category
  const storesByCategory = STORE_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = storesWithCounts.filter(s => s.category === cat)
    return acc
  }, {} as Record<string, typeof storesWithCounts>)

  const totalDeals = storesWithCounts.reduce((sum, s) => sum + s.count, 0)

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            All Canadian Stores
          </h1>
          <p className="text-gray-600">
            {ALL_STORES.length} retailers · {totalDeals} active deals
          </p>
        </div>

        {/* Stores by Category */}
        {STORE_CATEGORIES.map(category => (
          <section key={category} className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              {category}
              <span className="text-sm font-normal text-gray-500">
                ({storesByCategory[category].length} stores)
              </span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {storesByCategory[category].map(store => (
                <Link
                  key={store.slug}
                  href={`/stores/${store.slug}`}
                  className="
                    flex flex-col items-center justify-center
                    p-4 rounded-xl
                    bg-white border border-gray-200
                    hover:border-orange-300 hover:shadow-lg
                    transition-all duration-200
                    group
                  "
                >
                  <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                    {store.emoji}
                  </span>
                  <span className="font-semibold text-gray-900 text-center text-sm">
                    {store.name}
                  </span>
                  {store.count > 0 ? (
                    <span className="text-xs text-green-600 font-medium mt-1">
                      {store.count} deals
                    </span>
                  ) : store.hasFlipp ? (
                    <span className="text-xs text-blue-600 font-medium mt-1">
                      Flyer deals
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 mt-1">
                      Coming soon
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* SEO Content */}
        <section className="mt-12 prose max-w-none">
          <h2>Shop Canadian Retailers</h2>
          <p>
            PromoPenguin tracks deals from {ALL_STORES.length} Canadian retailers.
            We scan for sales, discounts, and promotions from major stores like
            Amazon.ca, Walmart Canada, Costco, Best Buy, Canadian Tire, and many more.
          </p>
          <p>
            Our system updates hourly. Click any store to see their current deals.
            Stores with "Flyer deals" show weekly flyer promotions from Flipp.
          </p>
        </section>
      </main>
      <Footer />
    </>
  )
}
