// lib/api.ts
import { Product, ProductWithHistory } from '@/types'

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch('/api/products')
  if (!response.ok) throw new Error('Failed to fetch products')
  const data = await response.json()
  return data.products
}

export async function addProduct(url: string): Promise<Product> {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to add product')
  return data.product
}

export async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Failed to delete product')
}

export async function fetchProduct(id: string): Promise<Product> {
  const response = await fetch(`/api/products/${id}`)
  if (!response.ok) throw new Error('Failed to fetch product')
  const data = await response.json()
  return data.product
}


export async function fetchProductWithHistory(id: string): Promise<ProductWithHistory> {
  const response = await fetch(`/api/products/${id}`)
  if (!response.ok) throw new Error('Failed to fetch product')
  const data = await response.json()
  return data.product
}