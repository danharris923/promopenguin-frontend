'use client'

import { useEffect, useState } from 'react'

interface UrgencyBannerProps {
  hours: number
  minutes: number
  viewerCount: number
}

export function UrgencyBanner({ hours, minutes, viewerCount }: UrgencyBannerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours, minutes, seconds: 0 })

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev

        seconds--
        if (seconds < 0) {
          seconds = 59
          minutes--
        }
        if (minutes < 0) {
          minutes = 59
          hours--
        }
        if (hours < 0) {
          hours = 0
          minutes = 0
          seconds = 0
        }

        return { hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const isUrgent = timeLeft.hours < 2

  return (
    <div className={`
      w-full py-2.5 px-4
      bg-gradient-to-r from-red-600 via-red-500 to-orange-500
      text-white text-center
      ${isUrgent ? 'animate-pulse' : ''}
    `}>
      <div className="flex items-center justify-center gap-2 text-sm font-bold">
        <span className="text-lg">⚡</span>
        <span>
          {isUrgent ? 'ENDING SOON' : 'LIMITED TIME'} |
        </span>
        <span className="font-mono bg-black/20 px-2 py-0.5 rounded">
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span className="hidden sm:inline">|</span>
        <span className="hidden sm:inline">
          {viewerCount} Canadians viewing
        </span>
      </div>
    </div>
  )
}
