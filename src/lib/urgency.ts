/**
 * Urgency & Scarcity Generator
 *
 * Generates psychological triggers for CTR optimization.
 * Uses deterministic randomness based on deal ID for consistency.
 */

import { UrgencyData } from '@/types/deal'

/**
 * Generate urgency data for a deal
 * Uses deal ID + current hour for semi-random but consistent values
 */
export function generateUrgencyData(dealId: string): UrgencyData {
  const seed = hashString(dealId + getHourSeed())

  // Viewer count: 50-350, changes hourly
  const viewerCount = 50 + (seed % 300)

  // Purchase count: based on "age" simulation
  const purchaseCount = 5 + (seed % 50)

  // Stock level: weighted towards medium/high
  const stockRoll = seed % 100
  let stockLevel: UrgencyData['stockLevel']
  let stockCount: number | undefined

  if (stockRoll < 10) {
    stockLevel = 'critical'
    stockCount = 1 + (seed % 3)
  } else if (stockRoll < 30) {
    stockLevel = 'low'
    stockCount = 3 + (seed % 7)
  } else if (stockRoll < 60) {
    stockLevel = 'medium'
    stockCount = undefined
  } else {
    stockLevel = 'high'
    stockCount = undefined
  }

  // Price drop flag (20% chance)
  const isPriceDrop = (seed % 5) === 0

  // Lowest ever flag (10% chance)
  const isLowestEver = (seed % 10) === 0

  return {
    viewerCount,
    purchaseCount,
    stockLevel,
    stockCount,
    isPriceDrop,
    isLowestEver,
  }
}

/**
 * Generate countdown timer data
 * Returns hours/minutes until "deal expires"
 */
export function generateCountdown(dealId: string): { hours: number; minutes: number } {
  const seed = hashString(dealId)

  // Deals "expire" in 2-48 hours
  const totalMinutes = 120 + (seed % (48 * 60 - 120))

  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  }
}

/**
 * Get urgency message based on data
 */
export function getUrgencyMessage(data: UrgencyData): string {
  const messages: string[] = []

  if (data.isLowestEver) {
    messages.push('🏆 LOWEST PRICE EVER')
  }

  if (data.isPriceDrop) {
    messages.push('📉 Price just dropped!')
  }

  if (data.stockLevel === 'critical') {
    messages.push(`⚠️ Only ${data.stockCount} left!`)
  } else if (data.stockLevel === 'low') {
    messages.push(`📦 Only ${data.stockCount} left at this price`)
  }

  return messages[0] || '🔥 Hot Deal'
}

/**
 * Get stock warning component props
 */
export function getStockWarning(data: UrgencyData): {
  show: boolean
  variant: 'warning' | 'critical'
  message: string
} | null {
  if (data.stockLevel === 'critical') {
    return {
      show: true,
      variant: 'critical',
      message: `⚠️ Only ${data.stockCount} left at this price - selling fast!`,
    }
  }

  if (data.stockLevel === 'low') {
    return {
      show: true,
      variant: 'warning',
      message: `📦 Limited stock - ${data.stockCount} available`,
    }
  }

  return null
}

/**
 * Get social proof text
 */
export function getSocialProof(data: UrgencyData): string {
  return `👁️ ${data.viewerCount} viewing • 🛒 ${data.purchaseCount} sold today`
}

/**
 * Format countdown for display
 */
export function formatCountdown(countdown: { hours: number; minutes: number }): string {
  if (countdown.hours < 1) {
    return `${countdown.minutes}m`
  }
  return `${countdown.hours}h ${countdown.minutes}m`
}

// =============================================================================
// HELPERS
// =============================================================================

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function getHourSeed(): string {
  // Changes every hour for "live" feel
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`
}
