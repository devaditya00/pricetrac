import { chromium } from 'playwright'
import { ScrapeResult } from '@/types'

export async function scrapeMeesho(url: string): Promise<ScrapeResult> {
  const browser = await chromium.launch({ headless: true })

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'en-IN',
      timezoneId: 'Asia/Kolkata',
      viewport: { width: 1366, height: 768 },
      extraHTTPHeaders: {
        'Accept-Language': 'en-IN,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': 'https://www.google.com/',
      }
    })

    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] })
      Object.defineProperty(navigator, 'languages', { get: () => ['en-IN', 'en'] })
    })

    const page = await context.newPage()

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(4000)

    const name = await page.$eval(
      'span[class*="ProductDetail__Name"], p[class*="ProductDetail__Name"], h1',
      el => el.textContent?.trim() ?? null
    ).catch(() => null)

    const priceText = await page.$eval(
      'h4[class*="ProductDetail__Price"], p[class*="ProductDetail__Price"], [class*="price"]',
      el => el.textContent?.trim() ?? ''
    ).catch(() => '')

    const price = parsePrice(priceText as string)

    const image_url = await page.$eval(
      'img[class*="ProductDetail__Image"], img[class*="sc-"], img',
      el => el.getAttribute('src')
    ).catch(() => null)

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
  } finally {
    await browser.close()
  }
}

function parsePrice(text: string): number | null {
  const cleaned = text.replace(/[₹,\s]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}