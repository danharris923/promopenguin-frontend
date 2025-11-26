import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { getDealBySlug, getRelatedDeals, getAllDealSlugs } from '@/lib/db'
import {
  generateDealDescription,
  generateMetaDescription,
  generatePageTitle,
  generateBreadcrumbs,
  formatStoreName,
  generateFAQ,
  getStoreDescription,
} from '@/lib/content-generator'
import {
  generateProductSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from '@/lib/schema'
import {
  generateUrgencyData,
  generateCountdown,
  getStockWarning,
} from '@/lib/urgency'
import { toNumber, formatPrice, calculateSavings } from '@/lib/price-utils'

import { UrgencyBanner } from '@/components/deal/UrgencyBanner'
import { SocialProofBanner } from '@/components/deal/SocialProofBanner'
import { PriceDisplay } from '@/components/deal/PriceDisplay'
import { CTAButton } from '@/components/deal/CTAButton'
import { StockWarning } from '@/components/deal/StockWarning'
import { TrustBadges, StoreBadge } from '@/components/deal/TrustBadges'
import { Breadcrumbs } from '@/components/deal/Breadcrumbs'
import { StickyMobileCTA } from '@/components/deal/StickyMobileCTA'

interface PageProps {
  params: { slug: string }
}

// Generate static pages for all deals
export async function generateStaticParams() {
  const slugs = await getAllDealSlugs()
  return slugs.map(slug => ({ slug }))
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const deal = await getDealBySlug(params.slug)

  if (!deal) {
    return { title: 'Deal Not Found' }
  }

  const title = generatePageTitle(deal)
  const description = generateMetaDescription(deal)
  const imageUrl = deal.image_blob_url || deal.image_url || '/og-default.jpg'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function DealPage({ params }: PageProps) {
  const deal = await getDealBySlug(params.slug)

  if (!deal) {
    notFound()
  }

  // Generate all the psychological warfare data
  const urgencyData = generateUrgencyData(deal.id)
  const countdown = generateCountdown(deal.id)
  const stockWarning = getStockWarning(urgencyData)
  const breadcrumbs = generateBreadcrumbs(deal)
  const description = generateDealDescription(deal)
  const faqs = generateFAQ(deal)
  const storeDescription = getStoreDescription(deal.store)
  const relatedDeals = await getRelatedDeals(deal)

  // Schema markup
  const productSchema = generateProductSchema(deal)
  const breadcrumbSchema = generateBreadcrumbSchema(deal)
  const faqSchema = generateFAQSchema(deal)

  const imageUrl = deal.image_blob_url || deal.image_url || '/placeholder-deal.jpg'
  const storeName = formatStoreName(deal.store)

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([productSchema, breadcrumbSchema, faqSchema]),
        }}
      />

      {/* ABOVE THE FOLD - Maximum CTR Zone */}
      <div className="min-h-screen">
        {/* Layer 1: Urgency Banner */}
        <UrgencyBanner
          hours={countdown.hours}
          minutes={countdown.minutes}
          viewerCount={urgencyData.viewerCount}
        />

        {/* Layer 2: Social Proof */}
        <SocialProofBanner
          viewerCount={urgencyData.viewerCount}
          purchaseCount={urgencyData.purchaseCount}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-4">
          {/* Breadcrumbs */}
          <div className="mb-4">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          {/* Hero Section - Above Fold */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Left: Product Image */}
            <div className="relative">
              {/* Discount Badge */}
              {deal.discount_percent && deal.discount_percent > 0 && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="
                    bg-red-600 text-white
                    px-4 py-2 rounded-xl
                    font-black text-2xl
                    shadow-lg
                  ">
                    -{deal.discount_percent}%
                  </span>
                </div>
              )}

              {/* Lowest Ever Badge */}
              {urgencyData.isLowestEver && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="
                    bg-yellow-400 text-yellow-900
                    px-3 py-1.5 rounded-lg
                    font-bold text-sm
                    shadow-md
                  ">
                    🏆 LOWEST PRICE EVER
                  </span>
                </div>
              )}

              {/* Image */}
              <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={deal.title}
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Right: Deal Info + CTA */}
            <div className="flex flex-col">
              {/* Store Badge */}
              <div className="mb-3 flex items-center gap-2">
                <StoreBadge store={deal.store} />
                <span className="text-gray-500 text-sm">
                  at {storeName}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {deal.title}
              </h1>

              {/* Price Display */}
              <div className="mb-6">
                <PriceDisplay
                  currentPrice={deal.price}
                  originalPrice={deal.original_price}
                  discountPercent={deal.discount_percent}
                  size="xl"
                />
              </div>

              {/* Stock Warning */}
              {stockWarning && (
                <div className="mb-4">
                  <StockWarning
                    variant={stockWarning.variant}
                    message={stockWarning.message}
                  />
                </div>
              )}

              {/* Primary CTA */}
              <div className="mb-4">
                <CTAButton
                  href={deal.affiliate_url}
                  price={deal.price}
                  storeName={storeName}
                  size="xl"
                />
              </div>

              {/* Trust Badges */}
              <div className="mb-6">
                <TrustBadges storeName={storeName} />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 rounded-xl p-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {deal.discount_percent || 0}%
                  </div>
                  <div className="text-xs text-gray-500">Discount</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${calculateSavings(deal.original_price, deal.price)?.split('.')[0] || '0'}
                  </div>
                  <div className="text-xs text-gray-500">You Save</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {urgencyData.purchaseCount}
                  </div>
                  <div className="text-xs text-gray-500">Sold Today</div>
                </div>
              </div>
            </div>
          </div>

          {/* BELOW THE FOLD - SEO Content */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content (2 cols) */}
            <div className="md:col-span-2 space-y-8">
              {/* Generated Description */}
              <section className="prose max-w-none">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  About This Deal
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {description}
                </p>
                {deal.description && (
                  <p className="text-gray-600 leading-relaxed mt-4">
                    {deal.description}
                  </p>
                )}
              </section>

              {/* Store Info */}
              {storeDescription && (
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    About {storeName}
                  </h2>
                  <p className="text-gray-600">
                    {storeDescription}
                  </p>
                </section>
              )}

              {/* FAQ Section */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar (1 col) */}
            <div className="space-y-6">
              {/* Sticky CTA (desktop) */}
              <div className="sticky top-4 space-y-4 hidden md:block">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <PriceDisplay
                    currentPrice={deal.price}
                    originalPrice={deal.original_price}
                    discountPercent={deal.discount_percent}
                    size="md"
                  />
                  <div className="mt-4">
                    <CTAButton
                      href={deal.affiliate_url}
                      storeName={storeName}
                      size="lg"
                    />
                  </div>
                </div>

                {/* Related Deals */}
                {relatedDeals.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-bold text-gray-900 mb-3">
                      Related Deals
                    </h3>
                    <div className="space-y-3">
                      {relatedDeals.slice(0, 4).map(related => (
                        <a
                          key={related.id}
                          href={`/deals/${related.slug}`}
                          className="block group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                              {(related.image_blob_url || related.image_url) && (
                                <Image
                                  src={related.image_blob_url || related.image_url || ''}
                                  alt={related.title}
                                  width={48}
                                  height={48}
                                  className="object-cover w-full h-full"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate group-hover:text-orange-600">
                                {related.title}
                              </div>
                              {related.price && (
                                <div className="text-sm text-green-600 font-bold">
                                  ${formatPrice(related.price)}
                                </div>
                              )}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Sticky Mobile CTA */}
        <StickyMobileCTA
          href={deal.affiliate_url}
          price={deal.price}
          storeName={storeName}
        />
      </div>
    </>
  )
}
