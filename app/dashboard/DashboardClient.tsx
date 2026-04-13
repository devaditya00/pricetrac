'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchProducts } from '@/lib/api'
import Navbar from '@/components/ui/Navbar'
import ProductCard from '@/components/products/ProductCard'
import AddProductForm from '@/components/products/AddProductForm'

export default function DashboardClient({ email }: { email: string }) {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar email={email} />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Products</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {products?.length ?? 0} products tracked
            </p>
          </div>
        </div>

        <AddProductForm />

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 h-28 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-600">
            Failed to load products. Please refresh.
          </div>
        )}

        {!isLoading && !error && products?.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-1">No products tracked yet</p>
            <p className="text-sm">Paste a product URL above to get started</p>
          </div>
        )}

        {!isLoading && !error && products && products.length > 0 && (
          <div className="space-y-3">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}