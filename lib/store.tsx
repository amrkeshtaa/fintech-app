'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  transactions: Transaction[];
  cards: VirtualCard[];
  invoices: Invoice[];
  paymentLinks: PaymentLink[];
  isAuthenticated: boolean;
  login: (role: 'business' | 'customer') => void;
  logout: () => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'reference'>) => void;
  toggleCardFreeze: (cardId: string) => void;
  updateBalance: (amount: number) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [cards, setCards] = useState<VirtualCard[]>(MOCK_VIRTUAL_CARDS);
  const [invoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [paymentLinks] = useState<PaymentLink[]>(MOCK_PAYMENT_LINKS);

  useEffect(() => {
    const stored = localStorage.getItem('fintech_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = useCallback((role: 'business' | 'customer') => {
    const u = role === 'business' ? MOCK_BUSINESS_USER : MOCK_CUSTOMER_USER;
    setUser(u);
    localStorage.setItem('fintech_user', JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('fintech_user');
  }, []);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'reference'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `txn_${Date.now()}`,
      reference: `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };
    setTransactions(prev => [newTx, ...prev]);
    setUser(prev => {
      if (!prev) return prev;
      const delta = tx.type === 'receive' || tx.type === 'topup' ? tx.amount : -tx.amount;
      return { ...prev, balance: prev.balance + delta };
    });
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

  const updateBalance = useCallback((amount: number) => {
    setUser(prev => prev ? { ...prev, balance: prev.balance + amount } : prev);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        transactions,
        cards,
        invoices,
        paymentLinks,
        isAuthenticated: !!user,
        login,
        logout,
        addTransaction,
        toggleCardFreeze,
        updateBalance,
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
