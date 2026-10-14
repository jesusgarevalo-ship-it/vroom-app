import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useOrderStore } from '../../src/stores/order.store';
import { StatusBadge } from '../../src/components/OrderStatus';

export default function Orders() {
  const { orders, fetchOrders, loading } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading && orders.length === 0) {
    return <View style={styles.loadingContainer}><ActivityIndicator color="#0066FF" size="large" /></View>;
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyTitle}>Sin pedidos aún</Text>
        <Text style={styles.emptySub}>Tu historial de pedidos aparecerá aquí</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mis pedidos</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchOrders}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>#{item.id?.slice(0, 8)}</Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.orderItems}>{item.items?.length || 0} repuesto(s)</Text>
            <View style={styles.orderFooter}>
              <Text style={styles.orderTotal}>${item.totalUsd?.toFixed(2)}</Text>
              <Text style={styles.orderDate}>
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-VE') : ''}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f', paddingTop: 16 },
  loadingContainer: { flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' },
  header: { color: '#fff', fontSize: 24, fontFamily: 'Space Grotesk', fontWeight: '800', paddingHorizontal: 16, marginBottom: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  emptyTitle: { color: '#fff', fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: '700', textAlign: 'center', marginTop: 80 },
  emptySub: { color: '#64748b', fontSize: 14, textAlign: 'center', marginTop: 8 },
  orderCard: { backgroundColor: '#0d1420', borderWidth: 1, borderColor: 'rgba(0,102,255,0.2)', borderRadius: 16, padding: 16, marginBottom: 12 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { color: '#0066FF', fontSize: 16, fontFamily: 'Courier New', fontWeight: '700' },
  orderItems: { color: '#e2e8f0', fontSize: 14, marginBottom: 12 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal: { color: '#FFD600', fontSize: 18, fontWeight: '800', fontFamily: 'Space Grotesk' },
  orderDate: { color: '#64748b', fontSize: 12 },
});