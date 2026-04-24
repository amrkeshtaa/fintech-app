export type UserRole = 'business' | 'customer';
export type TransactionType = 'send' | 'receive' | 'payment' | 'refund' | 'topup';
export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type CardStatus = 'active' | 'frozen' | 'cancelled';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  businessName?: string;
  balance: number;
  currency: string;
  verified: boolean;
  joinedAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  counterparty: string;
  status: TransactionStatus;
  category: string;
  date: string;
  reference: string;
}

export interface VirtualCard {
  id: string;
  userId: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  status: CardStatus;
  spendingLimit: number;
  spent: number;
  network: 'visa' | 'mastercard';
  addedToApplePay: boolean;
  addedToGooglePay: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  createdAt: string;
  paidAt?: string;
  currency: string;
  notes?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentLink {
  id: string;
  title: string;
  description?: string;
  amount?: number;
  currency: string;
  slug: string;
  active: boolean;
  visits: number;
  payments: number;
  collected: number;
  createdAt: string;
}

export interface SpendingCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}
