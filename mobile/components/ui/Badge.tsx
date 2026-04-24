import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const cfg: Record<Variant, { bg: string; text: string }> = {
  success: { bg: colors.successBg, text: colors.success },
  warning: { bg: colors.warningBg, text: colors.warning },
  danger:  { bg: colors.dangerBg,  text: colors.danger },
  info:    { bg: colors.infoBg,    text: colors.info },
  neutral: { bg: 'rgba(100,116,139,0.15)', text: colors.textSub },
};

export function Badge({ text, variant = 'neutral' }: { text: string; variant?: Variant }) {
  const c = cfg[variant];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '600' },
});
