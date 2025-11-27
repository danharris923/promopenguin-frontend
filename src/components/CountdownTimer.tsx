'use client'

import { useState, useEffect } from 'react'

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 })

  useEffect(() => {
    // Calculate time until next hour
    const calculateTimeLeft = () => {
      const now = new Date()
      const nextHour = new Date(now)
      nextHour.setHours(nextHour.getHours() + 1)
      nextHour.setMinutes(0)
      nextHour.setSeconds(0)
      nextHour.setMilliseconds(0)

      const diff = nextHour.getTime() - now.getTime()
      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)

      return { minutes, seconds }
    }

    // Set initial time
    setTimeLeft(calculateTimeLeft())

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <span>
      {pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
    </span>
  )
}
