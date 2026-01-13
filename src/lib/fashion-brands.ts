/**
 * Fashion Brand Card Generator for PromoPenguin
 *
 * Generates "synthetic" deal cards for fashion affiliate brands using local images.
 * These cards rotate every 15 minutes to match the site's shuffle timing.
 *
 * Architecture:
 * - Brand images stored locally in /images/fashion/{brand}/ folders
 * - Cards generated on-the-fly with time-based image rotation
 * - Uses affiliate search URLs for click-through
 *
 * NOTE: Unlike ShopCanada, PromoPenguin uses ALL affiliate brands, not just Canadian ones
 */

import { Deal } from '@/types/deal'
import { RETAILER_SEARCH_URLS, extractSearchTerms } from './affiliates'

// =============================================================================
// BRAND CONFIGURATION
// Maps image folder names to store slugs and metadata
// =============================================================================

export interface FashionBrand {
  folder: string            // Folder name in /images/ directory
  slug: string              // Store slug (matches DB or RETAILER_SEARCH_URLS)
  name: string              // Display name
  category: string          // Deal category (fashion, beauty, home, sports)
  cardTitles: string[]      // Rotating card titles for variety
  priority: 'premium' | 'top' | 'standard'  // Premium = highest priority
}

/**
 * All fashion brands with their configurations
 * Folder names are normalized slugs matching public/images/fashion/{folder}
 */
