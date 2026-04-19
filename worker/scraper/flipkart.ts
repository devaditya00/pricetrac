import axios from 'axios'
import * as cheerio from 'cheerio'
import { ScrapeResult } from '@/types'

export async function scrapeFlipkart(url: string): Promise<ScrapeResult> {
  try {
    const response = await axios.get('http://api.scraperapi.com', {
      params: {
        api_key: process.env.SCRAPER_API_KEY,
        url: url,
        render: 'true',
        country_code: 'in',
      },
      timeout: 60000,
    })

    const $ = cheerio.load(response.data)

    const priceMatch = response.data.match(/₹\s?[\d,]+/g)
    console.log('PRICE MATCHES:', priceMatch?.slice(0, 5))

    const name = $('span.VU-ZEz').first().text().trim() ||
      $('span.B_NuCI').first().text().trim() ||
      $('h1').first().text().trim() ||
      null

    const price = extractPriceFromHTML(response.data)

    const rawImage = $('img[src*="rukminim"][src*="/image/"]').first().attr('src') ||
      $('img[src*="rukminim"]').first().attr('src') ||
      null

    const image_url = rawImage
      ? rawImage.replace('/image/280/370/', '/image/832/832/')
      : null

    if (!name && !price) {
      return {
        success: false,
        name: null,
        price: null,
        image_url: null,
        error: 'Could not extract product data'
      }
    }

    return { success: true, name, price, image_url }

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred'
    return {
      success: false,
      name: null,
      price: null,
      image_url: null,
      error: message
    }
  }
}

function extractPriceFromHTML(html: string): number | null {
  const buyAtMatch = html.match(/Buy at ₹\s?[\d,]+/)

  if (buyAtMatch) {
    const price = parseInt(buyAtMatch[0].replace(/[^0-9]/g, ''))
    if (!isNaN(price)) return price
  }

  const matches = html.match(/₹\s?[\d,]+/g) || []

  const prices = matches
    .map(p => parseInt(p.replace(/[₹,]/g, '')))
    .filter(p =>
      p > 1000 &&
      p !== 919 &&
      p !== 11025
    )

  if (prices.length === 0) return null

  return prices[0]
}

function parsePrice(text: string): number | null {
  const cleaned = text.replace(/[₹,\s]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}