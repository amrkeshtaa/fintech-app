import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Modal, Share, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Plus, X, Copy, Share2, CheckCircle, ToggleLeft, ToggleRight, Link, QrCode } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { MOCK_PAYMENT_LINKS } from '@/lib/mock-data';
import type { PaymentLink } from '@/lib/types';
import { colors } from '@/constants/colors';

export default function PaymentLinksScreen() {
  const [links, setLinks]       = useState<PaymentLink[]>(MOCK_PAYMENT_LINKS);
  const [selected, setSelected] = useState<PaymentLink | null>(null);
  const [showCreate, setCreate] = useState(false);
  const [copied, setCopied]     = useState<string | null>(null);
  const [form, setForm]         = useState({ title: '', desc: '', amount: '' });

  const totalCollected = links.reduce((s, l) => s + l.collected, 0);

  const copyLink = async (link: PaymentLink) => {
    const url = `https://paynow.app/pay/${link.slug}`;
    await Clipboard.setStringAsync(url);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(link.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const shareLink = (link: PaymentLink) => {
    const url = `https://paynow.app/pay/${link.slug}`;
    Share.share({ message: `Pay via PayNow: ${url}`, url });
  };

  const toggleActive = (id: string) =>
    setLinks(v => v.map(l => l.id === id ? { ...l, active: !l.active } : l));

  const handleCreate = () => {
    const slug = form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newLink: PaymentLink = {
      id:          `pl_${Date.now()}`,
      title:       form.title,
      description: form.desc || undefined,
      amount:      form.amount ? parseFloat(form.amount) : undefined,
      currency:    'USD',
      slug,
      active:      true,
      visits:      0,
      payments:    0,
      collected:   0,
      createdAt:   new Date().toISOString().split('T')[0],
    };
    setLinks(v => [newLink, ...v]);
    setCreate(false);
    setForm({ title: '', desc: '', amount: '' });
    setSelected(newLink);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <ArrowLeft size={20} color={colors.primaryLight} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.titleRow}>
        <Text style={styles.pageTitle}>Payment Links</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setCreate(true)}>
          <Plus size={18} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total Collected', value: formatCurrency(totalCollected), color: colors.success },
          { label: 'Active Links', value: String(links.filter(l => l.active).length), color: colors.primary },
          { label: 'Total Payments', value: String(links.reduce((s, l) => s + l.payments, 0)), color: colors.purple },
        ].map(s => (
          <Card key={s.label} style={styles.statCard}>
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
          </Card>
        ))}
      </View>

      {/* Links list */}
      <View style={{ gap: 12 }}>
        {links.map(link => (
          <Card key={link.id} onPress={() => setSelected(link)}>
            <View style={styles.linkHeader}>
              <View style={styles.linkIconWrap}>
                <Link size={18} color={colors.primaryLight} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.linkTitle}>{link.title}</Text>
                {link.description && <Text style={styles.linkDesc}>{link.description}</Text>}
              </View>
              <View style={styles.linkRight}>
                <Badge text={link.active ? 'Active' : 'Off'} variant={link.active ? 'success' : 'neutral'} />
                <TouchableOpacity onPress={() => toggleActive(link.id)}>
                  {link.active
                    ? <ToggleRight size={24} color={colors.success} />
                    : <ToggleLeft size={24} color={colors.textMuted} />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.linkStats}>
              {[
                { label: 'Visits', value: link.visits },
                { label: 'Payments', value: link.payments },
                { label: 'Collected', value: formatCurrency(link.collected) },
                ...(link.amount ? [{ label: 'Fixed', value: formatCurrency(link.amount) }] : []),
              ].map(s => (
                <View key={s.label} style={styles.linkStat}>
                  <Text style={styles.linkStatValue}>{s.value}</Text>
                  <Text style={styles.linkStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.linkActions}>
              <TouchableOpacity style={styles.linkAction} onPress={() => copyLink(link)}>
                {copied === link.id
                  ? <CheckCircle size={16} color={colors.success} />
                  : <Copy size={16} color={colors.textSub} />}
                <Text style={styles.linkActionText}>{copied === link.id ? 'Copied' : 'Copy'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkAction} onPress={() => shareLink(link)}>
                <Share2 size={16} color={colors.textSub} />
                <Text style={styles.linkActionText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkAction} onPress={() => setSelected(link)}>
                <QrCode size={16} color={colors.textSub} />
                <Text style={styles.linkActionText}>QR</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </View>

      {/* Detail / QR modal */}
      <Modal visible={!!selected} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setSelected(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            {selected && (
              <>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>{selected.title}</Text>
                  <TouchableOpacity onPress={() => setSelected(null)}><X size={20} color={colors.textSub} /></TouchableOpacity>
                </View>
                <View style={styles.qrCenter}>
                  <QRCode value={`https://paynow.app/pay/${selected.slug}`} size={180} color={colors.text} backgroundColor="transparent" />
                </View>
                <Text style={styles.qrUrl}>paynow.app/pay/{selected.slug}</Text>
                {selected.amount && (
                  <Text style={styles.qrAmount}>Fixed: {formatCurrency(selected.amount)}</Text>
                )}
                <View style={styles.modalBtns}>
                  <Button title={copied === selected.id ? 'Copied!' : 'Copy Link'} onPress={() => copyLink(selected)} variant="secondary" style={{ flex: 1 }} />
                  <Button title="Share" onPress={() => shareLink(selected)} style={{ flex: 1 }} />
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Create modal */}
      <Modal visible={showCreate} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setCreate(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>New Payment Link</Text>
              <TouchableOpacity onPress={() => setCreate(false)}><X size={20} color={colors.textSub} /></TouchableOpacity>
            </View>
            <View style={{ gap: 14 }}>
              <Input label="Title" value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. Design Consultation" />
              <Input label="Description (optional)" value={form.desc} onChangeText={v => setForm(f => ({ ...f, desc: v }))} placeholder="One-hour session" />
              <Input label="Fixed amount (leave blank for open)" value={form.amount} onChangeText={v => setForm(f => ({ ...f, amount: v }))} keyboardType="decimal-pad" placeholder="0.00" prefix={<Text style={{ color: colors.textSub }}>$</Text>} />
              {form.title && (
                <Text style={styles.slugPreview}>
                  URL: paynow.app/pay/{form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
                </Text>
              )}
              <Button title="Create Link" onPress={handleCreate} fullWidth disabled={!form.title} />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 60, gap: 16, paddingBottom: 40 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  backText: { color: colors.primaryLight, fontSize: 14 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, gap: 4, padding: 12 },
  statLabel: { fontSize: 10, color: colors.textSub, textTransform: 'uppercase', letterSpacing: 0.3 },
  statValue: { fontSize: 15, fontWeight: '800' },
  linkHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  linkIconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: `${colors.primary}20`, justifyContent: 'center', alignItems: 'center' },
  linkTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
  linkDesc: { color: colors.textSub, fontSize: 12, marginTop: 2 },
  linkRight: { alignItems: 'center', gap: 4 },
  linkStats: { flexDirection: 'row', backgroundColor: colors.bgElevated, borderRadius: 12, padding: 12, marginBottom: 12, gap: 4 },
  linkStat: { flex: 1, alignItems: 'center' },
  linkStatValue: { color: colors.text, fontWeight: '700', fontSize: 14 },
  linkStatLabel: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  linkActions: { flexDirection: 'row', gap: 8 },
  linkAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, backgroundColor: colors.bgElevated, borderRadius: 10 },
  linkActionText: { color: colors.textSub, fontSize: 12, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 44 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  qrCenter: { alignItems: 'center', padding: 20, backgroundColor: colors.bgElevated, borderRadius: 20, marginBottom: 14 },
  qrUrl: { textAlign: 'center', color: colors.primaryLight, fontSize: 13, marginBottom: 4 },
  qrAmount: { textAlign: 'center', color: colors.textSub, fontSize: 13, marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  slugPreview: { color: colors.textMuted, fontSize: 12, fontStyle: 'italic' },
});
