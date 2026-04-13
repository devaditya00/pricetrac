import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import { createClient } from '@supabase/supabase-js'
import { scrapeAmazon } from '../scraper/amazon'
import { scrapeFlipkart } from '../scraper/flipkart'
import { scrapeMyntra } from '../scraper/myntra'
import { calculateSignal } from '../../lib/signal'

const connection = new IORedis(process.env.UPSTASH_REDIS_URL!, {
  maxRetriesPerRequest: null,
  tls: {},
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const worker = new Worker(
  'scrape',
  async (job) => {
    const { productId, url, platform } = job.data

    console.log(`Processing job for product ${productId}`)

    let scrapeResult
    if (platform === 'amazon') scrapeResult = await scrapeAmazon(url)
    else if (platform === 'flipkart') scrapeResult = await scrapeFlipkart(url)
    else scrapeResult = await scrapeMyntra(url)

    if (!scrapeResult.success) {
      throw new Error(`Scraping failed: ${scrapeResult.error}`)
    }

    const { data: product } = await supabase
      .from('products')
      .select('all_time_low, all_time_high')
      .eq('id', productId)
      .single()

    const newLow = product?.all_time_low
      ? Math.min(product.all_time_low, scrapeResult.price!)
      : scrapeResult.price

    const newHigh = product?.all_time_high
      ? Math.max(product.all_time_high, scrapeResult.price!)
      : scrapeResult.price

    await supabase
      .from('price_history')
      .insert({
        product_id: productId,
        price: scrapeResult.price,
      })

    const { data: priceHistory } = await supabase
  .from('price_history')
  .select('id, product_id, price, recorded_at')
  .eq('product_id', productId)
  .order('recorded_at', { ascending: false })

    const signal = calculateSignal(
      scrapeResult.price!,
      newLow!,
      priceHistory || []
    )

    await supabase
      .from('products')
      .update({
        current_price: scrapeResult.price,
        image_url: scrapeResult.image_url,
        all_time_low: newLow,
        all_time_high: newHigh,
        signal,
      })
      .eq('id', productId)

    console.log(`Job completed for product ${productId} — price: ${scrapeResult.price} signal: ${signal}`)
  },
  { connection }
)

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`)
})

worker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} failed: ${err.message}`)
})

export default worker