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

    const name = $('span.VU-ZEz').first().text().trim() ||
      $('span.B_NuCI').first().text().trim() ||
      $('h1').first().text().trim() ||
      null

    const priceText = $('div.v1zwn21s.v1zwn2a').first().text().trim() ||
  $('[style*="color: rgb(51, 51, 51)"]').first().text().trim() ||
  ''

    const price = parsePrice(priceText)

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

function parsePrice(text: string): number | null {
  const cleaned = text.replace(/[₹,\s]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}