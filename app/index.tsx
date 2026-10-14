import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SearchBar } from '@/src/components/SearchBar'
import { useAuthStore } from '@/src/stores/auth.store'
import { useCartStore } from '@/src/stores/cart.store'
import { getCategories } from '@/src/api/products'

const COLORS = {
  voltBlue: '#0066FF',
  ignitionYellow: '#FFD600',
  background: '#0a0a0f',
  surface: '#0d1420',
  surfaceLight: '#1a2438',
  text: '#e2e8f0',
  textMuted: '#8892a4',
}

const CATEGORIES = [
  { id: 'frenos', name: 'Frenos', icon: '🛑' },
  { id: 'motor', name: 'Motor', icon: '⚙️' },
  { id: 'suspension', name: 'Suspensión', icon: '🔧' },
  { id: 'electricidad', name: 'Electricidad', icon: '⚡' },
  { id: 'direccion', name: 'Dirección', icon: '🔄' },
  { id: 'carroceria', name: 'Carrocería', icon: '🚗' },
  { id: 'combustible', name: 'Combustible', icon: '⛽' },
  { id: 'accesorios', name: 'Accesorios', icon: '🔑' },
]

const QUICK_SEARCHES = [
  'Pastillas Civic',
  'Aceite Corolla',
  'Amortiguadores',
  'Bomba de agua',
  'Bujías',
  'Filtros',
]

export default function HomeScreen() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const itemCount = useCartStore((s) => s.itemCount())
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({ pathname: '/search', params: { q: searchQuery.trim() } })
    }
  }

  const handleCategoryPress = (category: string) => {
    router.push({ pathname: '/search', params: { category } })
  }

  const handleQuickSearch = (query: string) => {
    router.push({ pathname: '/search', params: { q: query } })
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>VROOM</Text>
            <Text style={styles.tagline}>Repuestos Express</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => router.push('/cart')}
            >
              <Text style={styles.cartIcon}>🛒</Text>
              {itemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{itemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => isAuthenticated ? router.push('/orders') : router.push('/(auth)/login')}
            >
              <Text style={styles.avatarText}>
                {isAuthenticated && user?.name ? user.name[0].toUpperCase() : '👤'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmit={handleSearch}
            onVoicePress={() => {}}
          />
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Categorías</Text>
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(cat.id)}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Searches */}
        <Text style={styles.sectionTitle}>Búsquedas populares</Text>
        <View style={styles.quickSearches}>
          {QUICK_SEARCHES.map((qs) => (
            <TouchableOpacity
              key={qs}
              style={styles.chip}
              onPress={() => handleQuickSearch(qs)}
            >
              <Text style={styles.chipText}>{qs}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🚗 Envío express</Text>
          <Text style={styles.bannerSubtitle}>Recibe tu repuesto en Caracas en menos de 2 horas</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    color: COLORS.voltBlue,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
  },
  tagline: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartIcon: {
    fontSize: 22,
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.ignitionYellow,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: '700',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.voltBlue,
  },
  avatarText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  categoryCard: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  quickSearches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 28,
  },
  chip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  chipText: {
    color: COLORS.text,
    fontSize: 13,
  },
  banner: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ignitionYellow,
  },
  bannerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
})