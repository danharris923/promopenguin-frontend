import { Deal, DealCardProps } from '@/types/deal'

/** Convert a Deal (DB row) to DealCardProps — safe to call from server components */
export function dealToCardProps(deal: Deal): DealCardProps {
  return {
    id: deal.id,
    title: deal.title,
    slug: deal.slug,
    imageUrl: deal.image_blob_url || deal.image_url || '',
    price: deal.price,
    originalPrice: deal.original_price,
    discountPercent: deal.discount_percent,
    store: deal.store || 'Unknown',
    affiliateUrl: deal.affiliate_url,
    featured: deal.featured,
  }
}
