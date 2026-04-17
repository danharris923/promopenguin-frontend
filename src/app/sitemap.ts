import { MetadataRoute } from 'next'
import { getAllDealSlugs, getStores } from '@/lib/db'
import { SITE_URL } from '@/lib/config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [dealSlugs, stores] = await Promise.all([
    getAllDealSlugs(),
    getStores(),
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

  return [...staticPages, ...dealPages, ...storePages]
}
