'use client'

import { useState, useCallback } from 'react'
import { getDealAffiliateUrl } from '@/lib/affiliates'
import type {
  AffiliateClickProps,
  AffiliateClickResult,
  UseAffiliateClickReturn
} from '@/types/affiliate.types'

/**
 * Custom hook for smart affiliate click handling
 * Implements the one-click experience with affiliate routing
 */
export default function useAffiliateClick(): UseAffiliateClickReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getAffiliateUrl = useCallback(async (props: AffiliateClickProps): Promise<AffiliateClickResult> => {
    const { title, storeSlug, existingAffiliateUrl } = props

    try {
      // Use existing affiliate system logic
      const affiliateUrl = getDealAffiliateUrl(existingAffiliateUrl, storeSlug || null, title)

      if (affiliateUrl) {
        // Determine the network type for analytics
        let network: AffiliateClickResult['network'] = 'direct'

        if (affiliateUrl.includes('shopstyle.it')) {
          network = 'shopstyle'
        } else if (affiliateUrl.includes('linksynergy.com')) {
          network = 'rakuten'
        } else if (affiliateUrl.includes('amazon.ca') || affiliateUrl.includes('amazon.com')) {
          network = 'amazon'
        }

        return {
          url: affiliateUrl,
          isAffiliate: network !== 'direct',
          network
        }
      }

      return {
        url: null,
        isAffiliate: false,
        error: 'No affiliate link available'
      }
    } catch (err) {
      return {
        url: null,
        isAffiliate: false,
        error: err instanceof Error ? err.message : 'Failed to get affiliate link'
      }
    }
  }, [])

  const handleClick = useCallback(async (props: AffiliateClickProps): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getAffiliateUrl(props)

      if (result.url) {
        // Track the click for analytics
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'affiliate_click', {
            event_category: 'affiliate',
            event_label: result.network || 'unknown',
            value: 1,
            deal_id: props.dealId,
            store: props.storeSlug,
            is_affiliate: result.isAffiliate
          })
        }

        // Open the affiliate link
        window.open(result.url, '_blank', 'noopener,noreferrer')
      } else {
        setError(result.error || 'No affiliate link available')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Click handling failed'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [getAffiliateUrl])

  return {
    handleClick,
    isLoading,
    error
  }
}
