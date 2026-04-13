import { addScheduledScrapeJobs } from './producer'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function scheduleAllProducts() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, url, platform')
    .eq('is_active', true)

  if (error || !products || products.length === 0) {
    console.log('No active products to schedule')
    return
  }

  await addScheduledScrapeJobs(products)
  console.log(`Scheduled ${products.length} products for scraping`)
}