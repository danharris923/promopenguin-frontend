import { Pool } from 'pg'
import { Deal, Store, Category, StoreCardData } from '@/types/deal'

/**
 * Database queries for deals, stores, and categories.
 * Uses pg driver for Prisma Postgres compatibility.
 */

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
})

// Transform PostgreSQL row data to serializable format for React Server Components
// RSC is stricter than JSON.stringify - we need to ensure only primitives are passed
function transformRow<T>(row: Record<string, unknown>): T {
  const transformed: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(row)) {
    if (value === null || value === undefined) {
      // For JSONB array fields, return empty array instead of null
      if (key === 'badges' || key === 'top_categories') {
        transformed[key] = []
      } else {
        transformed[key] = null
      }
    } else if (value instanceof Date) {
      // Convert Date objects to ISO strings
      transformed[key] = value.toISOString()
    } else if (typeof value === 'object' && value !== null && 'toISOString' in value) {
      // Duck-type check for Date-like objects from different realms
      transformed[key] = (value as { toISOString: () => string }).toISOString()
    } else if (key === 'price' || key === 'original_price' || key === 'current_price') {
      // Convert DECIMAL strings to numbers
      transformed[key] = value !== null ? parseFloat(String(value)) : null
    } else if (key === 'discount_percent' || key === 'deal_count') {
      // Convert integer strings to numbers
      transformed[key] = value !== null ? parseInt(String(value), 10) : null
    } else if (key === 'badges' || key === 'top_categories') {
      // Handle JSONB array fields - pg driver may return as object, string, or array
      if (Array.isArray(value)) {
        transformed[key] = value
      } else if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value)
          transformed[key] = Array.isArray(parsed) ? parsed : []
        } catch {
          transformed[key] = []
        }
      } else {
        transformed[key] = []
      }
    } else if (key === 'is_canadian') {
      // Ensure boolean type
      transformed[key] = Boolean(value)
    } else if (typeof value === 'bigint') {
      // Convert BigInt to number (or string if too large)
      transformed[key] = Number(value)
    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      // Primitives pass through
      transformed[key] = value
    } else if (Buffer.isBuffer(value)) {
      // Convert Buffer to base64 string
      transformed[key] = value.toString('base64')
    } else {
      // For any other type, stringify it
      try {
        transformed[key] = JSON.parse(JSON.stringify(value))
      } catch {
        transformed[key] = String(value)
      }
    }
  }
  return transformed as T
}

// Helper to run queries
async function query<T>(queryText: string, values?: unknown[]): Promise<T[]> {
  try {
    const result = await pool.query(queryText, values)
    return result.rows.map(row => transformRow<T>(row))
  } catch (error) {
    // Error logged internally
    throw error
  }
}

// Helper for single row queries
async function queryOne<T>(queryText: string, values?: unknown[]): Promise<T | null> {
  const rows = await query<T>(queryText, values)
  return rows[0] || null
}

// =============================================================================
// DEALS (queries deals table)
// =============================================================================

export async function getDealBySlug(slug: string): Promise<Deal | null> {
  try {
    return await queryOne<Deal>(
      'SELECT * FROM deals WHERE slug = $1 AND is_active = TRUE LIMIT 1',
      [slug]
    )
  } catch (error) {
    console.error('getDealBySlug error:', error)
    return null
  }
}

export async function getDealById(id: string): Promise<Deal | null> {
  try {
    return await queryOne<Deal>(
      'SELECT * FROM deals WHERE id = $1 AND is_active = TRUE LIMIT 1',
      [id]
    )
  } catch (error) {
    console.error('getDealById error:', error)
    return null
  }
}

