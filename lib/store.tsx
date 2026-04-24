'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import type { User, Transaction, VirtualCard, Invoice, PaymentLink } from './types';
import {
  MOCK_BUSINESS_USER,
  MOCK_CUSTOMER_USER,
  MOCK_TRANSACTIONS,
  MOCK_VIRTUAL_CARDS,
  MOCK_INVOICES,
  MOCK_PAYMENT_LINKS,
} from './mock-data';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  transactions: Transaction[];
  cards: VirtualCard[];
  invoices: Invoice[];
  paymentLinks: PaymentLink[];
  logout: () => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'reference'>) => void;
  toggleCardFreeze: (cardId: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [cards, setCards] = useState<VirtualCard[]>(MOCK_VIRTUAL_CARDS);
  const invoices = MOCK_INVOICES;
  const paymentLinks = MOCK_PAYMENT_LINKS;

  // Build a User object from the live NextAuth session, falling back to mock
  // data for fields the session doesn't carry (phone, etc.)
  const user: User | null = session?.user
    ? {
        ...(session.user.role === 'business' ? MOCK_BUSINESS_USER : MOCK_CUSTOMER_USER),
        id: session.user.id,
        name: session.user.name ?? '',
        email: session.user.email ?? '',
        role: session.user.role,
        businessName: session.user.businessName,
        balance: session.user.balance,
        currency: session.user.currency,
      }
    : null;

  const logout = useCallback(() => signOut({ callbackUrl: '/' }), []);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'reference'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `txn_${Date.now()}`,
      reference: `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };
    setTransactions(prev => [newTx, ...prev]);
  }, []);

  const toggleCardFreeze = useCallback((cardId: string) => {
    setCards(prev =>
      prev.map(c =>
        c.id === cardId
          ? { ...c, status: c.status === 'active' ? 'frozen' : 'active' }
          : c,
      ),
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: status === 'authenticated',
        transactions,
        cards,
        invoices,
        paymentLinks,
        logout,
        addTransaction,
        toggleCardFreeze,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
