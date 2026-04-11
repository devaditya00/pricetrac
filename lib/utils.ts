import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function getAuthUser() {
  const supabase = await createClient()
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