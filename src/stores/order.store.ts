import { create } from 'zustand'
import type { Order } from '@/src/api/orders'

interface OrderState {
  currentOrder: Order | null
  orders: Order[]
  isLoading: boolean
  error: string | null
  setCurrentOrder: (order: Order) => void
  setOrders: (orders: Order[]) => void
  clearCurrentOrder: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateOrderStatus: (orderId: string, status: Order['status']) => void
  updateDriverLocation: (orderId: string, lat: number, lng: number) => void
}

export const useOrderStore = create<OrderState>()((set) => ({
  currentOrder: null,
  orders: [],
  isLoading: false,
  error: null,

  setCurrentOrder: (order) => set({ currentOrder: order, error: null }),

  setOrders: (orders) => set({ orders, error: null }),

  clearCurrentOrder: () => set({ currentOrder: null }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      currentOrder:
        state.currentOrder?.id === orderId
          ? { ...state.currentOrder, status }
          : state.currentOrder,
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      ),
    })),

  updateDriverLocation: (orderId, lat, lng) =>
    set((state) => ({
      currentOrder:
        state.currentOrder?.id === orderId
          ? {
              ...state.currentOrder,
              driver: state.currentOrder.driver
                ? { ...state.currentOrder.driver, lat, lng }
                : undefined,
            }
          : state.currentOrder,
    })),
}))