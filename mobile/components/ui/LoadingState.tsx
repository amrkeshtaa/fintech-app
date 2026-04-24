import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  overlay?: boolean;
}

export function LoadingState({
  message,
  size = 'large',
  overlay = false,
}: LoadingStateProps) {
  return (
    <View
      style={[styles.container, overlay && styles.overlay]}
      accessibilityRole="progressbar"
      accessibilityLabel={message ?? 'Loading'}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.card}>
        <ActivityIndicator size={size} color={colors.primary} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );
}

// Inline loading row — used inside lists / cards
export function LoadingRow() {
  return (
    <View style={styles.row}>
      <ActivityIndicator size="small" color={colors.primary} />
      <Text style={styles.rowText}>Loading…</Text>
    </View>
  );
}

// Skeleton shimmer placeholder (lightweight version)
export function SkeletonBlock({ width, height, radius = 8 }: { width: number | string; height: number; radius?: number }) {
  return (
    <View
      style={[styles.skeleton, { width: width as any, height, borderRadius: radius }]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(248,250,252,0.85)',
    zIndex: 100,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  message: {
    fontSize: typography.size.base,
    color: colors.textSub,
    fontWeight: typography.weight.medium,
    textAlign: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16 },
  rowText: { fontSize: typography.size.base, color: colors.textSub },
  skeleton: {
    backgroundColor: colors.bgCardAlt,
  },
});
