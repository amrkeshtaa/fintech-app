import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withAuth(
  function middleware(req: NextRequest) {
    const res = NextResponse.next();

    // Security headers applied to every response
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-DNS-Prefetch-Control', 'on');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=(self)',
    );
    res.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    );

    return res;
  },
  {
    callbacks: {
      // Redirect to /auth/login if JWT is missing or invalid
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  // Protect every dashboard route at the edge — before any page code runs
  matcher: ['/dashboard/:path*'],
};
