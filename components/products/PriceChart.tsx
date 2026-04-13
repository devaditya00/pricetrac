'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { PriceHistory } from '@/types'

interface PriceChartProps {
  priceHistory: PriceHistory[]
}

export default function PriceChart({ priceHistory }: PriceChartProps) {
  const [days, setDays] = useState<30 | 60 | 90>(30)

  const now = new Date()

  const filtered = priceHistory
    .filter(p => {
      const date = new Date(p.recorded_at)
      const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      return diffDays <= days
    })
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .map(p => ({
      date: new Date(p.recorded_at).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      }),
      price: p.price,
    }))

  if (filtered.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center text-gray-400">
        <p className="text-sm">Not enough price history yet</p>
        <p className="text-xs mt-1">Check back after a few scrape cycles</p>
      </div>
    )
  }

  const prices = filtered.map(p => p.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const padding = (maxPrice - minPrice) * 0.1 || 100

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Price history</h3>
        <div className="flex gap-1">
          {([30, 60, 90] as const).map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`text-xs px-3 py-1 rounded-full transition ${
                days === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={filtered}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[minPrice - padding, maxPrice + padding]}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `₹${v.toLocaleString('en-IN')}`}
          />
           <Tooltip
                formatter={(value) => {
                    if (value === undefined || value === null) return ['N/A', 'Price']
                    return [`₹${Number(value).toLocaleString('en-IN')}`, 'Price'] as [string, string]
                }}
                labelStyle={{ fontSize: 12 }}
                contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #f0f0f0',
                    fontSize: 12,
                }}
                />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}