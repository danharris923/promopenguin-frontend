import { Metadata } from 'next'

import { getDeals } from '@/lib/db'
import { DealCard, DealGrid } from '@/components/DealCard'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const revalidate = 900

export const metadata: Metadata = {
  title: "Today's Hot Deals - Best Canadian Sales | PromoPenguin",
  description: "Today's hottest deals and sales from top Canadian retailers. Fresh deals updated every 4 hours. Don't miss out on these limited-time offers!",
}

export default async function TodayDealsPage() {
  // Get deals from the last 24 hours, sorted by newest
  const deals = await getDeals({ limit: 50, orderBy: 'date_added', orderDir: 'DESC' })

  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🔥</span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Today's Hot Deals
            </h1>
          </div>
          <p className="text-gray-600">
            {formattedDate} • Updated every 4 hours
          </p>
        </div>

        {/* Urgency Banner */}
        <div className="bg-slate-800 text-white rounded-xl p-4 mb-8">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">⚡</span>
            <span className="font-bold">Limited Time Offers</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300">Prices may change at any time</span>
          </div>
        </div>

        {/* Deals Grid */}
        {deals.length > 0 ? (
          <DealGrid>
            {deals.map(deal => (
              <DealCard
                key={deal.id}
                id={deal.id}
                title={deal.title}
                slug={deal.slug}
                imageUrl={deal.image_blob_url || deal.image_url || '/placeholder-deal.jpg'}
                price={deal.price}
                originalPrice={deal.original_price}
                discountPercent={deal.discount_percent}
                store={deal.store || 'Unknown'}
                affiliateUrl={deal.affiliate_url}
                featured={deal.featured}
              />
            ))}
          </DealGrid>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No deals found today. Check back soon!</p>
            <p className="text-gray-400 mt-2">We update deals every 4 hours.</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
