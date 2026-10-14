import { useState, useEffect, useCallback } from 'react'
import * as ExpoLocation from 'expo-location'

interface LocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  isLoading: boolean
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    isLoading: false,
  })

  const requestPermission = useCallback(async () => {
    setLocation((s) => ({ ...s, isLoading: true, error: null }))
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setLocation((s) => ({
          ...s,
          isLoading: false,
          error: 'Permiso de ubicación denegado',
        }))
        return false
      }
      return true
    } catch (err) {
      setLocation((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Error al obtener ubicación',
      }))
      return false
    }
  }, [])

  const getCurrentLocation = useCallback(async () => {
    const hasPermission = await requestPermission()
    if (!hasPermission) return

    setLocation((s) => ({ ...s, isLoading: true }))
    try {
      const pos = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      })
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        error: null,
        isLoading: false,
      })
    } catch (err) {
      setLocation((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Error al obtener ubicación',
      }))
    }
  }, [requestPermission])

  return {
    ...location,
    requestPermission,
    getCurrentLocation,
  }
}