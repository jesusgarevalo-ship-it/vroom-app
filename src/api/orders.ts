import { apiFetch } from './client'

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  priceUsd: number
  priceBs: number
  imageUrl: string
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'picked_up'
  | 'en_route'
  | 'delivered'
  | 'cancelled'

export interface DeliveryAddress {
  address: string
  lat: number
  lng: number
}

export interface Order {
  id: string
  items: OrderItem[]
  status: OrderStatus
  totalUsd: number
  totalBs: number
  deliveryAddress: DeliveryAddress
  createdAt: string
  updatedAt: string
  payment: {
    method: 'pago_movil'
    bank: string
    reference: string
    amountBs: number
    status: 'pending' | 'confirmed' | 'expired'
    expiresAt: string
  }
  driver?: {
    id: string
    name: string
    phone: string
    vehicle: string
    lat: number
    lng: number
  }
  estimatedDelivery: string
}

export interface CreateOrderPayload {
  items: Array<{ productId: string; quantity: number }>
  deliveryAddress: DeliveryAddress
  pagoMovilBank: string
}

export interface CreateOrderResponse {
  order: Order
  paymentInstructions: {
    phone: string
    amountBs: number
    reference: string
    expiresAt: string
    bank: string
  }
}

export async function createOrder(
  payload: CreateOrderPayload,
  token: string
): Promise<CreateOrderResponse> {
  return apiFetch<CreateOrderResponse>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  })
}

export async function getOrders(token: string): Promise<Order[]> {
  return apiFetch<Order[]>('/orders', { token })
}

export async function getOrder(id: string, token: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}`, { token })
}