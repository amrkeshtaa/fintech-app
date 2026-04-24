import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TextInputProps, ViewStyle,
} from 'react-native';
import { colors } from '@/constants/colors';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, prefix, suffix, containerStyle, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.row,
        focused && styles.focused,
        !!error && styles.errored,
      ]}>
        {prefix && <View style={styles.adorn}>{prefix}</View>}
        <TextInput
          style={[styles.input, prefix && styles.inputWithPrefix]}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {suffix && <View style={styles.adornRight}>{suffix}</View>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 13, fontWeight: '500', color: colors.textSub },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    minHeight: 48,
  },
  focused: { borderColor: `${colors.primary}99` },
  errored: { borderColor: `${colors.danger}80` },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputWithPrefix: { paddingLeft: 6 },
  adorn: { paddingLeft: 14 },
  adornRight: { paddingRight: 14 },
  error: { fontSize: 12, color: colors.danger },
});
