import React from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import type { Product } from '@/src/api/products'

const COLORS = {
  voltBlue: '#0066FF',
  ignitionYellow: '#FFD600',
  background: '#0a0a0f',
  surface: '#0d1420',
  surfaceLight: '#1a2438',
  text: '#e2e8f0',
  textMuted: '#8892a4',
  success: '#22c55e',
}

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 48) / 2

interface ProductCardProps {
  product: Product
  onPress: (id: string) => void
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(product.id)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.imageUrl || 'https://via.placeholder.com/150' }}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.etaBadge}>
          <Text style={styles.etaText}>{product.deliveryEta}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.brand}>{product.brand}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.priceUsd}>${product.priceUsd.toFixed(2)}</Text>
          <Text style={styles.priceBs}>
            {product.priceBs.toLocaleString('es-VE')} BS
          </Text>
        </View>

        <View style={styles.supplierRow}>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>
              ★ {product.supplier.rating.toFixed(1)}
            </Text>
          </View>
          <Text style={styles.supplierName} numberOfLines={1}>
            {product.supplier.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageContainer: {
    height: 130,
    backgroundColor: COLORS.surfaceLight,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  etaBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: COLORS.voltBlue,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  etaText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    padding: 10,
  },
  name: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 18,
  },
  brand: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 8,
  },
  priceUsd: {
    color: COLORS.voltBlue,
    fontSize: 16,
    fontWeight: '700',
  },
  priceBs: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingBadge: {
    backgroundColor: COLORS.ignitionYellow,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: '700',
  },
  supplierName: {
    color: COLORS.textMuted,
    fontSize: 11,
    flex: 1,
  },
})