'use client'

import Link from 'next/link'
import { Product } from '@/types'
import SignalBadge from '@/components/ui/SignalBadge'
import { useQueryClient } from '@tanstack/react-query'
import { deleteProduct } from '@/lib/api'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const queryClient = useQueryClient()

  async function handleDelete() {
    if (!confirm('Stop tracking this product?')) return
    await deleteProduct(product.id)
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 hover:shadow-sm transition">
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name || 'Product'}
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
            No image
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/products/${product.id}`}>
            <p className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600 transition">
              {product.name || 'Loading product details...'}
            </p>
          </Link>
          <SignalBadge signal={product.signal} />
        </div>

        <div className="mt-2 flex items-center gap-3">
          {product.current_price ? (
            <span className="text-lg font-bold text-gray-900">
              ₹{product.current_price.toLocaleString('en-IN')}
            </span>
          ) : (
            <span className="text-sm text-gray-400">Fetching price...</span>
          )}

          {product.all_time_low && product.current_price && (
            <span className="text-xs text-gray-400">
              Low: ₹{product.all_time_low.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-400 capitalize">{product.platform}</span>
          <button
            onClick={handleDelete}
            className="text-xs text-gray-400 hover:text-red-500 transition"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}