export const FASHION_BRANDS: FashionBrand[] = [
  // ==========================================================================
  // PREMIUM TIER - Highest priority brands
  // ==========================================================================
  {
    folder: 'lululemon',
    slug: 'lululemon',
    name: 'Lululemon',
    category: 'fashion',
    priority: 'premium',
    cardTitles: [
      'Lululemon Align Leggings - New Arrivals',
      'Lululemon Define Jacket - Shop Now',
      'Lululemon Scuba Hoodie - Fan Favorite',
      'Lululemon ABC Pants - Bestseller',
      'Lululemon Wunder Under - Classic Fit',
    ],
  },
  {
    folder: 'aritzia',
    slug: 'aritzia',
    name: 'Aritzia',
    category: 'fashion',
    priority: 'premium',
    cardTitles: [
      'Aritzia - Super Puff Collection',
      'Aritzia - Effortless Pants',
      'Aritzia - The Melina Pant',
      'Aritzia TNA - Cozy Fleece',
      'Aritzia - New Season Arrivals',
    ],
  },
  {
    folder: 'ardene',
    slug: 'ardene',
    name: 'Ardene',
    category: 'fashion',
    priority: 'premium',
    cardTitles: [
      'Ardene - Buy 1 Get 1 Free',
      'Ardene - $5 Tank Tops & More',
      'Ardene - Back to School Essentials',
      'Ardene - Activewear Collection',
      'Ardene - Accessories Under $10',
    ],
  },

  // ==========================================================================
  // TOP TIER BRANDS - High priority
  // ==========================================================================
  {
    folder: 'foot-locker',
    slug: 'foot-locker',
    name: 'Foot Locker',
    category: 'fashion',
    priority: 'top',
    cardTitles: [
      'Foot Locker - Latest Sneaker Drops',
      'Foot Locker - Nike & Jordan Collection',
      'Foot Locker - New Balance Fresh Foam',
      'Foot Locker - Adidas Originals',
      'Foot Locker - Kids Sneakers Sale',
    ],
  },
  {
    folder: 'aldo',
    slug: 'aldo',
    name: 'Aldo',
    category: 'fashion',
    priority: 'top',
    cardTitles: [
      'Aldo - Trending Boots & Booties',
      'Aldo - Designer Handbags Collection',
      'Aldo - Heels & Pumps Sale',
      'Aldo - Men\'s Dress Shoes',
      'Aldo - New Season Accessories',
    ],
  },
  {
    folder: 'new-balance',
    slug: 'new-balance',
    name: 'New Balance',
    category: 'fashion',
    priority: 'top',
    cardTitles: [
      'New Balance 574 - Classic Style',
      'New Balance Fresh Foam - Running',
      'New Balance 990 - Made in USA',
      'New Balance FuelCell - Performance',
      'New Balance Kids - Back to School',
    ],
  },
  {
    folder: 'simons',
    slug: 'simons',
    name: 'Simons',
    category: 'fashion',
    priority: 'top',
    cardTitles: [
      'Simons - Designer Fashion',
      'Simons - Maison Simons Collection',
      'Simons - Exclusive Home Decor',
      'Simons - Winter Outerwear Sale',
      'Simons - Trending Accessories',
    ],
  },

  // ==========================================================================
  // STANDARD TIER - Fashion & Apparel
  // ==========================================================================
  {
    folder: 'abercrombie-fitch',
    slug: 'abercrombie-fitch',
    name: 'Abercrombie & Fitch',
    category: 'fashion',
    priority: 'standard',
    cardTitles: [
      'A&F - Cozy Season Essentials',
      'Abercrombie - Curve Love Jeans',
      'A&F - Puffer Jackets Collection',
      'Abercrombie - YPB Activewear',
    ],
  },
  {
    folder: 'aerie',
    slug: 'aerie',
    name: 'Aerie',
    category: 'fashion',
    priority: 'standard',
    cardTitles: [
      'Aerie - Real Good Collection',
      'Aerie - OFFLINE Activewear',
      'Aerie - Cozy Loungewear',
      'Aerie - Swimwear Favorites',
    ],
  },
  {
    folder: 'alo-yoga',
    slug: 'alo-yoga',
    name: 'Alo Yoga',
    category: 'sports',
    priority: 'standard',
    cardTitles: [
      'Alo Yoga - Airlift Collection',
      'Alo Yoga - Wellness Essentials',
      'Alo Yoga - Studio to Street',
      'Alo Yoga - Best Selling Leggings',
    ],
  },
  {
    folder: 'american-eagle',
    slug: 'american-eagle',
    name: 'American Eagle',
    category: 'fashion',
    priority: 'standard',
    cardTitles: [
      'AE - Signature Denim Collection',
      'American Eagle - Cozy Flannels',
      'AE - Fall Essentials',
      'American Eagle - Clearance Deals',
    ],
  },
  {
    folder: 'anthropologie',
    slug: 'anthropologie',
    name: 'Anthropologie',
    category: 'fashion',
    priority: 'standard',
    cardTitles: [
      'Anthropologie - Boho Chic Dresses',
      'Anthropologie - Home Collection',
      'Anthropologie - Unique Gifts',
      'Anthropologie - Somerset Favorites',
    ],
  },
  {
    folder: 'birkenstock',
    slug: 'birkenstock',
    name: 'Birkenstock',
    category: 'fashion',
    priority: 'standard',
    cardTitles: [
      'Birkenstock - Arizona Sandals',
      'Birkenstock - Boston Clogs',
      'Birkenstock - Winter Collection',
      'Birkenstock - Limited Editions',
    ],
  },
  {
    folder: 'brooklinen',
    slug: 'brooklinen',
    name: 'Brooklinen',
    category: 'home',
    priority: 'standard',
    cardTitles: [
      'Brooklinen - Luxe Core Sheet Set',
      'Brooklinen - Down Comforters',
      'Brooklinen - Waffle Bath Towels',
      'Brooklinen - Bundle & Save',
    ],
  },
  {
    folder: 'cb2',
    slug: 'cb2',
    name: 'CB2',
    category: 'home',
    priority: 'standard',
    cardTitles: [
      'CB2 - Modern Furniture',
      'CB2 - Designer Home Decor',
      'CB2 - Outdoor Collection',
      'CB2 - Lighting Sale',
    ],
  },
  {
    folder: 'cotton-on',
    slug: 'cotton-on',
    name: 'Cotton On',
    category: 'fashion',
    priority: 'standard',
    cardTitles: [
      'Cotton On - Everyday Basics',
      'Cotton On Body - Activewear',
      'Cotton On Kids - Back to School',
      'Cotton On - $5 Tees & More',
    ],
  },
  {
    folder: 'crate-barrel',
    slug: 'crate-barrel',
    name: 'Crate & Barrel',
    category: 'home',
    priority: 'standard',
    cardTitles: [
      'Crate & Barrel - Kitchen Essentials',
      'Crate & Barrel - Furniture Sale',
      'CB2 - Holiday Entertaining',
      'Crate & Barrel - Registry Favorites',
    ],
  },
  {
    folder: 'free-people',
    slug: 'free-people',
    name: 'Free People',
    category: 'fashion',
    priority: 'standard',
    cardTitles: [
      'Free People - Boho Dresses',
      'Free People Movement - Activewear',
      'Free People - Vintage Inspired',
      'Free People - Intimates & Swim',
    ],
  },
  {
    folder: 'guess',
    slug: 'guess',
    name: 'GUESS',
    category: 'fashion',
    priority: 'standard',
    cardTitles: [
      'GUESS - Iconic Denim Collection',
      'GUESS - Designer Handbags',
      'GUESS - Watches & Accessories',
      'GUESS - Holiday Glam',
    ],
  },
  {
    folder: 'lulus',
    slug: 'lulus',
    name: 'Lulus',
    category: 'fashion',
    priority: 'standard',
    cardTitles: [
      'Lulus - Party Dresses',
      'Lulus - Wedding Guest Looks',
      'Lulus - Date Night Styles',
      'Lulus - Under $50 Finds',
    ],
  },
  {
    folder: 'madewell',
    slug: 'madewell',
    name: 'Madewell',
    category: 'fashion',
    priority: 'standard',
    cardTitles: [
      'Madewell - Perfect Vintage Jeans',
      'Madewell - Transport Totes',
      'Madewell - Cozy Sweaters',
      'Madewell - Insider Rewards',
    ],
  },
  {
    folder: 'nasty-gal',
    slug: 'nasty-gal',
    name: 'Nasty Gal',
    category: 'fashion',
    priority: 'standard',
    cardTitles: [
      'Nasty Gal - Bold Fashion Finds',
      'Nasty Gal - Going Out Tops',
      'Nasty Gal - Platform Boots',
      'Nasty Gal - 70% Off Sale',
    ],
  },
  {
    folder: 'pottery-barn',
    slug: 'pottery-barn',
    name: 'Pottery Barn',
    category: 'home',
    priority: 'standard',
    cardTitles: [
      'Pottery Barn - Living Room Furniture',
      'Pottery Barn - Bedding & Bath',
      'Pottery Barn - Holiday Decor',
      'Pottery Barn - Outdoor Living',
    ],
  },
  {
    folder: 'prettylittlething',
    slug: 'prettylittlething',
    name: 'PrettyLittleThing',
    category: 'fashion',
    priority: 'standard',
    cardTitles: [
      'PLT - Trending Styles',
      'PrettyLittleThing - Party Wear',
      'PLT - Up to 70% Off',
      'PrettyLittleThing - New In',
    ],
  },
  {
    folder: 'princess-polly',
    slug: 'princess-polly',
    name: 'Princess Polly',
    category: 'fashion',
    priority: 'standard',
    cardTitles: [
      'Princess Polly - Trending Now',
      'Princess Polly - Y2K Styles',
      'Princess Polly - Festival Looks',
      'Princess Polly - Mini Dresses',
    ],
  },
  {
    folder: 'revolve',
    slug: 'revolve',
    name: 'Revolve',
    category: 'fashion',
    priority: 'standard',
    cardTitles: [
      'Revolve - Designer Brands',
      'Revolve - Wedding Season',
      'Revolve - Vacation Ready',
      'Revolve - Best Sellers',
    ],
  },
  {
    folder: 'shopbop',
    slug: 'shopbop',
    name: 'Shopbop',
    category: 'fashion',
    priority: 'standard',
    cardTitles: [
      'Shopbop - Designer Fashion',
      'Shopbop - New Arrivals',
      'Shopbop - Sale Up to 70% Off',
      'Shopbop - Trending Brands',
    ],
  },
  {
    folder: 'skims',
    slug: 'skims',
    name: 'SKIMS',
    category: 'fashion',
    priority: 'standard',
    cardTitles: [
      'SKIMS - Shapewear Solutions',
      'SKIMS - Cozy Collection',
      'SKIMS - Swim & Resort',
      'SKIMS - Boyfriend Collection',
    ],
  },
  {
    folder: 'steve-madden',
    slug: 'steve-madden',
    name: 'Steve Madden',
    category: 'fashion',
    priority: 'standard',
    cardTitles: [
      'Steve Madden - Trending Boots',
      'Steve Madden - Platform Sneakers',
      'Steve Madden - Designer Handbags',
      'Steve Madden - New Arrivals',
    ],
  },
  {
    folder: 'ugg',
    slug: 'ugg',
    name: 'UGG',
    category: 'fashion',
    priority: 'standard',
    cardTitles: [
      'UGG - Classic Boot Collection',
      'UGG - Tasman Slippers',
      'UGG - Cozy Home & Gifts',
      'UGG - New Season Styles',
    ],
  },
  {
    folder: 'urban-outfitters',
    slug: 'urban-outfitters',
    name: 'Urban Outfitters',
    category: 'fashion',
    priority: 'standard',
    cardTitles: [
      'Urban Outfitters - Vintage Vibes',
      'UO - Apartment Essentials',
      'Urban Outfitters - Music & Tech',
      'UO - BDG Denim Collection',
    ],
  },
  {
    folder: 'vuori',
    slug: 'vuori',
    name: 'Vuori',
    category: 'sports',
    priority: 'standard',
    cardTitles: [
      'Vuori - Performance Joggers',
      'Vuori - Ponto Collection',
      'Vuori - Running & Training',
      'Vuori - Daily Wear Favorites',
    ],
  },
  {
    folder: 'west-elm',
    slug: 'west-elm',
    name: 'West Elm',
    category: 'home',
    priority: 'standard',
    cardTitles: [
      'West Elm - Modern Furniture',
      'West Elm - Bedroom Collection',
      'West Elm - Workspace Essentials',
      'West Elm - Holiday Sale',
    ],
  },

  // ==========================================================================
  // BEAUTY BRANDS
  // ==========================================================================
  {
    folder: 'charlotte-tilbury',
    slug: 'charlotte-tilbury',
    name: 'Charlotte Tilbury',
    category: 'beauty',
    priority: 'standard',
    cardTitles: [
      'Charlotte Tilbury - Pillow Talk',
      'Charlotte Tilbury - Hollywood Flawless',
      'Charlotte Tilbury - Gift Sets',
      'Charlotte Tilbury - New Launches',
    ],
  },
  {
    folder: 'colleen-rothschild',
    slug: 'colleen-rothschild',
    name: 'Colleen Rothschild',
    category: 'beauty',
    priority: 'standard',
    cardTitles: [
      'Colleen Rothschild - Radiant Cleansing Balm',
      'Colleen Rothschild - Age Renewal',
      'Colleen Rothschild - Discovery Sets',
      'Colleen Rothschild - Best Sellers',
    ],
  },
  {
    folder: 'dime-beauty',
    slug: 'dime-beauty',
    name: 'Dime Beauty',
    category: 'beauty',
    priority: 'standard',
    cardTitles: [
      'Dime Beauty - TBT Cream',
      'Dime Beauty - Clean Skincare',
      'Dime Beauty - Starter Sets',
      'Dime Beauty - Best Sellers',
    ],
  },
  {
    folder: 'dyson',
    slug: 'dyson',
    name: 'Dyson',
    category: 'beauty',
    priority: 'standard',
    cardTitles: [
      'Dyson Airwrap - Complete',
      'Dyson Supersonic - Hair Dryer',
      'Dyson Airstrait - Straightener',
      'Dyson - Limited Edition Colors',
    ],
  },
  {
    folder: 'elf-cosmetics',
    slug: 'elf-cosmetics',
    name: 'e.l.f. Cosmetics',
    category: 'beauty',
    priority: 'standard',
    cardTitles: [
      'e.l.f. - Power Grip Primer',
      'e.l.f. - Halo Glow Collection',
      'e.l.f. - Viral TikTok Picks',
      'e.l.f. - Under $10 Favorites',
    ],
  },
  {
    folder: 'merit-beauty',
    slug: 'merit-beauty',
    name: 'Merit Beauty',
    category: 'beauty',
    priority: 'standard',
    cardTitles: [
      'Merit - The Minimalist Kit',
      'Merit - Day Glow Highlighter',
      'Merit - Clean Beauty',
      'Merit - Effortless Makeup',
    ],
  },
  {
    folder: 'supergoop',
    slug: 'supergoop',
    name: 'Supergoop',
    category: 'beauty',
    priority: 'standard',
    cardTitles: [
      'Supergoop - Unseen Sunscreen',
      'Supergoop - Glowscreen SPF 40',
      'Supergoop - Lip Shield',
      'Supergoop - Value Sets',
    ],
  },
  {
    folder: 'tarte-cosmetics',
    slug: 'tarte-cosmetics',
    name: 'Tarte Cosmetics',
    category: 'beauty',
    priority: 'standard',
    cardTitles: [
      'Tarte - Shape Tape Concealer',
      'Tarte - Maracuja Juicy Lip',
      'Tarte - Custom Kit Sale',
      'Tarte - Best Sellers Set',
    ],
  },
  {
    folder: 'tula-skincare',
    slug: 'tula-skincare',
    name: 'Tula Skincare',
    category: 'beauty',
    priority: 'standard',
    cardTitles: [
      'Tula - Cooling Brightening Balm',
      'Tula - Probiotic Skincare',
      'Tula - Glow & Get It Eye Balm',
      'Tula - Starter Kit',
    ],
  },
]

