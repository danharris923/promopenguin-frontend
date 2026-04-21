'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface DealFeedFiltersProps {
  categories: string[]
  currentCategory?: string
  currentMinDiscount?: number
}

export function DealFeedFilters({
  categories,
  currentCategory,
  currentMinDiscount,
}: DealFeedFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '' || value === 'all') params.delete(key)
    else params.set(key, value)
    router.push(`/daily?${params.toString()}`)
  }

  const discount = currentMinDiscount ?? 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor="feed-category"
          className="text-sm text-gray-700 font-semibold"
        >
          Category:
        </label>
        <select
          id="feed-category"
          value={currentCategory ?? 'all'}
          onChange={(e) => updateParam('category', e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 max-w-md">
        <label
          htmlFor="feed-min-discount"
          className="text-sm text-gray-700 font-semibold whitespace-nowrap"
        >
          Minimum discount:
        </label>
        <input
          id="feed-min-discount"
          type="range"
          min={0}
          max={90}
          step={5}
          value={discount}
          onChange={(e) => updateParam('minDiscount', e.target.value || null)}
          className="flex-1 accent-brand-blue"
          aria-valuemin={0}
          aria-valuemax={90}
          aria-valuenow={discount}
        />
        <span className="text-sm font-bold text-brand-navy w-10 tabular-nums">
          {discount}%
        </span>
      </div>
    </div>
  )
}
