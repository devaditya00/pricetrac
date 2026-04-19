import './queue/consumer.js'
import { scheduleAllProducts } from './queue/scheduler.js'

console.log('PriceTrac worker started')

scheduleAllProducts()

setInterval(async () => {
  console.log('Running scheduled scrape...')
  await scheduleAllProducts()
}, 6 * 60 * 60 * 1000)

