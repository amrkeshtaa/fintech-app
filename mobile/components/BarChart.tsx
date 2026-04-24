import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface BarData {
  label: string;
  income: number;
  expenses: number;
}

export function BarChart({ data }: { data: BarData[] }) {
  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expenses]));

  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {data.map((d, i) => (
          <View key={i} style={styles.group}>
            <View style={styles.barPair}>
              <View style={[styles.bar, {
                height: Math.max(4, (d.income / maxVal) * 100),
                backgroundColor: colors.success,
              }]} />
              <View style={[styles.bar, {
                height: Math.max(4, (d.expenses / maxVal) * 100),
                backgroundColor: colors.danger,
              }]} />
            </View>
            <Text style={styles.label}>{d.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.danger }]} />
          <Text style={styles.legendText}>Expenses</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 110, gap: 6 },
  group: { flex: 1, alignItems: 'center', gap: 6 },
  barPair: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, flex: 1, width: '100%' },
  bar: { flex: 1, borderRadius: 4 },
  label: { color: colors.textMuted, fontSize: 10 },
  legend: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.textSub, fontSize: 12 },
});
