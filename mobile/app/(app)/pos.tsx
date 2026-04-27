import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, KeyboardAvoidingView, Platform, Modal,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle, QrCode, Wifi, FileText, Mail, Share2, X, Send } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { formatCurrency, generateId } from '@/lib/utils';
import { colors } from '@/constants/colors';

type Mode = 'qr' | 'nfc';
type ReceiptState = 'idle' | 'form' | 'sending' | 'sent';

function buildReceiptHtml(opts: {
  merchant: string;
  amount: number;
  currency: string;
  customerName: string;
  reference: string;
  date: string;
  time: string;
}): string {
  const { merchant, amount, currency, customerName, reference, date, time } = opts;
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency', currency, minimumFractionDigits: 2,
  }).format(amount);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,Helvetica,Arial,sans-serif;background:#F8FAFC;padding:32px 24px;color:#0F172A}
    .card{background:#fff;border-radius:20px;padding:32px;max-width:420px;margin:0 auto;box-shadow:0 2px 16px rgba(0,0,0,.08)}
    .header{text-align:center;padding-bottom:24px;border-bottom:1px solid #E2E8F0;margin-bottom:24px}
    .brand{font-size:22px;font-weight:800;color:#0D9488;letter-spacing:-0.5px}
    .merchant{font-size:15px;font-weight:600;color:#0F172A;margin-top:6px}
    .badge{display:inline-flex;align-items:center;gap:6px;background:#ECFDF5;color:#059669;border-radius:20px;padding:5px 14px;font-size:12px;font-weight:700;margin-top:10px}
    .total-box{background:#F0FDFA;border:1px solid #99F6E4;border-radius:14px;text-align:center;padding:20px;margin-bottom:24px}
    .total-label{font-size:11px;font-weight:700;color:#0D9488;text-transform:uppercase;letter-spacing:0.8px}
    .total-amount{font-size:40px;font-weight:800;color:#0D9488;margin-top:4px;letter-spacing:-1px}
    .customer-box{background:#F1F5F9;border-radius:12px;padding:14px;margin-bottom:24px}
    .customer-label{font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.8px}
    .customer-name{font-size:16px;font-weight:700;color:#0F172A;margin-top:4px}
    .rows{border-top:1px solid #F1F5F9}
    .row{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid #F1F5F9}
    .row-label{font-size:13px;color:#475569}
    .row-value{font-size:13px;font-weight:600;color:#0F172A}
    .row-value.success{color:#059669}
    .footer{text-align:center;margin-top:28px;color:#94A3B8;font-size:11px;line-height:1.6}
    .footer strong{color:#0D9488}
    .divider{border:none;border-top:2px dashed #E2E8F0;margin:24px 0}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">PayNow</div>
      <div class="merchant">${merchant}</div>
      <div class="badge">&#10003; Payment Received</div>
    </div>

    <div class="total-box">
      <div class="total-label">Total Charged</div>
      <div class="total-amount">${formatted}</div>
    </div>

    ${customerName.trim() ? `
    <div class="customer-box">
      <div class="customer-label">Customer</div>
      <div class="customer-name">${customerName.trim()}</div>
    </div>` : ''}

    <div class="rows">
      <div class="row">
        <span class="row-label">Date</span>
        <span class="row-value">${date}</span>
      </div>
      <div class="row">
        <span class="row-label">Time</span>
        <span class="row-value">${time}</span>
      </div>
      <div class="row">
        <span class="row-label">Reference</span>
        <span class="row-value">${reference}</span>
      </div>
      <div class="row">
        <span class="row-label">Payment method</span>
        <span class="row-value">POS Terminal</span>
      </div>
      <div class="row">
        <span class="row-label">Status</span>
        <span class="row-value success">&#10003; Completed</span>
      </div>
    </div>

    <hr class="divider"/>
    <div class="footer">
      <p>Thank you for your business!</p>
      <p style="margin-top:6px">Powered by <strong>PayNow</strong></p>
    </div>
  </div>
</body>
</html>`;
}

export default function POSScreen() {
  const { user, addTransaction } = useAppStore();
  const [amount, setAmount]           = useState('');
  const [mode, setMode]               = useState<Mode>('qr');
  const [charged, setCharged]         = useState(false);
  const [loading, setLoading]         = useState(false);
  const [txnRef, setTxnRef]           = useState('');
  const [txnDate, setTxnDate]         = useState(new Date());

  // Receipt state
  const [receiptState, setReceiptState] = useState<ReceiptState>('idle');
  const [custName, setCustName]         = useState('');
  const [custEmail, setCustEmail]       = useState('');
  const [emailError, setEmailError]     = useState('');

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
    const ref  = `POS-${generateId()}`;
    const now  = new Date();
    await new Promise(r => setTimeout(r, 900));
    addTransaction({
      type: 'receive',
      amount: parsed,
      currency: user.currency,
      description: 'POS payment',
      counterparty: 'Walk-in Customer',
      status: 'completed',
      category: 'Sales',
      date: now.toISOString(),
    });
    setTxnRef(ref);
    setTxnDate(now);
    setLoading(false);
    setCharged(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const makeReceiptHtml = () => buildReceiptHtml({
    merchant:     user.businessName ?? user.name,
    amount:       parsed,
    currency:     user.currency,
    customerName: custName,
    reference:    txnRef,
    date: txnDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    time: txnDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  });

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleEmailReceipt = async () => {
    if (!validateEmail(custEmail.trim())) {
      setEmailError('Enter a valid email address');
      return;
    }
    setEmailError('');
    setReceiptState('sending');
    try {
      const html    = makeReceiptHtml();
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      try {
        // Opens the native mail compose view with the PDF pre-attached
        await MailComposer.composeAsync({
          recipients:  [custEmail.trim()],
          subject:     `Your receipt from ${user?.businessName ?? user?.name}`,
          body:        'Hi,\n\nPlease find your payment receipt attached.\n\nThank you!',
          attachments: [uri],
        });
      } catch {
        // No mail app configured — fall back to the OS share sheet
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Receipt' });
      }
      setReceiptState('sent');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setReceiptState('form');
    }
  };

  const handleSharePdf = async () => {
    setReceiptState('sending');
    try {
      const html    = makeReceiptHtml();
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Receipt' });
      setReceiptState('sent');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setReceiptState('form');
    }
  };

  const resetForNewCharge = () => {
    setCharged(false);
    setAmount('');
    setReceiptState('idle');
    setCustName('');
    setCustEmail('');
    setEmailError('');
  };

  // ─── Success / receipt screen ──────────────────────────────────────────────
  if (charged) return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.successContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Payment confirmed */}
        <View style={styles.successCircle}>
          <CheckCircle size={56} color={colors.success} />
        </View>
        <Text style={styles.successTitle}>Payment received!</Text>
        <Text style={styles.successAmt}>{formatCurrency(parsed, user.currency)}</Text>
        <Text style={styles.successRef}>{txnRef}</Text>

        {/* Receipt card */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptCardHeader}>
            <FileText size={18} color={colors.primary} />
            <Text style={styles.receiptCardTitle}>Send Receipt</Text>
          </View>

          {receiptState === 'idle' && (
            <TouchableOpacity
              style={styles.sendReceiptBtn}
              onPress={() => setReceiptState('form')}
              activeOpacity={0.75}
            >
              <FileText size={16} color={colors.primary} />
              <Text style={styles.sendReceiptBtnText}>Prepare receipt for customer</Text>
            </TouchableOpacity>
          )}

          {receiptState === 'form' && (
            <View style={styles.receiptForm}>
              <Text style={styles.fieldLabel}>Customer name (optional)</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. Sarah Johnson"
                placeholderTextColor={colors.textMuted}
                value={custName}
                onChangeText={setCustName}
                autoCapitalize="words"
                returnKeyType="next"
              />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Customer email</Text>
              <TextInput
                style={[styles.fieldInput, emailError ? styles.fieldInputError : null]}
                placeholder="customer@example.com"
                placeholderTextColor={colors.textMuted}
                value={custEmail}
                onChangeText={v => { setCustEmail(v); setEmailError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="send"
                onSubmitEditing={handleEmailReceipt}
              />
              {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}

              <View style={styles.receiptActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleEmailReceipt} activeOpacity={0.75}>
                  <Mail size={16} color={colors.white} />
                  <Text style={styles.actionBtnText}>Email Receipt</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={handleSharePdf} activeOpacity={0.75}>
                  <Share2 size={16} color={colors.primary} />
                  <Text style={[styles.actionBtnText, { color: colors.primary }]}>Share PDF</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => setReceiptState('idle')} style={styles.cancelLink}>
                <Text style={styles.cancelLinkText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {receiptState === 'sending' && (
            <View style={styles.sendingRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.sendingText}>Generating PDF…</Text>
            </View>
          )}

          {receiptState === 'sent' && (
            <View style={styles.sentRow}>
              <CheckCircle size={18} color={colors.success} />
              <Text style={styles.sentText}>Receipt sent!</Text>
              <TouchableOpacity onPress={() => setReceiptState('form')}>
                <Text style={styles.sendAgainText}>Send again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bottom actions */}
        <Button title="New Charge" onPress={resetForNewCharge} style={styles.newChargeBtn} />
        <TouchableOpacity onPress={() => router.replace('/(app)')} style={{ marginTop: 10 }}>
          <Text style={styles.backHome}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ─── Keypad screen ─────────────────────────────────────────────────────────
  const qrValue = `paynow://pos?merchant=${encodeURIComponent(user.businessName ?? user.name)}&amount=${parsed}`;

  return (
    <View style={styles.screen}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <ArrowLeft size={20} color={colors.primaryLight} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.pageTitle}>Point of Sale</Text>

      <View style={styles.amountBox}>
        <Text style={styles.currency}>{user.currency}</Text>
        <Text style={styles.amountText}>{amount ? `$${amount}` : '$0.00'}</Text>
        {parsed > 0 && <Text style={styles.amountWords}>{formatCurrency(parsed, user.currency)}</Text>}
      </View>

      <View style={styles.modeRow}>
        {(['qr', 'nfc'] as Mode[]).map(m => (
          <TouchableOpacity key={m} style={[styles.modeBtn, mode === m && styles.modeBtnActive]} onPress={() => setMode(m)}>
            {m === 'qr'
              ? <QrCode size={16} color={mode === m ? colors.primary : colors.textSub} />
              : <Wifi   size={16} color={mode === m ? colors.primary : colors.textSub} />}
            <Text style={[styles.modeBtnText, mode === m && { color: colors.primary }]}>
              {m === 'qr' ? 'QR Code' : 'Tap / NFC'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {parsed > 0 && mode === 'qr' && (
        <View style={styles.qrBox}>
          <QRCode value={qrValue} size={140} color={colors.text} backgroundColor="transparent" />
          <Text style={styles.qrHint}>Customer scans to pay {formatCurrency(parsed, user.currency)}</Text>
        </View>
      )}

      {parsed > 0 && mode === 'nfc' && (
        <View style={styles.nfcBox}>
          <View style={styles.nfcPulse}><Wifi size={48} color={colors.primary} /></View>
          <Text style={styles.nfcText}>Hold device near customer's phone</Text>
          <Text style={styles.nfcAmt}>{formatCurrency(parsed, user.currency)}</Text>
        </View>
      )}

      <View style={styles.keypad}>
        {KEYS.map(k => (
          <TouchableOpacity key={k} style={styles.key} onPress={() => pressKey(k)}>
            <Text style={[styles.keyText, k === '⌫' && { color: colors.danger }]}>{k}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title={parsed ? `Charge ${formatCurrency(parsed, user.currency)}` : 'Enter amount'}
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
  screen:         { flex: 1, backgroundColor: colors.bg, padding: 20, paddingTop: 60 },
  back:           { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backText:       { color: colors.primaryLight, fontSize: 14 },
  pageTitle:      { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 20 },
  amountBox:      { alignItems: 'center', paddingVertical: 24, backgroundColor: colors.bgCard, borderRadius: 22, marginBottom: 16 },
  currency:       { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  amountText:     { fontSize: 52, fontWeight: '800', color: colors.text, letterSpacing: -1 },
  amountWords:    { fontSize: 14, color: colors.textSub, marginTop: 4 },
  modeRow:        { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: 14, padding: 4, gap: 4, marginBottom: 16 },
  modeBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10 },
  modeBtnActive:  { backgroundColor: colors.bgElevated },
  modeBtnText:    { fontSize: 13, color: colors.textSub, fontWeight: '600' },
  qrBox:          { alignItems: 'center', padding: 16, backgroundColor: colors.bgCard, borderRadius: 18, marginBottom: 16, gap: 10 },
  qrHint:         { color: colors.textSub, fontSize: 12 },
  nfcBox:         { alignItems: 'center', padding: 24, backgroundColor: colors.bgCard, borderRadius: 18, marginBottom: 16, gap: 10 },
  nfcPulse:       { width: 96, height: 96, borderRadius: 48, backgroundColor: `${colors.primary}20`, justifyContent: 'center', alignItems: 'center' },
  nfcText:        { color: colors.textSub, fontSize: 14 },
  nfcAmt:         { fontSize: 24, fontWeight: '800', color: colors.text },
  keypad:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  key:            { width: '30%', paddingVertical: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: 14 },
  keyText:        { fontSize: 22, color: colors.text, fontWeight: '600' },
  chargeBtn:      { marginBottom: 10 },

  // Success screen
  successContent: { padding: 28, paddingTop: 70, alignItems: 'center', gap: 6 },
  successCircle:  { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.successBg, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  successTitle:   { fontSize: 26, fontWeight: '800', color: colors.text },
  successAmt:     { fontSize: 42, fontWeight: '800', color: colors.success, marginTop: 4 },
  successRef:     { fontSize: 12, color: colors.textMuted, fontWeight: '500', marginBottom: 20 },
  newChargeBtn:   { width: 200, marginTop: 8 },
  backHome:       { color: colors.textSub, fontSize: 14, textAlign: 'center' },

  // Receipt card
  receiptCard:       { width: '100%', backgroundColor: colors.bgCard, borderRadius: 20, padding: 20, gap: 14, borderWidth: 1, borderColor: colors.border },
  receiptCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  receiptCardTitle:  { fontSize: 15, fontWeight: '700', color: colors.text },

  sendReceiptBtn:     { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.primaryBg, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: `${colors.primary}30` },
  sendReceiptBtnText: { color: colors.primary, fontWeight: '600', fontSize: 14, flex: 1 },

  // Form
  receiptForm:    { gap: 4 },
  fieldLabel:     { fontSize: 12, fontWeight: '600', color: colors.textSub, marginBottom: 4 },
  fieldInput:     { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.text },
  fieldInputError:{ borderColor: colors.danger },
  errorText:      { fontSize: 11, color: colors.danger, marginTop: 4 },

  receiptActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  actionBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 13 },
  actionBtnSecondary: { backgroundColor: colors.primaryBg, borderWidth: 1, borderColor: `${colors.primary}40` },
  actionBtnText:  { color: colors.white, fontWeight: '700', fontSize: 13 },

  cancelLink:     { alignItems: 'center', paddingTop: 4 },
  cancelLinkText: { color: colors.textMuted, fontSize: 13 },

  // Sending / sent states
  sendingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  sendingText:{ color: colors.textSub, fontSize: 14 },
  sentRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sentText:   { color: colors.success, fontWeight: '600', fontSize: 14, flex: 1 },
  sendAgainText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
});
