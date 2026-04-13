import { Queue } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis(process.env.UPSTASH_REDIS_URL!, {
  maxRetriesPerRequest: null,
  tls: {},
  connectTimeout: 10000,
  lazyConnect: true,
  retryStrategy: (times) => {
    if (times > 3) return null
    return Math.min(times * 1000, 3000)
  },
})

export const scrapeQueue = new Queue('scrape', { connection })

export async function addScrapeJob(productId: string, url: string, platform: string) {
  try {
    await scrapeQueue.add(
      'scrape-product',
      { productId, url, platform },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      }
    )
  } catch (err) {
    console.log('Queue unavailable — skipping job:', err)
  }
}

export async function addScheduledScrapeJobs(products: { id: string, url: string, platform: string }[]) {
  try {
    const jobs = products.map(product => ({
      name: 'scrape-product',
      data: {
        productId: product.id,
        url: product.url,
        platform: product.platform,
      },
      opts: {
        attempts: 3,
        backoff: {
          type: 'exponential' as const,
          delay: 5000,
        },
      },
    }))

    await scrapeQueue.addBulk(jobs)
  } catch (err) {
    console.log('Queue unavailable — skipping bulk jobs:', err)
  }
}