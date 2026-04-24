'use client';

import { useState } from 'react';
import {
  Plus, Link2, Copy, CheckCircle, Eye, ToggleLeft, ToggleRight,
  ExternalLink, QrCode, BarChart2,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency, formatDate, generatePaymentLink } from '@/lib/utils';

type View = 'list' | 'create';

export default function PaymentLinksPage() {
  const { paymentLinks } = useApp();
  const [view, setView] = useState<View>('list');
  const [copied, setCopied] = useState<string | null>(null);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', amount: '', slug: '' });

  const handleCopy = (slug: string) => {
    navigator.clipboard.writeText(generatePaymentLink(slug)).catch(() => {});
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  const totalCollected = paymentLinks.reduce((s, l) => s + l.collected, 0);
  const activeLinks = paymentLinks.filter(l => l.active).length;
  const totalPayments = paymentLinks.reduce((s, l) => s + l.payments, 0);

  if (view === 'create') {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('list')} className="text-brand-400 text-sm hover:text-brand-300">← Back</button>
          <h2 className="text-white font-semibold">New Payment Link</h2>
          <div />
        </div>

        <Card>
          <CardHeader><CardTitle>Link Details</CardTitle></CardHeader>
          <div className="space-y-4">
            <Input
              label="Title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
              placeholder="e.g. Coffee Order, Design Work"
            />
            <Input
              label="Description (optional)"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="What is this payment for?"
            />
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">
                Amount <span className="text-slate-500 font-normal">(leave blank for custom amount)</span>
              </label>
              <Input
                type="number"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                prefix={<span className="text-sm">$</span>}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Link URL</label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-dark-900/60 border border-white/[0.08]">
                <span className="text-slate-500 text-sm">pay.paynow.app/</span>
                <input
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                  className="flex-1 bg-transparent text-slate-200 text-sm focus:outline-none"
                  placeholder="your-link-slug"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setView('list')}>Cancel</Button>
          <Button className="flex-1" onClick={() => setView('list')}>
            <Link2 className="w-4 h-4" /> Create Link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-slate-400 text-xs mb-1">Total Collected</p>
          <p className="text-white font-bold text-xl">{formatCurrency(totalCollected)}</p>
        </Card>
        <Card>
          <p className="text-slate-400 text-xs mb-1">Active Links</p>
          <p className="text-white font-bold text-xl">{activeLinks}</p>
        </Card>
        <Card>
          <p className="text-slate-400 text-xs mb-1">Total Payments</p>
          <p className="text-white font-bold text-xl">{totalPayments}</p>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold">Your Payment Links</h2>
        <Button size="sm" onClick={() => setView('create')}>
          <Plus className="w-4 h-4" /> New Link
        </Button>
      </div>

      <div className="space-y-4">
        {paymentLinks.map(link => (
          <Card key={link.id}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${link.active ? 'bg-brand-500/10' : 'bg-slate-600/10'}`}>
                  <Link2 className={`w-5 h-5 ${link.active ? 'text-brand-400' : 'text-slate-500'}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm">{link.title}</p>
                    <Badge variant={link.active ? 'success' : 'neutral'}>
                      {link.active ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                  {link.description && (
                    <p className="text-slate-400 text-xs mt-0.5">{link.description}</p>
                  )}
                  <p className="text-slate-500 text-xs mt-1 font-mono truncate">pay.paynow.app/{link.slug}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                {link.amount ? (
                  <p className="text-white font-bold">{formatCurrency(link.amount)}</p>
                ) : (
                  <p className="text-slate-400 text-sm">Custom amount</p>
                )}
                <p className="text-slate-500 text-xs">{link.payments} payments</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-xl bg-dark-900/40">
              <div className="text-center">
                <p className="text-white font-semibold">{formatCurrency(link.collected)}</p>
                <p className="text-slate-500 text-xs">Collected</p>
              </div>
              <div className="text-center border-x border-white/[0.06]">
                <p className="text-white font-semibold">{link.payments}</p>
                <p className="text-slate-500 text-xs">Payments</p>
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">{link.visits}</p>
                <p className="text-slate-500 text-xs">Visits</p>
              </div>
            </div>

            {/* QR preview */}
            {showQR === link.id && (
              <div className="flex justify-center mb-4 animate-slide-up">
                <div className="p-4 bg-white rounded-xl">
                  <QRCodeSVG value={generatePaymentLink(link.slug)} size={140} level="M" fgColor="#0f172a" bgColor="#ffffff" />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleCopy(link.slug)}>
                {copied === link.slug ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === link.slug ? 'Copied' : 'Copy Link'}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowQR(showQR === link.id ? null : link.id)}>
                <QrCode className="w-3.5 h-3.5" /> QR Code
              </Button>
              <Button variant="secondary" size="sm">
                <ExternalLink className="w-3.5 h-3.5" /> Open
              </Button>
              <Button variant="ghost" size="sm" className="text-xs ml-auto">
                {link.active ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                {link.active ? 'Pause' : 'Activate'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
