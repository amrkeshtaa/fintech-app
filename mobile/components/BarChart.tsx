import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

interface BarData {
  label: string;
  income: number;
  expenses: number;
}

const CHART_HEIGHT = 120;

export function BarChart({ data }: { data: BarData[] }) {
  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expenses]), 1);

  return (
    <View style={styles.container} accessibilityRole="image" accessibilityLabel="Cash flow bar chart">
      {/* Y-axis lines (subtle grid) */}
      <View style={styles.gridLines} pointerEvents="none">
        {[0.25, 0.5, 0.75, 1].map(pct => (
          <View key={pct} style={[styles.gridLine, { bottom: pct * CHART_HEIGHT }]} />
        ))}
      </View>

      {/* Bars */}
      <View style={styles.bars}>
        {data.map((d, i) => (
          <View key={i} style={styles.group}>
            <View style={[styles.barPair, { height: CHART_HEIGHT }]}>
              {/* Income bar */}
              <View
                style={[styles.bar, styles.barIncome, {
                  height: Math.max(4, (d.income / maxVal) * CHART_HEIGHT),
                }]}
                accessibilityLabel={`${d.label} income ${d.income}`}
              />
              {/* Expense bar */}
              <View
                style={[styles.bar, styles.barExpense, {
                  height: Math.max(4, (d.expenses / maxVal) * CHART_HEIGHT),
                }]}
                accessibilityLabel={`${d.label} expenses ${d.expenses}`}
              />
            </View>
            <Text style={styles.label}>{d.label}</Text>
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {[
          { color: colors.success, label: 'Income' },
          { color: colors.danger,  label: 'Expenses' },
        ].map(l => (
          <View key={l.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: l.color }]} />
            <Text style={styles.legendText}>{l.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  gridLines: {
    position: 'absolute',
    left: 0, right: 0, bottom: 22,
    height: CHART_HEIGHT,
  },
  gridLine: {
    position: 'absolute',
    left: 0, right: 0,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginBottom: 4,
  },
  group: { flex: 1, alignItems: 'center', gap: 6 },
  barPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    width: '100%',
  },
  bar: { flex: 1, borderRadius: 4 },
  barIncome:  { backgroundColor: colors.success },
  barExpense: { backgroundColor: colors.dangerBg, borderWidth: 1, borderColor: colors.dangerBorder },
  label: {
    color: colors.textMuted,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  legend: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.textSub, fontSize: typography.size.sm },
});
