'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, FormEvent } from 'react'
import { AFFILIATE_BRANDS } from '@/lib/affiliates'

interface SearchFormProps {
  initialQuery?: string
  compact?: boolean
}

// Static suggestions - stores, categories, popular searches
const STORES = [
  { name: 'Amazon', slug: 'amazon', emoji: '📦' },
  { name: 'Walmart', slug: 'walmart', emoji: '🛒' },
  { name: 'Costco', slug: 'costco', emoji: '🏬' },
  { name: 'Best Buy', slug: 'best-buy', emoji: '💻' },
  { name: 'Canadian Tire', slug: 'canadian-tire', emoji: '🔧' },
  { name: 'Shoppers Drug Mart', slug: 'shoppers', emoji: '💊' },
  { name: 'Loblaws', slug: 'loblaws', emoji: '🍎' },
  { name: 'No Frills', slug: 'no-frills', emoji: '🛒' },
  { name: 'Home Depot', slug: 'home-depot', emoji: '🏠' },
  { name: 'IKEA', slug: 'ikea', emoji: '🪑' },
  { name: 'The Brick', slug: 'the-brick', emoji: '🛋️' },
  { name: 'Staples', slug: 'staples', emoji: '📎' },
  { name: 'PetSmart', slug: 'petsmart', emoji: '🐕' },
  { name: 'Sport Chek', slug: 'sport-chek', emoji: '⚽' },
  { name: 'Lululemon', slug: 'lululemon', emoji: '🧘' },
  { name: 'Roots', slug: 'roots', emoji: '🍁' },
  { name: 'Aritzia', slug: 'aritzia', emoji: '✨' },
  { name: 'Sephora', slug: 'sephora', emoji: '💄' },
  { name: 'London Drugs', slug: 'london-drugs', emoji: '💊' },
  { name: 'Giant Tiger', slug: 'giant-tiger', emoji: '🐯' },
]

const CATEGORIES = [
  { name: 'Electronics', emoji: '📱' },
  { name: 'Fashion', emoji: '👗' },
  { name: 'Home', emoji: '🏠' },
  { name: 'Grocery', emoji: '🛒' },
  { name: 'Beauty', emoji: '💄' },
  { name: 'Sports', emoji: '⚽' },
  { name: 'Toys', emoji: '🧸' },
  { name: 'Automotive', emoji: '🚗' },
]

const POPULAR_SEARCHES = [
  'TV deals',
  'laptop',
  'air fryer',
  'Christmas gifts',
  'winter jacket',
  'headphones',
  'coffee maker',
  'gaming',
]

interface Suggestion {
  type: 'store' | 'category' | 'search' | 'affiliate'
  label: string
  emoji?: string
  slug?: string
}

export function SearchForm({ initialQuery = '', compact = false }: SearchFormProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Filter suggestions based on query
  useEffect(() => {
    if (query.length < 1) {
      setSuggestions([])
      return
    }

    const q = query.toLowerCase()
    const results: Suggestion[] = []

    // Match affiliate brands first (priority)
    AFFILIATE_BRANDS.forEach(brand => {
      if (brand.name.toLowerCase().includes(q) || brand.slug.includes(q)) {
        results.push({
          type: 'affiliate',
          label: brand.name,
          emoji: brand.emoji,
          slug: brand.slug,
        })
      }
    })

    // Match stores
    STORES.forEach(store => {
      if (
        (store.name.toLowerCase().includes(q) || store.slug.includes(q)) &&
        !results.some(r => r.slug === store.slug)
      ) {
        results.push({
          type: 'store',
          label: store.name,
          emoji: store.emoji,
          slug: store.slug,
        })
      }
    })

    // Match categories
    CATEGORIES.forEach(cat => {
      if (cat.name.toLowerCase().includes(q)) {
        results.push({
          type: 'category',
          label: cat.name,
          emoji: cat.emoji,
        })
      }
    })

    // Match popular searches
    POPULAR_SEARCHES.forEach(search => {
      if (search.toLowerCase().includes(q)) {
        results.push({
          type: 'search',
          label: search,
          emoji: '🔍',
        })
      }
    })

    setSuggestions(results.slice(0, 8))
    setSelectedIndex(-1)
  }, [query])

  // Close suggestions on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (query.trim().length >= 2) {
      setShowSuggestions(false)
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setShowSuggestions(false)
    if (suggestion.type === 'store' || suggestion.type === 'affiliate') {
      router.push(`/stores/${suggestion.slug}`)
    } else {
      router.push(`/search?q=${encodeURIComponent(suggestion.label)}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSuggestionClick(suggestions[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const renderSuggestions = () => {
    if (!showSuggestions || suggestions.length === 0) return null

    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
        {suggestions.map((suggestion, index) => (
          <button
            key={`${suggestion.type}-${suggestion.label}`}
            type="button"
            onClick={() => handleSuggestionClick(suggestion)}
            className={`w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-orange-50 transition-colors ${
              index === selectedIndex ? 'bg-orange-50' : ''
            }`}
          >
            <span className="text-lg">{suggestion.emoji}</span>
            <span className="flex-1 text-gray-900">{suggestion.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              suggestion.type === 'affiliate'
                ? 'bg-orange-100 text-orange-700'
                : suggestion.type === 'store'
                ? 'bg-blue-100 text-blue-700'
                : suggestion.type === 'category'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {suggestion.type === 'affiliate' ? 'Featured' : suggestion.type}
            </span>
          </button>
        ))}
      </div>
    )
  }

  if (compact) {
    return (
      <div ref={wrapperRef} className="relative">
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search deals..."
            className="
              w-full pl-9 pr-3 py-2
              bg-gray-100 rounded-lg
              text-sm text-gray-900
              placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white
              transition-all
            "
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </form>
        {renderSuggestions()}
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className="relative max-w-xl">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search for deals, stores, products..."
            className="
              w-full pl-10 pr-4 py-3
              bg-white border border-gray-300 rounded-xl
              text-gray-900
              placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
              transition-all
            "
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button
          type="submit"
          className="
            px-6 py-3 rounded-xl
            bg-orange-500 hover:bg-orange-600
            text-white font-semibold
            transition-colors
          "
        >
          Search
        </button>
      </form>
      {renderSuggestions()}
    </div>
  )
}
