import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle, QrCode, Wifi } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { colors } from '@/constants/colors';

type Mode = 'qr' | 'nfc';

export default function POSScreen() {
  const { user, addTransaction } = useAppStore();
  const [amount, setAmount]     = useState('');
  const [mode, setMode]         = useState<Mode>('qr');
  const [charged, setCharged]   = useState(false);
  const [loading, setLoading]   = useState(false);

  if (!user) return null;

  const parsed = parseFloat(amount) || 0;
  const KEYS   = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];

  const pressKey = (k: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (k === '⌫') { setAmount(v => v.slice(0, -1)); return; }
    if (k === '.' && amount.includes('.')) return;
    if (amount.split('.')[1]?.length >= 2) return;
    setAmount(v => (v === '' && k === '.') ? '0.' : v + k);
  };

  const handleCharge = async () => {
    if (!parsed) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    addTransaction({
      type: 'receive',
      amount: parsed,
      currency: user.currency,
      description: 'POS payment',
      counterparty: 'Walk-in Customer',
      status: 'completed',
      category: 'Sales',
      date: new Date().toISOString(),
    });
    setLoading(false);
    setCharged(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (charged) return (
    <View style={styles.successScreen}>
      <View style={styles.successCircle}>
        <CheckCircle size={56} color={colors.success} />
      </View>
      <Text style={styles.successTitle}>Payment received!</Text>
      <Text style={styles.successAmt}>{formatCurrency(parsed)}</Text>
      <Text style={styles.successSub}>Walk-in Customer</Text>
      <Button title="New Charge" onPress={() => { setCharged(false); setAmount(''); }} style={{ marginTop: 32, width: 200 }} />
      <TouchableOpacity onPress={() => router.replace('/(app)')} style={{ marginTop: 14 }}>
        <Text style={{ color: colors.textSub, fontSize: 14 }}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );

  const qrValue = `paynow://pos?merchant=${encodeURIComponent(user.businessName ?? user.name)}&amount=${parsed}`;

  return (
    <View style={styles.screen}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <ArrowLeft size={20} color={colors.primaryLight} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.pageTitle}>Point of Sale</Text>

      {/* Amount display */}
      <View style={styles.amountBox}>
        <Text style={styles.currency}>USD</Text>
        <Text style={styles.amountText}>{amount ? `$${amount}` : '$0.00'}</Text>
        {parsed > 0 && <Text style={styles.amountWords}>{formatCurrency(parsed)}</Text>}
      </View>

      {/* Mode toggle */}
      <View style={styles.modeRow}>
        {(['qr', 'nfc'] as Mode[]).map(m => (
          <TouchableOpacity key={m} style={[styles.modeBtn, mode === m && styles.modeBtnActive]} onPress={() => setMode(m)}>
            {m === 'qr' ? <QrCode size={16} color={mode === m ? colors.primary : colors.textSub} /> : <Wifi size={16} color={mode === m ? colors.primary : colors.textSub} />}
            <Text style={[styles.modeBtnText, mode === m && { color: colors.primary }]}>{m === 'qr' ? 'QR Code' : 'Tap / NFC'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* QR or NFC display */}
      {parsed > 0 && mode === 'qr' && (
        <View style={styles.qrBox}>
          <QRCode value={qrValue} size={140} color={colors.text} backgroundColor="transparent" />
          <Text style={styles.qrHint}>Customer scans to pay {formatCurrency(parsed)}</Text>
        </View>
      )}

      {parsed > 0 && mode === 'nfc' && (
        <View style={styles.nfcBox}>
          <View style={styles.nfcPulse}>
            <Wifi size={48} color={colors.primary} />
          </View>
          <Text style={styles.nfcText}>Hold device near customer's phone</Text>
          <Text style={styles.nfcAmt}>{formatCurrency(parsed)}</Text>
        </View>
      )}

      {/* Keypad */}
      <View style={styles.keypad}>
        {KEYS.map(k => (
          <TouchableOpacity key={k} style={styles.key} onPress={() => pressKey(k)}>
            <Text style={[styles.keyText, k === '⌫' && { color: colors.danger }]}>{k}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title={parsed ? `Charge ${formatCurrency(parsed)}` : 'Enter amount'}
        onPress={handleCharge}
        loading={loading}
        disabled={!parsed}
        fullWidth
        style={styles.chargeBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 20, paddingTop: 60 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backText: { color: colors.primaryLight, fontSize: 14 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 20 },
  amountBox: { alignItems: 'center', paddingVertical: 24, backgroundColor: colors.bgCard, borderRadius: 22, marginBottom: 16 },
  currency: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  amountText: { fontSize: 52, fontWeight: '800', color: colors.text, letterSpacing: -1 },
  amountWords: { fontSize: 14, color: colors.textSub, marginTop: 4 },
  modeRow: { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: 14, padding: 4, gap: 4, marginBottom: 16 },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10 },
  modeBtnActive: { backgroundColor: colors.bgElevated },
  modeBtnText: { fontSize: 13, color: colors.textSub, fontWeight: '600' },
  qrBox: { alignItems: 'center', padding: 16, backgroundColor: colors.bgCard, borderRadius: 18, marginBottom: 16, gap: 10 },
  qrHint: { color: colors.textSub, fontSize: 12 },
  nfcBox: { alignItems: 'center', padding: 24, backgroundColor: colors.bgCard, borderRadius: 18, marginBottom: 16, gap: 10 },
  nfcPulse: { width: 96, height: 96, borderRadius: 48, backgroundColor: `${colors.primary}20`, justifyContent: 'center', alignItems: 'center' },
  nfcText: { color: colors.textSub, fontSize: 14 },
  nfcAmt: { fontSize: 24, fontWeight: '800', color: colors.text },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  key: { width: '30%', paddingVertical: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: 14 },
  keyText: { fontSize: 22, color: colors.text, fontWeight: '600' },
  chargeBtn: { marginBottom: 10 },
  successScreen: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', padding: 40 },
  successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.successBg, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 26, fontWeight: '800', color: colors.text },
  successAmt: { fontSize: 42, fontWeight: '800', color: colors.success, marginTop: 8 },
  successSub: { fontSize: 15, color: colors.textSub, marginTop: 6 },
});
