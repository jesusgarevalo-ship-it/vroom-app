import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useCartStore } from '../src/stores/cart.store';
import { useOrderStore } from '../src/stores/order.store';
import { useAuthStore } from '../src/stores/auth.store';
import { PagoMovilModal } from '../src/components/PagoMovilModal';

const BCV_RATE = 50;

export default function Checkout() {
  const { items, deliveryAddress, deliveryLat, deliveryLng, totalUsd, clearCart } = useCartStore();
  const { createOrder, currentOrder, loading } = useOrderStore();
  const { token } = useAuthStore();
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  if (items.length === 0 && !orderSuccess) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
        <Text style={styles.emptySub}>Agrega repuestos antes de pagar</Text>
      </View>
    );
  }

  if (orderSuccess && currentOrder) {
    return (
      <View style={styles.container}>
        <View style={styles.successCard}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>¡Pedido confirmado!</Text>
          <Text style={styles.orderId}>Pedido #{currentOrder.id?.slice(0, 8)}</Text>
          <Text style={styles.successText}>
            Tu pedido está siendo preparado. Te notificaremos cuando un conductor lo recoja.
          </Text>
          <TouchableOpacity style={styles.trackButton}>
            <Text style={styles.trackButtonText}>Seguir pedido</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const subtotalBs = Math.round(totalUsd * BCV_RATE * 1.02);
  const deliveryFeeUsd = 1.5;
  const deliveryFeeBs = Math.round(deliveryFeeUsd * BCV_RATE);
  const totalBs = subtotalBs + deliveryFeeBs;

  const handlePlaceOrder = async () => {
    if (!token) {
      Alert.alert('Inicia sesión', 'Necesitas iniciar sesión para hacer un pedido.');
      return;
    }
    if (!deliveryAddress) {
      Alert.alert('Dirección requerida', 'Ingresa la dirección de entrega.');
      return;
    }

    try {
      const order = await createOrder({
        items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        deliveryAddress,
        deliveryLat,
        deliveryLng,
      });
      if (order) {
        setOrderSuccess(true);
        clearCart();
      }
    } catch (err) {
      Alert.alert('Error', 'No pudimos crear tu pedido. Intenta de nuevo.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Resumen del pedido</Text>

      {items.map((item) => (
        <View key={item.product.id} style={styles.itemRow}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.product.name}</Text>
            <Text style={styles.itemBrand}>{item.product.brand}</Text>
          </View>
          <View style={styles.itemRight}>
            <Text style={styles.itemQty}>x{item.quantity}</Text>
            <Text style={styles.itemPrice}>${item.product.priceUsd}</Text>
          </View>
        </View>
      ))}

      <View style={styles.divider} />

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal</Text>
        <Text style={styles.summaryValue}>${totalUsd.toFixed(2)} / {subtotalBs.toLocaleString('es-VE')} BS</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Delivery</Text>
        <Text style={styles.summaryValue}>${deliveryFeeUsd.toFixed(2)} / {deliveryFeeBs.toLocaleString('es-VE')} BS</Text>
      </View>
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${(totalUsd + deliveryFeeUsd).toFixed(2)} / {totalBs.toLocaleString('es-VE')} BS</Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Dirección de entrega</Text>
      <View style={styles.addressCard}>
        <Text style={styles.addressText}>{deliveryAddress || 'Sin dirección'}</Text>
      </View>

      <TouchableOpacity
        style={[styles.payButton, !deliveryAddress && styles.payButtonDisabled]}
        onPress={handlePlaceOrder}
        disabled={!deliveryAddress || loading}
      >
        <Text style={styles.payButtonText}>
          {loading ? 'Procesando...' : 'Proceder al pago'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pagoMovilButton}
        onPress={() => setShowPagoModal(true)}
      >
        <Text style={styles.pagoMovilButtonText}>💳 Pagar con Pago Móvil (BS)</Text>
      </TouchableOpacity>

      <PagoMovilModal
        visible={showPagoModal}
        onClose={() => setShowPagoModal(false)}
        amountBs={totalBs}
        orderId={currentOrder?.id}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f', padding: 16 },
  emptyTitle: { color: '#fff', fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: '700', textAlign: 'center', marginTop: 80 },
  emptySub: { color: '#64748b', fontSize: 14, textAlign: 'center', marginTop: 8 },
  sectionTitle: { color: '#fff', fontSize: 16, fontFamily: 'Space Grotesk', fontWeight: '700', marginBottom: 12, marginTop: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,102,255,0.1)' },
  itemInfo: { flex: 1 },
  itemName: { color: '#e2e8f0', fontSize: 14, fontWeight: '500' },
  itemBrand: { color: '#64748b', fontSize: 12, marginTop: 2 },
  itemRight: { alignItems: 'flex-end' },
  itemQty: { color: '#64748b', fontSize: 12 },
  itemPrice: { color: '#0066FF', fontSize: 14, fontWeight: '700', marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(0,102,255,0.2)', marginVertical: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: '#64748b', fontSize: 14 },
  summaryValue: { color: '#e2e8f0', fontSize: 14 },
  totalRow: { marginTop: 8 },
  totalLabel: { color: '#fff', fontSize: 16, fontWeight: '700' },
  totalValue: { color: '#FFD600', fontSize: 16, fontWeight: '700' },
  addressCard: { backgroundColor: '#0d1420', borderWidth: 1, borderColor: 'rgba(0,102,255,0.2)', borderRadius: 12, padding: 16 },
  addressText: { color: '#e2e8f0', fontSize: 14 },
  payButton: { backgroundColor: '#0066FF', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  payButtonDisabled: { backgroundColor: '#1e3a5f' },
  payButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: 'Space Grotesk' },
  pagoMovilButton: { backgroundColor: 'rgba(255,214,0,0.1)', borderWidth: 1, borderColor: '#FFD600', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  pagoMovilButtonText: { color: '#FFD600', fontSize: 16, fontWeight: '700', fontFamily: 'Space Grotesk' },
  successCard: { alignItems: 'center', paddingVertical: 60 },
  successEmoji: { fontSize: 64, marginBottom: 16 },
  successTitle: { color: '#fff', fontSize: 24, fontFamily: 'Space Grotesk', fontWeight: '800', marginBottom: 8 },
  orderId: { color: '#0066FF', fontSize: 16, fontFamily: 'Courier New', marginBottom: 16 },
  successText: { color: '#94a3b8', fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 24 },
  trackButton: { backgroundColor: '#0066FF', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginTop: 24 },
  trackButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: 'Space Grotesk' },
});