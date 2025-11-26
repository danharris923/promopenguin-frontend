import { Metadata } from 'next'

import { getDealsByStore, getStores } from '@/lib/db'
import { formatStoreName, getStoreDescription } from '@/lib/content-generator'
import { generateItemListSchema } from '@/lib/schema'
import { DealCard, DealGrid } from '@/components/DealCard'
import { Breadcrumbs } from '@/components/deal/Breadcrumbs'

interface PageProps {
  params: { slug: string }
}

// Revalidate every 15 minutes for fresh data
export const revalidate = 900

// Generate static pages for all stores
export async function generateStaticParams() {
  const stores = await getStores()
  return stores.map(store => ({ slug: store.slug }))
}

// Allow dynamic params (new stores added by scraper)
export const dynamicParams = true

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const storeName = formatStoreName(params.slug)

  return {
    title: `${storeName} Deals & Sales in Canada`,
    description: `Find the best ${storeName} deals, sales, and discounts in Canada. Save money on your ${storeName} purchases with verified deals.`,
    openGraph: {
      title: `${storeName} Deals & Sales in Canada`,
      description: `Save money at ${storeName} with verified Canadian deals.`,
    },
  }
}

export default async function StorePage({ params }: PageProps) {
  const storeSlug = params.slug
  const storeName = formatStoreName(storeSlug)
  const storeDescription = getStoreDescription(storeSlug)

  const deals = await getDealsByStore(storeSlug)

  // Schema markup (only if we have deals)
  const itemListSchema = deals.length > 0
    ? generateItemListSchema(deals, `${storeName} Deals`)
    : null

  // Breadcrumbs
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Stores', href: '/stores' },
    { label: storeName, href: `/stores/${storeSlug}` },
  ]

  // Group deals by category for better UX
  const dealsByCategory = deals.reduce((acc, deal) => {
    const cat = deal.category || 'general'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(deal)
    return acc
  }, {} as Record<string, typeof deals>)

  return (
    <>
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {storeName} Deals in Canada
          </h1>
          <p className="text-gray-600">
            {deals.length} active deals
          </p>
        </div>

        {/* Store Info */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h2 className="font-bold text-gray-900 mb-2">
                About {storeName}
              </h2>
              <p className="text-gray-600 text-sm">
                {storeDescription || `Shop the best deals at ${storeName} in Canada.`}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {deals.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-gray-900">{deals.length}</div>
              <div className="text-sm text-gray-500">Active Deals</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {Math.max(...deals.map(d => d.discount_percent || 0))}%
              </div>
              <div className="text-sm text-gray-500">Max Discount</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-orange-600">
                {Object.keys(dealsByCategory).length}
              </div>
              <div className="text-sm text-gray-500">Categories</div>
            </div>
          </div>
        )}

        {/* No Deals Message */}
        {deals.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center mb-8">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No Active Deals Right Now
            </h2>
            <p className="text-gray-600 mb-4">
              We are constantly scanning for new {storeName} deals. Check back soon!
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
            >
              Browse All Deals
            </a>
          </div>
        )}

        {/* Deals Grid */}
        {deals.length > 0 && (
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
        )}

        {/* Bottom SEO Content */}
        <div className="mt-12 prose max-w-none">
          <h2>Shopping at {storeName} in Canada</h2>
          <p>
            {storeName} is a popular destination for Canadian shoppers looking for quality
            products at competitive prices. We track all the latest {storeName} deals,
            sales, and promotions to help you save money on your purchases.
          </p>

          <h3>Why Shop at {storeName}?</h3>
          <ul>
            <li>Competitive prices on a wide selection of products</li>
            <li>Convenient shopping options for Canadian customers</li>
            <li>Regular sales and promotional events</li>
            <li>Easy returns and customer support</li>
          </ul>

          <h3>How to Save at {storeName}</h3>
          <p>
            To maximize your savings at {storeName}, check this page regularly for the
            latest deals. We update our listings multiple times per day to ensure you
            never miss a sale.
          </p>

          <h3>{storeName} Shipping to Canada</h3>
          <p>
            {storeName} offers various shipping options for Canadian customers.
            Many orders qualify for free shipping when you spend above a certain
            threshold.
          </p>
        </div>
      </main>
    </>
  )
}
