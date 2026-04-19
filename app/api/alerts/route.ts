// app/api/alerts/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/utils'

export async function GET() {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { data, error: dbError } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ alerts: data })
}

export async function POST(request: NextRequest) {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const body = await request.json()
  const { product_id, target_price, alert_type } = body

  if (!product_id || !target_price) {
    return NextResponse.json({ error: 'product_id and target_price required' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('alerts')
    .select('id')
    .eq('user_id', user!.id)
    .eq('product_id', product_id)
    .eq('is_triggered', false)
    .single()

  if (existing) {
    await supabase
      .from('alerts')
      .update({ target_price, alert_type: alert_type || 'push' })
      .eq('id', existing.id)

    return NextResponse.json({ message: 'Alert updated' })
  }

  const { data, error: dbError } = await supabase
    .from('alerts')
    .insert({
      user_id: user!.id,
      product_id,
      target_price,
      alert_type: alert_type || 'push',
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ alert: data }, { status: 201 })
}