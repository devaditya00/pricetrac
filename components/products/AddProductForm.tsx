'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { addProduct } from '@/lib/api'
import toast from 'react-hot-toast'

export default function AddProductForm() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    const isValidUrl = url.includes('amazon.in') ||
      url.includes('amazon.com') ||
      url.includes('flipkart.com') ||
      url.includes('myntra.com')

    if (!isValidUrl) {
      toast.error('Only Amazon, Flipkart and Myntra URLs supported')
      return
    }

    setLoading(true)

    const toastId = toast.loading('Fetching product details... (20-30 seconds)')

    try {
      await addProduct(url)
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setUrl('')
      toast.success('Product added successfully!', { id: toastId })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(message, { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6">
      <h2 className="text-sm font-medium text-gray-900 mb-3">Track a new product</h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Paste Amazon, Flipkart or Myntra URL..."
          disabled={loading}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition whitespace-nowrap"
        >
          {loading ? 'Adding...' : 'Track'}
        </button>
      </form>
    </div>
  )
}