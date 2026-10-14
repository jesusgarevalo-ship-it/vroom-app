import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native'
import { differenceInSeconds, differenceInMinutes, format } from 'date-fns'
import { confirmPagoMovil } from '@/src/api/payments'
import { useAuthStore } from '@/src/stores/auth.store'

const COLORS = {
  voltBlue: '#0066FF',
  ignitionYellow: '#FFD600',
  success: '#22c55e',
  danger: '#ef4444',
  background: '#0a0a0f',
  surface: '#0d1420',
  surfaceLight: '#1a2438',
  text: '#e2e8f0',
  textMuted: '#8892a4',
}

const BANKS = [
  { id: 'banesco', name: 'Banesco', icon: '🏦' },
  { id: 'venezuela', name: 'Banco de Venezuela', icon: '🏛️' },
  { id: 'bicentenario', name: 'Bicentenario', icon: '🏢' },
]

interface PagoMovilModalProps {
  visible: boolean
  onClose: () => void
  phone: string
  amountBs: number
  reference: string
  bank: string
  expiresAt: string
  orderId: string
  onConfirmed: () => void
  onExpired: () => void
}

export function PagoMovilModal({
  visible,
  onClose,
  phone,
  amountBs,
  reference,
  bank,
  expiresAt,
  orderId,
  onConfirmed,
  onExpired,
}: PagoMovilModalProps) {
  const { token } = useAuthStore()
  const [selectedBank, setSelectedBank] = useState(bank)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (!visible) return

    const updateTimer = () => {
      const now = new Date()
      const expires = new Date(expiresAt)
      const seconds = differenceInSeconds(expires, now)
      setSecondsLeft(Math.max(0, seconds))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [visible, expiresAt])

  useEffect(() => {
    if (secondsLeft === 0 && visible) {
      onExpired()
    }
  }, [secondsLeft, visible])

  const handleConfirm = async () => {
    if (!token) return
    setIsConfirming(true)
    try {
      const result = await confirmPagoMovil(
        { orderId, reference, amountBs, bank: selectedBank },
        token
      )
      if (result.success || result.status === 'confirmed') {
        setConfirmed(true)
        onConfirmed()
      } else {
        Alert.alert('Error', result.message || 'Pago no confirmado')
      }
    } catch (err) {
      Alert.alert('Error', 'No pudimos verificar tu pago. Intenta de nuevo.')
    } finally {
      setIsConfirming(false)
    }
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  if (confirmed) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>¡Pago confirmado!</Text>
            <Text style={styles.successText}>
              Tu pedido está siendo procesado. Recibirás actualizaciones en tiempo real.
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Pago Móvil</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeX}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timer}>
            <Text style={styles.timerLabel}>Tiempo restante</Text>
            <Text style={styles.timerValue}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Selecciona tu banco</Text>
          <View style={styles.bankList}>
            {BANKS.map((b) => (
              <TouchableOpacity
                key={b.id}
                style={[
                  styles.bankOption,
                  selectedBank === b.id && styles.bankOptionSelected,
                ]}
                onPress={() => setSelectedBank(b.id)}
              >
                <Text style={styles.bankIcon}>{b.icon}</Text>
                <Text style={styles.bankName}>{b.name}</Text>
                {selectedBank === b.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Teléfono:</Text>
              <Text style={styles.detailValue}>{phone}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Monto:</Text>
              <Text style={styles.detailAmount}>
                {amountBs.toLocaleString('es-VE')} BS
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Referencia:</Text>
              <Text style={styles.detailValue}>{reference}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, isConfirming && styles.buttonDisabled]}
            onPress={handleConfirm}
            disabled={isConfirming}
          >
            <Text style={styles.confirmButtonText}>
              {isConfirming ? 'Verificando...' : 'Ya hice la transferencia'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Realiza la transferencia por el monto exacto. Una vez confirmada,
            recibirás la confirmación de tu pedido.
          </Text>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
  },
  closeX: {
    padding: 4,
  },
  closeXText: {
    color: COLORS.textMuted,
    fontSize: 20,
  },
  timer: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  timerLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  timerValue: {
    color: COLORS.ignitionYellow,
    fontSize: 36,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  bankList: {
    gap: 8,
    marginBottom: 20,
  },
  bankOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 10,
  },
  bankOptionSelected: {
    borderColor: COLORS.voltBlue,
  },
  bankIcon: {
    fontSize: 20,
  },
  bankName: {
    color: COLORS.text,
    fontSize: 14,
    flex: 1,
  },
  checkmark: {
    color: COLORS.voltBlue,
    fontSize: 16,
    fontWeight: '700',
  },
  details: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  detailValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  detailAmount: {
    color: COLORS.ignitionYellow,
    fontSize: 18,
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: COLORS.voltBlue,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  disclaimer: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  successContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    margin: 16,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    color: COLORS.success,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  successText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: COLORS.voltBlue,
    borderRadius: 12,
    paddingHorizontal: 40,
    paddingVertical: 14,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})