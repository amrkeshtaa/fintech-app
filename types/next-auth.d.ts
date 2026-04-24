import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: 'business' | 'customer';
      businessName?: string;
      balance: number;
      currency: string;
    };
  }

  interface User {
    id: string;
    role: 'business' | 'customer';
    businessName?: string;
    balance: number;
    currency: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'business' | 'customer';
    businessName?: string;
    balance: number;
    currency: string;
  }
}
