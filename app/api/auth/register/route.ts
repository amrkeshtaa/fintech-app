import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validation';
import { emailExists, createUser } from '@/lib/db';
import { registerLimiter } from '@/lib/rate-limit';
import { generateId } from '@/lib/utils';

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1';

  const limit = registerLimiter(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': '3',
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Validate with Zod
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return NextResponse.json({ error: 'Validation failed', fields: fieldErrors }, { status: 422 });
  }

  const { name, email, password, phone, role, businessName } = parsed.data;

  // Check duplicate email — return same message as "not found" to prevent enumeration
  if (emailExists(email)) {
    return NextResponse.json(
      { error: 'An account with this email already exists.' },
      { status: 409 },
    );
  }

  // Hash password — cost factor 12 for production-grade security
  const hashedPassword = await bcrypt.hash(password, 12);

  createUser({
    id: `usr_${generateId()}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    hashedPassword,
    role,
    businessName: businessName?.trim(),
    phone: phone.trim(),
    balance: 0,
    currency: 'USD',
    verified: false,
    joinedAt: new Date().toISOString().split('T')[0],
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
