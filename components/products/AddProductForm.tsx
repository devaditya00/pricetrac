'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { addProduct } from '@/lib/api'
import { useProductStore } from '@/lib/store'

export default function AddProductForm() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const queryClient = useQueryClient()
  const setIsAddingProduct = useProductStore(s => s.setIsAddingProduct)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await addProduct(url)
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setUrl('')
      setIsAddingProduct(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
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
          required
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition whitespace-nowrap"
        >
          {loading ? 'Adding...' : 'Track'}
        </button>
      </form>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      {loading && (
        <p className="text-gray-400 text-xs mt-2">
          Fetching product details... this takes 20-30 seconds
        </p>
      )}
    </div>
  )
}