import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductDetailClient from './ProductDetailClient'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const supabase = await createClient()
  const { id } = await params

  const { data: product } = await supabase
    .from('products')
    .select('name, current_price, platform')
    .eq('id', id)
    .single()

  if (!product) return { title: 'Product — PriceTrac' }

  return {
    title: `${product.name} — PriceTrac`,
    description: `Track price of ${product.name} on ${product.platform}. Current price: ₹${product.current_price?.toLocaleString('en-IN')}`,
  }
}


export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params

  return <ProductDetailClient id={id} />
}