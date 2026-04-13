import { NextResponse, type NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/utils'
import { calculateSignal, getSignalDetails } from '@/lib/signal'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { id } = await params

  const { data: product } = await supabase
    .from('products')
    .select('*, price_history(price, recorded_at)')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const signal = calculateSignal(
    product.current_price,
    product.all_time_low,
    product.price_history || []
  )

  const details = getSignalDetails(
    signal,
    product.current_price,
    product.all_time_low,
    product.all_time_high,
    product.price_history || []
  )

  return NextResponse.json({ signal, details })
}