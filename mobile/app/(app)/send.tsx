import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';
import { CheckCircle, ArrowLeft, Send } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';
import { CONTACTS } from '@/lib/mock-data';
import { colors } from '@/constants/colors';

type Step = 'contact' | 'amount' | 'confirm' | 'success';

export default function SendScreen() {
  const { user, addTransaction } = useAppStore();
  const [step, setStep]         = useState<Step>('contact');
  const [contact, setContact]   = useState<typeof CONTACTS[0] | null>(null);
  const [amount, setAmount]     = useState('');
  const [note, setNote]         = useState('');
  const [loading, setLoading]   = useState(false);

  if (!user) return null;

  const parsed = parseFloat(amount) || 0;
  const canSend = parsed > 0 && parsed <= user.balance;

  const KEYS = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];

  const pressKey = (k: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (k === '⌫') { setAmount(v => v.slice(0, -1)); return; }
    if (k === '.' && amount.includes('.')) return;
    if (amount.split('.')[1]?.length >= 2) return;
    setAmount(v => (v === '' && k === '.') ? '0.' : v + k);
  };

  const handleSend = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    addTransaction({
      type: 'send',
      amount: parsed,
      currency: user.currency,
      description: note || `Transfer to ${contact!.name}`,
      counterparty: contact!.name,
      status: 'completed',
      category: 'Transfer',
      date: new Date().toISOString(),
    });
    setLoading(false);
    setStep('success');
  };

  if (step === 'success') return (
    <View style={styles.successScreen}>
      <View style={styles.successCircle}>
        <CheckCircle size={56} color={colors.success} />
      </View>
      <Text style={styles.successTitle}>Sent!</Text>
      <Text style={styles.successAmt}>{formatCurrency(parsed)}</Text>
      <Text style={styles.successTo}>to {contact?.name}</Text>
      <Button title="Back to Home" onPress={() => router.replace('/(app)')} style={{ marginTop: 32, width: 200 }} />
    </View>
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={() => step === 'contact' ? router.back() : setStep(s => s === 'amount' ? 'contact' : 'amount')} style={styles.back}>
        <ArrowLeft size={20} color={colors.primaryLight} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.pageTitle}>Send Money</Text>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        {(['contact', 'amount', 'confirm'] as Step[]).map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepDot, step === s && styles.stepDotActive,
              (['amount', 'confirm'].includes(step) && s === 'contact') || (step === 'confirm' && s === 'amount')
                ? styles.stepDotDone : null]}>
              <Text style={styles.stepNum}>{i + 1}</Text>
            </View>
            <View style={[styles.stepLine, i < 2 && { flex: 1 }]} />
          </View>
        ))}
      </View>

      {/* Step 1 — Contact */}
      {step === 'contact' && (
        <Card>
          <Text style={styles.sectionTitle}>Who are you sending to?</Text>
          <View style={styles.contacts}>
            {CONTACTS.map(c => (
              <TouchableOpacity key={c.id} style={[styles.contactItem, contact?.id === c.id && styles.contactActive]}
                onPress={() => { setContact(c); setStep('amount'); }}>
                <View style={[styles.avatar, { backgroundColor: c.color }]}>
                  <Text style={styles.avatarText}>{c.initials}</Text>
                </View>
                <Text style={styles.contactName}>{c.name.split(' ')[0]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Input label="Or enter email / phone" placeholder="name@example.com" containerStyle={{ marginTop: 16 }} />
        </Card>
      )}

      {/* Step 2 — Amount keypad */}
      {step === 'amount' && (
        <>
          {contact && (
            <View style={styles.toRow}>
              <View style={[styles.avatar, { backgroundColor: contact.color, width: 36, height: 36, borderRadius: 18 }]}>
                <Text style={[styles.avatarText, { fontSize: 13 }]}>{contact.initials}</Text>
              </View>
              <Text style={styles.toName}>To {contact.name}</Text>
            </View>
          )}
          <Card>
            <Text style={styles.amountDisplay}>{amount ? `$${amount}` : '$0'}</Text>
            <Text style={styles.balHint}>Balance: {formatCurrency(user.balance)}</Text>
            <View style={styles.keypad}>
              {KEYS.map(k => (
                <TouchableOpacity key={k} style={styles.key} onPress={() => pressKey(k)}>
                  <Text style={[styles.keyText, k === '⌫' && { color: colors.danger }]}>{k}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Input label="Note (optional)" value={note} onChangeText={setNote} placeholder="What's this for?" containerStyle={{ marginTop: 4 }} />
            <Button title="Continue" onPress={() => setStep('confirm')} disabled={!canSend} style={{ marginTop: 16 }} fullWidth />
            {parsed > user.balance && <Text style={styles.errText}>Insufficient balance</Text>}
          </Card>
        </>
      )}

      {/* Step 3 — Confirm */}
      {step === 'confirm' && contact && (
        <Card>
          <Text style={styles.sectionTitle}>Confirm Transfer</Text>
          <View style={styles.confirmBox}>
            <View style={[styles.avatar, { backgroundColor: contact.color, width: 56, height: 56, borderRadius: 28, alignSelf: 'center', marginBottom: 12 }]}>
              <Text style={[styles.avatarText, { fontSize: 20 }]}>{contact.initials}</Text>
            </View>
            <Text style={styles.confirmAmt}>{formatCurrency(parsed)}</Text>
            <Text style={styles.confirmTo}>to {contact.name}</Text>
            {note ? <Text style={styles.confirmNote}>"{note}"</Text> : null}
            <View style={styles.divider} />
            {[
              ['From', user.businessName ?? user.name],
              ['Fee', 'Free'],
              ['Arrives', 'Instantly'],
            ].map(([l, v]) => (
              <View key={l} style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>{l}</Text>
                <Text style={styles.confirmValue}>{v}</Text>
              </View>
            ))}
          </View>
          <View style={styles.btns}>
            <Button title="Edit" onPress={() => setStep('amount')} variant="secondary" style={{ flex: 1 }} />
            <Button title="Send" onPress={handleSend} loading={loading} style={{ flex: 1 }}>
              <Send size={16} color={colors.white} />
            </Button>
          </View>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 60, gap: 16, paddingBottom: 40 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  backText: { color: colors.primaryLight, fontSize: 14 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  stepItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.bgElevated, justifyContent: 'center', alignItems: 'center' },
  stepDotActive: { backgroundColor: colors.primary },
  stepDotDone: { backgroundColor: colors.success },
  stepNum: { color: colors.white, fontSize: 12, fontWeight: '700' },
  stepLine: { height: 2, backgroundColor: colors.bgElevated, marginHorizontal: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 },
  contacts: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  contactItem: { alignItems: 'center', gap: 6, padding: 10, borderRadius: 14, borderWidth: 1, borderColor: 'transparent' },
  contactActive: { borderColor: `${colors.primary}66`, backgroundColor: `${colors.primary}10` },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  contactName: { color: colors.textSub, fontSize: 12 },
  toRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toName: { color: colors.text, fontWeight: '600', fontSize: 15 },
  amountDisplay: { fontSize: 48, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 4 },
  balHint: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginBottom: 20 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  key: { width: '30%', aspectRatio: 1.8, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgElevated, borderRadius: 14 },
  keyText: { fontSize: 20, color: colors.text, fontWeight: '600' },
  errText: { textAlign: 'center', color: colors.danger, fontSize: 12, marginTop: 8 },
  confirmBox: { backgroundColor: colors.bgElevated, borderRadius: 18, padding: 20, marginBottom: 20 },
  confirmAmt: { fontSize: 36, fontWeight: '800', color: colors.text, textAlign: 'center' },
  confirmTo: { textAlign: 'center', color: colors.textSub, fontSize: 14, marginTop: 4 },
  confirmNote: { textAlign: 'center', color: colors.textMuted, fontSize: 13, fontStyle: 'italic', marginTop: 8 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  confirmLabel: { color: colors.textSub, fontSize: 13 },
  confirmValue: { color: colors.text, fontWeight: '600', fontSize: 13 },
  btns: { flexDirection: 'row', gap: 12 },
  successScreen: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', padding: 40 },
  successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.successBg, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 28, fontWeight: '800', color: colors.text },
  successAmt: { fontSize: 42, fontWeight: '800', color: colors.success, marginTop: 8 },
  successTo: { fontSize: 16, color: colors.textSub, marginTop: 6 },
});
