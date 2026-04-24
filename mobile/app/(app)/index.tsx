import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Send, QrCode, Smartphone, FileText, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { TransactionItem } from '@/components/TransactionItem';
import { BarChart } from '@/components/BarChart';
import { VirtualCardView } from '@/components/VirtualCard';
import { formatCurrency } from '@/lib/utils';
import { MOCK_MONTHLY } from '@/lib/mock-data';
import { colors } from '@/constants/colors';

const BIZ_ACTIONS = [
  { icon: Send, label: 'Send', href: '/(app)/send', color: colors.primary },
  { icon: QrCode, label: 'Receive', href: '/(app)/receive', color: colors.purple },
  { icon: Smartphone, label: 'POS', href: '/(app)/pos', color: '#f59e0b' },
  { icon: FileText, label: 'Invoice', href: '/(app)/invoices', color: '#10b981' },
];
const CUST_ACTIONS = [
  { icon: Send, label: 'Send', href: '/(app)/send', color: colors.primary },
  { icon: QrCode, label: 'Receive', href: '/(app)/receive', color: colors.purple },
  { icon: Smartphone, label: 'POS', href: '/(app)/pos', color: '#f59e0b' },
  { icon: FileText, label: 'Spending', href: '/(app)/analytics', color: '#10b981' },
];

export default function HomeScreen() {
  const { user, transactions, cards } = useAppStore();
  if (!user) return null;
  const isBiz = user.role === 'business';
  const actions = isBiz ? BIZ_ACTIONS : CUST_ACTIONS;
  const activeCard = cards[0];
  const cur = MOCK_MONTHLY[MOCK_MONTHLY.length - 1];
  const prev = MOCK_MONTHLY[MOCK_MONTHLY.length - 2];
  const incomeGrowth = ((cur.income - prev.income) / prev.income * 100).toFixed(1);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning 👋</Text>
          <Text style={styles.name}>{user.businessName ?? user.name}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name[0]}</Text>
        </View>
      </View>

      {/* Balance card */}
      <LinearGradient colors={[colors.gradStart, colors.gradMid, colors.gradEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
        <Text style={styles.balLabel}>{isBiz ? 'Business Balance' : 'Your Balance'}</Text>
        <Text style={styles.balAmount}>{formatCurrency(user.balance)}</Text>
        <Text style={styles.balSub}>{user.currency} · Updated just now</Text>
        <View style={styles.balActions}>
          <TouchableOpacity style={styles.balBtn} onPress={() => router.push('/(app)/wallet')}>
            <Text style={styles.balBtnText}>+ Add Money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.balBtn} onPress={() => router.push('/(app)/send')}>
            <Text style={styles.balBtnText}>↑ Send</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Quick actions */}
      <View style={styles.actionsRow}>
        {actions.map(a => (
          <TouchableOpacity key={a.label} style={styles.actionItem} onPress={() => router.push(a.href as any)}>
            <View style={[styles.actionIcon, { backgroundColor: `${a.color}20` }]}>
              <a.icon size={22} color={a.color} />
            </View>
            <Text style={styles.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.row}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Month Income</Text>
          <Text style={styles.statValue}>{formatCurrency(cur.income)}</Text>
          <View style={styles.statBadge}>
            <TrendingUp size={12} color={colors.success} />
            <Text style={[styles.statChange, { color: colors.success }]}>+{incomeGrowth}%</Text>
          </View>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Expenses</Text>
          <Text style={styles.statValue}>{formatCurrency(cur.expenses)}</Text>
          <View style={styles.statBadge}>
            <TrendingDown size={12} color={colors.danger} />
            <Text style={[styles.statChange, { color: colors.danger }]}>vs prev</Text>
          </View>
        </Card>
      </View>

      {/* Chart */}
      <Card>
        <Text style={styles.sectionTitle}>Cash Flow — 6 months</Text>
        <View style={{ marginTop: 12 }}>
          <BarChart data={MOCK_MONTHLY} />
        </View>
      </Card>

      {/* Card preview */}
      {activeCard && (
        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Virtual Card</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/cards')} style={styles.seeAll}>
              <Text style={styles.seeAllText}>Manage</Text>
              <ArrowRight size={14} color={colors.primaryLight} />
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 12, alignItems: 'center' }}>
            <VirtualCardView card={activeCard} compact />
          </View>
          <View style={{ marginTop: 14, gap: 6 }}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Spending limit</Text>
              <Text style={styles.progressValue}>{formatCurrency(activeCard.spent)} / {formatCurrency(activeCard.spendingLimit)}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(100, activeCard.spent / activeCard.spendingLimit * 100)}%` }]} />
            </View>
          </View>
        </Card>
      )}

      {/* Recent transactions */}
      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/wallet')} style={styles.seeAll}>
            <Text style={styles.seeAllText}>See all</Text>
            <ArrowRight size={14} color={colors.primaryLight} />
          </TouchableOpacity>
        </View>
        {transactions.slice(0, 6).map(tx => <TransactionItem key={tx.id} item={tx} />)}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 60, gap: 16, paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  greeting: { fontSize: 13, color: colors.textSub },
  name: { fontSize: 20, fontWeight: '800', color: colors.text },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  balanceCard: { borderRadius: 22, padding: 22 },
  balLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  balAmount: { color: colors.white, fontSize: 38, fontWeight: '800', marginTop: 4 },
  balSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  balActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  balBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
  balBtnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionItem: { flex: 1, alignItems: 'center', gap: 8 },
  actionIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 12, color: colors.textSub, fontWeight: '500' },
  row: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, gap: 4 },
  statLabel: { fontSize: 12, color: colors.textSub },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  statBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  statChange: { fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSub, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: { fontSize: 13, color: colors.primaryLight },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 12, color: colors.textSub },
  progressValue: { fontSize: 12, color: colors.text },
  progressTrack: { height: 6, backgroundColor: colors.bgElevated, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
});