// =============================================================================
// IMAGE PATH CONFIGURATION
// Images served from public/images/fashion/{folder}/
// =============================================================================

/**
 * Base URL path for brand images (relative to public folder)
 */
export const FASHION_IMAGES_BASE_URL = '/images/fashion'

// =============================================================================
// TIME-BASED ROTATION LOGIC (15-minute intervals)
// =============================================================================

/**
 * Get the current 15-minute interval index
 * Used for deterministic image rotation across all users/instances
 */
function getIntervalIndex(): number {
  const now = new Date()
  const minutes = now.getHours() * 60 + now.getMinutes()
  const intervalIndex = Math.floor(minutes / 15)  // Changes every 15 minutes
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
  return dayOfYear * 96 + intervalIndex  // 96 intervals per day (24*4)
}

/**
 * Get the image index for a brand based on current time interval
 * All users see the same image at the same time
 */
function getRotatingImageIndex(imageCount: number, brandIndex: number): number {
  const interval = getIntervalIndex()
  // Add brand index to stagger rotations between brands
  return (interval + brandIndex) % imageCount
}

/**
 * Get the card title index for rotation
 */
function getRotatingTitleIndex(titleCount: number, brandIndex: number): number {
  const interval = getIntervalIndex()
  // Different offset than images for variety
  return (interval + brandIndex + 3) % titleCount
}

