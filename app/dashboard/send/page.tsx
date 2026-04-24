'use client';

import { useState } from 'react';
import { Send, CheckCircle, Search, ArrowRight } from 'lucide-react';
import { useApp } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';

const CONTACTS = [
  { id: 'c1', name: 'Sarah Johnson', email: 'sarah@email.com', initials: 'SJ', color: 'from-pink-500 to-rose-600' },
  { id: 'c2', name: 'Mike Chen', email: 'mike@email.com', initials: 'MC', color: 'from-blue-500 to-cyan-600' },
  { id: 'c3', name: 'Emma Davis', email: 'emma@email.com', initials: 'ED', color: 'from-emerald-500 to-teal-600' },
  { id: 'c4', name: 'James Wilson', email: 'james@email.com', initials: 'JW', color: 'from-amber-500 to-orange-600' },
  { id: 'c5', name: 'Lily Park', email: 'lily@email.com', initials: 'LP', color: 'from-purple-500 to-violet-600' },
  { id: 'c6', name: 'Omar Hassan', email: 'omar@email.com', initials: 'OH', color: 'from-brand-500 to-indigo-600' },
];

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];

type Step = 'select' | 'amount' | 'confirm' | 'success';

export default function SendPage() {
  const { user, addTransaction } = useApp();
  const [step, setStep] = useState<Step>('select');
  const [recipient, setRecipient] = useState<typeof CONTACTS[0] | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const filtered = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSend = async () => {
    if (!recipient || !amount) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    addTransaction({
      type: 'send',
      amount: parseFloat(amount),
      currency: user.currency,
      description: note || `Payment to ${recipient.name}`,
      counterparty: recipient.name,
      status: 'completed',
      category: 'Transfer',
      date: new Date().toISOString(),
    });
    setLoading(false);
    setStep('success');
  };

  const reset = () => {
    setStep('select');
    setRecipient(null);
    setAmount('');
    setNote('');
    setSearch('');
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {step === 'select' && (
        <>
          <Card>
            <h2 className="text-white font-semibold mb-4">Send to</h2>
            <Input
              placeholder="Search name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              prefix={<Search className="w-4 h-4" />}
              className="mb-4"
            />
            <div className="space-y-1">
              {filtered.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setRecipient(c); setStep('amount'); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {c.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 font-medium text-sm">{c.name}</p>
                    <p className="text-slate-500 text-xs">{c.email}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Send to new recipient</h2>
            <Input placeholder="Enter email, phone, or PayNow ID" />
            <Button variant="secondary" className="w-full mt-3">Continue</Button>
          </Card>
        </>
      )}

      {step === 'amount' && recipient && (
        <Card>
          <button onClick={() => setStep('select')} className="text-brand-400 text-sm mb-4 hover:text-brand-300">← Back</button>

          <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-dark-900/50">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${recipient.color} flex items-center justify-center text-white text-sm font-bold`}>
              {recipient.initials}
            </div>
            <div>
              <p className="text-slate-200 font-medium text-sm">{recipient.name}</p>
              <p className="text-slate-500 text-xs">{recipient.email}</p>
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-slate-400 text-sm mb-2">Amount</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-slate-400">$</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="text-5xl font-extrabold text-white bg-transparent border-none outline-none w-48 text-center placeholder-slate-700"
                min="0.01"
                step="0.01"
              />
            </div>
            <p className="text-slate-500 text-xs mt-2">Balance: {formatCurrency(user.balance)}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {QUICK_AMOUNTS.map(a => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                className={`py-2 rounded-xl text-sm font-medium transition-all border ${
                  amount === String(a)
                    ? 'border-brand-500/50 bg-brand-500/10 text-brand-300'
                    : 'border-white/[0.08] text-slate-400 hover:border-white/20'
                }`}
              >
                ${a}
              </button>
            ))}
          </div>

          <Input
            label="Note (optional)"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="What's this for?"
            className="mb-4"
          />

          <Button
            className="w-full"
            size="lg"
            disabled={!amount || parseFloat(amount) <= 0}
            onClick={() => setStep('confirm')}
          >
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>
      )}

      {step === 'confirm' && recipient && (
        <Card>
          <h2 className="text-white font-semibold mb-5">Confirm transfer</h2>
          <div className="space-y-3 mb-6">
            {[
              { label: 'To', value: recipient.name },
              { label: 'Amount', value: formatCurrency(parseFloat(amount)) },
              { label: 'Fee', value: 'Free' },
              { label: 'Note', value: note || '—' },
              { label: 'Arrives', value: 'Instantly' },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-2 border-b border-white/[0.06] last:border-0">
                <span className="text-slate-400 text-sm">{r.label}</span>
                <span className={`text-sm font-medium ${r.label === 'Amount' ? 'text-white text-base font-bold' : 'text-slate-200'}`}>{r.value}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setStep('amount')}>Edit</Button>
            <Button className="flex-1" loading={loading} onClick={handleSend}>
              <Send className="w-4 h-4" /> Send {formatCurrency(parseFloat(amount))}
            </Button>
          </div>
        </Card>
      )}

      {step === 'success' && recipient && (
        <Card className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-1">Sent!</h2>
          <p className="text-slate-400 text-sm mb-1">
            {formatCurrency(parseFloat(amount))} sent to {recipient.name}
          </p>
          <p className="text-slate-500 text-xs mb-6">Arrives instantly</p>
          <Button onClick={reset}>Send Another</Button>
        </Card>
      )}
    </div>
  );
}
