/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Block clickjacking via iframes
  { key: 'X-Frame-Options', value: 'DENY' },
  // Disable XSS auditor (modern browsers ignore it, but no harm)
  { key: 'X-XSS-Protection', value: '0' },
  // Enforce HTTPS for 2 years, including subdomains
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Control referrer information
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Restrict powerful browser features
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self), usb=()',
  },
  // Content Security Policy
  // — allows Next.js inline scripts (nonce would be stricter but needs middleware)
  // — allows Recharts SVGs, QRCode canvases, and self-hosted fonts
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-eval in dev
      "style-src 'self' 'unsafe-inline'",                // Tailwind injects inline styles
      "img-src 'self' data: blob: https://api.dicebear.com",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  // Prevent sensitive info leaking in error responses
  poweredByHeader: false,
};

export default nextConfig;
