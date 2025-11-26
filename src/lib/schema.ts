/**
 * Schema.org JSON-LD generators for rich snippets
 */

import { Deal } from '@/types/deal'
import { formatStoreName, generateBreadcrumbs, generateFAQ } from './content-generator'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://promopenguin.ca'

/**
 * Generate Product schema for deal pages
 */
export function generateProductSchema(deal: Deal) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: deal.title,
    description: deal.description || `${deal.title} on sale at ${formatStoreName(deal.store)}`,
    image: deal.image_blob_url || deal.image_url,
    url: `${SITE_URL}/deals/${deal.slug}`,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/deals/${deal.slug}`,
      priceCurrency: 'CAD',
      price: deal.price?.toString() || '0',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: formatStoreName(deal.store),
      },
    },
  }

  // Add price validity if we have original price
  if (deal.original_price) {
    schema.offers.priceValidUntil = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString().split('T')[0]
  }

  return schema
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(deal: Deal) {
  const breadcrumbs = generateBreadcrumbs(deal)

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: crumb.href.startsWith('http') ? crumb.href : `${SITE_URL}${crumb.href}`,
    })),
  }
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(deal: Deal) {
  const faqs = generateFAQ(deal)

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * Generate WebSite schema for homepage
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PromoPenguin',
    url: SITE_URL,
    description: 'Find the best deals and discounts from top Canadian retailers.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PromoPenguin',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English', 'French'],
    },
  }
}

/**
 * Generate ItemList schema for category/store pages
 */
export function generateItemListSchema(deals: Deal[], listName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: deals.length,
    itemListElement: deals.slice(0, 10).map((deal, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/deals/${deal.slug}`,
      name: deal.title,
    })),
  }
}

/**
 * Combine multiple schemas into a single JSON-LD block
 */
export function combineSchemas(...schemas: any[]) {
  return JSON.stringify(schemas)
}
