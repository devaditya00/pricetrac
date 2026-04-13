import { NextResponse, type NextRequest } from 'next/server'
import { scrapeAmazon } from '@/worker/scraper/amazon'
import { scrapeFlipkart } from '@/worker/scraper/flipkart'
import { scrapeMyntra } from '@/worker/scraper/myntra'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { url, platform } = body

  if (!url || !platform) {
    return NextResponse.json({ error: 'url and platform required' }, { status: 400 })
  }

  if (platform === 'amazon') {
    const result = await scrapeAmazon(url)
    return NextResponse.json(result)
  }

  if (platform === 'flipkart') {
    const result = await scrapeFlipkart(url)
    return NextResponse.json(result)
  }

  if (platform === 'myntra') {
    const result = await scrapeMyntra(url)
    return NextResponse.json(result)
  }

  return NextResponse.json({ error: 'Platform not supported' }, { status: 400 })
}