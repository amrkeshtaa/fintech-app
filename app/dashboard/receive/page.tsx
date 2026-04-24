'use client';

import { useState } from 'react';
import { QrCode, Link2, Copy, CheckCircle, Share2, Download } from 'lucide-react';
import { useApp } from '@/lib/store';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency, generateId } from '@/lib/utils';

export default function ReceivePage() {
  const { user } = useApp();
  const [tab, setTab] = useState<'qr' | 'link'>('qr');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const baseLink = `https://pay.paynow.app/${user.id}`;
  const paymentLink = amount
    ? `${baseLink}?amount=${amount}&note=${encodeURIComponent(note)}`
    : baseLink;

  const displayLink = amount
    ? `pay.paynow.app/${user.id}?amount=$${amount}`
    : `pay.paynow.app/${user.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-dark-800/60 rounded-xl border border-white/[0.06]">
        {[{ id: 'qr', label: 'QR Code', icon: QrCode }, { id: 'link', label: 'Payment Link', icon: Link2 }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as 'qr' | 'link')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Amount + Note */}
      <Card>
        <CardHeader><CardTitle>Customize Request</CardTitle></CardHeader>
        <div className="space-y-4">
          <Input
            label="Amount (optional)"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            prefix={<span className="text-sm">$</span>}
            min="0"
            step="0.01"
          />
          <Input
            label="Note (optional)"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="What is this payment for?"
          />
        </div>
      </Card>

      {tab === 'qr' && (
        <Card>
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-5">
              Show this QR code to receive payment
              {amount && <span className="text-white font-semibold"> of {formatCurrency(parseFloat(amount))}</span>}
            </p>

            <div className="inline-flex flex-col items-center p-5 bg-white rounded-2xl shadow-2xl mb-5">
              <QRCodeSVG
                value={paymentLink}
                size={200}
                level="H"
                includeMargin={false}
                fgColor="#0f172a"
                bgColor="#ffffff"
              />
              <div className="mt-3 flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">P</span>
                </div>
                <span className="text-dark-900 text-xs font-semibold">{user.businessName || user.name}</span>
              </div>
            </div>

            <p className="text-slate-500 text-xs mb-4">
              Scan with any camera app or payment app
            </p>

            <div className="flex gap-3 justify-center">
              <Button variant="secondary" size="sm" onClick={handleCopy}>
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                Copy Link
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4" /> Save QR
              </Button>
              <Button variant="secondary" size="sm">
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>
          </div>
        </Card>
      )}

      {tab === 'link' && (
        <Card>
          <CardHeader><CardTitle>Your Payment Link</CardTitle></CardHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-dark-900/60 border border-white/[0.06]">
              <Link2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span className="text-slate-300 text-sm flex-1 truncate font-mono">{displayLink}</span>
              <button onClick={handleCopy} className="text-slate-400 hover:text-white flex-shrink-0">
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {amount && (
              <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20 text-center">
                <p className="text-brand-300 text-sm">
                  Requesting <span className="font-bold text-white text-lg">{formatCurrency(parseFloat(amount))}</span>
                </p>
                {note && <p className="text-slate-400 text-xs mt-1">For: {note}</p>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleCopy} className="w-full">
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              <Button variant="secondary" className="w-full">
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>

            <p className="text-xs text-slate-500 text-center">
              Anyone with this link can pay you directly. Payments arrive instantly.
            </p>
          </div>
        </Card>
      )}

      {/* Your payment info */}
      <Card>
        <CardHeader><CardTitle>Your Payment Info</CardTitle></CardHeader>
        <div className="space-y-2">
          {[
            { label: 'Name', value: user.businessName || user.name },
            { label: 'PayNow ID', value: user.id },
            { label: 'Email', value: user.email },
          ].map(r => (
            <div key={r.label} className="flex justify-between py-2 border-b border-white/[0.04] last:border-0">
              <span className="text-slate-400 text-sm">{r.label}</span>
              <span className="text-slate-200 text-sm font-medium">{r.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
