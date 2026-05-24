import { addScheduledScrapeJobs } from './producer'
import { createClient } from '@supabase/supabase-js'

export async function scheduleAllProducts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: products, error } = await supabase
    .from('products')
    .select('id, url, platform, updated_at')
    .eq('is_active', true)
    .lt('updated_at', oneDayAgo)

  if (error || !products || products.length === 0) {
    console.log('No products need updating right now')
    return
  }

  await addScheduledScrapeJobs(products)
  console.log(`Scheduled ${products.length} products for scraping`)
}