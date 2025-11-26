import { MetadataRoute } from 'next'
import { getAllDealSlugs, getStores, getCategories } from '@/lib/db'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://promopenguin.ca'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [dealSlugs, stores, categories] = await Promise.all([
    getAllDealSlugs(),
    getStores(),
    getCategories(),
  ])

  const now = new Date()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/deals`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/stores`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/category`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/deals/today`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
  ]

  // Deal pages
  const dealPages: MetadataRoute.Sitemap = dealSlugs.map(slug => ({
    url: `${SITE_URL}/deals/${slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // Store pages
  const storePages: MetadataRoute.Sitemap = stores.map(store => ({
    url: `${SITE_URL}/stores/${store.slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${SITE_URL}/category/${cat.slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...dealPages, ...storePages, ...categoryPages]
}
