import { useRouter } from 'expo-router'
import { useAuthStore } from '@/src/stores/auth.store'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'

interface FetchOptions extends RequestInit {
  token?: string
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiFetch<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  if (response.status === 401) {
    const authStore = useAuthStore.getState()
    authStore.logout()
    const router = useRouter.getStatefulRouter?.() || null
    if (router) {
      router.replace('/(auth)/login')
    }
    throw new ApiError(401, 'Sesión expirada')
  }

  if (!response.ok) {
    let errorData: unknown
    try {
      errorData = await response.json()
    } catch {
      errorData = null
    }
    throw new ApiError(
      response.status,
      `Error ${response.status}`,
      errorData
    )
  }

  return response.json() as Promise<T>
}

export { apiFetch, ApiError, BASE_URL }