'use client';

import Link from 'next/link';
import {
  TrendingUp, TrendingDown, Send, QrCode, Smartphone, FileText,
  Link2, CreditCard, ArrowRight, Wallet,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransactionList } from '@/components/dashboard/transaction-list';
import { VirtualCardDisplay } from '@/components/cards/virtual-card';
import { formatCurrency, formatRelativeDate } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { MOCK_MONTHLY_DATA } from '@/lib/mock-data';

const quickActions = [
  { href: '/dashboard/send', icon: Send, label: 'Send', color: 'from-brand-500 to-purple-600' },
  { href: '/dashboard/receive', icon: QrCode, label: 'Receive', color: 'from-purple-500 to-pink-600' },
  { href: '/dashboard/pos', icon: Smartphone, label: 'POS', color: 'from-amber-500 to-orange-600' },
  { href: '/dashboard/invoices', icon: FileText, label: 'Invoice', color: 'from-emerald-500 to-teal-600' },
];

const customerActions = [
  { href: '/dashboard/send', icon: Send, label: 'Send', color: 'from-brand-500 to-purple-600' },
  { href: '/dashboard/receive', icon: QrCode, label: 'Receive', color: 'from-purple-500 to-pink-600' },
  { href: '/dashboard/cards', icon: CreditCard, label: 'Card', color: 'from-amber-500 to-orange-600' },
  { href: '/dashboard/analytics', icon: TrendingUp, label: 'Spending', color: 'from-emerald-500 to-teal-600' },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-800 border border-white/10 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-emerald-400 font-semibold">Income: {formatCurrency(payload[0]?.value)}</p>
      <p className="text-red-400 font-semibold">Expenses: {formatCurrency(payload[1]?.value)}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, transactions, cards } = useApp();
  if (!user) return null;

  const isBusiness = user.role === 'business';
  const actions = isBusiness ? quickActions : customerActions;
  const activeCard = cards[0];

  const monthIncome = MOCK_MONTHLY_DATA[MOCK_MONTHLY_DATA.length - 1].income;
  const prevMonthIncome = MOCK_MONTHLY_DATA[MOCK_MONTHLY_DATA.length - 2].income;
  const incomeGrowth = ((monthIncome - prevMonthIncome) / prevMonthIncome * 100).toFixed(1);

  const monthExpenses = MOCK_MONTHLY_DATA[MOCK_MONTHLY_DATA.length - 1].expenses;
  const prevMonthExpenses = MOCK_MONTHLY_DATA[MOCK_MONTHLY_DATA.length - 2].expenses;
  const expensesGrowth = ((monthExpenses - prevMonthExpenses) / prevMonthExpenses * 100).toFixed(1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            Good morning, {user.name.split(' ')[0]} 👋
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Here's what's happening with your {isBusiness ? 'business' : 'account'} today.
          </p>
        </div>
      </div>

      {/* Balance + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Balance card */}
        <div className="lg:col-span-2">
          <div className="relative rounded-2xl overflow-hidden p-6 bg-gradient-to-br from-brand-600 via-purple-600 to-purple-800 min-h-[160px] flex flex-col justify-between card-shine">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full" />
            <div className="absolute -right-6 top-16 w-32 h-32 bg-white/5 rounded-full" />
            <div className="relative z-10">
              <p className="text-white/70 text-sm font-medium">{isBusiness ? 'Business Balance' : 'Your Balance'}</p>
              <p className="text-white text-4xl font-extrabold mt-1 tracking-tight">
                {formatCurrency(user.balance)}
              </p>
              <p className="text-white/50 text-xs mt-1">{user.currency} · Updated just now</p>
            </div>
            <div className="flex items-center gap-3 relative z-10 mt-4">
              <Link href="/dashboard/wallet">
                <Button variant="secondary" size="sm" className="bg-white/15 border-white/20 text-white hover:bg-white/25">
                  <Wallet className="w-3.5 h-3.5" /> Top up
                </Button>
              </Link>
              <Link href="/dashboard/send">
                <Button variant="secondary" size="sm" className="bg-white/15 border-white/20 text-white hover:bg-white/25">
                  <Send className="w-3.5 h-3.5" /> Send
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs">This Month Income</p>
                <p className="text-white text-xl font-bold mt-1">{formatCurrency(monthIncome)}</p>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                +{incomeGrowth}%
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs">This Month Expenses</p>
                <p className="text-white text-xl font-bold mt-1">{formatCurrency(monthExpenses)}</p>
              </div>
              <div className="flex items-center gap-1 text-red-400 text-sm font-medium">
                <TrendingDown className="w-4 h-4" />
                -{expensesGrowth}%
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {actions.map(a => (
          <Link key={a.href} href={a.href}>
            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl glass glass-hover cursor-pointer transition-all duration-200">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center`}>
                <a.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-slate-300">{a.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Chart + Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow — 6 Months</CardTitle>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />Income</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" />Expenses</span>
              </div>
            </CardHeader>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_MONTHLY_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Virtual card preview */}
        {activeCard && (
          <Card className="flex flex-col gap-4">
            <CardHeader>
              <CardTitle>Virtual Card</CardTitle>
              <Link href="/dashboard/cards">
                <Button variant="ghost" size="sm" className="text-xs">
                  Manage <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <div className="flex justify-center">
              <VirtualCardDisplay card={activeCard} compact />
            </div>
            <div className="mt-1">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Monthly spend</span>
                <span className="text-slate-300">{formatCurrency(activeCard.spent)} / {formatCurrency(activeCard.spendingLimit)}</span>
              </div>
              <div className="h-2 bg-dark-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all"
                  style={{ width: `${(activeCard.spent / activeCard.spendingLimit) * 100}%` }}
                />
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <Link href="/dashboard/wallet">
            <Button variant="ghost" size="sm" className="text-xs">
              View all <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </CardHeader>
        <TransactionList transactions={transactions} limit={6} />
      </Card>
    </div>
  );
}
