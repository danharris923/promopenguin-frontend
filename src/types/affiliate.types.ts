/**
 * Type definitions for affiliate system
 */

export interface AffiliateClickProps {
  dealId?: string | number
  title: string
  storeSlug?: string | null
  existingAffiliateUrl?: string | null
  price?: number | string | null
}

export interface AffiliateClickResult {
  url: string | null
  isAffiliate: boolean
  network?: 'shopstyle' | 'rakuten' | 'amazon' | 'direct'
  error?: string
}

export interface UseAffiliateClickReturn {
  handleClick: (props: AffiliateClickProps) => Promise<void>
  isLoading: boolean
  error: string | null
}
