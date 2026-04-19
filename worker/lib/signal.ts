import { PriceHistory, Signal } from '../types'

export function calculateSignal(
  currentPrice: number,
  allTimeLow: number,
  priceHistory: PriceHistory[]
): Signal {
  if (priceHistory.length === 0) return 'hold'

  const now = new Date()

  const history90 = priceHistory.filter(p => {
    const date = new Date(p.recorded_at)
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 90
  })

  const history7 = priceHistory.filter(p => {
    const date = new Date(p.recorded_at)
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  })

  const avg90 = history90.length > 0
    ? history90.reduce((sum, p) => sum + p.price, 0) / history90.length
    : currentPrice

  const distanceFromLow = ((currentPrice - allTimeLow) / allTimeLow) * 100

  const avg7 = history7.length > 1
    ? history7.reduce((sum, p) => sum + p.price, 0) / history7.length
    : currentPrice

  const recentTrend = ((currentPrice - avg7) / avg7) * 100

  const belowAvg90 = ((avg90 - currentPrice) / avg90) * 100

  if (distanceFromLow <= 5) return 'buy'
  if (belowAvg90 >= 15) return 'buy'
  if (recentTrend <= -10) return 'wait'

  return 'hold'
}

export function getSignalDetails(
  signal: Signal,
  currentPrice: number,
  allTimeLow: number,
  allTimeHigh: number,
  priceHistory: PriceHistory[]
): {
  label: string
  reason: string
  confidence: 'high' | 'medium' | 'low'
} {
  const now = new Date()

  const history90 = priceHistory.filter(p => {
    const date = new Date(p.recorded_at)
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 90
  })

  const avg90 = history90.length > 0
    ? history90.reduce((sum, p) => sum + p.price, 0) / history90.length
    : currentPrice

  const distanceFromLow = ((currentPrice - allTimeLow) / allTimeLow) * 100
  const distanceFromHigh = ((allTimeHigh - currentPrice) / allTimeHigh) * 100
  const belowAvg90 = ((avg90 - currentPrice) / avg90) * 100

  if (signal === 'buy') {
    if (distanceFromLow <= 5) {
      return {
        label: 'Great time to buy',
        reason: `Price is within ${distanceFromLow.toFixed(1)}% of all time low of ₹${allTimeLow}`,
        confidence: 'high'
      }
    }
    return {
      label: 'Good time to buy',
      reason: `Price is ${belowAvg90.toFixed(1)}% below 90 day average`,
      confidence: 'medium'
    }
  }

  if (signal === 'wait') {
    return {
      label: 'Wait for lower price',
      reason: 'Price has been dropping recently — it may go lower',
      confidence: 'medium'
    }
  }

  return {
    label: 'Hold off for now',
    reason: `Price is ${distanceFromHigh.toFixed(1)}% below all time high of ₹${allTimeHigh}`,
    confidence: 'low'
  }
}