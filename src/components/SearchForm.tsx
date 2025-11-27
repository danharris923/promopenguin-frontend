'use client'

import { useRouter } from 'next/navigation'
import { useState, FormEvent } from 'react'

interface SearchFormProps {
  initialQuery?: string
  compact?: boolean
}

export function SearchForm({ initialQuery = '', compact = false }: SearchFormProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (query.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
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
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-xl">
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
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
  )
}
