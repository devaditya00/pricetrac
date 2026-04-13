'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { fetchProductWithHistory } from '@/lib/api'
import { calculateSignal, getSignalDetails } from '@/lib/signal'
import Navbar from '@/components/ui/Navbar'
import SignalCard from '@/components/products/SignalCard'
import PriceChart from '@/components/products/PriceChart'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function ProductDetailClient({ id }: { id: string }) {
  const [email, setEmail] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email || '')
    })
  }, [])

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductWithHistory(id),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar email={email} />
        <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />
          ))}
        </main>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar email={email} />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-600">
            Product not found.{' '}
            <Link href="/dashboard" className="underline">
              Go back
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const signal = calculateSignal(
    product.current_price!,
    product.all_time_low!,
    product.price_history || []
  )

  const signalDetails = getSignalDetails(
    signal,
    product.current_price!,
    product.all_time_low!,
    product.all_time_high!,
    product.price_history || []
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar email={email} />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="text-sm text-gray-400 hover:text-gray-600 transition"
          >
            ← Back
          </Link>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex gap-4">
            {product.image_url && (
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                <img
                  src={product.image_url}
                  alt={product.name || 'Product'}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 leading-snug">
                {product.name}
              </p>

              <p className="text-xs text-gray-400 mt-1 capitalize">
                {product.platform}
              </p>

              {/* ✅ FIXED LINK */}
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline mt-1 block"
              >
                View on {product.platform} →
              </a>
            </div>
          </div>
        </div>

        <SignalCard
          signal={signal}
          label={signalDetails.label}
          reason={signalDetails.reason}
          confidence={signalDetails.confidence}
          currentPrice={product.current_price!}
          allTimeLow={product.all_time_low!}
          allTimeHigh={product.all_time_high!}
        />

        <PriceChart priceHistory={product.price_history || []} />

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Product details
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Platform</span>
              <span className="text-gray-900 capitalize">
                {product.platform}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Current price</span>
              <span className="text-gray-900 font-medium">
                ₹{product.current_price?.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">All time low</span>
              <span className="text-green-600 font-medium">
                ₹{product.all_time_low?.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">All time high</span>
              <span className="text-red-500 font-medium">
                ₹{product.all_time_high?.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Tracking since</span>
              <span className="text-gray-900">
                {new Date(product.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">
                Price history entries
              </span>
              <span className="text-gray-900">
                {product.price_history?.length ?? 0}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}