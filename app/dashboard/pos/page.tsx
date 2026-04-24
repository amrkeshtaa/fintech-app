'use client';

import { useState } from 'react';
import { Delete, CheckCircle, QrCode, NfcIcon, RotateCcw } from 'lucide-react';
import { useApp } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency, generateId } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type POSState = 'keypad' | 'awaiting' | 'success';

export default function POSPage() {
  const { user, addTransaction } = useApp();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [state, setState] = useState<POSState>('keypad');
  const [method, setMethod] = useState<'qr' | 'nfc'>('qr');

  if (!user) return null;

  const displayAmount = amount ? parseFloat(amount) / 100 : 0;
  const paymentLink = `https://pay.paynow.app/${user.id}?amount=${displayAmount}`;

  const press = (digit: string) => {
    if (digit === '.' && amount.includes('.')) return;
    if (amount === '0' && digit !== '.') { setAmount(digit); return; }
    if (amount.split('.')[1]?.length >= 2) return;
    setAmount(prev => prev + digit);
  };

  const erase = () => setAmount(prev => prev.slice(0, -1));
  const clear = () => setAmount('');

  const handleCharge = () => {
    if (!displayAmount) return;
    setState('awaiting');
    // Simulate payment after 3 seconds
    setTimeout(() => {
      addTransaction({
        type: 'receive',
        amount: displayAmount,
        currency: user.currency,
        description: note || 'POS payment',
        counterparty: 'Customer',
        status: 'completed',
        category: 'Sales',
        date: new Date().toISOString(),
      });
      setState('success');
    }, 3000);
  };

  const reset = () => {
    setState('keypad');
    setAmount('');
    setNote('');
  };

  const keys = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold">POS Terminal</h2>
          <p className="text-slate-400 text-sm">Turn your phone into a payment terminal</p>
        </div>
        <Badge variant="success" className="text-xs">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block mr-1 animate-pulse" />
          Ready
        </Badge>
      </div>

      {state === 'keypad' && (
        <>
          {/* Amount display */}
          <Card>
            <div className="text-center py-4">
              {note && <p className="text-slate-400 text-sm mb-2">{note}</p>}
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-3xl font-bold text-slate-400">$</span>
                <span className="text-6xl font-extrabold text-white tracking-tight min-w-[120px] text-center">
                  {amount ? (parseFloat(amount) / 100).toFixed(2) : '0.00'}
                </span>
              </div>
              <p className="text-slate-500 text-xs">Tap amount or use keypad</p>
            </div>

            {/* Note field */}
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add item description (optional)"
              className="w-full text-center text-sm bg-transparent text-slate-400 placeholder-slate-600 border-t border-white/[0.06] pt-3 mt-1 focus:outline-none focus:text-slate-200"
            />
          </Card>

          {/* Keypad */}
          <Card>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {keys.map(k => (
                <button
                  key={k}
                  onClick={() => k === '⌫' ? erase() : press(k)}
                  className={`h-16 rounded-xl text-xl font-semibold transition-all active:scale-95 ${
                    k === '⌫'
                      ? 'text-red-400 bg-red-400/10 hover:bg-red-400/20'
                      : 'text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06]'
                  }`}
                >
                  {k === '⌫' ? <Delete className="w-5 h-5 mx-auto" /> : k}
                </button>
              ))}
            </div>

            {/* Payment method */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setMethod('qr')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  method === 'qr'
                    ? 'border-brand-500/50 bg-brand-500/10 text-brand-300'
                    : 'border-white/[0.08] text-slate-400 hover:border-white/20'
                }`}
              >
                <QrCode className="w-4 h-4" /> QR Code
              </button>
              <button
                onClick={() => setMethod('nfc')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  method === 'nfc'
                    ? 'border-brand-500/50 bg-brand-500/10 text-brand-300'
                    : 'border-white/[0.08] text-slate-400 hover:border-white/20'
                }`}
              >
                <NfcIcon className="w-4 h-4" /> Contactless
              </button>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={!displayAmount || displayAmount <= 0}
              onClick={handleCharge}
            >
              Charge {displayAmount > 0 ? formatCurrency(displayAmount) : ''}
            </Button>

            {amount && (
              <button onClick={clear} className="w-full text-center text-xs text-slate-500 hover:text-slate-300 mt-2 py-1">
                Clear
              </button>
            )}
          </Card>
        </>
      )}

      {state === 'awaiting' && (
        <Card className="text-center py-8">
          {method === 'qr' ? (
            <>
              <p className="text-white font-semibold mb-2">Show QR to customer</p>
              <p className="text-slate-400 text-sm mb-5">
                Charging <span className="text-white font-bold">{formatCurrency(displayAmount)}</span>
              </p>
              <div className="flex justify-center mb-5">
                <div className="p-5 bg-white rounded-2xl shadow-2xl">
                  <QRCodeSVG value={paymentLink} size={180} level="H" fgColor="#0f172a" bgColor="#ffffff" />
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-1 animate-pulse">⏳ Waiting for payment...</p>
              <p className="text-slate-500 text-xs">(Auto-completes in a moment for demo)</p>
            </>
          ) : (
            <div className="py-4">
              <div className="w-20 h-20 rounded-full border-4 border-brand-500/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <NfcIcon className="w-10 h-10 text-brand-400" />
              </div>
              <p className="text-white font-semibold text-lg mb-2">Hold device near card</p>
              <p className="text-slate-400 text-sm mb-5">
                Tap to pay <span className="text-white font-bold">{formatCurrency(displayAmount)}</span>
              </p>
              <p className="text-slate-500 text-xs animate-pulse">Waiting for NFC tap...</p>
            </div>
          )}
          <button onClick={reset} className="mt-4 text-xs text-slate-600 hover:text-slate-400 flex items-center gap-1 mx-auto">
            <RotateCcw className="w-3 h-3" /> Cancel
          </button>
        </Card>
      )}

      {state === 'success' && (
        <Card className="text-center py-8">
          <div className="w-20 h-20 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-white font-bold text-2xl mb-1">Payment received!</h2>
          <p className="text-emerald-400 font-semibold text-xl">{formatCurrency(displayAmount)}</p>
          <p className="text-slate-400 text-sm mt-1 mb-6">Added to your balance</p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" size="sm">Receipt</Button>
            <Button onClick={reset}>New charge</Button>
          </div>
        </Card>
      )}

      {/* Recent POS payments */}
      {state === 'keypad' && (
        <Card>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Recent charges</p>
          <div className="space-y-2">
            {[
              { amount: 45.00, time: '2 min ago', note: 'Coffee order' },
              { amount: 120.50, time: '18 min ago', note: 'Lunch' },
              { amount: 320.00, time: '1 hr ago', note: 'Service' },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <div>
                  <p className="text-slate-200 text-sm">{r.note}</p>
                  <p className="text-slate-500 text-xs">{r.time}</p>
                </div>
                <span className="text-emerald-400 font-semibold text-sm">+{formatCurrency(r.amount)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
