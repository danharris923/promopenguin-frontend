import Link from 'next/link'
import { getFeaturedDeals, getDeals, getStoreStats } from '@/lib/db'
import { generateWebsiteSchema, generateOrganizationSchema } from '@/lib/schema'
import { FeaturedDealCard, DealCard, DealGrid } from '@/components/DealCard'
import { dealToCardProps } from '@/lib/deal-utils'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
export const revalidate = 900

export default async function HomePage() {
  const [featuredDeals, latestDeals, storeStats] = await Promise.all([
    getFeaturedDeals(4, true),
    getDeals({ limit: 12, orderBy: 'random' }),
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
        {/* Hero */}
        <section className="bg-white py-6 md:py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="font-serif text-3xl md:text-4xl font-normal text-gray-900 mb-2">
              Today&rsquo;s Best Deals, All in One Place.
            </h1>
            <p className="text-gray-500 text-base">
              Real discounts worth your click&mdash;no fluff, just savings.
            </p>
          </div>
        </section>

        {/* Featured Deals — 2x2 grid, large cards */}
        {featuredDeals.length > 0 && (
          <section className="pb-12 md:pb-16">
            <div className="max-w-5xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {featuredDeals.map(deal => (
                  <FeaturedDealCard key={deal.id} {...dealToCardProps(deal)} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tabbed deals section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            {/* Section tabs */}
            <div className="flex gap-8 mb-8 border-b border-gray-200">
              <span className="pb-3 border-b-2 border-gray-900 font-semibold text-gray-900 text-sm">
                Biggest Price Drops
              </span>
              <Link
                href="/deals"
                className="pb-3 text-gray-400 hover:text-gray-600 font-medium text-sm transition-colors"
              >
                Ending Soon
              </Link>
              <Link
                href="/deals"
                className="pb-3 text-gray-400 hover:text-gray-600 font-medium text-sm transition-colors"
              >
                Trending Now
              </Link>
            </div>

            <DealGrid>
              {latestDeals.map(deal => (
                <DealCard key={deal.id} {...dealToCardProps(deal)} />
              ))}
            </DealGrid>

            <div className="text-center mt-10">
              <Link
                href="/deals"
                className="
                  inline-block px-8 py-3 rounded-lg
                  border-2 border-brand-navy text-brand-navy
                  font-semibold text-sm
                  hover:bg-brand-navy hover:text-white
                  transition-colors
                "
              >
                View All Deals
              </Link>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Browse by Category
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
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
                  className="
                    text-center py-3 px-4 rounded-lg
                    bg-white border border-gray-200
                    hover:border-brand-blue hover:shadow-sm
                    transition-all text-sm font-medium text-gray-700
                    hover:text-brand-navy
                  "
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-12 bg-white">
          <div className="max-w-3xl mx-auto px-4 prose prose-gray">
            <h2>About PromoPenguin</h2>
            <p>
              PromoPenguin helps Canadians discover the best deals from top
              retailers like Amazon.ca, Walmart, Costco, Best Buy, Canadian Tire,
              and more. We update our listings daily so you never miss a sale.
            </p>
            <h3>Why Shoppers Trust Us</h3>
            <ul>
              <li>Real-time price tracking from major Canadian retailers</li>
              <li>Only verified, active promotions</li>
              <li>No registration required</li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