// =============================================================================
// DEAL GENERATION
// =============================================================================

/**
 * Generate a deterministic discount percentage based on brand
 * Fashion brands typically show 10-40% off messaging
 */
function generateDiscount(brandSlug: string, interval: number): number | null {
  // Use brand slug hash for deterministic but varied discounts
  const hash = brandSlug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const discounts = [15, 20, 25, 30, 35, 40, null]  // null = "Shop Now" without discount
  return discounts[(hash + interval) % discounts.length]
}

/**
 * Check if a URL is a search URL that expects query parameters
 */
function isSearchUrl(url: string): boolean {
  // Common search URL patterns
  return /[?&](q|query|search|searchTerm|keyword|k)=$/i.test(url)
}

/**
 * Generate a synthetic deal card for a fashion brand
 * @param storeAffiliateUrl - The affiliate URL from the database (from admin panel)
 */
export function generateFashionDeal(
  brand: FashionBrand,
  brandIndex: number,
  imageFiles: string[],
  storeAffiliateUrl?: string | null
): Deal {
  const interval = getIntervalIndex()
  const imageIndex = getRotatingImageIndex(imageFiles.length, brandIndex)
  const titleIndex = getRotatingTitleIndex(brand.cardTitles.length, brandIndex)

  const imageFile = imageFiles[imageIndex]
  const title = brand.cardTitles[titleIndex]
  const discount = generateDiscount(brand.slug, interval)

  // Generate unique ID based on brand and interval (changes every 15 min)
  const dealId = `fashion-${brand.slug}-${interval}`

  // Extract clean search terms (strips brand name, "collection", etc.)
  const searchTerms = extractSearchTerms(title, brand.name)

  // Build affiliate URL
  let affiliateUrl: string
  if (storeAffiliateUrl) {
    // If the affiliate URL is a search URL, append the search terms
    if (isSearchUrl(storeAffiliateUrl)) {
      affiliateUrl = `${storeAffiliateUrl}${encodeURIComponent(searchTerms)}`
    } else {
      // It's a direct affiliate link, use as-is
      affiliateUrl = storeAffiliateUrl
    }
  } else {
    // Fall back to RETAILER_SEARCH_URLS
    const searchUrl = RETAILER_SEARCH_URLS[brand.slug]
    affiliateUrl = searchUrl
      ? `${searchUrl}${encodeURIComponent(searchTerms)}`
      : `https://www.google.com/search?q=${encodeURIComponent(brand.name + ' ' + searchTerms)}`
  }

  // Image URL - served from public/images/fashion/{folder}/
  const imageUrl = `${FASHION_IMAGES_BASE_URL}/${brand.folder}/${imageFile}`

  const now = new Date().toISOString()

  return {
    id: dealId,
    title: title,
    slug: `${brand.slug}-${dealId}`,
    image_url: imageUrl,
    image_blob_url: null,
    price: null,  // Fashion cards don't show specific prices
    original_price: null,
    discount_percent: discount,
    store: brand.name,
    category: brand.category,
    description: `Shop ${brand.name} - ${title}. Find the latest styles and deals.`,
    affiliate_url: affiliateUrl,
    source_url: null,
    featured: brand.priority === 'premium' || brand.priority === 'top',
    date_added: now,
    date_updated: now,
    is_active: true,
  }
}

