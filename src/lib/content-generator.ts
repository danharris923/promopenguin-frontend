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

// Patterns to strip from deal titles (only for non-Amazon deals)
const TITLE_NOISE_PATTERNS_NON_AMAZON = [
  /🚀\s*Prime Eligible\s*/gi,
  /Prime Eligible\s*/gi,
  /at Amazon\.ca\s*/gi,
  /^\s*at\s+/gi,  // Leading "at" after store removal
]

/**
 * Clean noise from deal titles
 * Only strips Amazon-specific text if the deal is NOT from Amazon
 */
export function cleanTitle(title: string, store?: string | null): string {
  // If it's an Amazon deal, keep the Prime Eligible badge
  const isAmazon = store?.toLowerCase().includes('amazon')
  if (isAmazon) return title

  let cleaned = title
  for (const pattern of TITLE_NOISE_PATTERNS_NON_AMAZON) {
    cleaned = cleaned.replace(pattern, '')
  }
  return cleaned.replace(/\s{2,}/g, ' ').trim()
}

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
  // General / Big Box
  'amazon': 'Amazon.ca - Prime members get free shipping.',
  'walmart': 'Walmart Canada - Free shipping over $35.',
  'costco': 'Costco Canada - Members only warehouse club.',
  'giant-tiger': 'Giant Tiger - Budget-friendly Canadian retailer.',
  'dollarama': 'Dollarama - Dollar store deals across Canada.',

  // Electronics
  'best-buy': 'Best Buy Canada - Price matching available.',
  'the-source': 'The Source - Electronics and tech accessories.',
  'staples': 'Staples Canada - Office supplies and tech.',
  'visions': 'Visions Electronics - TVs, audio, appliances.',
  'canada-computers': 'Canada Computers - PC parts and electronics.',
  'memory-express': 'Memory Express - Computer hardware retailer.',

  // Home Improvement
  'canadian-tire': 'Canadian Tire - Auto, sports, home.',
  'home-depot': 'Home Depot Canada - Home improvement warehouse.',
  'lowes': "Lowe's Canada - Home improvement and appliances.",
  'rona': 'RONA - Canadian hardware and building supplies.',
  'home-hardware': 'Home Hardware - Locally owned hardware stores.',
  'ikea': 'IKEA Canada - Furniture and home goods.',
  'the-brick': 'The Brick - Furniture and appliances.',
  'leons': "Leon's - Furniture and mattresses.",
  'structube': 'Structube - Modern furniture at affordable prices.',
  'wayfair': 'Wayfair Canada - Online furniture and decor.',
  'bed-bath-beyond': 'Bed Bath & Beyond - Home and bath essentials.',

  // Grocery
  'loblaws': 'Loblaws - PC Optimum rewards.',
  'no-frills': 'No Frills - Low prices, no frills grocery.',
  'superstore': 'Real Canadian Superstore - PC Optimum points.',
  'metro': 'Metro - Grocery chain in Ontario and Quebec.',
  'sobeys': 'Sobeys - Full-service grocery stores.',
  'safeway': 'Safeway - Western Canada grocery chain.',
  'freshco': 'FreshCo - Discount grocery stores.',
  'food-basics': 'Food Basics - Low-price grocery in Ontario.',
  'save-on-foods': 'Save-On-Foods - Western Canada grocery.',
  'farm-boy': 'Farm Boy - Fresh and specialty foods.',
  'whole-foods': 'Whole Foods Market - Organic and natural groceries.',
  'longos': "Longo's - Premium grocery in GTA.",
  't-and-t': 'T&T Supermarket - Asian grocery chain.',

  // Health & Beauty
  'shoppers': 'Shoppers Drug Mart - PC Optimum points.',
  'rexall': 'Rexall - Pharmacy and health products.',
  'london-drugs': 'London Drugs - Pharmacy, electronics, and more.',
  'well-ca': 'Well.ca - Online health and baby products.',
  'sephora': 'Sephora Canada - Beauty and cosmetics.',

  // Fashion & Apparel
  'lululemon': 'Lululemon - Athletic apparel from Vancouver.',
  'gap': 'Gap - Casual clothing and basics.',
  'old-navy': 'Old Navy - Affordable family fashion.',
  'the-bay': "Hudson's Bay - Canadian department store.",
  'sport-chek': 'Sport Chek - Sports gear and athletic wear.',
  'marks': "Mark's - Work and casual wear.",
  'winners': 'Winners - Designer brands at discount prices.',
  'marshalls': 'Marshalls - Off-price department store.',
  'simons': 'Simons - Quebec fashion retailer.',
  'aritzia': 'Aritzia - Contemporary womens fashion.',
  'roots': 'Roots - Canadian leather goods and apparel.',
  'mec': 'MEC - Outdoor gear co-op.',
  'atmosphere': 'Atmosphere - Outdoor and camping gear.',
  'sporting-life': 'Sporting Life - Sports and outdoor equipment.',

  // Office & Business
  'bureau-en-gros': 'Bureau en Gros - Office supplies (Staples Quebec).',

  // Specialty
  'indigo': 'Indigo - Books, gifts, and lifestyle.',
  'toys-r-us': 'Toys R Us Canada - Toys and baby products.',
  'pet-valu': 'Pet Valu - Pet food and supplies.',
  'petsmart': 'PetSmart - Pet supplies and services.',
  'lcbo': 'LCBO - Ontario liquor and wine.',
  'saq': 'SAQ - Quebec alcohol retailer.',
  'bc-liquor': 'BC Liquor Stores - British Columbia.',
  'princess-auto': 'Princess Auto - Tools and surplus.',
  'lee-valley': 'Lee Valley - Woodworking and gardening tools.',
  'michaels': 'Michaels - Arts, crafts, and framing.',
  'sail': 'SAIL - Outdoor and fishing gear.',
  'cabelas': "Cabela's - Hunting and outdoor equipment.",
  'bass-pro': 'Bass Pro Shops - Fishing and outdoor gear.',
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
    // General / Big Box
    'amazon': 'Amazon.ca',
    'walmart': 'Walmart Canada',
    'costco': 'Costco',
    'giant-tiger': 'Giant Tiger',
    'dollarama': 'Dollarama',

    // Electronics
    'best-buy': 'Best Buy',
    'the-source': 'The Source',
    'staples': 'Staples',
    'visions': 'Visions Electronics',
    'canada-computers': 'Canada Computers',
    'memory-express': 'Memory Express',

    // Home Improvement
    'canadian-tire': 'Canadian Tire',
    'home-depot': 'Home Depot',
    'lowes': "Lowe's",
    'rona': 'RONA',
    'home-hardware': 'Home Hardware',
    'ikea': 'IKEA',
    'the-brick': 'The Brick',
    'leons': "Leon's",
    'structube': 'Structube',
    'wayfair': 'Wayfair',
    'bed-bath-beyond': 'Bed Bath & Beyond',

    // Grocery
    'loblaws': 'Loblaws',
    'no-frills': 'No Frills',
    'superstore': 'Real Canadian Superstore',
    'metro': 'Metro',
    'sobeys': 'Sobeys',
    'safeway': 'Safeway',
    'freshco': 'FreshCo',
    'food-basics': 'Food Basics',
    'save-on-foods': 'Save-On-Foods',
    'farm-boy': 'Farm Boy',
    'whole-foods': 'Whole Foods',
    'longos': "Longo's",
    't-and-t': 'T&T Supermarket',

    // Health & Beauty
    'shoppers': 'Shoppers Drug Mart',
    'rexall': 'Rexall',
    'london-drugs': 'London Drugs',
    'well-ca': 'Well.ca',
    'sephora': 'Sephora',

    // Fashion & Apparel
    'lululemon': 'Lululemon',
    'gap': 'Gap',
    'old-navy': 'Old Navy',
    'the-bay': "Hudson's Bay",
    'sport-chek': 'Sport Chek',
    'marks': "Mark's",
    'winners': 'Winners',
    'marshalls': 'Marshalls',
    'simons': 'Simons',
    'aritzia': 'Aritzia',
    'roots': 'Roots',
    'mec': 'MEC',
    'atmosphere': 'Atmosphere',
    'sporting-life': 'Sporting Life',

    // Office
    'bureau-en-gros': 'Bureau en Gros',

    // Specialty
    'indigo': 'Indigo',
    'toys-r-us': 'Toys R Us',
    'pet-valu': 'Pet Valu',
    'petsmart': 'PetSmart',
    'lcbo': 'LCBO',
    'saq': 'SAQ',
    'bc-liquor': 'BC Liquor Stores',
    'princess-auto': 'Princess Auto',
    'lee-valley': 'Lee Valley',
    'michaels': 'Michaels',
    'sail': 'SAIL',
    'cabelas': "Cabela's",
    'bass-pro': 'Bass Pro Shops',
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
