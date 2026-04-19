import './queue/consumer'
import { scheduleAllProducts } from './queue/scheduler'
import { createServer } from 'http'

const PORT = process.env.PORT || 3001

createServer((req, res) => {
  res.writeHead(200)
  res.end('PriceTrac worker running')
}).listen(PORT, () => {
  console.log(`Worker HTTP server listening on port ${PORT}`)
})

console.log('PriceTrac worker started')

scheduleAllProducts()

setInterval(async () => {
  console.log('Running scheduled scrape...')
  await scheduleAllProducts()
}, 6 * 60 * 60 * 1000)