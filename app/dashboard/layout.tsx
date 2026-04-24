'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { Zap } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/wallet': 'Wallet',
  '/dashboard/cards': 'Virtual Cards',
  '/dashboard/send': 'Send Money',
  '/dashboard/receive': 'Receive Payment',
  '/dashboard/pos': 'POS Terminal',
  '/dashboard/invoices': 'Invoices',
  '/dashboard/payment-links': 'Payment Links',
  '/dashboard/analytics': 'Analytics',
};

import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Middleware already blocks unauthenticated requests at the edge,
    // but this client-side guard handles session expiry after page load.
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [status, router]);

  // Show spinner while NextAuth resolves the session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <p className="text-slate-400 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  const title = PAGE_TITLES[pathname] ?? 'Dashboard';

  return (
    <div className="flex min-h-screen bg-dark-950">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 p-4 sm:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
