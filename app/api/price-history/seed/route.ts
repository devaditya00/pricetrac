import { NextResponse, type NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const { supabase, error } = await getAuthUser(request)
  if (error) return error

  const body = await request.json()
  const { productId, basePrice } = body

  const records = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const randomVariation = Math.floor(Math.random() * 200) - 100
    records.push({
      product_id: productId,
      price: Math.max(basePrice + randomVariation, 100),
      recorded_at: date.toISOString(),
    })
  }

  const { error: dbError } = await supabase
    .from('price_history')
    .insert(records)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({
    message: `Inserted ${records.length} price history records`
  })
}