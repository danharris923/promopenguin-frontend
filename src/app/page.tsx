import Link from 'next/link'
import { getFeaturedDeals, getLatestDeals, getStores, getStoreStats } from '@/lib/db'
import { generateWebsiteSchema, generateOrganizationSchema } from '@/lib/schema'
import { DealCard, DealGrid } from '@/components/DealCard'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { FeaturedBrandsSection, BrandBanner, FEATURED_BRANDS } from '@/components/FeaturedBrands'

// Revalidate every 15 minutes
export const revalidate = 900

export default async function HomePage() {
  const [featuredDeals, latestDeals, storeStats] = await Promise.all([
    getFeaturedDeals(12),
    getLatestDeals(50),
    getStoreStats(),
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
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-black mb-4">
                Best Canadian Deals
                <span className="block text-yellow-300">Save Money Today 🇨🇦</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8">
                AI-powered deal aggregator. We scan Amazon.ca, Walmart, Costco, Best Buy and 50+ Canadian retailers every 4 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/deals/today"
                  className="
                    px-8 py-4 rounded-xl
                    bg-white text-orange-600
                    font-bold text-lg
                    hover:bg-yellow-100
                    transition-colors
                    shadow-lg
                  "
                >
                  🔥 Today's Hot Deals
                </Link>
                <Link
                  href="/stores"
                  className="
                    px-8 py-4 rounded-xl
                    bg-white/20 text-white
                    font-bold text-lg
                    hover:bg-white/30
                    transition-colors
                    border border-white/30
                  "
                >
                  Browse Stores
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-gray-900 text-white py-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-center gap-8 md:gap-16 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-orange-400">
                  {latestDeals.length + featuredDeals.length}+
                </div>
                <div className="text-sm text-gray-400">Active Deals</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-green-400">
                  {storeStats.length}+
                </div>
                <div className="text-sm text-gray-400">Stores</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-yellow-400">
                  4hrs
                </div>
                <div className="text-sm text-gray-400">Update Frequency</div>
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
                  🔥 Featured Deals
                </h2>
                <Link
                  href="/deals"
                  className="text-orange-600 hover:text-orange-700 font-semibold"
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
              🏪 Shop by Store
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {[
                { slug: 'amazon', name: 'Amazon.ca', emoji: '📦' },
                { slug: 'walmart', name: 'Walmart', emoji: '🛒' },
                { slug: 'costco', name: 'Costco', emoji: '🏬' },
                { slug: 'best-buy', name: 'Best Buy', emoji: '💻' },
                { slug: 'canadian-tire', name: 'Canadian Tire', emoji: '🔧' },
                { slug: 'shoppers', name: 'Shoppers', emoji: '💊' },
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
                  <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                    {store.emoji}
                  </span>
                  <span className="font-semibold text-gray-900 text-sm text-center">
                    {store.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Deals */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                ⚡ Latest Deals
              </h2>
              <Link
                href="/deals"
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                View All →
              </Link>
            </div>
            <DealGrid>
              {latestDeals.map(deal => (
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

            {/* Big CTA to view all deals */}
            <div className="mt-10 text-center">
              <Link
                href="/deals"
                className="
                  inline-flex items-center gap-2
                  px-8 py-4 rounded-xl
                  bg-gradient-to-r from-orange-500 to-red-600
                  text-white font-bold text-lg
                  hover:from-orange-400 hover:to-red-500
                  transition-all shadow-lg hover:shadow-xl
                  hover:scale-105
                "
              >
                View All Deals
              </Link>
            </div>
          </div>
        </section>

        {/* Brand Banner - AFFILIATE */}
        <section className="py-6 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <BrandBanner brand={FEATURED_BRANDS[0]} />
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              📂 Browse Categories
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
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 prose">
            <h2>What is PromoPenguin?</h2>
            <p>
              A deal aggregator powered by AI. Our scraper monitors Canadian retailers
              around the clock - Amazon.ca, Walmart, Costco, Best Buy, Canadian Tire,
              and dozens more. Every 4 hours, fresh deals. No humans copy-pasting links.
            </p>

            <h3>How it works</h3>
            <p>
              AI scans retailer feeds and surfaces the sales worth knowing about.
              Deals older than a week get automatically removed. What you see is what's
              currently active (or close to it - stuff sells out).
            </p>

            <h3>The fine print</h3>
            <ul>
              <li>We use affiliate links - that's how we keep the lights on</li>
              <li>Prices come from retailer feeds, not manually verified</li>
              <li>Deals expire - if it's dead, sorry, it's dead</li>
              <li>No account needed, no newsletter spam</li>
            </ul>

            <h3>Built in Canada</h3>
            <p>
              By Canadians, for Canadians. We only list deals that ship to Canada.
              Click through, buy if it's good, move on. Simple.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}






