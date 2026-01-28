import Link from 'next/link'
import { getDeals, getDealCount, getStores, getCategories } from '@/lib/db'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { DealCard, DealGrid } from '@/components/DealCard'
import { Breadcrumbs } from '@/components/deal/Breadcrumbs'
import { SITE_URL, REVALIDATE_INTERVAL } from '@/lib/config'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Deals - PromoPenguin',
  description: 'Browse all the best deals from Canadian retailers. Find discounts from Amazon.ca, Walmart, Costco, Best Buy, Canadian Tire and more.',
  alternates: {
    canonical: `${SITE_URL}/deals`,
  },
}

// Revalidate every 15 minutes
export const revalidate = REVALIDATE_INTERVAL

export default async function DealsPage() {
  const [deals, dealCount, stores] = await Promise.all([
    getDeals({ limit: 100, orderBy: 'random' }),
    getDealCount(),
    getStores(),
  ])
  const storeCount = stores.length

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <Breadcrumbs items={[
            { label: 'Home', href: '/' },
            { label: 'All Deals' },
          ]} />
        </div>

        {/* Hero */}
        <section className="bg-gray-900 py-12 mt-4">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              All Deals
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              {dealCount} products from {storeCount} retailers, updated every 15 minutes
            </p>
          </div>
        </section>

        {/* Deals Grid */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            {deals.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600">
                    Showing {deals.length} deals
                  </p>
                </div>
                <DealGrid>
                  {deals.map(deal => (
                    <DealCard
                      key={deal.id}
                      id={deal.id}
                      title={deal.title}
                      slug={deal.slug}
                      imageUrl={deal.image_blob_url || deal.image_url || '/placeholder-deal.svg'}
                      price={deal.price}
                      originalPrice={deal.original_price}
                      discountPercent={deal.discount_percent}
                      store={deal.store || null}
                      affiliateUrl={deal.affiliate_url}
                      featured={deal.featured}
                    />
                  ))}
                </DealGrid>
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-gray-600 mb-4">No deals available at the moment</p>
                <p className="text-gray-400 mb-8">Check back soon - we update every 15 minutes!</p>
                <Link href="/" className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                  Back to Home
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
