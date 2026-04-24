import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Share, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Copy, Share2, ArrowLeft, CheckCircle, Link } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

export default function ReceiveScreen() {
  const { user } = useAppStore();
  const [amount, setAmount]   = useState('');
  const [note, setNote]       = useState('');
  const [copied, setCopied]   = useState(false);

  if (!user) return null;

  const tag     = `@${user.name.toLowerCase().replace(/\s+/g, '.')}`;
  const baseUrl = `https://paynow.app/pay/${tag.slice(1)}`;
  const qrData  = amount
    ? `${baseUrl}?amount=${amount}${note ? `&note=${encodeURIComponent(note)}` : ''}`
    : baseUrl;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(qrData);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () =>
    Share.share({ message: `Pay me via PayNow: ${qrData}`, url: qrData });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <ArrowLeft size={20} color={colors.primaryLight} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.pageTitle}>Receive Money</Text>

      {/* QR */}
      <Card style={styles.qrCard}>
        <View style={styles.qrWrap}>
          <QRCode value={qrData} size={200} color={colors.text} backgroundColor="transparent" />
        </View>
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
        <Text style={styles.qrHint}>Scan to pay {user.businessName ?? user.name}</Text>

        <View style={styles.qrBtns}>
          <TouchableOpacity style={styles.qrBtn} onPress={handleCopy}>
            {copied
              ? <CheckCircle size={18} color={colors.success} />
              : <Copy size={18} color={colors.textSub} />}
            <Text style={styles.qrBtnText}>{copied ? 'Copied!' : 'Copy link'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qrBtn} onPress={handleShare}>
            <Share2 size={18} color={colors.textSub} />
            <Text style={styles.qrBtnText}>Share</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Request specific amount */}
      <Card>
        <Text style={styles.sectionTitle}>Request specific amount</Text>
        <Input
          label="Amount (USD)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
          prefix={<Text style={{ color: colors.textSub }}>$</Text>}
          containerStyle={{ marginBottom: 12 }}
        />
        <Input
          label="Note"
          value={note}
          onChangeText={setNote}
          placeholder="What's this for?"
        />
        {(amount || note) && (
          <View style={styles.linkRow}>
            <Link size={14} color={colors.primaryLight} />
            <Text style={styles.linkText} numberOfLines={1}>{qrData}</Text>
          </View>
        )}
        <Button
          title="Copy Payment Request"
          onPress={handleCopy}
          variant="secondary"
          style={{ marginTop: 16 }}
          fullWidth
        />
      </Card>

      {/* Your info */}
      <Card>
        <Text style={styles.sectionTitle}>Your payment details</Text>
        {[
          { label: 'PayNow Tag', value: tag },
          { label: 'Account name', value: user.businessName ?? user.name },
          { label: 'Payment link', value: baseUrl },
        ].map(r => (
          <View key={r.label} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{r.label}</Text>
            <View style={styles.detailRight}>
              <Text style={styles.detailValue} numberOfLines={1}>{r.value}</Text>
              <TouchableOpacity onPress={() => Clipboard.setStringAsync(r.value)}>
                <Copy size={14} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 60, gap: 16, paddingBottom: 40 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  backText: { color: colors.primaryLight, fontSize: 14 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  qrCard: { alignItems: 'center', gap: 4 },
  qrWrap: { padding: 20, backgroundColor: colors.bgElevated, borderRadius: 20, marginVertical: 8 },
  tagPill: { backgroundColor: `${colors.primary}20`, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 4 },
  tagText: { color: colors.primaryLight, fontWeight: '700', fontSize: 15 },
  qrHint: { color: colors.textSub, fontSize: 13, marginTop: 4 },
  qrBtns: { flexDirection: 'row', gap: 12, marginTop: 16, width: '100%' },
  qrBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, backgroundColor: colors.bgElevated, borderRadius: 14 },
  qrBtnText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, backgroundColor: colors.bgElevated, borderRadius: 10, padding: 10 },
  linkText: { flex: 1, color: colors.primaryLight, fontSize: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel: { color: colors.textSub, fontSize: 13 },
  detailRight: { flexDirection: 'row', alignItems: 'center', gap: 10, maxWidth: '60%' },
  detailValue: { color: colors.text, fontSize: 13, fontFamily: 'monospace' },
});
