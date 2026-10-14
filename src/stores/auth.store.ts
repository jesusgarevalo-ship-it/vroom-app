import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { sendOtp, verifyOtp } from '@/src/api/auth'

interface User {
  id: string
  phone: string
  name?: string
  email?: string
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  checkAuth: () => Promise<void>
  login: (phone: string) => Promise<void>
  verifyOtpCode: (code: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      checkAuth: async () => {
        const { token, refreshToken } = get()
        if (!token && !refreshToken) return
        // Token validation would go to the API here
      },

      login: async (phone: string) => {
        set({ isLoading: true, error: null })
        try {
          await sendOtp(phone)
          set({ isLoading: false })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al enviar OTP'
          set({ isLoading: false, error: message })
          throw err
        }
      },

      verifyOtpCode: async (code: string) => {
        const { user } = get()
        if (!user?.phone) {
          set({ error: 'No hay número de teléfono registrado' })
          return false
        }
        set({ isLoading: true, error: null })
        try {
          const result = await verifyOtp(user.phone, code)
          set({
            user: result.user,
            token: result.accessToken,
            refreshToken: result.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })
          return true
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Código inválido'
          set({ isLoading: false, error: message })
          return false
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'vroom-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)