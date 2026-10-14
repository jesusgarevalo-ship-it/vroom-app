import { apiFetch } from './client'

export interface Product {
  id: string
  name: string
  brand: string
  partNumber: string
  category: string
  priceUsd: number
  priceBs: number
  imageUrl: string
  supplier: {
    id: string
    name: string
    rating: number
    address: string
    phone: string
  }
  compatibility: string[]
  stock: number
  deliveryEta: string
  description?: string
}

export interface ProductSearchResult {
  products: Product[]
  total: number
  page: number
  pageSize: number
}

export interface Category {
  id: string
  name: string
  icon: string
  count: number
}

export async function searchProducts(
  query: string,
  page = 1,
  pageSize = 20
): Promise<ProductSearchResult> {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    pageSize: String(pageSize),
  })
  return apiFetch<ProductSearchResult>(`/products/search?${params}`)
}

export async function getProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`)
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/products/categories')
}

export async function getProductsByCategory(
  category: string,
  page = 1,
  pageSize = 20
): Promise<ProductSearchResult> {
  const params = new URLSearchParams({
    category,
    page: String(page),
    pageSize: String(pageSize),
  })
  return apiFetch<ProductSearchResult>(`/products?${params}`)
}