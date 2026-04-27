'use client';

import { useState } from 'react';
import {
  Snowflake, Play, Eye, EyeOff, Copy, Apple, Globe,
  CheckCircle, Shield, Plus, CreditCard,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VirtualCardDisplay } from '@/components/cards/virtual-card';
import { formatCurrency } from '@/lib/utils';

export default function CardsPage() {
  const { cards, toggleCardFreeze } = useApp();
  const [selectedCard, setSelectedCard] = useState(cards[0]);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [walletSuccess, setWalletSuccess] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToWallet = async (wallet: string) => {
    await new Promise(r => setTimeout(r, 800));
    setWalletSuccess(wallet);
    setTimeout(() => setWalletSuccess(null), 3000);
  };

  if (!selectedCard) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Card selector */}
      {cards.length > 1 && (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {cards.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCard(c)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all whitespace-nowrap ${
                selectedCard.id === c.id
                  ? 'border-brand-500/50 bg-brand-500/10 text-brand-300'
                  : 'border-white/[0.08] text-slate-400 hover:border-white/20'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              •••• {c.last4}
              {c.status === 'frozen' && <Badge variant="info">Frozen</Badge>}
            </button>
          ))}
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-white/20 text-slate-500 hover:border-brand-500/40 hover:text-brand-400 text-sm font-medium transition-all whitespace-nowrap">
            <Plus className="w-4 h-4" /> New Card
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Card visual */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-white font-semibold">Virtual {selectedCard.network.toUpperCase()}</h3>
                <p className="text-slate-400 text-sm">•••• •••• •••• {selectedCard.last4}</p>
              </div>
              <Badge variant={selectedCard.status === 'active' ? 'success' : selectedCard.status === 'frozen' ? 'info' : 'danger'}>
                {selectedCard.status.charAt(0).toUpperCase() + selectedCard.status.slice(1)}
              </Badge>
            </div>

            <div className="flex justify-center mb-5">
              <VirtualCardDisplay card={selectedCard} />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toggleCardFreeze(selectedCard.id)}
                className="flex-col h-auto py-2.5 gap-1 text-xs"
              >
                {selectedCard.status === 'frozen'
                  ? <><Play className="w-4 h-4 text-emerald-400" />Unfreeze</>
                  : <><Snowflake className="w-4 h-4 text-blue-400" />Freeze</>}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="flex-col h-auto py-2.5 gap-1 text-xs"
              >
                {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showDetails ? 'Hide' : 'Details'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCopy(`4111 1111 1111 ${selectedCard.last4}`)}
                className="flex-col h-auto py-2.5 gap-1 text-xs"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-col h-auto py-2.5 gap-1 text-xs"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                Lock 3DS
              </Button>
            </div>
          </Card>

          {/* Card details */}
          {showDetails && (
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle>Card Details</CardTitle>
                <Badge variant="warning">Sensitive</Badge>
              </CardHeader>
              <div className="space-y-3 font-mono text-sm">
                {[
                  { label: 'Card Number', value: `4111 1111 1111 ${selectedCard.last4}` },
                  { label: 'Expiry', value: `${selectedCard.expiryMonth}/${selectedCard.expiryYear}` },
                  { label: 'CVV', value: '***' },
                  { label: 'Billing Zip', value: '10001' },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between p-3 rounded-xl bg-dark-900/50">
                    <span className="text-slate-400 font-sans text-xs">{r.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-200">{r.value}</span>
                      <button onClick={() => handleCopy(r.value)} className="text-slate-600 hover:text-slate-400">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-3 text-center">
                Never share your card details with anyone.
              </p>
            </Card>
          )}
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Spending limit */}
          <Card>
            <CardHeader><CardTitle>Spending Limit</CardTitle></CardHeader>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Used</span>
                <span className="text-white font-semibold">{formatCurrency(selectedCard.spent)}</span>
              </div>
              <div className="h-3 bg-dark-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all"
                  style={{ width: `${Math.min((selectedCard.spent / selectedCard.spendingLimit) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>$0</span>
                <span>Limit: {formatCurrency(selectedCard.spendingLimit)}</span>
              </div>
            </div>
          </Card>

          {/* Apple Pay / Google Pay */}
          <Card>
            <CardHeader><CardTitle>Digital Wallets</CardTitle></CardHeader>
            <div className="space-y-3">
              {/* Apple Pay */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-dark-900/60 border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black border border-white/10 flex items-center justify-center">
                    <Apple className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-200 text-sm font-medium">Apple Pay</p>
                    <p className="text-xs text-slate-500">{selectedCard.addedToApplePay ? 'Active' : 'Not added'}</p>
                  </div>
                </div>
                {selectedCard.addedToApplePay ? (
                  <Badge variant="success">Added</Badge>
                ) : (
                  <Button size="sm" onClick={() => handleAddToWallet('apple')}>
                    {walletSuccess === 'apple' ? <CheckCircle className="w-4 h-4" /> : 'Add'}
                  </Button>
                )}
              </div>

              {/* Google Pay */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-dark-900/60 border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-slate-200 text-sm font-medium">Google Pay</p>
                    <p className="text-xs text-slate-500">{selectedCard.addedToGooglePay ? 'Active' : 'Not added'}</p>
                  </div>
                </div>
                {selectedCard.addedToGooglePay ? (
                  <Badge variant="success">Added</Badge>
                ) : (
                  <Button size="sm" onClick={() => handleAddToWallet('google')}>
                    {walletSuccess === 'google' ? <CheckCircle className="w-4 h-4" /> : 'Add'}
                  </Button>
                )}
              </div>

              {walletSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-slide-up">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  Card added to {walletSuccess === 'apple' ? 'Apple Pay' : 'Google Pay'} successfully!
                </div>
              )}
            </div>
          </Card>

          {/* Card settings */}
          <Card>
            <CardHeader><CardTitle>Card Controls</CardTitle></CardHeader>
            <div className="space-y-2">
              {[
                { label: 'Online payments', active: true },
                { label: 'Contactless (NFC)', active: true },
                { label: 'International', active: false },
                { label: 'ATM withdrawals', active: false },
              ].map(ctrl => (
                <div key={ctrl.label} className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-300">{ctrl.label}</span>
                  <div className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${ctrl.active ? 'bg-brand-500' : 'bg-dark-900'} flex items-center ${ctrl.active ? 'justify-end' : 'justify-start'} px-0.5`}>
                    <div className="w-4 h-4 rounded-full bg-white shadow" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
