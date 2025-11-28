'use client'

import { useState } from 'react'
import Image from 'next/image'

interface StoreLogoProps {
  src: string | null
  alt: string
  emoji: string
  size?: number
  className?: string
}

/**
 * Store logo with automatic emoji fallback.
 * Falls back to emoji if:
 * - src is null
 * - Image fails to load (404, network error, etc.)
 */
export function StoreLogo({ src, alt, emoji, size = 48, className = '' }: StoreLogoProps) {
  const [hasError, setHasError] = useState(false)

  // Show emoji if no src provided or if image failed to load
  if (!src || hasError) {
    return (
      <span
        className={`text-3xl ${className}`}
        role="img"
        aria-label={alt}
      >
        {emoji}
      </span>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      unoptimized
      onError={() => setHasError(true)}
    />
  )
}
