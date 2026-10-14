import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/auth.store';

export default function Otp() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const { verifyOtp, resendOtp, loading } = useAuthStore();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const inputs = useRef<(TextInput | null)[]>([]);

  const phone = params?.phone || '';

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(timer); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (newCode.every((d) => d !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (fullCode?: string) => {
    const verifyCode = fullCode || code.join('');
    if (verifyCode.length !== 6) return;

    const success = await verifyOtp(phone, verifyCode);
    if (success) {
      router.replace('/');
    } else {
      Alert.alert('Código incorrecto', 'Verifica el código e intenta de nuevo.');
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    const ok = await sendOtp(phone);
    if (ok) {
      setResendTimer(60);
      setCode(['', '', '', '', '', '']);
    } else {
      Alert.alert('Error', 'No pudimos reenviar el código.');
    }
  };

  const sendOtp = async (p: string) => {
    return await resendOtp(p);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Código de verificación</Text>
      <Text style={styles.subtitle}>
        Enviamos un código de 6 dígitos a{'\n'}{phone}
      </Text>

      <View style={styles.otpContainer}>
        {code.map((digit, i) => (
          <TextInput
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            style={[styles.otpBox, digit && styles.otpBoxFilled]}
            value={digit}
            onChangeText={(text) => handleChange(text, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            autoFocus={i === 0}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.verifyButton, (code.join('').length < 6 || loading) && styles.buttonDisabled]}
        onPress={() => handleVerify()}
        disabled={code.join('').length < 6 || loading}
      >
        <Text style={styles.verifyButtonText}>
          {loading ? 'Verificando...' : 'Verificar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleResend}
        disabled={resendTimer > 0}
      >
        <Text style={[styles.resendText, resendTimer > 0 && styles.resendDisabled]}>
          {resendTimer > 0 ? `Reenviar en ${resendTimer}s` : 'Reenviar código'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', padding: 24, alignItems: 'center' },
  title: { color: '#fff', fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  subtitle: { color: '#64748b', fontSize: 14, marginBottom: 40, textAlign: 'center', lineHeight: 22 },
  otpContainer: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  otpBox: { width: 48, height: 56, backgroundColor: '#0d1420', borderWidth: 2, borderColor: 'rgba(0,102,255,0.3)', borderRadius: 12, color: '#fff', fontSize: 24, fontWeight: '700', fontFamily: 'Space Grotesk' },
  otpBoxFilled: { borderColor: '#0066FF', backgroundColor: 'rgba(0,102,255,0.1)' },
  verifyButton: { backgroundColor: '#0066FF', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 64, marginBottom: 24 },
  buttonDisabled: { backgroundColor: '#1e3a5f' },
  verifyButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: 'Space Grotesk' },
  resendButton: { marginBottom: 32 },
  resendText: { color: '#0066FF', fontSize: 14 },
  resendDisabled: { color: '#4a5568' },
  backText: { color: '#64748b', fontSize: 14, marginTop: 16 },
});