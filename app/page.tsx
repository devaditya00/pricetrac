import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">PriceTrac</h1>
        <p className="text-gray-500 mb-8">
          Track prices on Amazon, Flipkart and Myntra. Get notified when prices drop.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/signup"
            className="bg-blue-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-blue-700 transition"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="bg-white border border-gray-200 text-gray-700 rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-50 transition"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  )
}