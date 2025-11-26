const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

const schema = `
-- Deals table
CREATE TABLE IF NOT EXISTS deals (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    image_url TEXT,
    image_blob_url TEXT,
    price DECIMAL(10,2),
    original_price DECIMAL(10,2),
    discount_percent INT,
    store VARCHAR(100),
    category VARCHAR(100),
    description TEXT,
    affiliate_url TEXT NOT NULL,
    source_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    date_added TIMESTAMP DEFAULT NOW(),
    date_updated TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    affiliate_url TEXT,
    deal_count INT DEFAULT 0
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    deal_count INT DEFAULT 0
);

-- Scrape logs table
CREATE TABLE IF NOT EXISTS scrape_logs (
    id SERIAL PRIMARY KEY,
    scraper VARCHAR(50),
    feed_url TEXT,
    deals_found INT,
    deals_new INT,
    deals_updated INT,
    errors TEXT,
    duration_seconds INT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deals_store ON deals(store);
CREATE INDEX IF NOT EXISTS idx_deals_category ON deals(category);
CREATE INDEX IF NOT EXISTS idx_deals_date ON deals(date_added DESC);
CREATE INDEX IF NOT EXISTS idx_deals_active ON deals(is_active);
CREATE INDEX IF NOT EXISTS idx_deals_slug ON deals(slug);

-- Seed some initial data for testing
INSERT INTO stores (name, slug, deal_count) VALUES
    ('Amazon.ca', 'amazon', 0),
    ('Walmart Canada', 'walmart', 0),
    ('Best Buy', 'best-buy', 0),
    ('Canadian Tire', 'canadian-tire', 0),
    ('Costco', 'costco', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, deal_count) VALUES
    ('Electronics', 'electronics', 0),
    ('Fashion', 'fashion', 0),
    ('Home', 'home', 0),
    ('Grocery', 'grocery', 0),
    ('Sports', 'sports', 0)
ON CONFLICT (slug) DO NOTHING;
`;

async function initDb() {
  console.log('Initializing database schema...');
  try {
    await pool.query(schema);
    console.log('Schema created successfully!');
    
    // Verify tables exist
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables:', result.rows.map(r => r.table_name).join(', '));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

initDb();
