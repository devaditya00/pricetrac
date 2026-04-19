import { NextResponse, type NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/utils'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { id } = await params

  const { error: dbError } = await supabase
    .from('alerts')
    .delete()
    .eq('id', id)
    .eq('user_id', user!.id)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Alert deleted' })
}