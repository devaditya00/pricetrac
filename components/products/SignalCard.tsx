import { Signal } from '@/types'

interface SignalCardProps {
  signal: Signal | null
  label: string
  reason: string
  confidence: 'high' | 'medium' | 'low'
  currentPrice: number
  allTimeLow: number
  allTimeHigh: number
}

export default function SignalCard({
  signal,
  label,
  reason,
  confidence,
  currentPrice,
  allTimeLow,
  allTimeHigh,
}: SignalCardProps) {
  const config = {
    buy: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      badge: 'bg-green-100 text-green-700',
    },
    wait: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      badge: 'bg-yellow-100 text-yellow-700',
    },
    hold: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
      badge: 'bg-gray-100 text-gray-600',
    },
  }

  const colors = signal ? config[signal] : config.hold

  const confidenceLabel = {
    high: 'High confidence',
    medium: 'Medium confidence',
    low: 'Low confidence',
  }

  return (
    <div className={`rounded-2xl border p-5 ${colors.bg} ${colors.border}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-lg font-bold ${colors.text}`}>{label}</h3>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${colors.badge}`}>
          {confidenceLabel[confidence]}
        </span>
      </div>

      <p className={`text-sm ${colors.text} mb-4`}>{reason}</p>

      <div className="grid grid-cols-3 gap-3">
  <div className="bg-white rounded-xl p-3 text-center">
    <p className="text-xs text-gray-400 mb-1">Current</p>
    <p className="text-sm font-bold text-gray-900">
      {currentPrice ? `₹${currentPrice.toLocaleString('en-IN')}` : 'N/A'}
    </p>
  </div>
  <div className="bg-white rounded-xl p-3 text-center">
    <p className="text-xs text-gray-400 mb-1">All time low</p>
    <p className="text-sm font-bold text-green-600">
      {allTimeLow ? `₹${allTimeLow.toLocaleString('en-IN')}` : 'N/A'}
    </p>
  </div>
  <div className="bg-white rounded-xl p-3 text-center">
    <p className="text-xs text-gray-400 mb-1">All time high</p>
    <p className="text-sm font-bold text-red-500">
      {allTimeHigh ? `₹${allTimeHigh.toLocaleString('en-IN')}` : 'N/A'}
    </p>
  </div>
</div>
    </div>
  )
}