'use client';

import { useState } from 'react';
import {
  ArrowDownLeft, ArrowUpRight, Plus, Building, CreditCard as CardIcon,
  CheckCircle, Wallet,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TransactionList } from '@/components/dashboard/transaction-list';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

type Modal = null | 'topup' | 'withdraw';

export default function WalletPage() {
  const { user, transactions, addTransaction } = useApp();
  const [modal, setModal] = useState<Modal>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    if (modal === 'topup') {
      addTransaction({
        type: 'topup',
        amount: val,
        currency: user.currency,
        description: 'Wallet top-up',
        counterparty: method === 'bank' ? 'Bank Transfer' : 'Debit Card',
        status: 'completed',
        category: 'Top-up',
        date: new Date().toISOString(),
      });
    } else {
      addTransaction({
        type: 'send',
        amount: val,
        currency: user.currency,
        description: 'Withdrawal to bank',
        counterparty: 'Bank Account ••4521',
        status: 'completed',
        category: 'Withdrawal',
        date: new Date().toISOString(),
      });
    }
    setLoading(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setModal(null); setAmount(''); }, 1500);
  };

  const monthlyIn = transactions
    .filter(t => (t.type === 'receive' || t.type === 'topup') && t.status === 'completed')
    .reduce((s, t) => s + t.amount, 0);
  const monthlyOut = transactions
    .filter(t => (t.type === 'send' || t.type === 'payment') && t.status === 'completed')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Balance hero */}
      <div className="relative rounded-2xl overflow-hidden p-8 bg-gradient-to-br from-brand-600 via-purple-600 to-indigo-800 card-shine">
        <div className="absolute -right-12 -top-12 w-56 h-56 bg-white/10 rounded-full" />
        <div className="absolute right-12 bottom-0 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-white/60" />
            <p className="text-white/70 text-sm">Available Balance</p>
            <Badge variant="success" className="bg-white/10 text-white/80 border-white/20 text-xs">Verified</Badge>
          </div>
          <p className="text-5xl font-extrabold text-white tracking-tight mt-2">
            {formatCurrency(user.balance)}
          </p>
          <p className="text-white/50 text-sm mt-1.5">{user.currency} · Real-time balance</p>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setModal('topup')}
              className="bg-white/15 border-white/20 text-white hover:bg-white/25"
              variant="secondary"
            >
              <Plus className="w-4 h-4" /> Add Money
            </Button>
            <Button
              onClick={() => setModal('withdraw')}
              className="bg-white/15 border-white/20 text-white hover:bg-white/25"
              variant="secondary"
            >
              <ArrowUpRight className="w-4 h-4" /> Withdraw
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Money In (All time)</p>
              <p className="text-white font-bold text-lg">{formatCurrency(monthlyIn)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-400/10 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Money Out (All time)</p>
              <p className="text-white font-bold text-lg">{formatCurrency(monthlyOut)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transaction history */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <span className="text-xs text-slate-500">{transactions.length} transactions</span>
        </CardHeader>
        <TransactionList transactions={transactions} />
      </Card>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass rounded-2xl border border-white/10 p-6 animate-slide-up">
            {success ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-white font-semibold text-lg">
                  {modal === 'topup' ? 'Money added!' : 'Withdrawal sent!'}
                </p>
                <p className="text-slate-400 text-sm mt-1">{formatCurrency(parseFloat(amount))} processed.</p>
              </div>
            ) : (
              <>
                <h2 className="text-white font-semibold text-lg mb-5">
                  {modal === 'topup' ? 'Add Money to Wallet' : 'Withdraw Funds'}
                </h2>
                <form onSubmit={handleAction} className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Method</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setMethod('bank')}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${method === 'bank' ? 'border-brand-500/50 bg-brand-500/10 text-brand-300' : 'border-white/[0.08] text-slate-400 hover:border-white/20'}`}>
                        <Building className="w-4 h-4" /> Bank Transfer
                      </button>
                      <button type="button" onClick={() => setMethod('card')}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${method === 'card' ? 'border-brand-500/50 bg-brand-500/10 text-brand-300' : 'border-white/[0.08] text-slate-400 hover:border-white/20'}`}>
                        <CardIcon className="w-4 h-4" /> Debit Card
                      </button>
                    </div>
                  </div>
                  <Input
                    label="Amount (USD)"
                    type="number"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    prefix={<span className="text-sm">$</span>}
                    required
                  />
                  <div className="flex gap-3">
                    <Button type="button" variant="secondary" className="flex-1" onClick={() => { setModal(null); setAmount(''); }}>
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" loading={loading}>
                      {modal === 'topup' ? 'Add Money' : 'Withdraw'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
