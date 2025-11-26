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
    `Our Canadian shopping experts found this incredible deal on {product} at {store}. Originally priced at ${'{original_price}'}, you can now get it for just ${'{current_price}'}, saving you ${'{savings}'} ({percent}% off). {benefits} {urgency}`,

    `Looking for the best price on {product} in Canada? This {store} deal won't last long. With {percent}% off, you're saving ${'{savings}'} compared to the regular price. {benefits}`,

    `Canadian deal alert! Save ${'{savings}'} on {product} at {store}. This {category} deal brings the price down from ${'{original_price}'} to just ${'{current_price}'}. {benefits} {urgency}`,

    `Score big savings on {product}! {store} is offering this {category} essential at {percent}% off. That's ${'{savings}'} back in your pocket. {benefits}`,

    `Hot {category} deal for Canadian shoppers: {product} is now ${'{current_price}'} at {store} (regularly ${'{original_price}'}). {benefits} Don't miss out!`,

    `{store} just dropped the price on {product} by {percent}%! Get it for ${'{current_price}'} instead of ${'{original_price}'} and save ${'{savings}'}. {benefits}`,

    `Price drop alert: {product} at {store} is now {percent}% off! Canadian shoppers are saving ${'{savings}'} on this {category} deal. {benefits} {urgency}`,

    `This {category} deal is one of the best we've seen in Canada. {product} at {store} for just ${'{current_price}'} (was ${'{original_price}'}) - that's ${'{savings}'} in savings! {benefits}`,
  ],
}

// =============================================================================
// CATEGORY-SPECIFIC BENEFITS
// =============================================================================

const CATEGORY_BENEFITS: Record<string, string[]> = {
  electronics: [
    'Perfect for Canadian tech enthusiasts who value quality and reliability.',
    'Trusted by thousands of Canadian customers coast to coast.',
    'Ideal for Canadian homes with fast, reliable shipping.',
    'A top pick among Canadian tech reviewers.',
    'Great for work-from-home setups across Canada.',
  ],
  fashion: [
    'Perfect for Canadian weather and style.',
    'Loved by fashion-forward Canadians from Vancouver to Halifax.',
    'Designed with Canadian comfort and durability in mind.',
    'A wardrobe essential for Canadian seasons.',
    'Free returns available at Canadian locations.',
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
  'Limited time offer - act fast!',
  'Selling quickly - grab yours now.',
  'Popular deal - stock is limited.',
  'Price may go back up soon.',
  'One of the best deals we\'ve seen this month.',
  'Canadian shoppers are snapping this up.',
  '',  // Sometimes no urgency
  '',
]

// =============================================================================
// STORE DESCRIPTIONS
// =============================================================================

const STORE_DESCRIPTIONS: Record<string, string> = {
  'amazon': 'Amazon.ca offers fast Prime shipping across Canada with easy returns.',
  'walmart': 'Walmart Canada provides everyday low prices with free shipping on orders over $35.',
  'costco': 'Costco Canada is known for bulk savings and quality products for members.',
  'best-buy': 'Best Buy Canada is your destination for electronics with price matching.',
  'canadian-tire': 'Canadian Tire offers a wide selection of automotive, sports, and home products.',
  'home-depot': 'Home Depot Canada is the go-to for home improvement and building materials.',
  'shoppers': 'Shoppers Drug Mart offers health, beauty, and convenience products with PC Optimum points.',
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
