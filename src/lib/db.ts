import { Pool } from 'pg'
import { Deal, Store, Category } from '@/types/deal'

/**
 * Database queries for deals, stores, and categories.
 * Uses pg driver for Prisma Postgres compatibility.
 */

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
})

// Helper to run queries
async function query<T>(queryText: string, values?: unknown[]): Promise<T[]> {
  try {
    const result = await pool.query(queryText, values)
    return result.rows as T[]
  } catch (error) {
    console.error('Query error:', error)
    throw error
  }
}

// Helper for single row queries
async function queryOne<T>(queryText: string, values?: unknown[]): Promise<T | null> {
  const rows = await query<T>(queryText, values)
  return rows[0] || null
}

// =============================================================================
// DEALS
// =============================================================================

export async function getDealBySlug(slug: string): Promise<Deal | null> {
  try {
    return await queryOne<Deal>(
      'SELECT * FROM deals WHERE slug = $1 AND is_active = TRUE LIMIT 1',
      [slug]
    )
  } catch (error) {
    console.error('Error fetching deal:', error)
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
    console.error('Error fetching deal:', error)
    return null
  }
}

export async function getDeals(options: {
  limit?: number
  offset?: number
  store?: string
  category?: string
  featured?: boolean
  orderBy?: 'date_added' | 'discount_percent' | 'price'
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

    queryText += ` ORDER BY ${orderBy} ${orderDir}`
    queryText += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`
    values.push(limit, offset)

    return await query<Deal>(queryText, values)
  } catch (error) {
    console.error('Error fetching deals:', error)
    return []
  }
}

export async function getFeaturedDeals(limit: number = 12): Promise<Deal[]> {
  try {
    return await query<Deal>(
      'SELECT * FROM deals WHERE is_active = TRUE AND featured = TRUE ORDER BY date_added DESC LIMIT $1',
      [limit]
    )
  } catch (error) {
    console.error('Error fetching featured deals:', error)
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
    console.error('Error fetching latest deals:', error)
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
    console.error('Error fetching store deals:', error)
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
    console.error('Error fetching category deals:', error)
    return []
  }
}

export async function getRelatedDeals(deal: Deal, limit: number = 6): Promise<Deal[]> {
  try {
    return await query<Deal>(
      `SELECT * FROM deals
       WHERE is_active = TRUE
         AND id != $1
         AND (store = $2 OR category = $3)
       ORDER BY
         CASE WHEN store = $2 THEN 0 ELSE 1 END,
         date_added DESC
       LIMIT $4`,
      [deal.id, deal.store, deal.category, limit]
    )
  } catch (error) {
    console.error('Error fetching related deals:', error)
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
    console.error('Error fetching deal slugs:', error)
    return []
  }
}

// =============================================================================
// STORES
// =============================================================================

export async function getStores(): Promise<Store[]> {
  try {
    return await query<Store>('SELECT * FROM stores ORDER BY deal_count DESC')
  } catch (error) {
    console.error('Error fetching stores:', error)
    return []
  }
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  try {
    return await queryOne<Store>(
      'SELECT * FROM stores WHERE slug = $1 LIMIT 1',
      [slug]
    )
  } catch (error) {
    console.error('Error fetching store:', error)
    return null
  }
}

// =============================================================================
// CATEGORIES
// =============================================================================

export async function getCategories(): Promise<Category[]> {
  try {
    return await query<Category>('SELECT * FROM categories ORDER BY deal_count DESC')
  } catch (error) {
    console.error('Error fetching categories:', error)
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
    console.error('Error fetching category:', error)
    return null
  }
}

// =============================================================================
// STATS
// =============================================================================

export async function getDealCount(): Promise<number> {
  try {
    const rows = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM deals WHERE is_active = TRUE'
    )
    return parseInt(rows[0]?.count || '0', 10)
  } catch (error) {
    console.error('Error getting deal count:', error)
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
    console.error('Error fetching store stats:', error)
    return []
  }
}
