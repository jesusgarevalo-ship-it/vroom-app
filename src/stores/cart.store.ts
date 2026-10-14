import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Product } from '@/src/api/products'

export interface CartItem {
  product: Product
  quantity: number
}

export interface DeliveryAddress {
  address: string
  lat?: number
  lng?: number
}

interface CartState {
  items: CartItem[]
  deliveryAddress: DeliveryAddress | null
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setDeliveryAddress: (address: DeliveryAddress) => void
  totalUsd: () => number
  totalBs: () => number
  itemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryAddress: null,

      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, { product, quantity }] }
        })
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }))
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [], deliveryAddress: null }),

      setDeliveryAddress: (address: DeliveryAddress) => {
        set({ deliveryAddress: address })
      },

      totalUsd: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.priceUsd * item.quantity,
          0
        )
      },

      totalBs: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.priceBs * item.quantity,
          0
        )
      },

      itemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'vroom-cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)