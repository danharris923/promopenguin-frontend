import Link from 'next/link'
import { getFeaturedDeals, getShuffledDeals, getStoreStats, getDealCount } from '@/lib/db'
import { generateWebsiteSchema, generateOrganizationSchema } from '@/lib/schema'
import { DealCard, DealGrid } from '@/components/DealCard'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { FeaturedBrandsSection, BrandBanner } from '@/components/FeaturedBrands'
import { AFFILIATE_BRANDS } from '@/lib/affiliates'
import { CountdownTimer } from '@/components/CountdownTimer'
import { LiveDealCount, LiveStoreCount } from '@/components/LiveStats'
import { LoadMoreDeals } from '@/components/LoadMoreDeals'

// Revalidate every 15 minutes
export const revalidate = 900

export default async function HomePage() {
  const [featuredDeals, latestDeals, storeStats, totalDeals] = await Promise.all([
    getFeaturedDeals(12),
    getShuffledDeals(24, 0), // Shuffled from full pool - offset 0 for initial load
    getStoreStats(),
    getDealCount(),
  ])

  const websiteSchema = generateWebsiteSchema()
  const orgSchema = generateOrganizationSchema()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([websiteSchema, orgSchema]),
        }}
      />

      <Header />

      <main>
        {/* Hero Section - Clean Trust */}
        <section className="bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-black mb-3">
                Best Canadian Deals
                <span className="block text-orange-400 mt-1">PromoPenguin</span>
              </h1>
              <p className="text-base md:text-lg text-slate-300 mb-6">
                AI-powered deal aggregator scanning 50+ Canadian retailers every hour.
              </p>
              <div className="flex flex-row gap-3 justify-center">
                <Link
                  href="/deals/today"
                  className="
                    px-6 py-3 rounded-lg
                    bg-orange-500 text-white
                    font-bold text-base
                    hover:bg-orange-600
                    transition-colors
                    shadow-lg
                  "
                >
                  🔥 Hot Deals
                </Link>
                <Link
                  href="/stores"
                  className="
                    px-6 py-3 rounded-lg
                    bg-slate-700 text-white
                    font-bold text-base
                    hover:bg-slate-600
                    transition-colors
                  "
                >
                  Browse Stores
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-slate-800 text-white py-4 border-t border-slate-700">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-center gap-8 md:gap-16 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">
                  <LiveDealCount />
                </div>
                <div className="text-sm text-slate-400">Active Deals</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">
                  <LiveStoreCount />
                </div>
                <div className="text-sm text-slate-400">Stores</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-orange-400">
                  <CountdownTimer />
                </div>
                <div className="text-sm text-slate-400">Next Update</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Canadian Brands - AFFILIATE */}
        <FeaturedBrandsSection />

        {/* Featured Deals */}
        {featuredDeals.length > 0 && (
          <section className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Featured Deals
                </h2>
                <Link
                  href="/deals"
                  className="text-orange-500 hover:text-orange-600 font-semibold"
                >
                  View All →
                </Link>
              </div>
              <DealGrid>
                {featuredDeals.map(deal => (
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
                    featured={true}
                  />
                ))}
              </DealGrid>
            </div>
          </section>
        )}

        {/* Store Shortcuts */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Shop by Store
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {[
                { slug: 'amazon', name: 'Amazon.ca' },
                { slug: 'walmart', name: 'Walmart' },
                { slug: 'costco', name: 'Costco' },
                { slug: 'best-buy', name: 'Best Buy' },
                { slug: 'canadian-tire', name: 'Canadian Tire' },
                { slug: 'shoppers', name: 'Shoppers' },
              ].map(store => (
                <Link
                  key={store.slug}
                  href={`/stores/${store.slug}`}
                  className="
                    flex flex-col items-center justify-center
                    p-4 rounded-xl
                    bg-white border border-gray-200
                    hover:border-orange-300 hover:shadow-md
                    transition-all
                    group
                  "
                >
                  <img
                    src={`/images/stores/${store.slug}.png`}
                    alt={store.name}
                    className="w-12 h-12 object-contain mb-2 group-hover:scale-110 transition-transform"
                  />
                  <span className="font-semibold text-gray-900 text-sm text-center">
                    {store.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Deals - WITH LOAD MORE */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Latest Deals
              </h2>
              <span className="text-sm text-gray-500">
                {totalDeals} deals available
              </span>
            </div>
            <LoadMoreDeals
              initialDeals={latestDeals}
              totalCount={totalDeals}
              pageSize={24}
            />
          </div>
        </section>

        {/* Brand Banner - AFFILIATE */}
        <section className="py-6 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <BrandBanner brand={AFFILIATE_BRANDS[0]} />
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Browse Categories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { slug: 'electronics', name: 'Electronics', emoji: '📱' },
                { slug: 'fashion', name: 'Fashion', emoji: '👕' },
                { slug: 'home', name: 'Home', emoji: '🏠' },
                { slug: 'grocery', name: 'Grocery', emoji: '🛒' },
                { slug: 'beauty', name: 'Beauty', emoji: '💄' },
                { slug: 'sports', name: 'Sports', emoji: '⚽' },
              ].map(cat => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="
                    flex items-center gap-3
                    p-4 rounded-xl
                    bg-white border border-gray-200
                    hover:border-orange-300 hover:shadow-md
                    transition-all
                  "
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="font-semibold text-gray-900">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-8 bg-white">
          <div className="max-w-4xl mx-auto px-4 prose prose-sm">
            <h2 className="text-lg mb-2">What is PromoPenguin?</h2>
            <p className="mb-3">A deal aggregator powered by AI. Our scraper monitors Canadian retailers around the clock - Amazon.ca, Walmart, Costco, Best Buy, Canadian Tire, and dozens more. Every 4 hours, fresh deals. No humans copy-pasting links.</p>
            <p className="mb-3"><strong>How it works:</strong> AI scans retailer feeds and surfaces sales. Deals older than a week get auto-removed. What you see is what's currently active (or close to it - stuff sells out).</p>
            <p className="mb-3"><strong>The fine print:</strong> We use affiliate links (that's how we keep the lights on). Prices from retailer feeds, not manually verified. Deals expire - if it's dead, it's dead. No account needed, no newsletter spam.</p>
            <p className="mb-0"><strong>Built in Canada</strong> by Canadians, for Canadians. We only list deals that ship to Canada. Click through, buy if it's good, move on.</p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
