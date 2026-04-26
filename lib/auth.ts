import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { loginSchema } from './validation';
import { findUserByEmail } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await findUserByEmail(parsed.data.email);
        if (!user) {
          // Constant-time dummy compare to prevent user enumeration timing attacks
          await bcrypt.compare(parsed.data.password, '$2a$10$dummyhashfortiminganonymisation');
          return null;
        }

        const passwordValid = await bcrypt.compare(parsed.data.password, user.hashedPassword);
        if (!passwordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as 'business' | 'customer',
          businessName: user.businessName ?? undefined,
          balance: user.balance,
          currency: user.currency,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
    updateAge: 60 * 60,
  },

  jwt: {
    maxAge: 24 * 60 * 60,
  },

  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.businessName = user.businessName;
        token.balance = user.balance;
        token.currency = user.currency;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.businessName = token.businessName;
      session.user.balance = token.balance;
      session.user.currency = token.currency;
      return session;
    },
  },

  debug: process.env.NODE_ENV === 'development',
};
