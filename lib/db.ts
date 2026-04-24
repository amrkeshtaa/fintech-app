import bcrypt from 'bcryptjs';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  hashedPassword: string;
  role: 'business' | 'customer';
  businessName?: string;
  phone: string;
  balance: number;
  currency: string;
  verified: boolean;
  joinedAt: string;
}

// In-memory store — replace with PostgreSQL/MongoDB in production
const users = new Map<string, StoredUser>();

// Pre-seed two demo accounts. Passwords are hashed with bcrypt (cost=10).
// Demo credentials:
//   Business : alex@coffeehouse.com  /  Demo@1234!
//   Customer : jordan@email.com      /  Demo@1234!
const DEMO_HASH = bcrypt.hashSync('Demo@1234!', 10);

users.set('alex@coffeehouse.com', {
  id: 'usr_biz_001',
  name: 'Alex Morgan',
  email: 'alex@coffeehouse.com',
  hashedPassword: DEMO_HASH,
  role: 'business',
  businessName: 'The Coffee House',
  phone: '+1 (555) 234-5678',
  balance: 12450.75,
  currency: 'USD',
  verified: true,
  joinedAt: '2024-01-15',
});

users.set('jordan@email.com', {
  id: 'usr_cust_001',
  name: 'Jordan Lee',
  email: 'jordan@email.com',
  hashedPassword: DEMO_HASH,
  role: 'customer',
  phone: '+1 (555) 987-6543',
  balance: 3820.50,
  currency: 'USD',
  verified: true,
  joinedAt: '2024-03-01',
});

export function findUserByEmail(email: string): StoredUser | undefined {
  return users.get(email.toLowerCase().trim());
}

export function emailExists(email: string): boolean {
  return users.has(email.toLowerCase().trim());
}

export function createUser(user: StoredUser): void {
  users.set(user.email.toLowerCase().trim(), user);
}

export function updateBalance(email: string, newBalance: number): void {
  const user = users.get(email.toLowerCase().trim());
  if (user) user.balance = newBalance;
}
