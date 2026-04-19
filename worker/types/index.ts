// types/index.ts
export type Platform = 'amazon' | 'flipkart' | 'myntra' | 'meesho'
export type Signal = 'buy' | 'wait' | 'hold'
export type AlertType = 'sms' | 'push' | 'both'

export interface Product {
  id: string
  user_id: string
  url: string
  platform: Platform
  name: string | null
  image_url: string | null
  current_price: number | null
  all_time_low: number | null
  all_time_high: number | null
  signal: Signal | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PriceHistory {
  id: string
  product_id: string
  price: number
  recorded_at: string
}

export interface Alert {
  id: string
  user_id: string
  product_id: string
  target_price: number
  alert_type: AlertType
  is_triggered: boolean
  triggered_at: string | null
  created_at: string
}

export interface ScrapeResult {
  name: string | null
  price: number | null
  image_url: string | null
  success: boolean
  error?: string
}
export interface ProductWithHistory extends Product {
  price_history: PriceHistory[]
}
export interface PushSubscription {
  id: string
  user_id: string
  subscription: object
  created_at: string
}