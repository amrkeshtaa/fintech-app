import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_HASH = bcrypt.hashSync('Demo@1234!', 12);

async function main() {
  // Upsert demo users so re-running seed is safe
  await prisma.user.upsert({
    where: { email: 'alex@coffeehouse.com' },
    update: {},
    create: {
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
    },
  });

  await prisma.user.upsert({
    where: { email: 'jordan@email.com' },
    update: {},
    create: {
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
    },
  });

  // Seed transactions for the business user
  const transactions = [
    { id: 'txn_001', type: 'receive', amount: 850.00, description: 'Payment received', counterparty: 'Sarah Johnson', status: 'completed', category: 'Sales', date: '2026-04-24T10:30:00Z', reference: 'REF-A1B2C3' },
    { id: 'txn_002', type: 'send', amount: 120.50, description: 'Coffee supplies', counterparty: 'Metro Wholesale', status: 'completed', category: 'Supplies', date: '2026-04-23T14:15:00Z', reference: 'REF-D4E5F6' },
    { id: 'txn_003', type: 'receive', amount: 1200.00, description: 'Invoice #INV-2024-042 paid', counterparty: 'Tech Corp LLC', status: 'completed', category: 'Invoice', date: '2026-04-22T09:00:00Z', reference: 'REF-G7H8I9' },
    { id: 'txn_004', type: 'payment', amount: 299.00, description: 'Software subscription', counterparty: 'Adobe Inc', status: 'completed', category: 'Software', date: '2026-04-21T16:45:00Z', reference: 'REF-J1K2L3' },
    { id: 'txn_005', type: 'receive', amount: 450.00, description: 'Freelance design work', counterparty: 'StartupX', status: 'completed', category: 'Freelance', date: '2026-04-20T11:20:00Z', reference: 'REF-M4N5O6' },
    { id: 'txn_006', type: 'send', amount: 75.00, description: 'Lunch meeting', counterparty: 'Olive Garden', status: 'completed', category: 'Food', date: '2026-04-19T13:00:00Z', reference: 'REF-P7Q8R9' },
    { id: 'txn_007', type: 'topup', amount: 2000.00, description: 'Bank transfer top-up', counterparty: 'Chase Bank ••4521', status: 'completed', category: 'Top-up', date: '2026-04-18T08:00:00Z', reference: 'REF-S1T2U3' },
    { id: 'txn_008', type: 'receive', amount: 320.00, description: 'POS payment', counterparty: 'Walk-in Customer', status: 'completed', category: 'Sales', date: '2026-04-17T15:30:00Z', reference: 'REF-V4W5X6' },
    { id: 'txn_009', type: 'payment', amount: 89.99, description: 'Electricity bill', counterparty: 'City Power Co', status: 'pending', category: 'Utilities', date: '2026-04-16T10:00:00Z', reference: 'REF-Y7Z8A9' },
    { id: 'txn_010', type: 'refund', amount: 45.00, description: 'Order refund', counterparty: 'Amazon', status: 'completed', category: 'Refund', date: '2026-04-15T12:00:00Z', reference: 'REF-B1C2D3' },
  ];

  for (const tx of transactions) {
    await prisma.transaction.upsert({
      where: { id: tx.id },
      update: {},
      create: { ...tx, currency: 'USD', userId: 'usr_biz_001' },
    });
  }

  // Seed virtual cards
  await prisma.virtualCard.upsert({
    where: { id: 'card_001' },
    update: {},
    create: {
      id: 'card_001', userId: 'usr_biz_001',
      last4: '4242', expiryMonth: '12', expiryYear: '28',
      cardholderName: 'ALEX MORGAN', status: 'active',
      spendingLimit: 5000, spent: 1284.49, network: 'visa',
      addedToApplePay: true, addedToGooglePay: false,
    },
  });

  await prisma.virtualCard.upsert({
    where: { id: 'card_002' },
    update: {},
    create: {
      id: 'card_002', userId: 'usr_biz_001',
      last4: '8891', expiryMonth: '06', expiryYear: '27',
      cardholderName: 'THE COFFEE HOUSE', status: 'frozen',
      spendingLimit: 10000, spent: 0, network: 'mastercard',
      addedToApplePay: false, addedToGooglePay: true,
    },
  });

  // Seed invoices
  const inv1 = await prisma.invoice.upsert({
    where: { id: 'inv_001' },
    update: {},
    create: {
      id: 'inv_001', userId: 'usr_biz_001',
      number: 'INV-2026-041', clientName: 'Tech Corp LLC', clientEmail: 'billing@techcorp.com',
      subtotal: 1200, tax: 96, total: 1296,
      status: 'paid', dueDate: '2026-04-15', createdAt: '2026-04-01',
      paidAt: '2026-04-10', currency: 'USD', notes: 'Thank you for your business!',
    },
  });
  if (inv1) {
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: 'inv_001' } });
    await prisma.invoiceItem.createMany({
      data: [
        { invoiceId: 'inv_001', description: 'Web design services', quantity: 1, unitPrice: 800, total: 800 },
        { invoiceId: 'inv_001', description: 'Logo design', quantity: 1, unitPrice: 400, total: 400 },
      ],
    });
  }

  await prisma.invoice.upsert({
    where: { id: 'inv_002' },
    update: {},
    create: {
      id: 'inv_002', userId: 'usr_biz_001',
      number: 'INV-2026-042', clientName: 'StartupX Inc', clientEmail: 'finance@startupx.io',
      subtotal: 1500, tax: 120, total: 1620,
      status: 'sent', dueDate: '2026-05-01', createdAt: '2026-04-20', currency: 'USD',
      items: { create: [{ description: 'UI/UX consulting (10 hours)', quantity: 10, unitPrice: 150, total: 1500 }] },
    },
  });

  await prisma.invoice.upsert({
    where: { id: 'inv_003' },
    update: {},
    create: {
      id: 'inv_003', userId: 'usr_biz_001',
      number: 'INV-2026-040', clientName: 'Acme Corp', clientEmail: 'accounts@acme.com',
      subtotal: 2000, tax: 160, total: 2160,
      status: 'overdue', dueDate: '2026-04-01', createdAt: '2026-03-15', currency: 'USD',
      items: { create: [{ description: 'Monthly retainer', quantity: 1, unitPrice: 2000, total: 2000 }] },
    },
  });

  await prisma.invoice.upsert({
    where: { id: 'inv_004' },
    update: {},
    create: {
      id: 'inv_004', userId: 'usr_biz_001',
      number: 'INV-2026-043', clientName: 'Local Bakery', clientEmail: 'owner@localbakery.com',
      subtotal: 500, tax: 40, total: 540,
      status: 'draft', dueDate: '2026-05-15', createdAt: '2026-04-24', currency: 'USD',
      items: { create: [{ description: 'Social media management', quantity: 1, unitPrice: 500, total: 500 }] },
    },
  });

  // Seed payment links
  await prisma.paymentLink.upsert({
    where: { id: 'pl_001' },
    update: {},
    create: {
      id: 'pl_001', userId: 'usr_biz_001',
      title: 'Coffee House Order', description: 'Pay for your coffee order',
      currency: 'USD', slug: 'coffee-house-order',
      active: true, visits: 248, payments: 63, collected: 1847.50, createdAt: '2026-03-01',
    },
  });

  await prisma.paymentLink.upsert({
    where: { id: 'pl_002' },
    update: {},
    create: {
      id: 'pl_002', userId: 'usr_biz_001',
      title: 'Design Consultation', description: '1-hour design session',
      amount: 150, currency: 'USD', slug: 'design-consult-150',
      active: true, visits: 42, payments: 12, collected: 1800, createdAt: '2026-04-01',
    },
  });

  await prisma.paymentLink.upsert({
    where: { id: 'pl_003' },
    update: {},
    create: {
      id: 'pl_003', userId: 'usr_biz_001',
      title: 'Tip Jar', description: 'Support our work!',
      currency: 'USD', slug: 'tip-jar',
      active: false, visits: 15, payments: 3, collected: 45, createdAt: '2026-02-15',
    },
  });

  console.log('✓ Database seeded with demo data');
  console.log('  Business: alex@coffeehouse.com / Demo@1234!');
  console.log('  Customer: jordan@email.com / Demo@1234!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
