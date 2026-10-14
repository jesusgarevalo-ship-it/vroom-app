import { useState, useCallback } from 'react'
import { searchProducts, getProduct, getCategories, type Product, type Category } from '@/src/api/products'

interface UseProductsState {
  products: Product[]
  currentProduct: Product | null
  categories: Category[]
  isLoading: boolean
  error: string | null
  total: number
  page: number
}

export function useProducts() {
  const [state, setState] = useState<UseProductsState>({
    products: [],
    currentProduct: null,
    categories: [],
    isLoading: false,
    error: null,
    total: 0,
    page: 1,
  })

  const search = useCallback(async (query: string, page = 1) => {
    setState((s) => ({ ...s, isLoading: true, error: null }))
    try {
      const result = await searchProducts(query, page)
      setState((s) => ({
        ...s,
        products: page === 1 ? result.products : [...s.products, ...result.products],
        total: result.total,
        page: result.page,
        isLoading: false,
      }))
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Error en búsqueda',
      }))
    }
  }, [])

  const fetchProduct = useCallback(async (id: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null, currentProduct: null }))
    try {
      const product = await getProduct(id)
      setState((s) => ({ ...s, currentProduct: product, isLoading: false }))
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Error al cargar producto',
      }))
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }))
    try {
      const categories = await getCategories()
      setState((s) => ({ ...s, categories, isLoading: false }))
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Error al cargar categorías',
      }))
    }
  }, [])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return {
    ...state,
    search,
    fetchProduct,
    fetchCategories,
    clearError,
  }
}