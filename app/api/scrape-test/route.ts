import { NextResponse, type NextRequest } from 'next/server'
import { scrapeFlipkart } from '@/worker/scraper/flipkart'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { url, platform } = body

  if (!url || !platform) {
    return NextResponse.json({ error: 'url and platform required' }, { status: 400 })
  }

  if (platform === 'flipkart') {
    const result = await scrapeFlipkart(url)
    return NextResponse.json(result)
  }

  return NextResponse.json({ error: 'Platform not supported in test' }, { status: 400 })
}