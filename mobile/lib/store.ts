import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import bcrypt from 'bcryptjs';
import type { User, Transaction, VirtualCard } from './types';
import {
  MOCK_BUSINESS_USER, MOCK_CUSTOMER_USER,
  MOCK_TRANSACTIONS, MOCK_CARDS,
} from './mock-data';

// SecureStore adapter for Zustand persist
const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// In-memory user DB (same demo accounts as web version)
const DEMO_HASH = bcrypt.hashSync('Demo@1234!', 10);
const usersDB = new Map([
  ['alex@coffeehouse.com', { ...MOCK_BUSINESS_USER, hashedPassword: DEMO_HASH }],
  ['jordan@email.com',     { ...MOCK_CUSTOMER_USER, hashedPassword: DEMO_HASH }],
]);

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  authError: string;

  // Data (persisted in memory per session)
  transactions: Transaction[];
  cards: VirtualCard[];

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;

  // App actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'reference'>) => void;
  toggleCardFreeze: (cardId: string) => void;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'business' | 'customer';
  businessName?: string;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      authError: '',
      transactions: MOCK_TRANSACTIONS,
      cards: MOCK_CARDS,

      login: async (email, password) => {
        const stored = usersDB.get(email.toLowerCase().trim());
        if (!stored) {
          // Constant-time compare even on unknown email
          await bcrypt.compare(password, DEMO_HASH);
          set({ authError: 'Incorrect email or password.' });
          return false;
        }
        const valid = await bcrypt.compare(password, stored.hashedPassword);
        if (!valid) {
          set({ authError: 'Incorrect email or password.' });
          return false;
        }
        const { hashedPassword: _, ...user } = stored as typeof stored & { hashedPassword: string };
        set({ user, isAuthenticated: true, authError: '' });
        return true;
      },

      register: async (data) => {
        const key = data.email.toLowerCase().trim();
        if (usersDB.has(key)) {
          set({ authError: 'An account with this email already exists.' });
          return false;
        }
        const hash = await bcrypt.hash(data.password, 12);
        const newUser: User = {
          id: `usr_${Math.random().toString(36).slice(2, 10)}`,
          name: data.name.trim(),
          email: key,
          phone: data.phone.trim(),
          role: data.role,
          businessName: data.businessName?.trim(),
          balance: 0,
          currency: 'USD',
          verified: false,
          joinedAt: new Date().toISOString().split('T')[0],
        };
        usersDB.set(key, { ...newUser, hashedPassword: hash } as any);
        set({ user: newUser, isAuthenticated: true, authError: '' });
        return true;
      },

      logout: () => set({ user: null, isAuthenticated: false, authError: '' }),

      addTransaction: (tx) => {
        const newTx: Transaction = {
          ...tx,
          id: `txn_${Date.now()}`,
          reference: `REF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        };
        const delta = (tx.type === 'receive' || tx.type === 'topup') ? tx.amount : -tx.amount;
        set(s => ({
          transactions: [newTx, ...s.transactions],
          user: s.user ? { ...s.user, balance: s.user.balance + delta } : s.user,
        }));
      },

      toggleCardFreeze: (cardId) =>
        set(s => ({
          cards: s.cards.map(c =>
            c.id === cardId ? { ...c, status: c.status === 'active' ? 'frozen' : 'active' } : c,
          ),
        })),
    }),
    {
      name: 'paynow-auth',
      storage: createJSONStorage(() => secureStorage),
      // Only persist auth state — transactions reset each session (demo)
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    },
  ),
);
