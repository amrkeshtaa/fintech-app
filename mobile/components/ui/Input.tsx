import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TextInputProps, ViewStyle,
} from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label, hint, error, prefix, suffix,
  containerStyle, ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const hasError = !!error;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Text style={styles.label} accessibilityRole="text">
          {label}
        </Text>
      )}

      <View style={[
        styles.row,
        focused && styles.focused,
        hasError && styles.errored,
      ]}>
        {prefix && <View style={styles.adornLeft}>{prefix}</View>}

        <TextInput
          style={[styles.input, prefix ? styles.inputWithPrefix : null, suffix ? styles.inputWithSuffix : null]}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
          accessibilityHint={hint}
          {...props}
        />

        {suffix && <View style={styles.adornRight}>{suffix}</View>}
      </View>

      {/* Error with icon — not color-only (accessibility requirement) */}
      {hasError && (
        <View style={styles.errorRow}>
          <AlertCircle size={13} color={colors.danger} />
          <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>
        </View>
      )}

      {hint && !hasError && (
        <Text style={styles.hint}>{hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textSub,
    letterSpacing: 0.1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    minHeight: 52,  // Large touch target
  },
  focused: {
    borderColor: colors.borderFocus,
    backgroundColor: colors.primaryBg,
  },
  errored: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerBg,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    paddingHorizontal: 14,
    paddingVertical: 13,
    minHeight: 52,
  },
  inputWithPrefix: { paddingLeft: 6 },
  inputWithSuffix: { paddingRight: 6 },
  adornLeft:  { paddingLeft: 14 },
  adornRight: { paddingRight: 14 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  errorText: {
    fontSize: typography.size.xs,
    color: colors.danger,
    fontWeight: typography.weight.medium,
    flex: 1,
  },
  hint: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
});
