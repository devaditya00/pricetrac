import { NextResponse, type NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { id } = await params

  const { data, error: dbError } = await supabase
    .from('products')
    .select(`
      *,
      price_history (
        id,
        price,
        recorded_at
      )
    `)
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (dbError || !data) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json({ product: data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { id } = await params

  const { error: dbError } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id)
    .eq('user_id', user!.id)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Product removed successfully' })
}