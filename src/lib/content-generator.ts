/**
 * Content Generator - Creates unique descriptions for SEO
 *
 * Uses template rotation and data injection to generate
 * unique content for each deal page.
 */

import { Deal, ContentContext } from '@/types/deal'
import { toNumber, formatPrice, calculateSavings } from '@/lib/price-utils'

// =============================================================================
// DESCRIPTION TEMPLATES (8 variations per category)
// =============================================================================

const DESCRIPTION_TEMPLATES = {
  default: [
    `{product} at {store}. Was ${'{original_price}'}, now ${'{current_price}'} ({percent}% off). Found by our AI scraper.`,

    `{product} - {percent}% off at {store}. Sale price: ${'{current_price}'}. Automated find.`,

    `{store} has {product} for ${'{current_price}'} (down from ${'{original_price}'}). AI-sourced.`,

    `{percent}% off {product} at {store}. Now ${'{current_price}'}. From retailer feed.`,

    `{product} on sale at {store}: ${'{current_price}'} (was ${'{original_price}'}). Scraper find.`,

    `{store} deal: {product} at ${'{current_price}'} ({percent}% off). Auto-found.`,

    `Price drop: {product} now ${'{current_price}'} at {store}. AI-sourced.`,

    `{product} at {store} - ${'{current_price}'} ({percent}% off). Verify at retailer.`,
  ],
}

// =============================================================================
// CATEGORY-SPECIFIC BENEFITS
// =============================================================================

const CATEGORY_BENEFITS: Record<string, string[]> = {
  electronics: [
    'Ships to Canada.',
    '',
    '',
    '',
    '',
  ],
  fashion: [
    'Ships to Canada.',
    '',
    '',
    '',
    'Check return policy.',
  ],
  home: [
    'Made for Canadian homes and families.',
    'Trusted by Canadian homeowners nationwide.',
    'Perfect for our Canadian climate and lifestyle.',
    'Energy-efficient for Canadian winters.',
    'A popular choice among Canadian home decor enthusiasts.',
  ],
  grocery: [
    'Stock up and save at Canadian prices.',
    'Quality products for Canadian families.',
    'Great value for budget-conscious Canadian shoppers.',
    'A pantry staple at an unbeatable price.',
  ],
  beauty: [
    'Loved by Canadian beauty enthusiasts.',
    'Perfect addition to your skincare routine.',
    'A bestseller among Canadian shoppers.',
    'Great for the Canadian climate.',
  ],
  sports: [
    'Get active with this Canadian deal.',
    'Perfect for outdoor activities in Canada.',
    'Trusted by Canadian athletes and fitness enthusiasts.',
    'Great for Canadian winters and summers alike.',
  ],
  general: [
    'A great find for Canadian shoppers.',
    'Quality product at an unbeatable Canadian price.',
    'Popular with Canadian buyers.',
    "Don't miss this Canadian deal.",
  ],
}

// =============================================================================
// URGENCY PHRASES
// =============================================================================

const URGENCY_PHRASES = [
  '',
  '',
  '',
  '',
  'One of the best deals we\'ve seen this month.',
  '',
  '',  // Sometimes no urgency
  '',
]

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
  'loblaws': 'Loblaws is one of Canada\'s largest grocery chains with PC Optimum rewards.',
}

// =============================================================================
// MAIN GENERATOR FUNCTIONS
// =============================================================================

/**
 * Generate a unique description for a deal
 */
export function generateDealDescription(deal: Deal): string {
  const category = deal.category || 'general'
  const templates = DESCRIPTION_TEMPLATES.default

  // Pick template based on deal ID hash (consistent for same deal)
  const templateIndex = hashString(deal.id) % templates.length
  let template = templates[templateIndex]

  // Pick benefit based on different hash
  const benefits = CATEGORY_BENEFITS[category] || CATEGORY_BENEFITS.general
  const benefitIndex = hashString(deal.id + 'benefit') % benefits.length
  const benefit = benefits[benefitIndex]

  // Pick urgency phrase
  const urgencyIndex = hashString(deal.id + 'urgency') % URGENCY_PHRASES.length
  const urgency = URGENCY_PHRASES[urgencyIndex]

  // Calculate savings
  const savings = calculateSavings(deal.original_price, deal.price) || '0'

  // Replace placeholders
  const description = template
    .replace(/{product}/g, deal.title)
    .replace(/{store}/g, formatStoreName(deal.store))
    .replace(/{category}/g, category)
    .replace(/{original_price}/g, formatPrice(deal.original_price) || 'regular price')
    .replace(/{current_price}/g, formatPrice(deal.price) || 'sale price')
    .replace(/{savings}/g, savings)
    .replace(/{percent}/g, deal.discount_percent?.toString() || '??')
    .replace(/{benefits}/g, benefit)
    .replace(/{urgency}/g, urgency)

  return description.trim()
}

/**
 * Generate SEO meta description
 */
export function generateMetaDescription(deal: Deal): string {
  const savingsAmount = calculateSavings(deal.original_price, deal.price)
  const savings = savingsAmount
    ? `Save $${savingsAmount}`
    : `${deal.discount_percent}% off`

  return `${deal.title} - ${savings} at ${formatStoreName(deal.store)}. Shop this Canadian deal now before it's gone.`
}

/**
 * Generate page title
 */
export function generatePageTitle(deal: Deal): string {
  if (deal.discount_percent && deal.discount_percent >= 20) {
    return `${deal.title} - ${deal.discount_percent}% OFF`
  }
  if (deal.price) {
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
 * Generate FAQ items for a deal
 */
export function generateFAQ(deal: Deal): { question: string; answer: string }[] {
  const faqs = [
    {
      question: `Is this ${deal.title} deal available in Canada?`,
      answer: `Yes, this deal is available to Canadian shoppers through ${formatStoreName(deal.store)}. Shipping is available across Canada.`,
    },
    {
      question: `How much can I save on this deal?`,
      answer: deal.original_price && deal.price
        ? `You save $${calculateSavings(deal.original_price, deal.price)} (${deal.discount_percent}% off) compared to the regular price of $${formatPrice(deal.original_price)}.`
        : `This deal offers ${deal.discount_percent}% off the regular price.`,
    },
    {
      question: `How long will this deal last?`,
      answer: `Deal availability varies. We recommend purchasing soon as prices and stock can change at any time.`,
    },
  ]

  if (deal.store) {
    faqs.push({
      question: `Does ${formatStoreName(deal.store)} offer free shipping?`,
      answer: getStoreDescription(deal.store),
    })
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
    'the-bay': 'Hudson\'s Bay',
    'sport-chek': 'Sport Chek',
    'marks': 'Mark\'s',
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
