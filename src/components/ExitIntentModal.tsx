"use client"

import { useEffect, useState, useCallback } from 'react'
import { toNumber, formatPrice } from '@/lib/price-utils'

interface ExitIntentModalProps {
  dealTitle?: string
  dealPrice?: number | string | null
}

export function ExitIntentModal({ dealTitle, dealPrice }: ExitIntentModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [hasShown, setHasShown] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const priceNum = toNumber(dealPrice)

  const handleExitIntent = useCallback((e: MouseEvent) => {
    // Only trigger when mouse moves to top of viewport (leaving page)
    if (e.clientY < 10 && !hasShown) {
      setIsOpen(true)
      setHasShown(true)
    }
  }, [hasShown])

  useEffect(() => {
    // Don't show on mobile (exit intent doesn't work well)
    if (typeof window === 'undefined' || window.innerWidth < 768) return

    // Don't show if already shown this session
    if (sessionStorage.getItem('exitIntentShown')) {
      setHasShown(true)
      return
    }

    // Wait a bit before enabling (don't trigger immediately)
    const timeout = setTimeout(() => {
      document.addEventListener('mouseout', handleExitIntent as any)
    }, 5000) // Wait 5 seconds

    return () => {
      clearTimeout(timeout)
      document.removeEventListener('mouseout', handleExitIntent as any)
    }
  }, [handleExitIntent])

  const handleClose = () => {
    setIsOpen(false)
    sessionStorage.setItem('exitIntentShown', 'true')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Integrate with email service (Mailchimp, ConvertKit, etc.)
    console.log('Email captured:', email)
    setIsSubmitted(true)
    setTimeout(() => {
      handleClose()
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="
          relative w-full max-w-md mx-4
          bg-white rounded-2xl shadow-2xl
          overflow-hidden
          animate-slide-up
        "
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-8 text-center">
          <div className="text-4xl mb-2">DEAL</div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Wait! Don't Miss Out
          </h2>
          <p className="text-white/90 text-sm">
            Get notified when prices drop even lower
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {isSubmitted ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">OK</div>
              <p className="text-gray-900 font-semibold">You're on the list!</p>
              <p className="text-gray-600 text-sm">
                We'll email you when we find better deals.
              </p>
            </div>
          ) : (
            <>
              {/* Deal reminder */}
              {dealTitle && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600">You were looking at:</p>
                  <p className="font-semibold text-gray-900 truncate">{dealTitle}</p>
                  {priceNum !== null && (
                    <p className="text-green-600 font-bold">${formatPrice(priceNum)}</p>
                  )}
                </div>
              )}

              {/* Value Props */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">Y</span>
                  <span>Instant price drop alerts</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">Y</span>
                  <span>Exclusive Canadian deals</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">Y</span>
                  <span>Unsubscribe anytime</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="
                    w-full px-4 py-3 rounded-xl
                    border border-gray-300
                    focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20
                    outline-none transition-all
                  "
                />
                <button
                  type="submit"
                  className="
                    w-full py-3 px-4 rounded-xl
                    bg-gradient-to-r from-orange-500 to-red-600
                    text-white font-bold
                    hover:from-orange-400 hover:to-red-500
                    transition-all
                  "
                >
                  GET DEAL ALERTS
                </button>
              </form>

              {/* Dismiss */}
              <button
                onClick={handleClose}
                className="w-full text-center text-sm text-gray-400 mt-3 hover:text-gray-600"
              >
                No thanks, I'll pay full price
              </button>

              {/* Social proof */}
              <p className="text-center text-xs text-gray-400 mt-4">
                Join 47,234 Canadian deal hunters
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
