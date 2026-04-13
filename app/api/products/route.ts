import { NextResponse, type NextRequest } from 'next/server'
import { getAuthUser, detectPlatform } from '@/lib/utils'
import { scrapeAmazon } from '@/worker/scraper/amazon'
import { scrapeFlipkart } from '@/worker/scraper/flipkart'
import { scrapeMyntra } from '@/worker/scraper/myntra'
import { addScrapeJob } from '@/worker/queue/producer'
import { calculateSignal } from '@/lib/signal'


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

  const { data: product, error: dbError } = await supabase
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

  let scrapeResult
  if (platform === 'amazon') scrapeResult = await scrapeAmazon(url)
  else if (platform === 'flipkart') scrapeResult = await scrapeFlipkart(url)
  else scrapeResult = await scrapeMyntra(url)

  if (scrapeResult.success) {
  await supabase
    .from('price_history')
    .insert({
      product_id: product.id,
      price: scrapeResult.price,
    })

  const { data: priceHistory } = await supabase
  .from('price_history')
  .select('id, product_id, price, recorded_at')
  .eq('product_id', product.id)

  const signal = calculateSignal(
    scrapeResult.price!,
    scrapeResult.price!,
    priceHistory || []
  )

  await supabase
    .from('products')
    .update({
      name: scrapeResult.name,
      current_price: scrapeResult.price,
      image_url: scrapeResult.image_url,
      all_time_low: scrapeResult.price,
      all_time_high: scrapeResult.price,
      signal,
    })
    .eq('id', product.id)

  await addScrapeJob(product.id, url, platform)
}

  const { data: updatedProduct } = await supabase
    .from('products')
    .select('*')
    .eq('id', product.id)
    .single()

  return NextResponse.json({ product: updatedProduct }, { status: 201 })
}