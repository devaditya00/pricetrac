import './queue/consumer'
import { scheduleAllProducts } from './queue/scheduler'

console.log('PriceTrac worker started')

scheduleAllProducts()

setInterval(async () => {
  console.log('Running scheduled scrape...')
  await scheduleAllProducts()
}, 6 * 60 * 60 * 1000)

