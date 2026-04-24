import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react-native';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { BarChart } from '@/components/BarChart';
import { formatCurrency } from '@/lib/utils';
import { MOCK_MONTHLY, MOCK_CATEGORIES } from '@/lib/mock-data';
import { colors } from '@/constants/colors';

const TABS = ['Monthly', 'Categories', 'Insights'] as const;
type Tab = typeof TABS[number];

export default function AnalyticsScreen() {
  const { transactions } = useAppStore();
  const [tab, setTab] = useState<Tab>('Monthly');

  const totalIncome   = MOCK_MONTHLY.reduce((s, m) => s + m.income, 0);
  const totalExpenses = MOCK_MONTHLY.reduce((s, m) => s + m.expenses, 0);
  const netFlow       = totalIncome - totalExpenses;
  const savingsRate   = ((netFlow / totalIncome) * 100).toFixed(1);

  const cur  = MOCK_MONTHLY[MOCK_MONTHLY.length - 1];
  const prev = MOCK_MONTHLY[MOCK_MONTHLY.length - 2];
  const incomeChange   = ((cur.income   - prev.income)   / prev.income   * 100).toFixed(1);
  const expenseChange  = ((cur.expenses - prev.expenses) / prev.expenses * 100).toFixed(1);

  const recentCategories = transactions
    .filter(t => t.type === 'payment' || t.type === 'send')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {});

  const INSIGHTS = [
    { emoji: '📈', title: 'Revenue growing', body: `Income up ${incomeChange}% vs last month — great momentum.` },
    { emoji: '💡', title: 'Spending dipped', body: `Expenses down ${Math.abs(+expenseChange)}% — well controlled.` },
    { emoji: '🎯', title: 'Savings rate', body: `You saved ${savingsRate}% of your income over 6 months.` },
    { emoji: '⚡', title: 'Top category', body: `Supplies is your largest expense at 32% of spend.` },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Analytics</Text>

      {/* KPI row */}
      <View style={styles.kpiRow}>
        {[
          { label: 'Total Income', value: formatCurrency(totalIncome), icon: TrendingUp, color: colors.success, bg: colors.successBg },
          { label: 'Total Spend', value: formatCurrency(totalExpenses), icon: TrendingDown, color: colors.danger, bg: colors.dangerBg },
        ].map(k => (
          <Card key={k.label} style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: k.bg }]}>
              <k.icon size={18} color={k.color} />
            </View>
            <Text style={styles.kpiLabel}>{k.label}</Text>
            <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
          </Card>
        ))}
      </View>

      <View style={styles.kpiRow}>
        {[
          { label: 'Net Cash Flow', value: formatCurrency(netFlow), icon: DollarSign, color: colors.primary, bg: `${colors.primary}20` },
          { label: 'Savings Rate', value: `${savingsRate}%`, icon: Activity, color: colors.purple, bg: `${colors.purple}20` },
        ].map(k => (
          <Card key={k.label} style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: k.bg }]}>
              <k.icon size={18} color={k.color} />
            </View>
            <Text style={styles.kpiLabel}>{k.label}</Text>
            <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
          </Card>
        ))}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'Monthly' && (
        <Card>
          <Text style={styles.sectionTitle}>Cash Flow — 6 months</Text>
          <View style={{ marginTop: 12 }}>
            <BarChart data={MOCK_MONTHLY} />
          </View>
          <View style={styles.changeRow}>
            <View style={styles.changePill}>
              <TrendingUp size={12} color={colors.success} />
              <Text style={[styles.changeText, { color: colors.success }]}>Income +{incomeChange}%</Text>
            </View>
            <View style={[styles.changePill, { backgroundColor: colors.dangerBg }]}>
              <TrendingDown size={12} color={colors.danger} />
              <Text style={[styles.changeText, { color: colors.danger }]}>Expenses {+expenseChange > 0 ? '+' : ''}{expenseChange}%</Text>
            </View>
          </View>
          <View style={{ marginTop: 16, gap: 8 }}>
            {MOCK_MONTHLY.map(m => (
              <View key={m.month} style={styles.monthRow}>
                <Text style={styles.monthName}>{m.month}</Text>
                <View style={styles.monthBars}>
                  <View style={[styles.monthBar, { width: `${(m.income / 13000) * 100}%`, backgroundColor: colors.success }]} />
                  <View style={[styles.monthBar, { width: `${(m.expenses / 13000) * 100}%`, backgroundColor: colors.danger, opacity: 0.7 }]} />
                </View>
                <Text style={styles.monthNet}>{formatCurrency(m.income - m.expenses)}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {tab === 'Categories' && (
        <Card>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          {MOCK_CATEGORIES.map(cat => (
            <View key={cat.name} style={styles.catRow}>
              <View style={styles.catLeft}>
                <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                <Text style={styles.catEmoji}>{cat.icon}</Text>
                <View>
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={styles.catPct}>{cat.percentage}% of spend</Text>
                </View>
              </View>
              <View style={styles.catRight}>
                <Text style={styles.catAmount}>{formatCurrency(cat.amount)}</Text>
                <View style={styles.catTrack}>
                  <View style={[styles.catFill, { width: `${cat.percentage}%`, backgroundColor: cat.color }]} />
                </View>
              </View>
            </View>
          ))}
        </Card>
      )}

      {tab === 'Insights' && (
        <View style={{ gap: 12 }}>
          {INSIGHTS.map(ins => (
            <Card key={ins.title}>
              <View style={styles.insightRow}>
                <Text style={styles.insightEmoji}>{ins.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.insightTitle}>{ins.title}</Text>
                  <Text style={styles.insightBody}>{ins.body}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 60, gap: 16, paddingBottom: 30 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  kpiRow: { flexDirection: 'row', gap: 12 },
  kpiCard: { flex: 1, gap: 6 },
  kpiIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  kpiLabel: { fontSize: 11, color: colors.textSub, marginTop: 4 },
  kpiValue: { fontSize: 16, fontWeight: '800' },
  tabs: { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: 14, padding: 4, gap: 4 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabBtnActive: { backgroundColor: colors.bgElevated },
  tabText: { fontSize: 13, color: colors.textSub, fontWeight: '600' },
  tabTextActive: { color: colors.text },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSub, textTransform: 'uppercase', letterSpacing: 0.5 },
  changeRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  changePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.successBg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  changeText: { fontSize: 12, fontWeight: '600' },
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  monthName: { width: 30, fontSize: 12, color: colors.textSub, fontWeight: '600' },
  monthBars: { flex: 1, gap: 3 },
  monthBar: { height: 6, borderRadius: 3 },
  monthNet: { width: 64, textAlign: 'right', fontSize: 12, color: colors.text, fontWeight: '600' },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  catLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catEmoji: { fontSize: 18 },
  catName: { color: colors.text, fontWeight: '600', fontSize: 14 },
  catPct: { color: colors.textMuted, fontSize: 11, marginTop: 1 },
  catRight: { alignItems: 'flex-end', gap: 4, minWidth: 90 },
  catAmount: { color: colors.text, fontWeight: '700', fontSize: 13 },
  catTrack: { width: 80, height: 4, backgroundColor: colors.bgElevated, borderRadius: 2, overflow: 'hidden' },
  catFill: { height: '100%', borderRadius: 2 },
  insightRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  insightEmoji: { fontSize: 28 },
  insightTitle: { color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: 4 },
  insightBody: { color: colors.textSub, fontSize: 13, lineHeight: 18 },
});
