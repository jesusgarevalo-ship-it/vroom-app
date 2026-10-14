import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SearchBar } from '@/src/components/SearchBar'
import { ProductCard } from '@/src/components/ProductCard'
import { searchProducts } from '@/src/api/products'
import type { Product } from '@/src/api/products'

const COLORS = {
  voltBlue: '#0066FF',
  ignitionYellow: '#FFD600',
  background: '#0a0a0f',
  surface: '#0d1420',
  surfaceLight: '#1a2438',
  text: '#e2e8f0',
  textMuted: '#8892a4',
}

export default function SearchScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ q?: string; category?: string }>()
  const [query, setQuery] = useState(params.q || params.category || '')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchResults = async (searchQuery: string, pageNum = 1, refresh = false) => {
    if (!searchQuery.trim() && !params.category) return

    if (refresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

    try {
      const result = await searchProducts(
        searchQuery.trim() || params.category || '',
        pageNum
      )
      if (pageNum === 1) {
        setProducts(result.products)
      } else {
        setProducts((prev) => [...prev, ...result.products])
      }
      setHasMore(result.products.length === 20)
      setPage(pageNum)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchResults(query)
  }, [params.q, params.category])

  const handleSearch = () => {
    setPage(1)
    setHasMore(true)
    fetchResults(query, 1)
  }

  const handleRefresh = () => {
    fetchResults(query, 1, true)
  }

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchResults(query, page + 1)
    }
  }

  const handleProductPress = (id: string) => {
    router.push(`/product/${id}`)
  }

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>
        No encontramos "{query || params.category}"
      </Text>
      <Text style={styles.emptySubtitle}>
        Prueba con otro nombre o navega por categorías
      </Text>
    </View>
  )

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard product={item} onPress={handleProductPress} />
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.searchWrapper}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onSubmit={handleSearch}
            autoFocus={false}
          />
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isLoading && products.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.voltBlue} />
          <Text style={styles.loadingText}>Buscando...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.voltBlue}
              colors={[COLORS.voltBlue]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoading && products.length > 0 ? (
              <ActivityIndicator
                size="small"
                color={COLORS.voltBlue}
                style={{ marginVertical: 16 }}
              />
            ) : null
          }
        />
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    color: COLORS.text,
    fontSize: 24,
  },
  searchWrapper: {
    flex: 1,
  },
  errorBanner: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
})