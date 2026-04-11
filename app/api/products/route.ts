import { NextResponse, type NextRequest } from 'next/server'
import { getAuthUser, detectPlatform } from '@/lib/utils'

export async function GET() {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { data, error: dbError } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user!.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ products: data })
}

export async function POST(request: NextRequest) {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const body = await request.json()
  const { url } = body

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  const platform = detectPlatform(url)

  if (!platform) {
    return NextResponse.json(
      { error: 'Only Amazon, Flipkart and Myntra URLs are supported' },
      { status: 400 }
    )
  }

  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('user_id', user!.id)
    .eq('url', url)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'You are already tracking this product' }, { status: 409 })
  }

  const { data, error: dbError } = await supabase
    .from('products')
    .insert({
      user_id: user!.id,
      url,
      platform,
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ product: data }, { status: 201 })
}