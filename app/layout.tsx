import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'PayNow — Digital Payments for Everyone',
  description:
    'Send money, receive payments, manage virtual cards, and grow your business with PayNow.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {/* SessionProvider must wrap AppProvider so AppProvider can call useSession() */}
        <Providers>
          <AppProvider>{children}</AppProvider>
        </Providers>
      </body>
    </html>
  );
}
