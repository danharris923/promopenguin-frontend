import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { searchDeals } from '@/lib/db'
import { searchFlippDeals } from '@/lib/flipp'
import { AFFILIATE_BRANDS, hasStoreAffiliate, getStoreAffiliateLink } from '@/lib/affiliates'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { DealCard, DealGrid } from '@/components/DealCard'
import { FlippDealCard, FlippDealGrid } from '@/components/FlippDealCard'
import { SearchForm } from '@/components/SearchForm'

export const revalidate = 0 // Don't cache search results

interface SearchPageProps {
  searchParams: { q?: string }
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || ''
  return {
    title: query ? `Search: ${query} | PromoPenguin` : 'Search Deals | PromoPenguin',
    description: query
      ? `Search results for "${query}" - Find the best Canadian deals`
      : 'Search for deals across all Canadian retailers',
  }
}

// All stores for store search with logos
const ALL_STORES = [
  { slug: 'amazon', name: 'Amazon.ca', emoji: '📦', logo: '/images/stores/amazon.png' },
  { slug: 'walmart', name: 'Walmart', emoji: '🛒', logo: '/images/stores/walmart.png' },
  { slug: 'costco', name: 'Costco', emoji: '🏬', logo: '/images/stores/costco.png' },
  { slug: 'best-buy', name: 'Best Buy', emoji: '💻', logo: '/images/stores/best-buy.png' },
  { slug: 'canadian-tire', name: 'Canadian Tire', emoji: '🔧', logo: '/images/stores/canadian-tire.png' },
  { slug: 'shoppers', name: 'Shoppers Drug Mart', emoji: '💊', logo: '/images/stores/shoppers.png' },
  { slug: 'loblaws', name: 'Loblaws', emoji: '🍎', logo: '/images/stores/loblaws.png' },
  { slug: 'no-frills', name: 'No Frills', emoji: '🛒', logo: '/images/stores/no-frills.png' },
  { slug: 'superstore', name: 'Real Canadian Superstore', emoji: '🏪', logo: '/images/stores/superstore.png' },
  { slug: 'home-depot', name: 'Home Depot', emoji: '🏠', logo: '/images/stores/home-depot.png' },
  { slug: 'ikea', name: 'IKEA', emoji: '🪑', logo: '/images/stores/ikea.png' },
  { slug: 'the-brick', name: 'The Brick', emoji: '🛋️', logo: '/images/stores/the-brick.png' },
  { slug: 'leons', name: "Leon's", emoji: '🛏️', logo: '/images/stores/leons.png' },
  { slug: 'staples', name: 'Staples', emoji: '📎', logo: '/images/stores/staples.png' },
  { slug: 'petsmart', name: 'PetSmart', emoji: '🐕', logo: '/images/stores/petsmart.png' },
  { slug: 'sport-chek', name: 'Sport Chek', emoji: '⚽', logo: '/images/stores/sport-chek.png' },
  { slug: 'marks', name: "Mark's", emoji: '👔', logo: '/images/stores/marks.png' },
  { slug: 'the-bay', name: "Hudson's Bay", emoji: '🏬', logo: '/images/stores/the-bay.png' },
  { slug: 'winners', name: 'Winners', emoji: '🏷️', logo: '/images/stores/winners.png' },
  { slug: 'lululemon', name: 'Lululemon', emoji: '🧘', logo: '/images/stores/lululemon.png' },
  { slug: 'roots', name: 'Roots', emoji: '🍁', logo: '/images/stores/roots.png' },
  { slug: 'aritzia', name: 'Aritzia', emoji: '👗', logo: '/images/stores/aritzia.png' },
  { slug: 'sephora', name: 'Sephora', emoji: '💄', logo: '/images/stores/sephora.png' },
  { slug: 'ardene', name: 'Ardene', emoji: '💃', logo: null },
  { slug: 'michael-kors', name: 'Michael Kors', emoji: '👜', logo: null },
  { slug: 'london-drugs', name: 'London Drugs', emoji: '💊', logo: '/images/stores/london-drugs.png' },
  { slug: 'giant-tiger', name: 'Giant Tiger', emoji: '🐯', logo: '/images/stores/giant-tiger.png' },
]

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q?.trim() || ''
  const hasQuery = query.length >= 2

  // Search deals from DB
  const dbDeals = hasQuery ? await searchDeals(query, 30) : []

  // Search Flipp deals - prioritize affiliated stores
  const flippDeals = hasQuery ? await searchFlippDeals(query, 20) : []
  const sortedFlippDeals = flippDeals.sort((a, b) => {
    const aHasAffiliate = hasStoreAffiliate(a.storeSlug)
    const bHasAffiliate = hasStoreAffiliate(b.storeSlug)
    if (aHasAffiliate && !bHasAffiliate) return -1
    if (!aHasAffiliate && bHasAffiliate) return 1
    return 0
  })

  // Search affiliate brands first
  const matchingAffiliateBrands = hasQuery
    ? AFFILIATE_BRANDS.filter(
        b =>
          b.name.toLowerCase().includes(query.toLowerCase()) ||
          b.slug.toLowerCase().includes(query.toLowerCase()) ||
          b.tagline.toLowerCase().includes(query.toLowerCase())
      )
    : []

  // Search other stores
  const matchingStores = hasQuery
    ? ALL_STORES.filter(
        s =>
          (s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.slug.toLowerCase().includes(query.toLowerCase())) &&
          !matchingAffiliateBrands.some(ab => ab.slug === s.slug)
      )
    : []

  const totalResults = dbDeals.length + sortedFlippDeals.length + matchingStores.length + matchingAffiliateBrands.length

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Search Deals
          </h1>
          <SearchForm initialQuery={query} />
        </div>

        {/* Results */}
        {hasQuery ? (
          <>
            <p className="text-gray-600 mb-6">
              {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
            </p>

            {/* Affiliate Brands First - Priority */}
            {matchingAffiliateBrands.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Featured Retailers
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matchingAffiliateBrands.map(brand => (
                    <a
                      key={brand.slug}
                      href={getStoreAffiliateLink(brand.slug) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all overflow-hidden"
                    >
                      {/* Image */}
                      {brand.image ? (
                        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={brand.image}
                            alt={brand.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      ) : (
                        <div className={`w-20 h-20 flex-shrink-0 rounded-lg bg-gradient-to-br ${brand.color} flex items-center justify-center`}>
                          <span className="text-4xl">{brand.emoji}</span>
                        </div>
                      )}
                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-lg text-gray-900">{brand.name}</div>
                        <div className="text-orange-500 font-semibold text-sm">{brand.tagline}</div>
                        <div className="text-gray-500 text-xs mt-1">{brand.description}</div>
                      </div>
                      {/* Arrow */}
                      <div className="flex-shrink-0 text-gray-400 group-hover:text-orange-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Other Matching Stores */}
            {matchingStores.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Stores ({matchingStores.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {matchingStores.map(store => (
                    <Link
                      key={store.slug}
                      href={`/stores/${store.slug}`}
                      className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all group"
                    >
                      <div className="w-10 h-10 mb-2 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {store.logo ? (
                          <Image
                            src={store.logo}
                            alt={store.name}
                            width={40}
                            height={40}
                            className="object-contain"
                            unoptimized
                          />
                        ) : (
                          <span className="text-3xl">{store.emoji}</span>
                        )}
                      </div>
                      <span className="font-semibold text-gray-900 text-sm text-center">
                        {store.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* DB Deals */}
            {dbDeals.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Deals ({dbDeals.length})
                </h2>
                <DealGrid>
                  {dbDeals.map(deal => (
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
              </section>
            )}

            {/* Flipp Deals */}
            {sortedFlippDeals.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Flyer Deals ({sortedFlippDeals.length})
                </h2>
                <FlippDealGrid>
                  {sortedFlippDeals.map(deal => (
                    <FlippDealCard key={deal.id} deal={deal} />
                  ))}
                </FlippDealGrid>
              </section>
            )}

            {/* No results */}
            {totalResults === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">
                  No deals found for "{query}"
                </p>
                <p className="text-gray-400">
                  Try a different search term or browse our{' '}
                  <Link href="/stores" className="text-orange-500 hover:underline">
                    stores
                  </Link>
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Enter a search term to find deals across all Canadian retailers
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
