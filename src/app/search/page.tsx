import Link from 'next/link'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { searchDeals } from '@/lib/db'
import { getFlippDealsAsDeals } from '@/lib/flipp'
import { mixDeals } from '@/lib/mix-deals'
import { DealCard, DealGrid } from '@/components/DealCard'
import { dealToCardProps } from '@/lib/deal-utils'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const revalidate = 0

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Search: ${q} | PromoPenguin` : 'Search Deals | PromoPenguin',
    description: q
      ? `Search results for "${q}" — Canadian deals from Flipp, RedFlagDeals, and SavingsGuru.`
      : 'Search for deals across Flipp, RedFlagDeals, and SavingsGuru.',
  }
}

function DealGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-square bg-gray-100 animate-pulse rounded-xl" />
      ))}
    </div>
  )
}

// Canonical 3-source search: Flipp flyer items + RFD-bucket DB rows +
// Guru-bucket DB rows, round-robin interleaved. Matches livingonaloonie.
async function SearchResults({ query }: { query: string }) {
  const PER_SOURCE = 20
  const [flipp, rfd, guru] = await Promise.all([
    getFlippDealsAsDeals(query, PER_SOURCE),
    searchDeals(query, PER_SOURCE, { bucket: 'non-guru' }),
    searchDeals(query, PER_SOURCE, { bucket: 'guru' }),
  ])
  const mixed = mixDeals(flipp, rfd, guru)

  if (mixed.length === 0) {
    return (
      <div className="text-center py-16">
        <svg
          className="h-16 w-16 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <h2 className="font-serif text-2xl font-normal text-gray-900 mb-2">
          No deals found for &ldquo;{query}&rdquo;
        </h2>
        <p className="text-gray-500 mb-6">
          Try a different search, or browse all of our current deals.
        </p>
        <Link
          href="/deals"
          className="
            inline-block px-8 py-3 rounded-lg
            bg-brand-navy text-white
            font-semibold text-sm
            hover:bg-blue-900
            transition-colors
          "
        >
          Browse All Deals
        </Link>
      </div>
    )
  }

  return (
    <>
      <p className="text-sm text-gray-500 mb-6">
        Found {mixed.length} result{mixed.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
      </p>
      <DealGrid>
        {mixed.map(deal => (
          <DealCard key={deal.id} {...dealToCardProps(deal)} />
        ))}
      </DealGrid>
    </>
  )
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q?.trim() || ''

  return (
    <>
      <Header />

      <main>
        {/* Hero with search input — promopenguin navy/serif tokens */}
        <section className="bg-white py-8 md:py-12 border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="font-serif text-3xl md:text-4xl font-normal text-gray-900 mb-3">
              Search Deals
            </h1>
            <p className="text-gray-500 text-base mb-6">
              Find deals across Flipp flyers, RedFlagDeals, and SavingsGuru.
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
                defaultValue={query}
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

        <section className="py-8 md:py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            {query ? (
              <Suspense fallback={<DealGridSkeleton />}>
                <SearchResults query={query} />
              </Suspense>
            ) : (
              <div className="text-center py-16">
                <svg
                  className="h-16 w-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h2 className="font-serif text-2xl font-normal text-gray-900 mb-2">
                  Search for deals
                </h2>
                <p className="text-gray-500">
                  Enter a product name, store, or category to find deals.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
