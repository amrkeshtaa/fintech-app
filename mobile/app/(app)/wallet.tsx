import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowDownLeft, ArrowUpRight, CheckCircle, X, Building, CreditCard } from 'lucide-react-native';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TransactionItem } from '@/components/TransactionItem';
import { formatCurrency } from '@/lib/utils';
import { colors } from '@/constants/colors';

type ModalType = null | 'topup' | 'withdraw';

export default function WalletScreen() {
  const { user, transactions, addTransaction } = useAppStore();
  const [modal, setModal] = useState<ModalType>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'bank' | 'card'>('bank');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user) return null;
  const totalIn  = transactions.filter(t => t.type === 'receive' || t.type === 'topup').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'send' || t.type === 'payment').reduce((s, t) => s + t.amount, 0);

  const handleAction = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    addTransaction({ type: modal === 'topup' ? 'topup' : 'send', amount: val, currency: user.currency, description: modal === 'topup' ? 'Wallet top-up' : 'Withdrawal', counterparty: method === 'bank' ? 'Bank Transfer' : 'Debit Card', status: 'completed', category: modal === 'topup' ? 'Top-up' : 'Withdrawal', date: new Date().toISOString() });
    setLoading(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setModal(null); setAmount(''); }, 1500);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Balance */}
      <LinearGradient colors={['#6366f1', '#8b5cf6', '#a855f7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Text style={styles.heroLabel}>Available Balance</Text>
        <Text style={styles.heroAmount}>{formatCurrency(user.balance)}</Text>
        <Text style={styles.heroSub}>{user.currency} · Real-time</Text>
        <View style={styles.heroActions}>
          <TouchableOpacity style={styles.heroBtn} onPress={() => setModal('topup')}>
            <Text style={styles.heroBtnText}>+ Add Money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroBtn} onPress={() => setModal('withdraw')}>
            <Text style={styles.heroBtnText}>↑ Withdraw</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <View style={styles.statIcon}><ArrowDownLeft size={18} color={colors.success} /></View>
          <Text style={styles.statLabel}>Money In</Text>
          <Text style={styles.statValue}>{formatCurrency(totalIn)}</Text>
        </Card>
        <Card style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.dangerBg }]}><ArrowUpRight size={18} color={colors.danger} /></View>
          <Text style={styles.statLabel}>Money Out</Text>
          <Text style={styles.statValue}>{formatCurrency(totalOut)}</Text>
        </Card>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>All Transactions</Text>
        {transactions.map(tx => <TransactionItem key={tx.id} item={tx} />)}
      </Card>

      {/* Modal */}
      <Modal visible={!!modal} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => !loading && setModal(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            {success ? (
              <View style={styles.successBox}>
                <CheckCircle size={48} color={colors.success} />
                <Text style={styles.successTitle}>{modal === 'topup' ? 'Money added!' : 'Withdrawal sent!'}</Text>
                <Text style={styles.successSub}>{formatCurrency(parseFloat(amount))} processed</Text>
              </View>
            ) : (
              <>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>{modal === 'topup' ? 'Add Money' : 'Withdraw Funds'}</Text>
                  <TouchableOpacity onPress={() => setModal(null)}><X size={20} color={colors.textSub} /></TouchableOpacity>
                </View>
                <View style={styles.methods}>
                  {([['bank', 'Bank Transfer', Building], ['card', 'Debit Card', CreditCard]] as const).map(([m, l, Icon]) => (
                    <TouchableOpacity key={m} style={[styles.method, method === m && styles.methodActive]} onPress={() => setMethod(m)}>
                      <Icon size={16} color={method === m ? colors.primary : colors.textSub} />
                      <Text style={[styles.methodText, method === m && { color: colors.primary }]}>{l}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Input label="Amount (USD)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" prefix={<Text style={{ color: colors.textSub }}>$</Text>} containerStyle={{ marginVertical: 16 }} />
                <View style={styles.modalBtns}>
                  <Button title="Cancel" onPress={() => setModal(null)} variant="secondary" style={{ flex: 1 }} />
                  <Button title={modal === 'topup' ? 'Add Money' : 'Withdraw'} onPress={handleAction} loading={loading} style={{ flex: 1 }} />
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 60, gap: 16, paddingBottom: 30 },
  hero: { borderRadius: 22, padding: 22 },
  heroLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  heroAmount: { color: colors.white, fontSize: 40, fontWeight: '800', marginTop: 4 },
  heroSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  heroActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  heroBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
  heroBtnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, gap: 6 },
  statIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.successBg, justifyContent: 'center', alignItems: 'center' },
  statLabel: { fontSize: 12, color: colors.textSub },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSub, textTransform: 'uppercase', marginBottom: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  methods: { flexDirection: 'row', gap: 12 },
  method: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  methodActive: { borderColor: `${colors.primary}66`, backgroundColor: `${colors.primary}10` },
  methodText: { color: colors.textSub, fontSize: 13, fontWeight: '500' },
  modalBtns: { flexDirection: 'row', gap: 12 },
  successBox: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  successTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  successSub: { fontSize: 14, color: colors.textSub },
});
