import React from 'react'
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native'

const COLORS = {
  voltBlue: '#0066FF',
  ignitionYellow: '#FFD600',
  background: '#0a0a0f',
  surface: '#0d1420',
  surfaceLight: '#1a2438',
  text: '#e2e8f0',
  textMuted: '#8892a4',
}

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  onSubmit?: () => void
  onVoicePress?: () => void
  placeholder?: string
  autoFocus?: boolean
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onVoicePress,
  placeholder = 'Busca tu repuesto...',
  autoFocus = false,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchIcon}>
        <Text style={styles.iconText}>🔍</Text>
      </View>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {value.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => onChangeText('')}
        >
          <Text style={styles.clearText}>✕</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.voiceButton} onPress={onVoicePress}>
        <Text style={styles.voiceIcon}>🎤</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  searchIcon: {
    width: 24,
    alignItems: 'center',
  },
  iconText: {
    fontSize: 16,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  voiceButton: {
    padding: 4,
  },
  voiceIcon: {
    fontSize: 20,
  },
})