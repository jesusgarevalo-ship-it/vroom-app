import React from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native'
import type { CartItem as CartItemType } from '@/src/stores/cart.store'

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

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (productId: string, qty: number) => void
  onRemove: (productId: string) => void
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { product, quantity } = item

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: product.imageUrl || 'https://via.placeholder.com/80' }}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.price}>
          ${(product.priceUsd * quantity).toFixed(2)}
        </Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.qtyControl}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => onUpdateQuantity(product.id, quantity - 1)}
          >
            <Text style={styles.qtyButtonText}>−</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.qtyInput}
            value={String(quantity)}
            onChangeText={(text) => {
              const num = parseInt(text, 10)
              if (!isNaN(num) && num > 0) {
                onUpdateQuantity(product.id, num)
              }
            }}
            keyboardType="number-pad"
            selectTextOnFocus
          />

          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => onUpdateQuantity(product.id, quantity + 1)}
          >
            <Text style={styles.qtyButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemove(product.id)}
        >
          <Text style={styles.removeText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  image: {
    width: 70,
    height: 70,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  brand: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  price: {
    color: COLORS.voltBlue,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  actions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    overflow: 'hidden',
  },
  qtyButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  qtyInput: {
    width: 36,
    height: 32,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 4,
    borderRadius: 4,
    padding: 0,
  },
  removeButton: {
    paddingVertical: 4,
  },
  removeText: {
    color: COLORS.danger,
    fontSize: 12,
  },
})