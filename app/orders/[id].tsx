import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useOrderStore } from '../../src/stores/order.store';
import { OrderStatus } from '../../src/components/OrderStatus';
import { MapTrack } from '../../src/components/MapTrack';

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getOrder, order, loading } = useOrderStore();

  useEffect(() => {
    if (id) getOrder(id);
  }, [id]);

  if (loading || !order) {
    return <View style={styles.container}><Text style={styles.loading}>Cargando...</Text></View>;
  }

  const delivery = order.delivery;
  const showMap = order.status === 'en_route' && delivery?.driverLat;

  return (
    <ScrollView style={styles.container}>
      <OrderStatus status={order.status} timeline={order.timeline} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pedido #{order.id?.slice(0, 8)}</Text>
        {order.items?.map((item: any, i: number) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name || item.productId?.slice(0, 8)}</Text>
            <Text style={styles.itemQty}>x{item.quantity}</Text>
            <Text style={styles.itemPrice}>${item.priceUsd?.toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${order.totalUsd?.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dirección de entrega</Text>
        <Text style={styles.address}>{order.deliveryAddress}</Text>
      </View>

      {delivery && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Conductor</Text>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{delivery.driverName || 'Asignando...'}</Text>
            <Text style={styles.driverVehicle}>{delivery.driverVehicle || ''}</Text>
            {delivery.driverPhone && (
              <Text
                style={styles.driverPhone}
                onPress={() => Linking.openURL(`tel:${delivery.driverPhone}`)}
              >
                📞 {delivery.driverPhone}
              </Text>
            )}
          </View>
          {delivery.etaMinutes && (
            <Text style={styles.eta}>⏱️ Llega en ~{delivery.etaMinutes} min</Text>
          )}
        </View>
      )}

      {showMap && (
        <View style={styles.mapContainer}>
          <Text style={styles.mapTitle}>📍 Ubicación en vivo</Text>
          <MapTrack
            driverLat={delivery!.driverLat!}
            driverLng={delivery!.driverLng!}
            destLat={order.deliveryLat!}
            destLng={order.deliveryLng!}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f', padding: 16 },
  loading: { color: '#64748b', textAlign: 'center', marginTop: 80, fontSize: 16 },
  card: { backgroundColor: '#0d1420', borderWidth: 1, borderColor: 'rgba(0,102,255,0.2)', borderRadius: 16, padding: 16, marginTop: 16 },
  cardTitle: { color: '#fff', fontSize: 16, fontFamily: 'Space Grotesk', fontWeight: '700', marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,102,255,0.1)' },
  itemName: { flex: 1, color: '#e2e8f0', fontSize: 14 },
  itemQty: { color: '#64748b', fontSize: 14, marginRight: 16 },
  itemPrice: { color: '#0066FF', fontSize: 14, fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,102,255,0.2)' },
  totalLabel: { color: '#fff', fontSize: 16, fontWeight: '700' },
  totalValue: { color: '#FFD600', fontSize: 18, fontWeight: '800', fontFamily: 'Space Grotesk' },
  address: { color: '#e2e8f0', fontSize: 14, lineHeight: 22 },
  driverInfo: { marginBottom: 8 },
  driverName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  driverVehicle: { color: '#64748b', fontSize: 13, marginTop: 2 },
  driverPhone: { color: '#0066FF', fontSize: 14, marginTop: 6 },
  eta: { color: '#FFD600', fontSize: 16, fontWeight: '700', marginTop: 8 },
  mapContainer: { marginTop: 16 },
  mapTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
});