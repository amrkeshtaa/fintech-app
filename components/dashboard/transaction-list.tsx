'use client';

import { ArrowDownLeft, ArrowUpRight, RefreshCcw, Plus, Clock } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { formatCurrency, formatRelativeDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const typeConfig = {
  receive: { icon: ArrowDownLeft, color: 'text-emerald-400', bg: 'bg-emerald-400/10', prefix: '+' },
  send: { icon: ArrowUpRight, color: 'text-red-400', bg: 'bg-red-400/10', prefix: '-' },
  payment: { icon: ArrowUpRight, color: 'text-red-400', bg: 'bg-red-400/10', prefix: '-' },
  refund: { icon: RefreshCcw, color: 'text-blue-400', bg: 'bg-blue-400/10', prefix: '+' },
  topup: { icon: Plus, color: 'text-emerald-400', bg: 'bg-emerald-400/10', prefix: '+' },
};

const statusBadge = {
  completed: <Badge variant="success">Completed</Badge>,
  pending: <Badge variant="warning">Pending</Badge>,
  failed: <Badge variant="danger">Failed</Badge>,
};

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
}

export function TransactionList({ transactions, limit }: TransactionListProps) {
  const items = limit ? transactions.slice(0, limit) : transactions;

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.map(tx => {
        const cfg = typeConfig[tx.type];
        return (
          <div
            key={tx.id}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-default"
          >
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', cfg.bg)}>
              <cfg.icon className={cn('w-4 h-4', cfg.color)} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{tx.description}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-slate-500">{tx.counterparty}</p>
                <span className="text-slate-700">·</span>
                <p className="text-xs text-slate-600">{formatRelativeDate(tx.date)}</p>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <p className={cn('text-sm font-semibold', cfg.color)}>
                {cfg.prefix}{formatCurrency(tx.amount, tx.currency)}
              </p>
              <div className="flex justify-end mt-0.5">
                {statusBadge[tx.status]}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