export async function getDeals(options: {
  limit?: number
  offset?: number
  store?: string
  category?: string
  featured?: boolean
  orderBy?: 'date_added' | 'discount_percent' | 'price' | 'random'
  orderDir?: 'ASC' | 'DESC'
} = {}): Promise<Deal[]> {
  const {
    limit = 20,
    offset = 0,
    store,
    category,
    featured,
    orderBy = 'date_added',
    orderDir = 'DESC'
  } = options

  try {
    const values: unknown[] = []
    let paramIndex = 1

    let queryText = 'SELECT * FROM deals WHERE is_active = TRUE'

    if (store) {
      queryText += ` AND store = $${paramIndex++}`
      values.push(store)
    }
    if (category) {
      queryText += ` AND category = $${paramIndex++}`
      values.push(category)
    }
    if (featured !== undefined) {
      queryText += ` AND featured = $${paramIndex++}`
      values.push(featured)
    }

    if (orderBy === 'random') {
      queryText += ' ORDER BY RANDOM()'
    } else {
      queryText += ` ORDER BY ${orderBy} ${orderDir}`
    }
    queryText += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`
    values.push(limit, offset)

    return await query<Deal>(queryText, values)
  } catch (error) {
    console.error('getDeals error:', error)
    return []
  }
}

export async function getFeaturedDeals(limit: number = 12, random: boolean = false): Promise<Deal[]> {
  try {
    const order = random ? 'RANDOM()' : 'date_added DESC'
    return await query<Deal>(
      `SELECT * FROM deals WHERE is_active = TRUE AND featured = TRUE ORDER BY ${order} LIMIT $1`,
      [limit]
    )
  } catch (error) {
    console.error('getFeaturedDeals error:', error)
    return []
  }
}

export async function getLatestDeals(limit: number = 20): Promise<Deal[]> {
  try {
    return await query<Deal>(
      'SELECT * FROM deals WHERE is_active = TRUE ORDER BY date_added DESC LIMIT $1',
      [limit]
    )
  } catch (error) {
    console.error('getLatestDeals error:', error)
    return []
  }
}

export async function getDealsByStore(store: string, limit: number = 50): Promise<Deal[]> {
  try {
    return await query<Deal>(
      'SELECT * FROM deals WHERE store = $1 AND is_active = TRUE ORDER BY date_added DESC LIMIT $2',
      [store, limit]
    )
  } catch (error) {
    console.error('getDealsByStore error:', error)
    return []
  }
}

export async function getDealsByCategory(category: string, limit: number = 50): Promise<Deal[]> {
  try {
    return await query<Deal>(
      'SELECT * FROM deals WHERE category = $1 AND is_active = TRUE ORDER BY date_added DESC LIMIT $2',
      [category, limit]
    )
  } catch (error) {
    console.error('getDealsByCategory error:', error)
    return []
  }
}

export async function getRelatedDeals(deal: Deal, limit: number = 6): Promise<Deal[]> {
  try {
    const titleWords = deal.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['sale', 'deal', 'save', 'off', 'free', 'get', 'now', 'today', 'only', 'with', 'from', 'this', 'that', 'your', 'more'].includes(w))
      .slice(0, 3)

    const keywordPattern = titleWords.length > 0 ? `%(${titleWords.join('|')})%` : null

    return await query<Deal>(
      `SELECT d.* FROM deals d
       LEFT JOIN stores s ON LOWER(d.store) = s.slug
       WHERE d.is_active = TRUE
         AND d.id != $1
         AND (d.store = $2 OR d.category = $3 ${keywordPattern ? `OR LOWER(d.title) SIMILAR TO $5` : ''})
       ORDER BY
         CASE WHEN s.affiliate_url IS NOT NULL THEN 0 ELSE 1 END,
         CASE WHEN d.store = $2 THEN 0 ELSE 1 END,
         ${keywordPattern ? `CASE WHEN LOWER(d.title) SIMILAR TO $5 THEN 0 ELSE 1 END,` : ''}
         d.date_added DESC
       LIMIT $4`,
      keywordPattern
        ? [deal.id, deal.store, deal.category, limit, keywordPattern]
        : [deal.id, deal.store, deal.category, limit]
    )
  } catch (error) {
    console.error('getRelatedDeals error:', error)
    return []
  }
}

export async function getAllDealSlugs(): Promise<string[]> {
  try {
    const rows = await query<{ slug: string }>(
      'SELECT slug FROM deals WHERE is_active = TRUE'
    )
    return rows.map(row => row.slug)
  } catch (error) {
    console.error('getAllDealSlugs error:', error)
    return []
  }
}

// =============================================================================
// STORES (queries stores table)
// =============================================================================

export async function getStores(): Promise<Store[]> {
  try {
    return await query<Store>(`
      SELECT
        id, name, slug, type, logo_url, website_url, affiliate_url,
        color, tagline, description, badges, top_categories,
        is_canadian, province, return_policy, loyalty_program_name,
        loyalty_program_desc, shipping_info, price_match_policy,
        affiliate_network, screenshot_url, deal_count
      FROM stores
      ORDER BY deal_count DESC
    `)
  } catch (error) {
    console.error('getStores error:', error)
    return []
  }
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  try {
    return await queryOne<Store>(
      `SELECT
        id, name, slug, type, logo_url, website_url, affiliate_url,
        color, tagline, description, badges, top_categories,
        is_canadian, province, return_policy, loyalty_program_name,
        loyalty_program_desc, shipping_info, price_match_policy,
        affiliate_network, screenshot_url, deal_count
      FROM stores
      WHERE slug = $1
      LIMIT 1`,
      [slug]
    )
  } catch (error) {
    console.error('getStoreBySlug error:', error)
    return null
  }
}

/**
 * Get minimal store data for deal cards - reduces payload size
 */
export async function getStoreForCard(slug: string): Promise<StoreCardData | null> {
  try {
    return await queryOne<StoreCardData>(
      `SELECT name, slug, logo_url, color, badges, return_policy, shipping_info
      FROM stores
      WHERE slug = $1
      LIMIT 1`,
      [slug]
    )
  } catch (error) {
    console.error('getStoreForCard error:', error)
    return null
  }
}

/**
 * Get Canadian brands - stores where type='brand' OR is_canadian=true
 */
export async function getCanadianBrands(): Promise<Store[]> {
  try {
    return await query<Store>(
      `SELECT
        id, name, slug, type, logo_url, website_url, affiliate_url,
        color, tagline, description, badges, top_categories,
        is_canadian, province, return_policy, loyalty_program_name,
        loyalty_program_desc, shipping_info, price_match_policy,
        affiliate_network, screenshot_url, deal_count
      FROM stores
      WHERE type = 'brand' OR is_canadian = TRUE
      ORDER BY deal_count DESC`
    )
  } catch (error) {
    console.error('getCanadianBrands error:', error)
    return []
  }
}

/**
 * Get all Canadian brand slugs for static params generation
 */
export async function getCanadianBrandSlugs(): Promise<string[]> {
  try {
    const rows = await query<{ slug: string }>(
      `SELECT slug FROM stores WHERE type = 'brand' OR is_canadian = TRUE`
    )
    return rows.map(row => row.slug)
  } catch (error) {
    console.error('getCanadianBrandSlugs error:', error)
    return []
  }
}

/**
 * Get related Canadian brands (same top_categories)
 */
export async function getRelatedCanadianBrands(brand: Store, limit: number = 6): Promise<Store[]> {
  try {
    const categories = brand.top_categories || []
    if (categories.length === 0) {
      return await query<Store>(
        `SELECT
          id, name, slug, type, logo_url, website_url, affiliate_url,
          color, tagline, description, badges, top_categories,
          is_canadian, province, return_policy, loyalty_program_name,
          loyalty_program_desc, shipping_info, price_match_policy,
          affiliate_network, screenshot_url, deal_count
        FROM stores
        WHERE (type = 'brand' OR is_canadian = TRUE)
          AND slug != $1
        ORDER BY deal_count DESC
        LIMIT $2`,
        [brand.slug, limit]
      )
    }

    return await query<Store>(
      `SELECT
        id, name, slug, type, logo_url, website_url, affiliate_url,
        color, tagline, description, badges, top_categories,
        is_canadian, province, return_policy, loyalty_program_name,
        loyalty_program_desc, shipping_info, price_match_policy,
        affiliate_network, screenshot_url, deal_count
      FROM stores
      WHERE (type = 'brand' OR is_canadian = TRUE)
        AND slug != $1
        AND top_categories && $2::text[]
      ORDER BY deal_count DESC
      LIMIT $3`,
      [brand.slug, categories, limit]
    )
  } catch (error) {
    console.error('getRelatedCanadianBrands error:', error)
    return []
  }
}

/**
 * Get Canadian brands by category
 */
export async function getCanadianBrandsByCategory(category: string): Promise<Store[]> {
  try {
    return await query<Store>(
      `SELECT
        id, name, slug, type, logo_url, website_url, affiliate_url,
        color, tagline, description, badges, top_categories,
        is_canadian, province, return_policy, loyalty_program_name,
        loyalty_program_desc, shipping_info, price_match_policy,
        affiliate_network, screenshot_url, deal_count
      FROM stores
      WHERE (type = 'brand' OR is_canadian = TRUE)
        AND $1 = ANY(top_categories)
      ORDER BY deal_count DESC`,
      [category]
    )
  } catch (error) {
    console.error('getCanadianBrandsByCategory error:', error)
    return []
  }
}

/**
 * Get unique categories from Canadian brands with counts
 */
export async function getCanadianBrandCategories(): Promise<{ name: string; slug: string; count: number }[]> {
  try {
    const rows = await query<{ category: string; count: string }>(
      `SELECT unnest(top_categories) as category, COUNT(*) as count
       FROM stores
       WHERE (type = 'brand' OR is_canadian = TRUE)
         AND top_categories IS NOT NULL
         AND array_length(top_categories, 1) > 0
       GROUP BY category
       ORDER BY count DESC`
    )
    return rows.map(row => ({
      name: row.category,
      slug: row.category.toLowerCase().replace(/\s+/g, '-'),
      count: parseInt(row.count, 10)
    }))
  } catch (error) {
    console.error('getCanadianBrandCategories error:', error)
    return []
  }
}

// =============================================================================
// CATEGORIES (queries categories table)
// =============================================================================

export async function getCategories(): Promise<Category[]> {
  try {
    return await query<Category>('SELECT * FROM categories ORDER BY deal_count DESC')
  } catch (error) {
    console.error('getCategories error:', error)
    return []
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    return await queryOne<Category>(
      'SELECT * FROM categories WHERE slug = $1 LIMIT 1',
      [slug]
    )
  } catch (error) {
    console.error('getCategoryBySlug error:', error)
    return null
  }
}

// =============================================================================
// STATS (queries deals table)
// =============================================================================

export async function getDealCount(): Promise<number> {
  try {
    const rows = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM deals WHERE is_active = TRUE'
    )
    return parseInt(rows[0]?.count || '0', 10)
  } catch (error) {
    console.error('getDealCount error:', error)
    return 0
  }
}

export async function getStoreStats(): Promise<{ store: string; count: number }[]> {
  try {
    const rows = await query<{ store: string; count: string }>(
      `SELECT store, COUNT(*) as count
       FROM deals
       WHERE is_active = TRUE AND store IS NOT NULL
       GROUP BY store
       ORDER BY count DESC`
    )
    return rows.map(row => ({ store: row.store, count: parseInt(row.count, 10) }))
  } catch (error) {
    console.error('getStoreStats error:', error)
    return []
  }
}

// =============================================================================
// SEARCH (queries deals/stores tables)
// =============================================================================

export async function searchDeals(searchQuery: string, limit: number = 50): Promise<Deal[]> {
  if (!searchQuery || searchQuery.trim().length < 2) return []

  try {
    const searchTerm = `%${searchQuery.trim().toLowerCase()}%`
    return await query<Deal>(
      `SELECT * FROM deals
       WHERE is_active = TRUE
       AND (LOWER(title) LIKE $1 OR LOWER(store) LIKE $1 OR LOWER(category) LIKE $1)
       ORDER BY featured DESC, date_added DESC
       LIMIT $2`,
      [searchTerm, limit]
    )
  } catch (error) {
    console.error('searchDeals error:', error)
    return []
  }
}

/**
 * Search stores by keyword - returns stores that sell products matching the search term
 * Prioritizes affiliated stores (has affiliate_url)
 */
export async function searchStoresByKeyword(searchQuery: string, limit: number = 12): Promise<Store[]> {
  if (!searchQuery || searchQuery.trim().length < 2) return []

  try {
    const searchTerm = searchQuery.trim().toLowerCase()
    return await query<Store>(
      `SELECT
        id, name, slug, type, logo_url, website_url, affiliate_url,
        color, tagline, description, badges, top_categories,
        is_canadian, province, return_policy, loyalty_program_name,
        loyalty_program_desc, shipping_info, price_match_policy,
        affiliate_network, screenshot_url, deal_count, keywords
      FROM stores
      WHERE $1 = ANY(keywords)
         OR LOWER(name) LIKE $2
         OR LOWER(tagline) LIKE $2
      ORDER BY
        CASE WHEN affiliate_url IS NOT NULL THEN 0 ELSE 1 END,
        CASE WHEN $1 = ANY(keywords) THEN 0 ELSE 1 END,
        deal_count DESC
      LIMIT $3`,
      [searchTerm, `%${searchTerm}%`, limit]
    )
  } catch (error) {
    console.error('searchStoresByKeyword error:', error)
    return []
  }
}

// =============================================================================
// ADMIN FUNCTIONS (queries stores table)
// =============================================================================

export async function getAllStoresAdmin(): Promise<Store[]> {
  try {
    return await query<Store>(
      `SELECT
        id, name, slug, type, logo_url, website_url, affiliate_url,
        color, tagline, description, badges, top_categories,
        is_canadian, province, return_policy, loyalty_program_name,
        loyalty_program_desc, shipping_info, price_match_policy,
        affiliate_network, screenshot_url, deal_count
      FROM stores
      ORDER BY name ASC`
    )
  } catch (error) {
    console.error('getAllStoresAdmin error:', error)
    return []
  }
}

export async function updateStoreAffiliateUrl(id: number, affiliateUrl: string | null): Promise<boolean> {
  try {
    await query(
      'UPDATE stores SET affiliate_url = $1 WHERE id = $2',
      [affiliateUrl, id]
    )
    return true
  } catch (error) {
    console.error('updateStoreAffiliateUrl error:', error)
    return false
  }
}

export async function updateStoreUrls(
  id: number,
  websiteUrl: string | null,
  affiliateUrl: string | null
): Promise<boolean> {
  try {
    await query(
      'UPDATE stores SET website_url = $1, affiliate_url = $2 WHERE id = $3',
      [websiteUrl, affiliateUrl, id]
    )
    return true
  } catch (error) {
    console.error('updateStoreUrls error:', error)
    return false
  }
}

export async function addStore(
  name: string,
  slug: string,
  websiteUrl: string | null,
  affiliateUrl: string | null
): Promise<boolean> {
  try {
    await query(
      'INSERT INTO stores (name, slug, website_url, affiliate_url, deal_count) VALUES ($1, $2, $3, $4, 0)',
      [name, slug, websiteUrl, affiliateUrl]
    )
    return true
  } catch (error) {
    console.error('addStore error:', error)
    return false
  }
}

export async function checkStoreSlugExists(slug: string): Promise<boolean> {
  try {
    const rows = await query<{ id: number }>(
      'SELECT id FROM stores WHERE slug = $1',
      [slug]
    )
    return rows.length > 0
  } catch (error) {
    console.error('checkStoreSlugExists error:', error)
    return false
  }
}
