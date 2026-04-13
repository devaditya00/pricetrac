// components/ui/SignalBadge.tsx
import { Signal } from '@/types'

interface SignalBadgeProps {
  signal: Signal | null
}

export default function SignalBadge({ signal }: SignalBadgeProps) {
  if (!signal) return null

  const config = {
    buy: {
      label: 'Buy now',
      className: 'bg-green-50 text-green-700 border border-green-200'
    },
    wait: {
      label: 'Wait',
      className: 'bg-yellow-50 text-yellow-700 border border-yellow-200'
    },
    hold: {
      label: 'Hold',
      className: 'bg-gray-50 text-gray-600 border border-gray-200'
    }
  }

  const { label, className } = config[signal]

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>
      {label}
    </span>
  )
}