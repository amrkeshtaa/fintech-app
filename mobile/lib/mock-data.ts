import type {
  User, Transaction, VirtualCard, Invoice,
  PaymentLink, SpendingCategory, MonthlyData,
} from './types';

export const MOCK_BUSINESS_USER: User = {
  id: 'usr_biz_001',
  name: 'Alex Morgan',
  email: 'alex@coffeehouse.com',
  phone: '+1 (555) 234-5678',
  role: 'business',
  businessName: 'The Coffee House',
  balance: 12450.75,
  currency: 'USD',
  verified: true,
  joinedAt: '2024-01-15',
};

export const MOCK_CUSTOMER_USER: User = {
  id: 'usr_cust_001',
  name: 'Jordan Lee',
  email: 'jordan@email.com',
  phone: '+1 (555) 987-6543',
  role: 'customer',
  balance: 3820.50,
  currency: 'USD',
  verified: true,
  joinedAt: '2024-03-01',
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'txn_001', type: 'receive', amount: 850.00, currency: 'USD', description: 'Payment received', counterparty: 'Sarah Johnson', status: 'completed', category: 'Sales', date: '2026-04-24T10:30:00Z', reference: 'REF-A1B2C3' },
  { id: 'txn_002', type: 'send', amount: 120.50, currency: 'USD', description: 'Coffee supplies', counterparty: 'Metro Wholesale', status: 'completed', category: 'Supplies', date: '2026-04-23T14:15:00Z', reference: 'REF-D4E5F6' },
  { id: 'txn_003', type: 'receive', amount: 1200.00, currency: 'USD', description: 'Invoice #INV-2026-042 paid', counterparty: 'Tech Corp LLC', status: 'completed', category: 'Invoice', date: '2026-04-22T09:00:00Z', reference: 'REF-G7H8I9' },
  { id: 'txn_004', type: 'payment', amount: 299.00, currency: 'USD', description: 'Software subscription', counterparty: 'Adobe Inc', status: 'completed', category: 'Software', date: '2026-04-21T16:45:00Z', reference: 'REF-J1K2L3' },
  { id: 'txn_005', type: 'receive', amount: 450.00, currency: 'USD', description: 'Freelance design work', counterparty: 'StartupX', status: 'completed', category: 'Freelance', date: '2026-04-20T11:20:00Z', reference: 'REF-M4N5O6' },
  { id: 'txn_006', type: 'send', amount: 75.00, currency: 'USD', description: 'Lunch meeting', counterparty: 'Olive Garden', status: 'completed', category: 'Food', date: '2026-04-19T13:00:00Z', reference: 'REF-P7Q8R9' },
  { id: 'txn_007', type: 'topup', amount: 2000.00, currency: 'USD', description: 'Bank transfer top-up', counterparty: 'Chase Bank ••4521', status: 'completed', category: 'Top-up', date: '2026-04-18T08:00:00Z', reference: 'REF-S1T2U3' },
  { id: 'txn_008', type: 'receive', amount: 320.00, currency: 'USD', description: 'POS payment', counterparty: 'Walk-in Customer', status: 'completed', category: 'Sales', date: '2026-04-17T15:30:00Z', reference: 'REF-V4W5X6' },
  { id: 'txn_009', type: 'payment', amount: 89.99, currency: 'USD', description: 'Electricity bill', counterparty: 'City Power Co', status: 'pending', category: 'Utilities', date: '2026-04-16T10:00:00Z', reference: 'REF-Y7Z8A9' },
  { id: 'txn_010', type: 'refund', amount: 45.00, currency: 'USD', description: 'Order refund', counterparty: 'Amazon', status: 'completed', category: 'Refund', date: '2026-04-15T12:00:00Z', reference: 'REF-B1C2D3' },
];

