import axios from 'axios'
import * as cheerio from 'cheerio'
import { ScrapeResult } from '@/types'

export async function scrapeAmazon(url: string): Promise<ScrapeResult> {
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

    const name = $('#productTitle').first().text().trim() ||
      $('#title').first().text().trim() ||
      null

    const priceText = $('span.a-price-whole').first().text().trim() ||
      $('#priceblock_ourprice').first().text().trim() ||
      $('#priceblock_dealprice').first().text().trim() ||
      $('span.a-offscreen').first().text().trim() ||
      ''

    const price = parsePrice(priceText)

    const image_url = $('#landingImage').attr('src') ||
      $('#imgBlkFront').attr('src') ||
      $('img[data-a-image-name="landingImage"]').attr('src') ||
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