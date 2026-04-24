import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .max(255, 'Email is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  phone: z
    .string()
    .min(7, 'Enter a valid phone number')
    .max(20, 'Phone number is too long')
    .regex(/^[+\d\s\-().]+$/, 'Invalid phone number format'),
  role: z.enum(['business', 'customer']),
  businessName: z
    .string()
    .max(100, 'Business name is too long')
    .optional(),
}).refine(
  data => data.role !== 'business' || (data.businessName && data.businessName.trim().length >= 2),
  { message: 'Business name is required', path: ['businessName'] },
);

export const sendMoneySchema = z.object({
  recipientId: z.string().min(1),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(50000, 'Amount exceeds single transfer limit'),
  note: z.string().max(200, 'Note is too long').optional(),
});

export const topupSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(100000, 'Amount exceeds top-up limit'),
  method: z.enum(['bank', 'card']),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SendMoneyInput = z.infer<typeof sendMoneySchema>;
export type TopupInput = z.infer<typeof topupSchema>;
