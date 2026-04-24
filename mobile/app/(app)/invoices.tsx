import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Plus, X, FileText, CheckCircle, Clock, AlertCircle, Edit3 } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { MOCK_INVOICES } from '@/lib/mock-data';
import type { Invoice } from '@/lib/types';
import { colors } from '@/constants/colors';

type Filter = 'all' | 'sent' | 'paid' | 'overdue' | 'draft';

const STATUS_ICON = {
  paid:    { Icon: CheckCircle, color: colors.success },
  sent:    { Icon: Clock,       color: colors.info    },
  overdue: { Icon: AlertCircle, color: colors.danger  },
  draft:   { Icon: Edit3,       color: colors.textSub },
};

const STATUS_VARIANT: Record<string, 'success' | 'info' | 'danger' | 'neutral'> = {
  paid: 'success', sent: 'info', overdue: 'danger', draft: 'neutral',
};

export default function InvoicesScreen() {
  const [filter, setFilter]       = useState<Filter>('all');
  const [invoices, setInvoices]   = useState<Invoice[]>(MOCK_INVOICES);
  const [selected, setSelected]   = useState<Invoice | null>(null);
  const [showCreate, setCreate]   = useState(false);
  const [form, setForm]           = useState({ client: '', email: '', desc: '', qty: '1', price: '' });

  const visible = filter === 'all' ? invoices : invoices.filter(i => i.status === filter);

  const totalPaid    = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.total, 0);

  const handleCreate = () => {
    const price = parseFloat(form.price) || 0;
    const qty   = parseInt(form.qty)    || 1;
    const sub   = price * qty;
    const tax   = Math.round(sub * 0.08 * 100) / 100;
    const newInv: Invoice = {
      id:          `inv_${Date.now()}`,
      number:      `INV-2026-0${50 + invoices.length}`,
      clientName:  form.client,
      clientEmail: form.email,
      items:       [{ description: form.desc, quantity: qty, unitPrice: price, total: sub }],
      subtotal:    sub,
      tax,
      total:       sub + tax,
      status:      'draft',
      dueDate:     new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      createdAt:   new Date().toISOString().split('T')[0],
      currency:    'USD',
    };
    setInvoices(v => [newInv, ...v]);
    setCreate(false);
    setForm({ client: '', email: '', desc: '', qty: '1', price: '' });
    setSelected(newInv);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <ArrowLeft size={20} color={colors.primaryLight} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.titleRow}>
        <Text style={styles.pageTitle}>Invoices</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setCreate(true)}>
          <Plus size={18} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Collected</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>{formatCurrency(totalPaid)}</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Pending</Text>
          <Text style={[styles.summaryValue, { color: colors.warning }]}>{formatCurrency(totalPending)}</Text>
        </Card>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={{ gap: 8 }}>
        {(['all', 'sent', 'paid', 'overdue', 'draft'] as Filter[]).map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <Card>
        {visible.length === 0 && <Text style={styles.empty}>No invoices here yet.</Text>}
        {visible.map(inv => {
          const { Icon, color } = STATUS_ICON[inv.status];
          return (
            <TouchableOpacity key={inv.id} style={styles.invRow} onPress={() => setSelected(inv)}>
              <View style={[styles.invIcon, { backgroundColor: `${color}20` }]}>
                <Icon size={18} color={color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.invNum}>{inv.number}</Text>
                <Text style={styles.invClient}>{inv.clientName}</Text>
                <Text style={styles.invDate}>Due {formatDate(inv.dueDate)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={styles.invAmount}>{formatCurrency(inv.total)}</Text>
                <Badge text={inv.status.charAt(0).toUpperCase() + inv.status.slice(1)} variant={STATUS_VARIANT[inv.status]} />
              </View>
            </TouchableOpacity>
          );
        })}
      </Card>

      {/* Invoice detail modal */}
      <Modal visible={!!selected} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setSelected(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            {selected && (
              <>
                <View style={styles.sheetHeader}>
                  <View>
                    <Text style={styles.sheetTitle}>{selected.number}</Text>
                    <Badge text={selected.status.charAt(0).toUpperCase() + selected.status.slice(1)} variant={STATUS_VARIANT[selected.status]} />
                  </View>
                  <TouchableOpacity onPress={() => setSelected(null)}><X size={20} color={colors.textSub} /></TouchableOpacity>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSub}>Bill to</Text>
                  <Text style={styles.detailMain}>{selected.clientName}</Text>
                  <Text style={styles.detailMuted}>{selected.clientEmail}</Text>
                </View>

                {selected.items.map((item, i) => (
                  <View key={i} style={styles.lineItem}>
                    <Text style={styles.lineDesc}>{item.description}</Text>
                    <Text style={styles.lineQty}>{item.quantity} × {formatCurrency(item.unitPrice)}</Text>
                    <Text style={styles.lineTotal}>{formatCurrency(item.total)}</Text>
                  </View>
                ))}

                <View style={styles.totals}>
                  {[
                    ['Subtotal', formatCurrency(selected.subtotal)],
                    ['Tax (8%)', formatCurrency(selected.tax)],
                    ['Total', formatCurrency(selected.total)],
                  ].map(([l, v]) => (
                    <View key={l} style={[styles.totalRow, l === 'Total' && styles.totalRowBold]}>
                      <Text style={[styles.totalLabel, l === 'Total' && styles.totalLabelBold]}>{l}</Text>
                      <Text style={[styles.totalValue, l === 'Total' && styles.totalValueBold]}>{v}</Text>
                    </View>
                  ))}
                </View>

                {selected.notes && <Text style={styles.notes}>{selected.notes}</Text>}

                <View style={styles.modalBtns}>
                  {selected.status === 'draft' && (
                    <Button title="Send Invoice" onPress={() => {
                      setInvoices(v => v.map(i => i.id === selected.id ? { ...i, status: 'sent' } : i));
                      setSelected(v => v ? { ...v, status: 'sent' } : v);
                    }} style={{ flex: 1 }} />
                  )}
                  {selected.status === 'sent' && (
                    <Button title="Mark Paid" variant="secondary" onPress={() => {
                      setInvoices(v => v.map(i => i.id === selected.id ? { ...i, status: 'paid', paidAt: new Date().toISOString() } : i));
                      setSelected(v => v ? { ...v, status: 'paid' } : v);
                    }} style={{ flex: 1 }} />
                  )}
                  <Button title="Close" variant="secondary" onPress={() => setSelected(null)} style={{ flex: 1 }} />
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Create invoice modal */}
      <Modal visible={showCreate} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setCreate(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>New Invoice</Text>
              <TouchableOpacity onPress={() => setCreate(false)}><X size={20} color={colors.textSub} /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ gap: 12 }}>
                <Input label="Client name" value={form.client} onChangeText={v => setForm(f => ({ ...f, client: v }))} placeholder="Acme Corp" />
                <Input label="Client email" value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} placeholder="billing@acme.com" keyboardType="email-address" autoCapitalize="none" />
                <Input label="Description" value={form.desc} onChangeText={v => setForm(f => ({ ...f, desc: v }))} placeholder="Services rendered" />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Input label="Qty" value={form.qty} onChangeText={v => setForm(f => ({ ...f, qty: v }))} keyboardType="number-pad" containerStyle={{ flex: 1 }} />
                  <Input label="Unit price" value={form.price} onChangeText={v => setForm(f => ({ ...f, price: v }))} keyboardType="decimal-pad" placeholder="0.00" prefix={<Text style={{ color: colors.textSub }}>$</Text>} containerStyle={{ flex: 2 }} />
                </View>
                {form.price && (
                  <Text style={styles.previewTotal}>
                    Total ≈ {formatCurrency((parseFloat(form.price) || 0) * (parseInt(form.qty) || 1) * 1.08)}
                  </Text>
                )}
                <Button title="Create Draft" onPress={handleCreate} fullWidth disabled={!form.client || !form.desc || !form.price} />
              </View>
            </ScrollView>
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
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1, gap: 4 },
  summaryLabel: { fontSize: 12, color: colors.textSub },
  summaryValue: { fontSize: 20, fontWeight: '800' },
  filters: { flexGrow: 0 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border },
  filterBtnActive: { backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}66` },
  filterText: { color: colors.textSub, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: colors.primaryLight },
  empty: { textAlign: 'center', color: colors.textMuted, paddingVertical: 20, fontSize: 14 },
  invRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  invIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  invNum: { color: colors.text, fontWeight: '700', fontSize: 14 },
  invClient: { color: colors.textSub, fontSize: 12, marginTop: 1 },
  invDate: { color: colors.textMuted, fontSize: 11, marginTop: 1 },
  invAmount: { color: colors.text, fontWeight: '700', fontSize: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 44, maxHeight: '85%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  detailSection: { marginBottom: 16, gap: 2 },
  detailSub: { fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailMain: { fontSize: 15, fontWeight: '700', color: colors.text },
  detailMuted: { fontSize: 13, color: colors.textSub },
  lineItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  lineDesc: { flex: 1, color: colors.text, fontSize: 13 },
  lineQty: { color: colors.textSub, fontSize: 12, marginHorizontal: 8 },
  lineTotal: { color: colors.text, fontWeight: '600', fontSize: 13 },
  totals: { marginTop: 12, gap: 6 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalRowBold: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, marginTop: 4 },
  totalLabel: { color: colors.textSub, fontSize: 13 },
  totalLabelBold: { color: colors.text, fontWeight: '700', fontSize: 15 },
  totalValue: { color: colors.text, fontSize: 13 },
  totalValueBold: { fontWeight: '800', fontSize: 16, color: colors.primary },
  notes: { color: colors.textMuted, fontSize: 12, fontStyle: 'italic', marginTop: 10 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
  previewTotal: { color: colors.primaryLight, fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
