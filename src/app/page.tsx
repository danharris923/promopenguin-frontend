import Link from 'next/link'
import { Suspense } from 'react'
import { getFeaturedDeals, getGuruDeals, getRfdDeals } from '@/lib/db'
import { getFlippDealsAsDeals } from '@/lib/flipp'
import { mixDeals } from '@/lib/mix-deals'
import { generateWebsiteSchema, generateOrganizationSchema } from '@/lib/schema'
import { FeaturedDealCard, DealCard, DealGrid } from '@/components/DealCard'
import { dealToCardProps } from '@/lib/deal-utils'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const revalidate = 900

function DealGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-square bg-gray-100 animate-pulse rounded-xl" />
      ))}
    </div>
  )
}

// Guru-priority mix; RFD kept low (flaky upstream) — just enough non-Amazon
// variety. Source order in mixDeals controls the top-left grid slot.
async function DealsFeed() {
  const [guru, flipp, rfd] = await Promise.all([
    getGuruDeals(24),
    getFlippDealsAsDeals('deals', 17),
    getRfdDeals(6),
  ])
  const mixed = mixDeals(guru, flipp, rfd).slice(0, 47)

  return (
    <DealGrid>
      {mixed.map(deal => (
        <DealCard key={deal.id} {...dealToCardProps(deal)} />
      ))}
    </DealGrid>
  )
}

export default async function HomePage() {
  const featuredDeals = await getFeaturedDeals(4, true)

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
        {/* Hero — promopenguin's signature serif tagline + inline search */}
        <section className="bg-white py-6 md:py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="font-serif text-3xl md:text-4xl font-normal text-gray-900 mb-2">
              Today&rsquo;s Best Deals, All in One Place.
            </h1>
            <p className="text-gray-500 text-base mb-5">
              Real discounts worth your click&mdash;no fluff, just savings.
            </p>
            <form
              action="/search"
              method="get"
              role="search"
              className="max-w-xl mx-auto flex gap-2"
            >
              <input
                type="search"
                name="q"
                placeholder="Search deals, stores, categories..."
                aria-label="Search deals"
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy text-sm"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-brand-navy text-white font-semibold text-sm hover:bg-blue-900 transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        {/* Featured Deals — 2x2 grid, large cards (promopenguin-specific) */}
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

        {/* Today's Deals — canonical 3-source mix */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl md:text-3xl font-normal text-gray-900">
                Today&rsquo;s Deals
              </h2>
              <Link
                href="/deals"
                className="text-sm font-semibold text-brand-navy hover:text-brand-blue transition-colors"
              >
                View All &rarr;
              </Link>
            </div>

            <Suspense fallback={<DealGridSkeleton />}>
              <DealsFeed />
            </Suspense>

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
