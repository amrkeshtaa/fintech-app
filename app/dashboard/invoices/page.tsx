'use client';

import { useState } from 'react';
import {
  Plus, Send, Download, Eye, FileText, CheckCircle, Clock, AlertCircle, Edit,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate, generateId } from '@/lib/utils';
import type { Invoice, InvoiceStatus } from '@/lib/types';

const statusConfig: Record<InvoiceStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' | 'info'; icon: React.ElementType }> = {
  paid: { label: 'Paid', variant: 'success', icon: CheckCircle },
  sent: { label: 'Sent', variant: 'info', icon: Send },
  overdue: { label: 'Overdue', variant: 'danger', icon: AlertCircle },
  draft: { label: 'Draft', variant: 'neutral', icon: Edit },
};

type View = 'list' | 'create' | 'preview';

export default function InvoicesPage() {
  const { invoices } = useApp();
  const [view, setView] = useState<View>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all');

  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    dueDate: '',
    notes: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
  });

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter);

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.total, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0);

  const updateItem = (idx: number, field: string, value: string | number) => {
    const newItems = [...form.items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[idx].total = newItems[idx].quantity * newItems[idx].unitPrice;
    }
    setForm({ ...form, items: newItems });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }] });

  const subtotal = form.items.reduce((s, i) => s + i.total, 0);
  const tax = subtotal * 0.08;

  if (view === 'preview' && selectedInvoice) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('list')} className="text-brand-400 text-sm hover:text-brand-300">← Back</button>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm"><Download className="w-4 h-4" /> PDF</Button>
            {selectedInvoice.status !== 'paid' && (
              <Button size="sm"><Send className="w-4 h-4" /> Send Reminder</Button>
            )}
          </div>
        </div>

        <Card className="p-8">
          {/* Invoice header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">P</span>
                </div>
                <span className="font-bold text-white">PayNow Business</span>
              </div>
              <p className="text-slate-400 text-sm">your@business.com</p>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-lg">{selectedInvoice.number}</p>
              <Badge variant={statusConfig[selectedInvoice.status].variant}>
                {statusConfig[selectedInvoice.status].label}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Bill To</p>
              <p className="text-white font-medium">{selectedInvoice.clientName}</p>
              <p className="text-slate-400 text-sm">{selectedInvoice.clientEmail}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Due Date</p>
              <p className="text-white font-medium">{formatDate(selectedInvoice.dueDate)}</p>
              <p className="text-slate-400 text-xs">Created {formatDate(selectedInvoice.createdAt)}</p>
            </div>
          </div>

          {/* Items */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-left text-slate-400 font-medium pb-2">Description</th>
                <th className="text-right text-slate-400 font-medium pb-2">Qty</th>
                <th className="text-right text-slate-400 font-medium pb-2">Price</th>
                <th className="text-right text-slate-400 font-medium pb-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedInvoice.items.map((item, i) => (
                <tr key={i} className="border-b border-white/[0.04]">
                  <td className="py-3 text-slate-200">{item.description}</td>
                  <td className="py-3 text-right text-slate-400">{item.quantity}</td>
                  <td className="py-3 text-right text-slate-400">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 text-right text-white font-medium">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-56 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-slate-200">{formatCurrency(selectedInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tax (8%)</span>
                <span className="text-slate-200">{formatCurrency(selectedInvoice.tax)}</span>
              </div>
              <div className="flex justify-between border-t border-white/[0.08] pt-2 font-bold">
                <span className="text-white">Total</span>
                <span className="text-white text-lg">{formatCurrency(selectedInvoice.total)}</span>
              </div>
            </div>
          </div>

          {selectedInvoice.notes && (
            <div className="mt-6 pt-6 border-t border-white/[0.08]">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Notes</p>
              <p className="text-slate-300 text-sm">{selectedInvoice.notes}</p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  if (view === 'create') {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('list')} className="text-brand-400 text-sm hover:text-brand-300">← Cancel</button>
          <h2 className="text-white font-semibold">New Invoice</h2>
          <Button size="sm">Save Draft</Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Client Details</CardTitle></CardHeader>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Client Name" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} placeholder="Client Company" />
            <Input label="Client Email" type="email" value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} placeholder="billing@client.com" />
          </div>
          <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="mt-4" />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
            <Button variant="ghost" size="sm" onClick={addItem}><Plus className="w-3.5 h-3.5" /> Add item</Button>
          </CardHeader>
          <div className="space-y-3">
            {form.items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  {i === 0 && <label className="text-xs text-slate-400 mb-1 block">Description</label>}
                  <input
                    value={item.description}
                    onChange={e => updateItem(i, 'description', e.target.value)}
                    placeholder="Service description"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                  />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="text-xs text-slate-400 mb-1 block">Qty</label>}
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                  />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="text-xs text-slate-400 mb-1 block">Price</label>}
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={e => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                  />
                </div>
                <div className="col-span-3 text-right">
                  {i === 0 && <label className="text-xs text-slate-400 mb-1 block">Total</label>}
                  <div className="py-2 text-white font-medium text-sm">{formatCurrency(item.total)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-4 pt-4 border-t border-white/[0.06]">
            <div className="w-48 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax (8%)</span><span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-base border-t border-white/[0.08] pt-2">
                <span>Total</span><span>{formatCurrency(subtotal + tax)}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-3">Notes</CardTitle>
          <textarea
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Thank you for your business!"
            rows={3}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/60 resize-none"
          />
        </Card>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1">Save Draft</Button>
          <Button className="flex-1"><Send className="w-4 h-4" /> Send Invoice</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-400/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-emerald-400" /></div>
            <div><p className="text-slate-400 text-xs">Paid</p><p className="text-white font-bold">{formatCurrency(totalPaid)}</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-400/10 flex items-center justify-center"><Clock className="w-4 h-4 text-blue-400" /></div>
            <div><p className="text-slate-400 text-xs">Pending</p><p className="text-white font-bold">{formatCurrency(totalPending)}</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-400/10 flex items-center justify-center"><AlertCircle className="w-4 h-4 text-red-400" /></div>
            <div><p className="text-slate-400 text-xs">Overdue</p><p className="text-white font-bold">{formatCurrency(totalOverdue)}</p></div>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'paid', 'sent', 'overdue', 'draft'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all capitalize border ${
                filter === f
                  ? 'border-brand-500/50 bg-brand-500/10 text-brand-300'
                  : 'border-white/[0.08] text-slate-400 hover:border-white/20'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setView('create')}>
          <Plus className="w-4 h-4" /> New Invoice
        </Button>
      </div>

      <Card>
        <div className="space-y-2">
          {filtered.map(inv => {
            const cfg = statusConfig[inv.status];
            return (
              <div
                key={inv.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer"
                onClick={() => { setSelectedInvoice(inv); setView('preview'); }}
              >
                <div className="w-10 h-10 rounded-xl bg-dark-900/60 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-slate-200 font-medium text-sm">{inv.number}</p>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {inv.clientName} · Due {formatDate(inv.dueDate)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-semibold">{formatCurrency(inv.total)}</p>
                  <p className="text-slate-500 text-xs">{inv.items.length} item{inv.items.length > 1 ? 's' : ''}</p>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No invoices found</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
