/**
 * Save.ca Article Scraper
 *
 * Scrapes deal articles from Save.ca to extract:
 * - Product names
 * - Prices and discounts
 * - Product images
 * - Direct Amazon affiliate links (with their tag, can be replaced)
 */

export interface SaveCaDeal {
  title: string
  imageUrl: string | null
  price: number | null
  discount: number | null
  affiliateUrl: string
  source: 'saveca'
  scrapedAt: string
}

// Save.ca affiliate links use amzlink.to and amzn.to
// These contain their affiliate tag (saveca-20)
// We can use these directly or resolve to get the Amazon product URL

/**
 * Resolve an Amazon short link to the full product URL
 * Useful for extracting ASIN or replacing affiliate tag
 */
export async function resolveAmazonLink(shortUrl: string): Promise<string | null> {
  try {
    const response = await fetch(shortUrl, {
      method: 'HEAD',
      redirect: 'manual',
    })
    const location = response.headers.get('location')
    if (location) {
      // Extract the actual amazon.ca URL from the redirect
      const match = location.match(/btn_url=([^&]+)/)
      if (match) {
        return decodeURIComponent(match[1])
      }
      return location
    }
    return null
  } catch {
    return null
  }
}

/**
 * Replace Save.ca's affiliate tag with our own
 */
export function replaceAffiliateTag(url: string, newTag: string): string {
  return url.replace(/tag=[^&]+/, `tag=${newTag}`)
}

/**
 * Get article URLs from Save.ca's Steals & Deals section
 */
export async function getSaveCaArticleUrls(): Promise<string[]> {
  // This would use Playwright in a server action or API route
  // For now, return a static list of known article URLs
  return [
    'https://www.save.ca/community/the-techies-toolkit-smart-home-gadget-early-black-friday-deals/',
    'https://www.save.ca/community/everyday-products-on-sale-this-black-friday-that-you-actually-need/',
    'https://www.save.ca/community/this-pocket-size-printer-is-going-viral-and-its-on-black-friday-sale/',
    'https://www.save.ca/community/deal-alert-heres-how-to-get-the-512gb-macbook-air-m4-for-the-price-of-the-base-model/',
  ]
}

/**
 * Transform raw scraped data to our Deal format
 */
export function transformSaveCaDeal(deal: SaveCaDeal, affiliateTag?: string): SaveCaDeal {
  let affiliateUrl = deal.affiliateUrl

  // Replace affiliate tag if provided
  if (affiliateTag && affiliateUrl.includes('tag=')) {
    affiliateUrl = replaceAffiliateTag(affiliateUrl, affiliateTag)
  }

  return {
    ...deal,
    affiliateUrl,
  }
}

// Note: The actual Playwright scraping logic is in scripts/scrape-saveca.js
// This is because Playwright requires Node.js runtime and can't run in Edge/browser
// Use the script to generate saveca-deals.json, then import that data
