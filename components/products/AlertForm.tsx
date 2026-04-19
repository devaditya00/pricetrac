'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

interface AlertFormProps {
  productId: string
  currentPrice: number
  existingAlert?: {
    id: string
    target_price: number
    alert_type: string
  } | null
}

export default function AlertForm({ productId, currentPrice, existingAlert }: AlertFormProps) {
  const [targetPrice, setTargetPrice] = useState(
    existingAlert?.target_price?.toString() || ''
  )
  const [alertType, setAlertType] = useState(existingAlert?.alert_type || 'push')
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const price = parseFloat(targetPrice)

    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price')
      return
    }

    if (price >= currentPrice) {
      toast.error('Target price must be lower than current price')
      return
    }

    setLoading(true)
    const toastId = toast.loading('Setting alert...')

    try {
      if (alertType === 'push' || alertType === 'both') {
        try {
          await requestPushPermission()
        } catch (pushErr) {
          console.log('Push setup failed — saving alert anyway:', pushErr)
        }
      }

      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          target_price: price,
          alert_type: alertType,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      toast.success(
        `Alert set for ₹${price.toLocaleString('en-IN')}`,
        { id: toastId }
      )
      queryClient.invalidateQueries({ queryKey: ['product', productId] })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(message, { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  async function requestPushPermission() {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') throw new Error('Permission denied')

    const registration = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

    const existingSubscription = await registration.pushManager.getSubscription()
    if (existingSubscription) await existingSubscription.unsubscribe()

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    })

    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription }),
    })
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  if (!currentPrice) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h3 className="text-sm font-medium text-gray-900 mb-1">Set price alert</h3>
      <p className="text-xs text-gray-400">
        Price data not available yet. Check back in a moment.
      </p>
    </div>
  )
}

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h3 className="text-sm font-medium text-gray-900 mb-1">Set price alert</h3>
      <p className="text-xs text-gray-400 mb-4">
        Get notified when price drops below your target
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">
           Target price (current: ₹{currentPrice ? currentPrice.toLocaleString('en-IN') : 'N/A'})
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
            <input
              type="number"
              value={targetPrice}
              onChange={e => setTargetPrice(e.target.value)}
              placeholder={currentPrice ? Math.round(currentPrice * 0.9).toString() : ''}
              required
              min={1}
              max={currentPrice ? currentPrice - 1 : undefined}
              className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Alert type</label>
          <select
            value={alertType}
            onChange={e => setAlertType(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="push">Browser notification</option>
            <option value="sms">SMS</option>
            <option value="both">Both</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Setting...' : existingAlert ? 'Update alert' : 'Set alert'}
        </button>
      </form>
    </div>
  )
}