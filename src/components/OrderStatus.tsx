import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { OrderStatus } from '@/src/api/orders'

const COLORS = {
  voltBlue: '#0066FF',
  ignitionYellow: '#FFD600',
  success: '#22c55e',
  background: '#0a0a0f',
  surface: '#0d1420',
  surfaceLight: '#1a2438',
  text: '#e2e8f0',
  textMuted: '#8892a4',
  danger: '#ef4444',
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; icon: string; color: string }
> = {
  pending: { label: 'Pedido recibido', icon: '📋', color: COLORS.textMuted },
  confirmed: { label: 'Pago confirmado', icon: '✅', color: COLORS.voltBlue },
  picked_up: { label: 'En camino al repartidor', icon: '📦', color: COLORS.voltBlue },
  en_route: { label: 'En camino a ti', icon: '🛵', color: COLORS.ignitionYellow },
  delivered: { label: 'Entregado', icon: '🎉', color: COLORS.success },
  cancelled: { label: 'Cancelado', icon: '❌', color: COLORS.danger },
}

const STATUS_ORDER: OrderStatus[] = [
  'pending',
  'confirmed',
  'picked_up',
  'en_route',
  'delivered',
]

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus
  updatedAt: string
}

export function OrderStatusTimeline({
  currentStatus,
  updatedAt,
}: OrderStatusTimelineProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus)
  const isCancelled = currentStatus === 'cancelled'

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estado del pedido</Text>
      <Text style={styles.lastUpdate}>
        Actualizado: {format(new Date(updatedAt), "d 'de' MMM, HH:mm", { locale: es })}
      </Text>

      <View style={styles.timeline}>
        {STATUS_ORDER.map((status, index) => {
          const config = STATUS_CONFIG[status]
          const isPast = index < currentIndex || status === currentStatus
          const isCurrent = status === currentStatus
          const isCancelledStep = isCancelled && index === currentIndex

          return (
            <View key={status} style={styles.stepContainer}>
              <View style={styles.stepLeft}>
                <View
                  style={[
                    styles.dot,
                    isPast && styles.dotPast,
                    isCurrent && styles.dotCurrent,
                    isCancelledStep && styles.dotCancelled,
                  ]}
                >
                  <Text style={styles.dotIcon}>{config.icon}</Text>
                </View>
                {index < STATUS_ORDER.length - 1 && (
                  <View
                    style={[
                      styles.line,
                      isPast && styles.linePast,
                    ]}
                  />
                )}
              </View>

              <View style={styles.stepContent}>
                <Text
                  style={[
                    styles.stepLabel,
                    isPast && styles.stepLabelPast,
                    isCurrent && styles.stepLabelCurrent,
                  ]}
                >
                  {config.label}
                </Text>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  lastUpdate: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 20,
  },
  timeline: {
    gap: 0,
  },
  stepContainer: {
    flexDirection: 'row',
    minHeight: 48,
  },
  stepLeft: {
    width: 40,
    alignItems: 'center',
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surfaceLight,
  },
  dotPast: {
    backgroundColor: COLORS.voltBlue,
    borderColor: COLORS.voltBlue,
  },
  dotCurrent: {
    backgroundColor: COLORS.ignitionYellow,
    borderColor: COLORS.ignitionYellow,
  },
  dotCancelled: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  dotIcon: {
    fontSize: 14,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    marginVertical: 4,
  },
  linePast: {
    backgroundColor: COLORS.voltBlue,
  },
  stepContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  stepLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  stepLabelPast: {
    color: COLORS.text,
    fontWeight: '500',
  },
  stepLabelCurrent: {
    color: COLORS.ignitionYellow,
    fontWeight: '700',
  },
})