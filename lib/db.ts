import { prisma } from './prisma';
import type { StoredUser } from './db-types';

export type { StoredUser };

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  return prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
}

export async function emailExists(email: string): Promise<boolean> {
  const count = await prisma.user.count({ where: { email: email.toLowerCase().trim() } });
  return count > 0;
}

export async function createUser(user: StoredUser): Promise<void> {
  await prisma.user.create({ data: user });
}

export async function updateBalance(email: string, newBalance: number): Promise<void> {
  await prisma.user.update({
    where: { email: email.toLowerCase().trim() },
    data: { balance: newBalance },
  });
}