// =============================================================================
// PRIORITY SYSTEM
// =============================================================================

/**
 * Get premium tier brands - highest priority
 */
export function getPremiumBrands(): FashionBrand[] {
  return FASHION_BRANDS.filter(b => b.priority === 'premium')
}

/**
 * Get top tier brands that should appear on page 1 (premium + top)
 */
export function getTopTierBrands(): FashionBrand[] {
  return FASHION_BRANDS.filter(b => b.priority === 'premium' || b.priority === 'top')
}

/**
 * Get standard tier brands for regular rotation
 */
export function getStandardBrands(): FashionBrand[] {
  return FASHION_BRANDS.filter(b => b.priority === 'standard')
}

/**
 * Get all fashion brands by category
 */
export function getBrandsByCategory(category: string): FashionBrand[] {
  return FASHION_BRANDS.filter(b => b.category === category)
}

/**
 * Get ALL affiliate brands for the carousel (PromoPenguin uses all brands)
 */
export function getAllFashionBrands(): FashionBrand[] {
  return FASHION_BRANDS
}

// =============================================================================
// HELPER: SEARCH URL ADDITIONS
// =============================================================================

export const FASHION_SEARCH_URLS: Record<string, string> = {
  'ardene': 'https://www.ardene.com/ca/en/search?q=',
  'aritzia': 'https://www.aritzia.com/en/search?q=',
  'foot-locker': 'https://www.footlocker.ca/en/search?query=',
  'aldo': 'https://www.aldoshoes.com/ca/en/search?q=',
  'new-balance': 'https://www.newbalance.ca/en_ca/search?q=',
  'abercrombie-fitch': 'https://www.abercrombie.com/shop/search?searchTerm=',
  'aerie': 'https://www.ae.com/ca/en/c/aerie/cat1410002?q=',
  'alo-yoga': 'https://www.aloyoga.com/search?q=',
  'american-eagle': 'https://www.ae.com/ca/en/search?q=',
  'anthropologie': 'https://www.anthropologie.com/search?q=',
  'birkenstock': 'https://www.birkenstock.com/ca/search?q=',
  'brooklinen': 'https://www.brooklinen.com/search?q=',
  'cb2': 'https://www.cb2.ca/search?query=',
  'cotton-on': 'https://cottonon.com/CA/search/?q=',
  'crate-barrel': 'https://www.crateandbarrel.ca/search?query=',
  'free-people': 'https://www.freepeople.com/search/?q=',
  'guess': 'https://www.guess.ca/en/catalog/search?q=',
  'lulus': 'https://www.lulus.com/search?q=',
  'madewell': 'https://www.madewell.com/search?q=',
  'nasty-gal': 'https://www.nastygal.com/search?q=',
  'pottery-barn': 'https://www.potterybarn.ca/search/results.html?words=',
  'prettylittlething': 'https://www.prettylittlething.ca/catalogsearch/result/?q=',
  'princess-polly': 'https://us.princesspolly.com/search?q=',
  'revolve': 'https://www.revolve.com/content/search?q=',
  'shopbop': 'https://www.shopbop.com/s/search?keywords=',
  'skims': 'https://skims.com/search?q=',
  'steve-madden': 'https://www.stevemadden.ca/search?q=',
  'ugg': 'https://www.ugg.com/ca/search?q=',
  'urban-outfitters': 'https://www.urbanoutfitters.com/search?q=',
  'vuori': 'https://vuoriclothing.com/search?q=',
  'west-elm': 'https://www.westelm.ca/search/results.html?words=',
  'charlotte-tilbury': 'https://www.charlottetilbury.com/ca/search?q=',
  'colleen-rothschild': 'https://www.colleenrothschild.com/search?q=',
  'dime-beauty': 'https://dimebeautyco.com/search?q=',
  'dyson': 'https://www.dyson.ca/en/search?q=',
  'elf-cosmetics': 'https://www.elfcosmetics.com/search?q=',
  'merit-beauty': 'https://meritbeauty.com/search?q=',
  'supergoop': 'https://supergoop.com/search?q=',
  'tarte-cosmetics': 'https://tartecosmetics.com/shop/search?q=',
  'tula-skincare': 'https://www.tula.com/search?q=',
}

/**
 * Get affiliate URL for a fashion brand
 * Checks both main RETAILER_SEARCH_URLS and FASHION_SEARCH_URLS
 */
export function getFashionAffiliateUrl(slug: string, searchTerms: string): string {
  const mainUrl = RETAILER_SEARCH_URLS[slug]
  if (mainUrl) return `${mainUrl}${encodeURIComponent(searchTerms)}`

  const fashionUrl = FASHION_SEARCH_URLS[slug]
  if (fashionUrl) return `${fashionUrl}${encodeURIComponent(searchTerms)}`

  // Fallback to Google search
  return `https://www.google.com/search?q=${encodeURIComponent(searchTerms)}`
}
