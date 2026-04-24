'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { useApp } from '@/lib/store';

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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const title = PAGE_TITLES[pathname] || 'Dashboard';

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
