import { Metadata } from 'next'

import { getDealsByCategory, getCategories } from '@/lib/db'
import { formatCategoryName } from '@/lib/content-generator'
import { generateItemListSchema } from '@/lib/schema'
import { DealCard, DealGrid } from '@/components/DealCard'
import { Breadcrumbs } from '@/components/deal/Breadcrumbs'

interface PageProps {
  params: { slug: string[] }
}

// Revalidate every 15 minutes
export const revalidate = 900

// Allow dynamic params
export const dynamicParams = true

// Generate static pages for all categories
export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map(cat => ({ slug: [cat.slug] }))
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const categorySlug = params.slug[params.slug.length - 1]
  const categoryName = formatCategoryName(categorySlug)

  return {
    title: `Best ${categoryName} Deals in Canada`,
    description: `Find the best deals and discounts on ${categoryName} from top Canadian retailers.`,
    openGraph: {
      title: `Best ${categoryName} Deals in Canada`,
      description: `Save on ${categoryName} products from Canadian retailers.`,
    },
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const categorySlug = params.slug[params.slug.length - 1]
  const categoryName = formatCategoryName(categorySlug)

  const deals = await getDealsByCategory(categorySlug)

  // Schema markup (only if we have deals)
  const itemListSchema = deals.length > 0
    ? generateItemListSchema(deals, `${categoryName} Deals`)
    : null

  // Breadcrumbs
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/category' },
    ...params.slug.map((s, i) => ({
      label: formatCategoryName(s),
      href: `/category/${params.slug.slice(0, i + 1).join('/')}`,
    })),
  ]

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
            Best {categoryName} Deals in Canada
          </h1>
          <p className="text-gray-600">
            {deals.length} active deals
          </p>
        </div>

        {/* Category Description (SEO Content) */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h2 className="font-bold text-gray-900 mb-2">
            Shop {categoryName} Deals
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Find the best {categoryName} deals from top Canadian retailers including
            Amazon.ca, Walmart Canada, Costco, Best Buy, and more.
          </p>
        </div>

        {/* No Deals Message */}
        {deals.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center mb-8">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No {categoryName} Deals Right Now
            </h2>
            <p className="text-gray-600 mb-4">
              We are constantly scanning for new deals. Check back soon!
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
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
          <h2>About {categoryName} Deals in Canada</h2>
          <p>
            We aggregate the best deals from major Canadian retailers so you
            do not have to hunt for discounts yourself.
          </p>
          <h3>How to Find the Best {categoryName} Deals</h3>
          <ul>
            <li>Check back often - new deals are added throughout the day</li>
            <li>Compare prices across multiple retailers</li>
            <li>Look for stackable coupons and promo codes</li>
          </ul>
          <h3>Top Retailers for {categoryName} in Canada</h3>
          <p>
            Canadian shoppers can find great {categoryName} deals at
            Amazon.ca, Walmart Canada, Costco, Best Buy, Canadian Tire, and other
            major retailers.
          </p>
        </div>
      </main>
    </>
  )
}
