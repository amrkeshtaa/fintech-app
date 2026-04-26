export interface StoredUser {
  id: string;
  name: string;
  email: string;
  hashedPassword: string;
  role: string;
  businessName?: string | null;
  phone: string;
  balance: number;
  currency: string;
  verified: boolean;
  joinedAt: string;
}