export const MOCK_CARDS: VirtualCard[] = [
  { id: 'card_001', userId: 'usr_biz_001', last4: '4242', expiryMonth: '12', expiryYear: '28', cardholderName: 'ALEX MORGAN', status: 'active', spendingLimit: 5000, spent: 1284.49, network: 'visa', addedToApplePay: true, addedToGooglePay: false },
  { id: 'card_002', userId: 'usr_biz_001', last4: '8891', expiryMonth: '06', expiryYear: '27', cardholderName: 'THE COFFEE HOUSE', status: 'frozen', spendingLimit: 10000, spent: 0, network: 'mastercard', addedToApplePay: false, addedToGooglePay: true },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 'inv_001', number: 'INV-2026-041', clientName: 'Tech Corp LLC', clientEmail: 'billing@techcorp.com', items: [{ description: 'Web design services', quantity: 1, unitPrice: 800, total: 800 }, { description: 'Logo design', quantity: 1, unitPrice: 400, total: 400 }], subtotal: 1200, tax: 96, total: 1296, status: 'paid', dueDate: '2026-04-15', createdAt: '2026-04-01', paidAt: '2026-04-10', currency: 'USD', notes: 'Thank you!' },
  { id: 'inv_002', number: 'INV-2026-042', clientName: 'StartupX Inc', clientEmail: 'finance@startupx.io', items: [{ description: 'UI/UX consulting (10 hrs)', quantity: 10, unitPrice: 150, total: 1500 }], subtotal: 1500, tax: 120, total: 1620, status: 'sent', dueDate: '2026-05-01', createdAt: '2026-04-20', currency: 'USD' },
  { id: 'inv_003', number: 'INV-2026-040', clientName: 'Acme Corp', clientEmail: 'accounts@acme.com', items: [{ description: 'Monthly retainer', quantity: 1, unitPrice: 2000, total: 2000 }], subtotal: 2000, tax: 160, total: 2160, status: 'overdue', dueDate: '2026-04-01', createdAt: '2026-03-15', currency: 'USD' },
  { id: 'inv_004', number: 'INV-2026-043', clientName: 'Local Bakery', clientEmail: 'owner@localbakery.com', items: [{ description: 'Social media management', quantity: 1, unitPrice: 500, total: 500 }], subtotal: 500, tax: 40, total: 540, status: 'draft', dueDate: '2026-05-15', createdAt: '2026-04-24', currency: 'USD' },
];

export const MOCK_PAYMENT_LINKS: PaymentLink[] = [
  { id: 'pl_001', title: 'Coffee House Order', description: 'Pay for your order', currency: 'USD', slug: 'coffee-house-order', active: true, visits: 248, payments: 63, collected: 1847.50, createdAt: '2026-03-01' },
  { id: 'pl_002', title: 'Design Consultation', description: '1-hour session', amount: 150, currency: 'USD', slug: 'design-consult-150', active: true, visits: 42, payments: 12, collected: 1800, createdAt: '2026-04-01' },
  { id: 'pl_003', title: 'Tip Jar', description: 'Support our work!', currency: 'USD', slug: 'tip-jar', active: false, visits: 15, payments: 3, collected: 45, createdAt: '2026-02-15' },
];

export const MOCK_CATEGORIES: SpendingCategory[] = [
  { name: 'Supplies',  amount: 1240, percentage: 32, color: '#6366f1', icon: '📦' },
  { name: 'Software',  amount: 850,  percentage: 22, color: '#8b5cf6', icon: '💻' },
  { name: 'Food',      amount: 620,  percentage: 16, color: '#a855f7', icon: '🍽️' },
  { name: 'Utilities', amount: 480,  percentage: 12, color: '#ec4899', icon: '⚡' },
  { name: 'Marketing', amount: 350,  percentage: 9,  color: '#f59e0b', icon: '📣' },
  { name: 'Other',     amount: 320,  percentage: 9,  color: '#64748b', icon: '📊' },
];

export const MOCK_MONTHLY: MonthlyData[] = [
  { month: 'Nov', income: 6200,  expenses: 3100 },
  { month: 'Dec', income: 9800,  expenses: 4200 },
  { month: 'Jan', income: 7500,  expenses: 3800 },
  { month: 'Feb', income: 8900,  expenses: 4100 },
  { month: 'Mar', income: 11200, expenses: 5200 },
  { month: 'Apr', income: 12800, expenses: 3860 },
];

export const CONTACTS = [
  { id: 'c1', name: 'Sarah Johnson', initials: 'SJ', color: '#ec4899' },
  { id: 'c2', name: 'Mike Chen',     initials: 'MC', color: '#3b82f6' },
  { id: 'c3', name: 'Emma Davis',    initials: 'ED', color: '#10b981' },
  { id: 'c4', name: 'James Wilson',  initials: 'JW', color: '#f59e0b' },
  { id: 'c5', name: 'Lily Park',     initials: 'LP', color: '#8b5cf6' },
  { id: 'c6', name: 'Omar Hassan',   initials: 'OH', color: '#6366f1' },
];
