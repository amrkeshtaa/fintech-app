import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Transaction } from '@/lib/types';
import { formatCurrency, formatRelativeDate } from '@/lib/utils';
import { Badge } from './ui/Badge';
import { colors } from '@/constants/colors';

const typeConfig = {
  receive: { icon: '↓', color: colors.success, bg: colors.successBg, prefix: '+' },
  send:    { icon: '↑', color: colors.danger,  bg: colors.dangerBg,  prefix: '-' },
  payment: { icon: '↑', color: colors.danger,  bg: colors.dangerBg,  prefix: '-' },
  refund:  { icon: '↺', color: colors.info,    bg: colors.infoBg,    prefix: '+' },
  topup:   { icon: '+', color: colors.success, bg: colors.successBg, prefix: '+' },
};

const statusVariant = {
  completed: 'success' as const,
  pending:   'warning' as const,
  failed:    'danger' as const,
};

export function TransactionItem({ item }: { item: Transaction }) {
  const cfg = typeConfig[item.type];
  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: cfg.bg }]}>
        <Text style={[styles.iconText, { color: cfg.color }]}>{cfg.icon}</Text>
      </View>
      <View style={styles.middle}>
        <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
        <Text style={styles.sub}>{item.counterparty} · {formatRelativeDate(item.date)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: cfg.color }]}>
          {cfg.prefix}{formatCurrency(item.amount)}
        </Text>
        <Badge text={item.status} variant={statusVariant[item.status]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  icon: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  iconText: { fontSize: 16, fontWeight: '700' },
  middle: { flex: 1 },
  desc: { color: colors.text, fontSize: 14, fontWeight: '500' },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 14, fontWeight: '700' },
});
