import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/auth.store';

export default function Login() {
  const router = useRouter();
  const { sendOtp, loading } = useAuthStore();
  const [phone, setPhone] = useState('');

  const formatPhone = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 4) return `+58 ${digits}`;
    if (digits.length <= 7) return `+58 ${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `+58 ${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 10)}`;
  };

  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      Alert.alert('Teléfono inválido', 'Ingresa un número de 10 dígitos.');
      return;
    }

    const fullPhone = '+58' + digits.slice(-10);
    const success = await sendOtp(fullPhone);
    if (success) {
      router.push({ pathname: '/(auth)/otp', params: { phone: fullPhone } });
    } else {
      Alert.alert('Error', 'No pudimos enviar el código. Intenta de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoArea}>
        <Text style={styles.logo}>VROOM</Text>
        <Text style={styles.tagline}>Repuestos Express</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.title}>Iniciar sesión</Text>
        <Text style={styles.subtitle}>Ingresa tu número de teléfono para continuar</Text>

        <View style={styles.phoneInput}>
          <Text style={styles.flag}>🇻🇪</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+58 412 XXX XXXX"
            placeholderTextColor="#4a5568"
            keyboardType="phone-pad"
            maxLength={17}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSendOtp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Enviando...' : 'Enviar código SMS'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Al continuar, aceptas nuestros términos y condiciones.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', padding: 24 },
  logoArea: { alignItems: 'center', marginBottom: 48 },
  logo: { color: '#0066FF', fontSize: 48, fontWeight: '800', fontFamily: 'Space Grotesk' },
  tagline: { color: '#FFD600', fontSize: 16, fontFamily: 'Space Grotesk', marginTop: 4 },
  form: { width: '100%' },
  title: { color: '#fff', fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#64748b', fontSize: 14, marginBottom: 32, lineHeight: 20 },
  phoneInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1420', borderWidth: 1, borderColor: 'rgba(0,102,255,0.3)', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16 },
  flag: { fontSize: 24, marginRight: 12 },
  input: { flex: 1, color: '#fff', fontSize: 18, paddingVertical: 16 },
  button: { backgroundColor: '#0066FF', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  buttonDisabled: { backgroundColor: '#1e3a5f' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: 'Space Grotesk' },
  disclaimer: { color: '#4a5568', fontSize: 12, textAlign: 'center', lineHeight: 18 },
});