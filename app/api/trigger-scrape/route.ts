import { NextResponse } from 'next/server'
import { scheduleAllProducts } from '@/worker/queue/scheduler'

export async function POST() {
  await scheduleAllProducts()
  return NextResponse.json({ message: 'Scrape jobs scheduled' })
}

