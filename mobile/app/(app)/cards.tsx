import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Snowflake, Play, Eye, EyeOff, Copy, CheckCircle, Shield } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VirtualCardView } from '@/components/VirtualCard';
import { maskCard, formatCurrency } from '@/lib/utils';
import { colors } from '@/constants/colors';

export default function CardsScreen() {
  const { cards, toggleCardFreeze } = useAppStore();
  const [selected, setSelected] = useState(cards[0]);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [walletMsg, setWalletMsg] = useState('');

  if (!selected) return null;

  const copyCard = async () => {
    await Clipboard.setStringAsync(`4111 1111 1111 ${selected.last4}`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addToWallet = (wallet: string) => {
    setWalletMsg(`Added to ${wallet === 'apple' ? 'Apple Pay' : 'Google Pay'}!`);
    setTimeout(() => setWalletMsg(''), 3000);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Virtual Cards</Text>

      {/* Selector */}
      {cards.length > 1 && (
        <View style={styles.selector}>
          {cards.map(c => (
            <TouchableOpacity key={c.id} style={[styles.selectorBtn, selected.id === c.id && styles.selectorActive]} onPress={() => setSelected(c)}>
              <Text style={[styles.selectorText, selected.id === c.id && { color: colors.primary }]}>•••• {c.last4}</Text>
              {c.status === 'frozen' && <Badge text="Frozen" variant="info" />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Card visual */}
      <Card>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardNetwork}>{selected.network.toUpperCase()}</Text>
            <Text style={styles.cardNumber}>•••• {selected.last4}</Text>
          </View>
          <Badge text={selected.status.charAt(0).toUpperCase() + selected.status.slice(1)} variant={selected.status === 'active' ? 'success' : 'info'} />
        </View>
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          <VirtualCardView card={selected} />
        </View>

        {/* Action buttons */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => toggleCardFreeze(selected.id)}>
            {selected.status === 'frozen'
              ? <Play size={18} color={colors.success} />
              : <Snowflake size={18} color={colors.info} />}
            <Text style={styles.actionBtnText}>{selected.status === 'frozen' ? 'Unfreeze' : 'Freeze'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowDetails(v => !v)}>
            {showDetails ? <EyeOff size={18} color={colors.textSub} /> : <Eye size={18} color={colors.textSub} />}
            <Text style={styles.actionBtnText}>{showDetails ? 'Hide' : 'Details'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={copyCard}>
            {copied ? <CheckCircle size={18} color={colors.success} /> : <Copy size={18} color={colors.textSub} />}
            <Text style={styles.actionBtnText}>{copied ? 'Copied' : 'Copy'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Shield size={18} color={colors.warning} />
            <Text style={styles.actionBtnText}>3DS</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Card details */}
      {showDetails && (
        <Card>
          <Text style={styles.sectionTitle}>Card Details</Text>
          {[
            { label: 'Card Number', value: `4111 1111 1111 ${selected.last4}` },
            { label: 'Expiry', value: `${selected.expiryMonth}/${selected.expiryYear}` },
            { label: 'CVV', value: '***' },
            { label: 'Billing Zip', value: '10001' },
          ].map(r => (
            <View key={r.label} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{r.label}</Text>
              <View style={styles.detailRight}>
                <Text style={styles.detailValue}>{r.value}</Text>
                <TouchableOpacity onPress={() => Clipboard.setStringAsync(r.value)}>
                  <Copy size={14} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <Text style={styles.detailWarning}>Never share your card details with anyone.</Text>
        </Card>
      )}

      {/* Spending limit */}
      <Card>
        <Text style={styles.sectionTitle}>Spending Limit</Text>
        <View style={styles.limitRow}>
          <Text style={styles.limitLabel}>Used</Text>
          <Text style={styles.limitValue}>{formatCurrency(selected.spent)}</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.min(100, selected.spent / selected.spendingLimit * 100)}%` }]} />
        </View>
        <View style={styles.limitRow}>
          <Text style={styles.limitSub}>$0</Text>
          <Text style={styles.limitSub}>Limit: {formatCurrency(selected.spendingLimit)}</Text>
        </View>
      </Card>

      {/* Digital wallets */}
      <Card>
        <Text style={styles.sectionTitle}>Digital Wallets</Text>
        {walletMsg ? (
          <View style={styles.walletMsg}>
            <CheckCircle size={16} color={colors.success} />
            <Text style={{ color: colors.success, fontSize: 13 }}>{walletMsg}</Text>
          </View>
        ) : null}
        {[
          { key: 'apple', label: 'Apple Pay', emoji: '🍎', added: selected.addedToApplePay },
          { key: 'google', label: 'Google Pay', emoji: '🟢', added: selected.addedToGooglePay },
        ].map(w => (
          <View key={w.key} style={styles.walletRow}>
            <View style={styles.walletLeft}>
              <View style={styles.walletIcon}><Text style={{ fontSize: 18 }}>{w.emoji}</Text></View>
              <View>
                <Text style={styles.walletName}>{w.label}</Text>
                <Text style={styles.walletStatus}>{w.added ? 'Active' : 'Not added'}</Text>
              </View>
            </View>
            {w.added
              ? <Badge text="Added" variant="success" />
              : <Button title="Add" onPress={() => addToWallet(w.key)} size="sm" />}
          </View>
        ))}
      </Card>

      {/* Controls */}
      <Card>
        <Text style={styles.sectionTitle}>Card Controls</Text>
        {[
          { label: 'Online payments', on: true },
          { label: 'Contactless (NFC)', on: true },
          { label: 'International', on: false },
          { label: 'ATM withdrawals', on: false },
        ].map(ctrl => (
          <View key={ctrl.label} style={styles.ctrlRow}>
            <Text style={styles.ctrlLabel}>{ctrl.label}</Text>
            <View style={[styles.toggle, ctrl.on && styles.toggleOn]}>
              <View style={[styles.toggleDot, ctrl.on && styles.toggleDotOn]} />
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 60, gap: 16, paddingBottom: 30 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  selector: { flexDirection: 'row', gap: 10 },
  selectorBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard },
  selectorActive: { borderColor: `${colors.primary}66`, backgroundColor: `${colors.primary}10` },
  selectorText: { color: colors.textSub, fontSize: 13, fontWeight: '600' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardNetwork: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardNumber: { fontSize: 13, color: colors.textSub, marginTop: 2 },
  actionsGrid: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: 14, backgroundColor: colors.bgElevated },
  actionBtnText: { fontSize: 11, color: colors.textSub },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSub, textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel: { color: colors.textSub, fontSize: 13 },
  detailRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailValue: { color: colors.text, fontSize: 13, fontFamily: 'monospace' },
  detailWarning: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 12 },
  limitRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  limitLabel: { color: colors.textSub, fontSize: 13 },
  limitValue: { color: colors.text, fontWeight: '600', fontSize: 13 },
  limitSub: { color: colors.textMuted, fontSize: 11 },
  track: { height: 8, backgroundColor: colors.bgElevated, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  walletMsg: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, backgroundColor: colors.successBg, borderRadius: 12, marginBottom: 12 },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  walletLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  walletIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.bgElevated, justifyContent: 'center', alignItems: 'center' },
  walletName: { color: colors.text, fontWeight: '600', fontSize: 14 },
  walletStatus: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  ctrlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  ctrlLabel: { color: colors.text, fontSize: 14 },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: colors.bgElevated, padding: 2, justifyContent: 'center' },
  toggleOn: { backgroundColor: colors.primary },
  toggleDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.white, alignSelf: 'flex-start' },
  toggleDotOn: { alignSelf: 'flex-end' },
});
