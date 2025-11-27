/**
 * Content Generator - Creates descriptions for SEO
 *
 * Generates honest descriptions based on actual data.
 * Strips AI slop from scraped feed descriptions.
 */

import { Deal } from '@/types/deal'
import { toNumber, formatPrice, calculateSavings } from '@/lib/price-utils'

// =============================================================================
// SLOP PATTERNS TO STRIP FROM SCRAPED DESCRIPTIONS
// =============================================================================

const SLOP_PATTERNS = [
  /if you're not sure whether to buy,?\s*add to cart/gi,
  /you can come back to it later!?/gi,
  /I think the price is very good\.?/gi,
  /Please read some of the reviews/gi,
  /see (?:what )?people thought of the product/gi,
  /sells on Amazon\.?/gi,
  /This is a great deal!?/gi,
  /Don't miss out!?/gi,
  /Limited time offer!?/gi,
  /Act fast!?/gi,
  /Hurry!?/gi,
  /Buy now!?/gi,
  /Order now!?/gi,
  /\*\*[^*]+\*\*/g,
  /Click here to/gi,
  /Check it out!?/gi,
]

/**
 * Strip AI slop from scraped content
 */
export function cleanDescription(text: string | null | undefined): string | null {
  if (!text) return null
  let cleaned = text
  for (const pattern of SLOP_PATTERNS) {
    cleaned = cleaned.replace(pattern, '')
  }
  cleaned = cleaned
    .replace(/\s{2,}/g, ' ')
    .replace(/\.\s*\./g, '.')
    .replace(/^\s+|\s+$/g, '')
    .replace(/\s+([.,!?])/g, '$1')
  if (cleaned.length < 20 || !/[a-zA-Z]{3,}/.test(cleaned)) {
    return null
  }
  return cleaned
}

// =============================================================================
// STORE DESCRIPTIONS
// =============================================================================

const STORE_DESCRIPTIONS: Record<string, string> = {
  'amazon': 'Amazon.ca - Prime members get free shipping.',
  'walmart': 'Walmart Canada - Free shipping over $35.',
  'costco': 'Costco Canada - Members only.',
  'best-buy': 'Best Buy Canada - Price matching available.',
  'canadian-tire': 'Canadian Tire - Auto, sports, home.',
  'home-depot': 'Home Depot Canada - Home improvement.',
  'shoppers': 'Shoppers Drug Mart - PC Optimum points.',
  'loblaws': 'Loblaws - PC Optimum rewards.',
}

// =============================================================================
// MAIN GENERATOR FUNCTIONS
// =============================================================================

/**
 * Generate a description based on available data
 */
export function generateDealDescription(deal: Deal): string {
  const price = toNumber(deal.price)
  const originalPrice = toNumber(deal.original_price)
  const hasPrice = price !== null && price > 0
  const hasOriginalPrice = originalPrice !== null && originalPrice > 0
  const hasDiscount = deal.discount_percent && deal.discount_percent > 0
  const storeName = formatStoreName(deal.store)

  if (hasPrice && hasOriginalPrice && hasDiscount) {
    const templates = [
      `${deal.title} at ${storeName}. Was $${formatPrice(deal.original_price)}, now $${formatPrice(deal.price)} (${deal.discount_percent}% off).`,
      `${deal.title} - ${deal.discount_percent}% off at ${storeName}. Sale price: $${formatPrice(deal.price)}.`,
      `${storeName} has ${deal.title} for $${formatPrice(deal.price)} (down from $${formatPrice(deal.original_price)}).`,
    ]
    return templates[hashString(deal.id) % templates.length]
  } else if (hasPrice) {
    const templates = [
      `${deal.title} at ${storeName} for $${formatPrice(deal.price)}.`,
      `${deal.title} - $${formatPrice(deal.price)} at ${storeName}.`,
      `${storeName}: ${deal.title} at $${formatPrice(deal.price)}.`,
    ]
    return templates[hashString(deal.id) % templates.length]
  } else if (hasDiscount) {
    const templates = [
      `${deal.title} - ${deal.discount_percent}% off at ${storeName}.`,
      `${deal.discount_percent}% off ${deal.title} at ${storeName}.`,
      `${storeName} deal: ${deal.title} at ${deal.discount_percent}% off.`,
    ]
    return templates[hashString(deal.id) % templates.length]
  } else {
    const templates = [
      `${deal.title} on sale at ${storeName}. Check store for current price.`,
      `${deal.title} deal at ${storeName}.`,
      `${storeName} deal: ${deal.title}.`,
    ]
    return templates[hashString(deal.id) % templates.length]
  }
}

