'use client'

import { useEffect, useState } from 'react'

interface SocialProofBannerProps {
  viewerCount: number
  purchaseCount: number
}

export function SocialProofBanner({ viewerCount, purchaseCount }: SocialProofBannerProps) {
  // Simulate live activity - viewer count fluctuates slightly
  const [currentViewers, setCurrentViewers] = useState(viewerCount)
  const [recentPurchase, setRecentPurchase] = useState(false)

  useEffect(() => {
    // Fluctuate viewers every 3-8 seconds
    const viewerInterval = setInterval(() => {
      setCurrentViewers(prev => {
        const change = Math.floor(Math.random() * 11) - 5 // -5 to +5
        return Math.max(20, prev + change)
      })
    }, 3000 + Math.random() * 5000)

    // Flash "just purchased" occasionally
    const purchaseInterval = setInterval(() => {
      setRecentPurchase(true)
      setTimeout(() => setRecentPurchase(false), 3000)
    }, 15000 + Math.random() * 30000)

    return () => {
      clearInterval(viewerInterval)
      clearInterval(purchaseInterval)
    }
  }, [])

  return (
    <div className="w-full py-2 px-4 bg-slate-100 border-b border-slate-200">
      <div className="flex items-center justify-center gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-slate-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium">{currentViewers}</span> viewing now
        </span>

        <span className="text-slate-400">•</span>

        <span className={`
          text-slate-700 font-medium
          transition-all duration-300
          ${recentPurchase ? 'text-emerald-600 scale-110' : ''}
        `}>
          🛒 {purchaseCount} sold today
          {recentPurchase && (
            <span className="ml-1 text-emerald-600 animate-bounce inline-block">
              +1
            </span>
          )}
        </span>
      </div>
    </div>
  )
}
