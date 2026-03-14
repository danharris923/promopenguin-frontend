import Link from 'next/link'
import { Metadata } from 'next'
import { getStores } from '@/lib/db'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const revalidate = 900

export const metadata: Metadata = {
  title: 'All Stores - PromoPenguin',
  description: 'Browse deals from all Canadian retailers. Find discounts from Amazon.ca, Walmart, Costco, Best Buy, Canadian Tire and more.',
}

export default async function StoresPage() {
  const stores = await getStores()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">All Stores</h1>
          <p className="text-gray-500 mb-8">{stores.length} retailers with active deals</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {stores.map(store => (
              <Link
                key={store.slug}
                href={`/stores/${store.slug}`}
                className="
                  bg-white border border-gray-200 rounded-lg p-4
                  hover:shadow-md hover:border-brand-blue transition-all
                  flex flex-col items-center text-center
                "
              >
                <span className="font-medium text-gray-900 text-sm">{store.name}</span>
                {store.deal_count > 0 && (
                  <span className="text-xs text-gray-400 mt-1">{store.deal_count} deals</span>
                )}
              </Link>
            ))}
          </div>

          {stores.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500">No stores available right now. Check back soon!</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
