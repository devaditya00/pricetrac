import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { corsHeaders, handleOptions } from '@/lib/cors'

export async function OPTIONS() {
  return handleOptions()
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password required' },
      { status: 400, headers: corsHeaders() }
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.session) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401, headers: corsHeaders() }
    )
  }

  return NextResponse.json({
    token: data.session.access_token,
    user: {
      id: data.user.id,
      email: data.user.email,
    }
  }, { headers: corsHeaders() })
}