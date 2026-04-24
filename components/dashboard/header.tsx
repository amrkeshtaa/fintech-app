'use client';

import { Menu, Bell, Search } from 'lucide-react';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const { user } = useApp();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/[0.06] bg-dark-950/90 backdrop-blur-xl px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-400 hover:text-white transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <h1 className="text-base font-semibold text-white flex-1">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-400 text-sm">
          <Search className="w-3.5 h-3.5" />
          <span className="text-xs">Search...</span>
        </div>

        <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
        </button>

        {user && (
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/[0.06]">
            <div className="text-right">
              <p className="text-xs text-slate-400">Balance</p>
              <p className="text-sm font-bold text-white">{formatCurrency(user.balance)}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {user.name.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
