import { chromium } from 'playwright'
import { ScrapeResult } from '@/types'

export async function scrapeFlipkart(url: string): Promise<ScrapeResult> {
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

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(5000)  

    const debugPrice = await page.evaluate(() => {
  const selectors = [
    'div.Nx9bqj',
    'div._30jeq3',
    'div.hl05eU',
    'div._25b18c',
    '[class*="price"]',
    '[class*="Price"]',
  ]
  return selectors.map(sel => ({
    selector: sel,
    found: document.querySelector(sel)?.textContent?.trim() ?? 'NOT FOUND'
  }))
})
console.log('DEBUG PRICE:', JSON.stringify(debugPrice, null, 2))

    const name = await page.$eval(
      'span.VU-ZEz, span.B_NuCI, h1',
      el => el.textContent?.trim() ?? null
    ).catch(() => null)

   const priceText = await page.$eval(
  'div.Nx9bqj, div._30jeq3, div.hl05eU, div._25b18c,      [class*="price"], [class*="Price"]',
    el => el.textContent?.trim() ?? ''
    ).catch(() => '')

    const price = parsePrice(priceText as string)

    const image_url = await page.$eval(
      'img.DByuf4, img._396cs4, img',
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