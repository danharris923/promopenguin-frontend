/**
 * Price utilities for handling Postgres DECIMAL values.
 *
 * PostgreSQL DECIMAL type returns strings to JavaScript,
 * not numbers. These helpers safely convert them.
 */

/**
 * Convert a potentially string price to a number.
 * Handles Postgres DECIMAL which returns strings.
 */
export function toNumber(value: number | string | null | undefined): number | null {
  if (value == null) return null
  const num = Number(value)
  return isNaN(num) ? null : num
}

/**
 * Format a price value with 2 decimal places.
 * Safely handles string prices from Postgres DECIMAL.
 */
export function formatPrice(value: number | string | null | undefined): string {
  const num = toNumber(value)
  if (num === null) return '0.00'
  return num.toFixed(2)
}

/**
 * Calculate savings between original and current price.
 * Safely handles string prices from Postgres DECIMAL.
 */
export function calculateSavings(
  originalPrice: number | string | null | undefined,
  currentPrice: number | string | null | undefined
): string | null {
  const original = toNumber(originalPrice)
  const current = toNumber(currentPrice)

  if (original === null || current === null) return null

  const savings = original - current
  return savings > 0 ? savings.toFixed(2) : null
}
