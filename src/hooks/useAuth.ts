import { useCallback } from 'react'
import { useAuthStore } from '@/src/stores/auth.store'

export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    verifyOtpCode,
    logout,
    clearError,
  } = useAuthStore()

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    verifyOtpCode,
    logout,
    clearError,
  }
}