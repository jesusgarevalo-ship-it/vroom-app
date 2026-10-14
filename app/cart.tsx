import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CartItem } from '@/src/components/CartItem'
import { useCartStore } from '@/src/stores/cart.store'
import { useLocation } from '@/src/hooks/useLocation'

const COLORS = {
  voltBlue: '#0066FF',
  ignitionYellow: '#FFD600',
  background: '#0a0a0f',
  surface: '#0d1420',
  surfaceLight: '#1a2438',
  text: '#e2e8f0',
  textMuted: '#8892a4',
  danger: '#ef4444',
}

export default function CartScreen() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, totalUsd, totalBs, deliveryAddress, setDeliveryAddress } = useCartStore()
  const { latitude, longitude, getCurrentLocation } = useLocation()
  const [addressInput, setAddressInput] = useState(deliveryAddress?.address || '')

  const handleUseCurrentLocation = async () => {
    await getCurrentLocation()
    if (latitude && longitude) {
      setDeliveryAddress({
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        lat: latitude,
        lng: longitude,
      })
      setAddressInput(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
    }
  }

  const handleAddressSave = () => {
    if (!addressInput.trim()) {
      Alert.alert('Dirección requerida', 'Por favor ingresa tu dirección de entrega.')
      return
    }
    setDeliveryAddress({
      address: addressInput.trim(),
      lat: latitude || undefined,
      lng: longitude || undefined,
    })
  }

  const handleCheckout = () => {
    if (!addressInput.trim() && !deliveryAddress) {
      Alert.alert('Dirección requerida', 'Por favor ingresa tu dirección de entrega.')
      return
    }
    router.push('/checkout')
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Carrito</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptySubtitle}>Agrega repuestos para continuar</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.shopButtonText}>Buscar repuestos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carrito ({items.length})</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {items.map((item) => (
            <CartItem
              key={item.product.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}

          {/* Delivery address */}
          <View style={styles.addressSection}>
            <Text style={styles.sectionTitle}>Dirección de entrega</Text>
            <View style={styles.addressCard}>
              <TextInput
                style={styles.addressInput}
                value={addressInput}
                onChangeText={setAddressInput}
                placeholder="Ej: Av. Libertador, Caracas"
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={2}
              />
              <TouchableOpacity
                style={styles.locationButton}
                onPress={handleUseCurrentLocation}
              >
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.locationText}>Usar mi ubicación</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddressSave}
              >
                <Text style={styles.saveButtonText}>Guardar dirección</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Totals */}
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal USD</Text>
              <Text style={styles.totalValue}>${totalUsd().toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal BS</Text>
              <Text style={styles.totalValueBs}>
                {totalBs().toLocaleString('es-VE')} BS
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomTotal}>
          <Text style={styles.bottomTotalLabel}>Total</Text>
          <Text style={styles.bottomTotalValue}>${totalUsd().toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutButton, !addressInput.trim() && styles.buttonDisabled]}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>Ir al pago</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backIcon: {
    color: COLORS.text,
    fontSize: 24,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: COLORS.voltBlue,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addressSection: {
    marginTop: 20,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  addressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  addressInput: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
    padding: 12,
    color: COLORS.text,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
  },
  locationIcon: {
    fontSize: 16,
  },
  locationText: {
    color: COLORS.voltBlue,
    fontSize: 13,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  totals: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    gap: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  totalValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  totalValueBs: {
    color: COLORS.ignitionYellow,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceLight,
  },
  bottomTotal: {
    gap: 4,
  },
  bottomTotalLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  bottomTotalValue: {
    color: COLORS.voltBlue,
    fontSize: 24,
    fontWeight: '800',
  },
  checkoutButton: {
    flex: 1,
    backgroundColor: COLORS.voltBlue,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})