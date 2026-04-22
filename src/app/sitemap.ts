import { MetadataRoute } from 'next'
import { getAllDealSlugs } from '@/lib/db'
import { SITE_URL } from '@/lib/config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dealSlugs = await getAllDealSlugs()

  const now = new Date()

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
  ]

  const dealPages: MetadataRoute.Sitemap = dealSlugs.map(slug => ({
    url: `${SITE_URL}/deals/${slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...dealPages]
}
