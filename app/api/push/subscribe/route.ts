import { NextResponse, type NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const body = await request.json()
  const { subscription } = body

  if (!subscription) {
    return NextResponse.json({ error: 'Subscription required' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  if (existing) {
    await supabase
      .from('push_subscriptions')
      .update({ subscription })
      .eq('user_id', user!.id)
  } else {
    await supabase
      .from('push_subscriptions')
      .insert({ user_id: user!.id, subscription })
  }

  return NextResponse.json({ message: 'Subscription saved' })
}