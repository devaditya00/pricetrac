import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function getAuthUser(request?: NextRequest) {
  const supabase = await createClient()

  if (request) {
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const { data: { user }, error } = await adminClient.auth.getUser(token)
      if (error || !user) {
        return { user: null, supabase, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
      }
      return { user, supabase: adminClient, error: null }
    }
  }

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return { user: null, supabase, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { user, supabase, error: null }
}

export function detectPlatform(url: string): string | null {
  if (url.includes('amazon.in') || url.includes('amazon.com')) return 'amazon'
  if (url.includes('flipkart.com')) return 'flipkart'
  if (url.includes('myntra.com')) return 'myntra'
  return null
}