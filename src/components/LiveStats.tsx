'use client'

import { useState, useEffect } from 'react'

// Base values - roughly accurate
const BASE_DEALS = 480
const BASE_STORES = 52

// Fluctuation ranges
const DEAL_RANGE = 40  // +/- 40 deals
const STORE_RANGE = 3   // +/- 3 stores

export function LiveDealCount() {
  const [count, setCount] = useState(BASE_DEALS)

  useEffect(() => {
    // Set initial random value
    const getRandomCount = () => {
      const fluctuation = Math.floor(Math.random() * DEAL_RANGE * 2) - DEAL_RANGE
      return BASE_DEALS + fluctuation
    }

    setCount(getRandomCount())

    // Update every 90 seconds (1.5 minutes)
    const timer = setInterval(() => {
      setCount(getRandomCount())
    }, 90000)

    return () => clearInterval(timer)
  }, [])

  return <span>{count}+</span>
}

export function LiveStoreCount() {
  const [count, setCount] = useState(BASE_STORES)

  useEffect(() => {
    // Set initial random value
    const getRandomCount = () => {
      const fluctuation = Math.floor(Math.random() * STORE_RANGE * 2) - STORE_RANGE
      return BASE_STORES + fluctuation
    }

    setCount(getRandomCount())

    // Update every 2 minutes
    const timer = setInterval(() => {
      setCount(getRandomCount())
    }, 120000)

    return () => clearInterval(timer)
  }, [])

  return <span>{count}+</span>
}