/**
 * Generate SEO meta description
 */
export function generateMetaDescription(deal: Deal): string {
  const price = toNumber(deal.price)
  const hasPrice = price !== null && price > 0
  const hasDiscount = deal.discount_percent && deal.discount_percent > 0
  const savingsAmount = calculateSavings(deal.original_price, deal.price)
  const storeName = formatStoreName(deal.store)

  let savings = ''
  if (savingsAmount && parseFloat(savingsAmount) > 0) {
    savings = `Save $${savingsAmount}`
  } else if (hasDiscount) {
    savings = `${deal.discount_percent}% off`
  }

  if (savings) {
    return `${deal.title} - ${savings} at ${storeName}. Canadian deal.`
  } else if (hasPrice) {
    return `${deal.title} - $${formatPrice(deal.price)} at ${storeName}. Canadian deal.`
  } else {
    return `${deal.title} deal at ${storeName}. Check store for price.`
  }
}

/**
 * Generate page title
 */
export function generatePageTitle(deal: Deal): string {
  const price = toNumber(deal.price)
  const hasPrice = price !== null && price > 0

  if (deal.discount_percent && deal.discount_percent >= 20) {
    return `${deal.title} - ${deal.discount_percent}% OFF`
  }
  if (hasPrice) {
    return `${deal.title} - $${formatPrice(deal.price)}`
  }
  return deal.title
}

/**
 * Generate breadcrumb items
 */
export function generateBreadcrumbs(deal: Deal): { label: string; href: string }[] {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Deals', href: '/deals' },
  ]

  if (deal.category) {
    breadcrumbs.push({
      label: formatCategoryName(deal.category),
      href: `/category/${deal.category}`,
    })
  }

  if (deal.store) {
    breadcrumbs.push({
      label: formatStoreName(deal.store),
      href: `/stores/${deal.store}`,
    })
  }

  breadcrumbs.push({
    label: truncate(deal.title, 40),
    href: `/deals/${deal.slug}`,
  })

  return breadcrumbs
}

/**
 * Generate store description
 */
export function getStoreDescription(storeSlug: string | null): string {
  if (!storeSlug) return ''
  return STORE_DESCRIPTIONS[storeSlug] || `Shop deals at ${formatStoreName(storeSlug)}.`
}

/**
 * Generate FAQ items - only when we have real data
 */
export function generateFAQ(deal: Deal): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = []

  const price = toNumber(deal.price)
  const originalPrice = toNumber(deal.original_price)
  const hasPrice = price !== null && price > 0
  const hasOriginalPrice = originalPrice !== null && originalPrice > 0
  const hasDiscount = deal.discount_percent && deal.discount_percent > 0
  const savingsAmount = calculateSavings(deal.original_price, deal.price)
  const hasSavings = savingsAmount && parseFloat(savingsAmount) > 0
  const storeName = formatStoreName(deal.store)

  if (hasPrice && hasOriginalPrice && hasDiscount && hasSavings) {
    faqs.push({
      question: `What's the discount on this ${storeName} deal?`,
      answer: `This deal saves you $${savingsAmount} (${deal.discount_percent}% off). Original price was $${formatPrice(deal.original_price)}, now $${formatPrice(deal.price)}.`,
    })
  }

  if (deal.store) {
    const shippingInfo = getStoreDescription(deal.store)
    if (shippingInfo) {
      faqs.push({
        question: `Does ${storeName} ship to Canada?`,
        answer: shippingInfo,
      })
    }
  }

  return faqs
}

// =============================================================================
// HELPERS
// =============================================================================

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function formatStoreName(slug: string | null): string {
  if (!slug) return 'this retailer'

  const storeNames: Record<string, string> = {
    'amazon': 'Amazon.ca',
    'walmart': 'Walmart Canada',
    'costco': 'Costco',
    'best-buy': 'Best Buy',
    'canadian-tire': 'Canadian Tire',
    'home-depot': 'Home Depot',
    'shoppers': 'Shoppers Drug Mart',
    'loblaws': 'Loblaws',
    'no-frills': 'No Frills',
    'metro': 'Metro',
    'sobeys': 'Sobeys',
    'lululemon': 'Lululemon',
    'gap': 'Gap',
    'old-navy': 'Old Navy',
    'the-bay': "Hudson's Bay",
    'sport-chek': 'Sport Chek',
    'marks': "Mark's",
    'staples': 'Staples',
    'rona': 'RONA',
    'ikea': 'IKEA',
    'indigo': 'Indigo',
  }

  return storeNames[slug] || slug.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

export function formatCategoryName(slug: string): string {
  return slug.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.substring(0, length - 3) + '...'
}
