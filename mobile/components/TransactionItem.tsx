import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Transaction } from '@/lib/types';
import { formatCurrency, formatRelativeDate } from '@/lib/utils';
import { Badge } from './ui/Badge';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

const TYPE_CFG = {
  receive: { icon: '↓', color: colors.success, bg: colors.successBg, prefix: '+' },
  send:    { icon: '↑', color: colors.danger,  bg: colors.dangerBg,  prefix: '-' },
  payment: { icon: '↑', color: colors.danger,  bg: colors.dangerBg,  prefix: '-' },
  refund:  { icon: '↺', color: colors.info,    bg: colors.infoBg,    prefix: '+' },
  topup:   { icon: '↓', color: colors.success, bg: colors.successBg, prefix: '+' },
};

// Maps tx status to badge display label + variant
const STATUS_BADGE: Record<Transaction['status'], { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  completed: { label: 'Paid',    variant: 'success' },
  pending:   { label: 'Pending', variant: 'warning' },
  failed:    { label: 'Failed',  variant: 'danger'  },
};

export function TransactionItem({ item }: { item: Transaction }) {
  const cfg    = TYPE_CFG[item.type];
  const badge  = STATUS_BADGE[item.status];

  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${item.description}, ${cfg.prefix}${formatCurrency(item.amount)}, ${badge.label}`}
    >
      {/* Icon */}
      <View style={[styles.icon, { backgroundColor: cfg.bg }]}>
        <Text style={[styles.iconText, { color: cfg.color }]} aria-hidden>{cfg.icon}</Text>
      </View>

      {/* Description */}
      <View style={styles.middle}>
        <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
        <Text style={styles.sub} numberOfLines={1}>{item.counterparty} · {formatRelativeDate(item.date)}</Text>
      </View>

      {/* Amount + status */}
      <View style={styles.right}>
        <Text style={[styles.amount, { color: cfg.color }]}>
          {cfg.prefix}{formatCurrency(item.amount)}
        </Text>
        <Badge text={badge.label} variant={badge.variant} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  middle: { flex: 1, gap: 2 },
  desc: {
    color: colors.text,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
  },
  sub: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
  },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
});
