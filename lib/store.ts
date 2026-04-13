// lib/store.ts
import { create } from 'zustand'
import { Product } from '@/types'

interface ProductStore {
  selectedProduct: Product | null
  setSelectedProduct: (product: Product | null) => void
  isAddingProduct: boolean
  setIsAddingProduct: (value: boolean) => void
}

export const useProductStore = create<ProductStore>((set) => ({
  selectedProduct: null,
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  isAddingProduct: false,
  setIsAddingProduct: (value) => set({ isAddingProduct: value }),
}))