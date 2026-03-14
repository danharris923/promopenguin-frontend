import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getDealBySlug, getRelatedDeals } from '@/lib/db'
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
import { formatPrice, calculateSavings } from '@/lib/price-utils'
import { dealToCardProps } from '@/lib/deal-utils'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { DealCard } from '@/components/DealCard'
import { Breadcrumbs } from '@/components/deal/Breadcrumbs'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const dynamicParams = true

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const deal = await getDealBySlug(slug)

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
  const { slug } = await params
  const deal = await getDealBySlug(slug)

  if (!deal) {
    notFound()
  }

  const breadcrumbs = generateBreadcrumbs(deal)
  const description = generateDealDescription(deal)
  const faqs = generateFAQ(deal)
  const storeDescription = getStoreDescription(deal.store)
  const relatedDeals = await getRelatedDeals(deal)

  const productSchema = generateProductSchema(deal)
  const breadcrumbSchema = generateBreadcrumbSchema(deal)
  const faqSchema = generateFAQSchema(deal)

  const imageUrl = deal.image_blob_url || deal.image_url || '/placeholder-deal.svg'
  const storeName = formatStoreName(deal.store)
  const savings = calculateSavings(deal.original_price, deal.price)
  const priceNum = deal.price
  const originalPriceNum = deal.original_price

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([productSchema, breadcrumbSchema, faqSchema]),
        }}
      />

      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Hero: image left, info right */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="relative bg-gray-50 rounded-xl overflow-hidden">
            {deal.discount_percent != null && deal.discount_percent > 0 && (
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-savings text-white px-3 py-1.5 rounded-lg font-bold text-sm">
                  -{deal.discount_percent}% Off
                </span>
              </div>
            )}
            <div className="aspect-square flex items-center justify-center p-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={deal.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>

          {/* Deal Info */}
          <div className="flex flex-col">
            {/* Store */}
            <div className="text-sm text-gray-500 mb-2">
              at {storeName}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              {deal.title}
            </h1>

            {/* Price */}
            <div className="mb-6">
              {priceNum != null ? (
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-4xl font-bold text-gray-900">
                    ${formatPrice(priceNum)}
                  </span>
                  {originalPriceNum != null && (
                    <span className="text-lg text-gray-400 line-through">
                      ${formatPrice(originalPriceNum)}
                    </span>
                  )}
                  {savings && (
                    <span className="text-sm font-semibold text-savings bg-green-50 px-2 py-1 rounded">
                      Save ${savings}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-2xl font-bold text-gray-900">
                  See Price at Store
                </span>
              )}
            </div>

            {/* CTA */}
            <a
              href={deal.affiliate_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="btn-deal text-center text-base py-4 mb-6"
            >
              View Deal at {storeName}
            </a>

            {/* Trust row */}
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-brand-blue" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified Deal
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-brand-blue" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Secure Checkout
              </span>
            </div>

            {/* Stats */}
            {((deal.discount_percent != null && deal.discount_percent > 0) || savings) && (
              <div className="flex gap-4 bg-gray-50 rounded-lg p-4">
                {deal.discount_percent != null && deal.discount_percent > 0 && (
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-brand-navy">{deal.discount_percent}%</div>
                    <div className="text-xs text-gray-500">Discount</div>
                  </div>
                )}
                {savings && (
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-savings">${savings.split('.')[0]}</div>
                    <div className="text-xs text-gray-500">You Save</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Below fold: content + sidebar */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">About This Deal</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
              {deal.description && (
                <p className="text-gray-600 leading-relaxed text-sm mt-3">{deal.description}</p>
              )}
            </section>

            {storeDescription && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">About {storeName}</h2>
                <p className="text-gray-600 text-sm">{storeDescription}</p>
              </section>
            )}

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{faq.question}</h3>
                    <p className="text-gray-500 text-sm">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-20 space-y-4 hidden md:block">
              {/* Sticky CTA card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                {priceNum != null ? (
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-bold text-gray-900">${formatPrice(priceNum)}</span>
                    {deal.discount_percent != null && deal.discount_percent > 0 && (
                      <span className="text-xs font-semibold text-white bg-savings px-2 py-0.5 rounded">
                        -{deal.discount_percent}%
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-lg font-bold text-gray-900 mb-1">See Price</div>
                )}
                {originalPriceNum != null && (
                  <div className="text-sm text-gray-400 line-through mb-3">${formatPrice(originalPriceNum)}</div>
                )}
                <a
                  href={deal.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="btn-deal text-center"
                >
                  View Deal
                </a>
              </div>

              {/* Related Deals */}
              {relatedDeals.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">Related Deals</h3>
                  <div className="space-y-3">
                    {relatedDeals.slice(0, 4).map(related => (
                      <Link
                        key={related.id}
                        href={`/deals/${related.slug}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {(related.image_blob_url || related.image_url) && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={related.image_blob_url || related.image_url || ''}
                              alt={related.title}
                              className="object-contain w-full h-full p-1"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-900 truncate group-hover:text-brand-blue">
                            {related.title}
                          </div>
                          {related.price != null && (
                            <div className="text-sm font-bold text-gray-900">
                              ${formatPrice(related.price)}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* More deals grid (mobile-visible related deals) */}
        {relatedDeals.length > 0 && (
          <section className="mt-12 md:hidden">
            <h2 className="text-lg font-bold text-gray-900 mb-4">More Deals</h2>
            <div className="grid grid-cols-2 gap-4">
              {relatedDeals.slice(0, 4).map(deal => (
                <DealCard key={deal.id} {...dealToCardProps(deal)} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  )
}
