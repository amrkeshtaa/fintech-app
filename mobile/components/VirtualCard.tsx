import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { VirtualCard } from '@/lib/types';
import { maskCard } from '@/lib/utils';
import { colors } from '@/constants/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

interface Props {
  card: VirtualCard;
  compact?: boolean;
}

export function VirtualCardView({ card, compact = false }: Props) {
  const w = compact ? CARD_WIDTH * 0.7 : CARD_WIDTH;
  const h = w * 0.585;  // Standard 85.6mm × 53.98mm aspect ratio
  const isFrozen = card.status === 'frozen';

  // Visa: teal-to-cyan premium gradient | Mastercard: dark slate
  const gradients: [string, string, string] = card.network === 'visa'
    ? [colors.gradStart, colors.gradMid, colors.gradEnd]
    : ['#1E293B', '#0F172A', '#334155'];

  return (
    <View style={{ width: w, height: h }}>
      <LinearGradient
        colors={gradients}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { width: w, height: h }]}
      >
        {/* Decorative circles */}
        <View style={[styles.circle1, {
          width: w * 0.55, height: w * 0.55,
          borderRadius: w * 0.275,
          top: -w * 0.2, right: -w * 0.15,
        }]} />
        <View style={[styles.circle2, {
          width: w * 0.35, height: w * 0.35,
          borderRadius: w * 0.175,
          top: w * 0.25, right: -w * 0.05,
        }]} />

        {/* Frozen overlay */}
        {isFrozen && (
          <View style={styles.frozenOverlay}>
            <Text style={styles.frozenIcon}>❄️</Text>
            <Text style={styles.frozenText}>Card Frozen</Text>
          </View>
        )}

        {/* Top row */}
        <View style={styles.topRow}>
          <Text style={[styles.brand, { fontSize: w * 0.038 }]}>PayNow</Text>
          <Text style={{ fontSize: w * 0.045 }}>📶</Text>
        </View>

        {/* EMV chip */}
        {!compact && (
          <View style={[styles.chip, { width: w * 0.1, height: w * 0.075 }]} />
        )}

        {/* Card number */}
        <Text style={[styles.number, { fontSize: w * 0.038, marginTop: compact ? 'auto' : 8 }]}>
          {maskCard(card.last4)}
        </Text>

        {/* Bottom row */}
        <View style={styles.bottomRow}>
          <View>
            <Text style={[styles.subLabel, { fontSize: w * 0.026 }]}>CARD HOLDER</Text>
            <Text style={[styles.fieldValue, { fontSize: w * 0.036 }]}>{card.cardholderName}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.subLabel, { fontSize: w * 0.026 }]}>EXPIRES</Text>
            <Text style={[styles.fieldValue, { fontSize: w * 0.036 }]}>{card.expiryMonth}/{card.expiryYear}</Text>
          </View>
          <View>
            {card.network === 'visa' ? (
              <Text style={[styles.visaText, { fontSize: w * 0.07 }]}>VISA</Text>
            ) : (
              <View style={styles.masterRow}>
                <View style={[styles.mcDot, { backgroundColor: '#EF4444', width: w * 0.07, height: w * 0.07, borderRadius: w * 0.035 }]} />
                <View style={[styles.mcDot, styles.mcDotRight, { backgroundColor: '#F59E0B', width: w * 0.07, height: w * 0.07, borderRadius: w * 0.035 }]} />
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  circle1: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.08)' },
  circle2: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.05)' },
  frozenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 20,
  },
  frozenIcon: { fontSize: 32 },
  frozenText: { color: '#fff', fontWeight: '700', marginTop: 6, fontSize: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { color: 'rgba(255,255,255,0.85)', fontWeight: '700', letterSpacing: 0.5 },
  chip: { backgroundColor: 'rgba(255,215,0,0.8)', borderRadius: 4, marginTop: 8 },
  number: { color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace', letterSpacing: 2 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  subLabel: { color: 'rgba(255,255,255,0.5)', letterSpacing: 1, marginBottom: 2 },
  fieldValue: { color: '#fff', fontWeight: '700', letterSpacing: 0.5 },
  visaText: { color: '#fff', fontWeight: '900', fontStyle: 'italic', letterSpacing: -1 },
  masterRow: { flexDirection: 'row', alignItems: 'center' },
  mcDot: { opacity: 0.9 },
  mcDotRight: { marginLeft: -8 },
});
