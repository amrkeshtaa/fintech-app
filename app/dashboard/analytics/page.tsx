'use client';

import { useState } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight, Calendar,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { MOCK_MONTHLY_DATA, MOCK_SPENDING_CATEGORIES } from '@/lib/mock-data';

type Period = '1M' | '3M' | '6M' | '1Y';

const WEEKLY_DATA = [
  { day: 'Mon', amount: 420 },
  { day: 'Tue', amount: 890 },
  { day: 'Wed', amount: 320 },
  { day: 'Thu', amount: 1240 },
  { day: 'Fri', amount: 780 },
  { day: 'Sat', amount: 450 },
  { day: 'Sun', amount: 220 },
];

function CustomTooltipAmount({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-800 border border-white/10 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-white font-semibold">{formatCurrency(payload[0]?.value)}</p>
    </div>
  );
}

function CustomTooltipFlow({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-800 border border-white/10 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { user, transactions } = useApp();
  const [period, setPeriod] = useState<Period>('6M');

  if (!user) return null;

  const totalIncome = MOCK_MONTHLY_DATA.reduce((s, m) => s + m.income, 0);
  const totalExpenses = MOCK_MONTHLY_DATA.reduce((s, m) => s + m.expenses, 0);
  const netProfit = totalIncome - totalExpenses;
  const savingsRate = ((netProfit / totalIncome) * 100).toFixed(0);

  const currentMonth = MOCK_MONTHLY_DATA[MOCK_MONTHLY_DATA.length - 1];
  const prevMonth = MOCK_MONTHLY_DATA[MOCK_MONTHLY_DATA.length - 2];
  const incomeChange = ((currentMonth.income - prevMonth.income) / prevMonth.income * 100).toFixed(1);
  const expenseChange = ((currentMonth.expenses - prevMonth.expenses) / prevMonth.expenses * 100).toFixed(1);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Income',
            value: formatCurrency(totalIncome),
            change: `+${incomeChange}%`,
            positive: true,
            icon: TrendingUp,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
          },
          {
            label: 'Total Expenses',
            value: formatCurrency(totalExpenses),
            change: `+${expenseChange}%`,
            positive: false,
            icon: TrendingDown,
            color: 'text-red-400',
            bg: 'bg-red-400/10',
          },
          {
            label: 'Net Profit',
            value: formatCurrency(netProfit),
            change: `${savingsRate}% margin`,
            positive: true,
            icon: DollarSign,
            color: 'text-brand-400',
            bg: 'bg-brand-400/10',
          },
          {
            label: 'Avg Monthly',
            value: formatCurrency(totalIncome / 6),
            change: 'Per month',
            positive: true,
            icon: Calendar,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
          },
        ].map(k => (
          <Card key={k.label}>
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center`}>
                <k.icon className={`w-4 h-4 ${k.color}`} />
              </div>
              <span className={`text-xs font-medium ${k.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                {k.change}
              </span>
            </div>
            <p className="text-slate-400 text-xs mb-0.5">{k.label}</p>
            <p className="text-white font-bold text-lg">{k.value}</p>
          </Card>
        ))}
      </div>

      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold">Cash Flow</h2>
        <div className="flex gap-1.5 p-1 bg-dark-800/60 rounded-xl border border-white/[0.06]">
          {(['1M', '3M', '6M', '1Y'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? 'bg-brand-500/20 text-brand-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Income vs Expenses chart */}
      <Card>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_MONTHLY_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltipFlow />} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by category */}
        <Card>
          <CardHeader><CardTitle>Spending by Category</CardTitle></CardHeader>
          <div className="flex items-start gap-4">
            <div className="w-40 h-40 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_SPENDING_CATEGORIES}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    dataKey="amount"
                    strokeWidth={0}
                  >
                    {MOCK_SPENDING_CATEGORIES.map((cat, i) => (
                      <Cell key={i} fill={cat.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {MOCK_SPENDING_CATEGORIES.map(cat => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-300 text-xs flex-1">{cat.name}</span>
                  <span className="text-slate-400 text-xs">{cat.percentage}%</span>
                  <span className="text-white text-xs font-medium">{formatCurrency(cat.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* This week */}
        <Card>
          <CardHeader><CardTitle>This Week</CardTitle></CardHeader>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_DATA} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="weekGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip content={<CustomTooltipAmount />} />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} fill="url(#weekGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-3 text-sm">
            <div>
              <p className="text-slate-400 text-xs">Best day</p>
              <p className="text-white font-semibold">Thursday · $1,240</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs">Weekly total</p>
              <p className="text-white font-semibold">
                {formatCurrency(WEEKLY_DATA.reduce((s, d) => s + d.amount, 0))}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Top spending insights */}
      <Card>
        <CardHeader><CardTitle>Spending Insights</CardTitle></CardHeader>
        <div className="space-y-3">
          {[
            { insight: 'Supplies costs increased by 18% vs last month', type: 'warning', icon: '📦' },
            { insight: 'Software subscriptions are on track — 0% over budget', type: 'success', icon: '✅' },
            { insight: 'Your net margin improved to 70% this month', type: 'success', icon: '🚀' },
            { insight: 'Consider reviewing your marketing spend — no ROI tracked', type: 'info', icon: '💡' },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
                item.type === 'warning'
                  ? 'bg-amber-400/5 border-amber-400/20 text-amber-300'
                  : item.type === 'success'
                  ? 'bg-emerald-400/5 border-emerald-400/20 text-emerald-300'
                  : 'bg-blue-400/5 border-blue-400/20 text-blue-300'
              }`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <span>{item.insight}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
