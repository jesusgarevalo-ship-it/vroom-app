import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getProduct } from '@/src/api/products'
import { useCartStore } from '@/src/stores/cart.store'
import type { Product } from '@/src/api/products'

const COLORS = {
  voltBlue: '#0066FF',
  ignitionYellow: '#FFD600',
  success: '#22c55e',
  background: '#0a0a0f',
  surface: '#0d1420',
  surfaceLight: '#1a2438',
  text: '#e2e8f0',
  textMuted: '#8892a4',
}

const { width } = Dimensions.get('window')

export default function ProductDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { addItem } = useCartStore()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    getProduct(id)
      .then(setProduct)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.voltBlue} />
        </View>
      </SafeAreaView>
    )
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || 'Producto no encontrado'}
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.imageUrl || 'https://via.placeholder.com/300' }}
            style={styles.image}
            resizeMode="contain"
          />
          <View style={styles.etaBadge}>
            <Text style={styles.etaText}>⏱️ {product.deliveryEta}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Title & brand */}
          <Text style={styles.name}>{product.name}</Text>
          <View style={styles.brandRow}>
            <Text style={styles.brand}>{product.brand}</Text>
            <Text style={styles.partNumber}>P/N: {product.partNumber}</Text>
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={styles.priceUsd}>${product.priceUsd.toFixed(2)}</Text>
            <Text style={styles.priceBs}>
              {product.priceBs.toLocaleString('es-VE')} BS
            </Text>
          </View>

          {/* Supplier */}
          <View style={styles.supplierSection}>
            <View style={styles.supplierHeader}>
              <Text style={styles.supplierLabel}>Proveedor</Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>
                  ★ {product.supplier.rating.toFixed(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.supplierName}>{product.supplier.name}</Text>
            <Text style={styles.supplierAddress}>{product.supplier.address}</Text>
          </View>

          {/* Compatibility */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compatibilidad</Text>
            <View style={styles.compatList}>
              {product.compatibility.map((vehicle, i) => (
                <View key={i} style={styles.compatBadge}>
                  <Text style={styles.compatText}>{vehicle}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Stock */}
          <View style={styles.stockRow}>
            <Text style={styles.stockLabel}>Disponibilidad:</Text>
            <Text
              style={[
                styles.stockValue,
                product.stock > 0 ? styles.inStock : styles.outStock,
              ]}
            >
              {product.stock > 0 ? `${product.stock} unidades` : 'Agotado'}
            </Text>
          </View>

          {/* Delivery estimate */}
          <View style={styles.deliveryNote}>
            <Text style={styles.deliveryIcon}>🚚</Text>
            <Text style={styles.deliveryText}>
              Entrega estimada: {product.deliveryEta}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.qtyControl}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Text style={styles.qtyButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => setQuantity((q) => q + 1)}
          >
            <Text style={styles.qtyButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.addButton, added && styles.addButtonSuccess]}
          onPress={handleAddToCart}
        >
          <Text style={styles.addButtonText}>
            {added ? '✓ Agregado' : 'Agregar al carrito'}
          </Text>
          <Text style={styles.addButtonPrice}>
            ${(product.priceUsd * quantity).toFixed(2)}
          </Text>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  backLink: {
    color: COLORS.voltBlue,
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 16,
    zIndex: 10,
    backgroundColor: COLORS.surface,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  backIcon: {
    color: COLORS.text,
    fontSize: 20,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  etaBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: COLORS.voltBlue,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  etaText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  name: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brand: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  partNumber: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  priceUsd: {
    color: COLORS.voltBlue,
    fontSize: 32,
    fontWeight: '800',
  },
  priceBs: {
    color: COLORS.ignitionYellow,
    fontSize: 16,
    fontWeight: '600',
  },
  supplierSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },
  supplierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  supplierLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ratingBadge: {
    backgroundColor: COLORS.ignitionYellow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: '700',
  },
  supplierName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  supplierAddress: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  compatList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  compatBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  compatText: {
    color: COLORS.text,
    fontSize: 12,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  stockValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  inStock: {
    color: COLORS.success,
  },
  outStock: {
    color: '#ef4444',
  },
  deliveryNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 10,
  },
  deliveryIcon: {
    fontSize: 18,
  },
  deliveryText: {
    color: COLORS.text,
    fontSize: 13,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceLight,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
    overflow: 'hidden',
  },
  qtyButton: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
  },
  qtyValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    width: 40,
    textAlign: 'center',
  },
  addButton: {
    flex: 1,
    backgroundColor: COLORS.voltBlue,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonSuccess: {
    backgroundColor: COLORS.success,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  addButtonPrice: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
})