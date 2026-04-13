import axios from 'axios'
import * as cheerio from 'cheerio'
import { ScrapeResult } from '@/types'

export async function scrapeMyntra(url: string): Promise<ScrapeResult> {
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
  

    const brand = $('.pdp-title').first().text().trim() ||
      $('h1.pdp-name').first().text().trim() ||
      ''

    const productName = $('.pdp-name').first().text().trim() ||
      $('h1').first().text().trim() ||
      ''

    const name = brand && productName
      ? `${brand} ${productName}`.trim()
      : brand || productName || null

    const priceText = $('.pdp-price strong').first().text().trim() ||
      $('span.pdp-price').first().text().trim() ||
      $('.pdp-mrp').first().text().trim() ||
      ''

    const price = parsePrice(priceText)

     const image_url = $('img[src*="assets.myntassets.com"]').first().attr('src')
      ?.replace('h_150,q_auto:best,w_112', 'h_720,q_90,w_540') ||
      $('img.colors-image').first().attr('src') ||
      null

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