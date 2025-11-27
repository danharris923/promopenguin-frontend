import { Metadata } from 'next'
import Link from 'next/link'

import { getDeals, getStores, getCategories, getDealCount } from '@/lib/db'
import { DealCard, DealGrid } from '@/components/DealCard'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { FeaturedBrandsGrid, FEATURED_BRANDS, FeaturedBrandCard } from '@/components/FeaturedBrands'

export const revalidate = 900

export const metadata: Metadata = {
  title: 'All Deals - Best Canadian Deals & Sales | PromoPenguin',
  description: 'Browse all the latest deals, sales, and discounts from top Canadian retailers. Find savings on electronics, fashion, home goods and more.',
}

export default async function DealsPage() {
  const [deals, stores, categories, totalCount] = await Promise.all([
    getDeals({ limit: 100 }),
    getStores(),
    getCategories(),
    getDealCount(),
  ])

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            All Deals
          </h1>
          <p className="text-gray-600">
            {totalCount} active deals from top Canadian retailers
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Store Filter */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 self-center">Stores:</span>
            {stores.slice(0, 6).map(store => (
              <Link
                key={store.slug}
                href={`/stores/${store.slug}`}
                className="px-3 py-1 bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-700 rounded-full text-sm transition-colors"
              >
                {store.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Category Quick Links */}
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="text-sm font-medium text-gray-700 self-center">Categories:</span>
          {[
            { slug: 'electronics', name: 'Electronics' },
            { slug: 'fashion', name: 'Fashion' },
            { slug: 'home', name: 'Home' },
            { slug: 'grocery', name: 'Grocery' },
            { slug: 'beauty', name: 'Beauty' },
            { slug: 'sports', name: 'Sports' },
          ].map(cat => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="px-3 py-1 bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-700 rounded-full text-sm transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Featured Canadian Brands - AFFILIATE */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🇨🇦 Shop Canadian Brands</h2>
          <FeaturedBrandsGrid />
        </div>

        {/* Deals Grid */}
        {deals.length > 0 ? (
          <DealGrid>
            {deals.map((deal, index) => (
              <>
                {/* Insert brand card every 8 deals */}
                {index > 0 && index % 8 === 0 && (
                  <FeaturedBrandCard 
                    key={`brand-${index}`} 
                    brand={FEATURED_BRANDS[Math.floor(index / 8) % FEATURED_BRANDS.length]} 
                  />
                )}
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
              </>
            ))}
          </DealGrid>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No deals found. Check back soon!</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
