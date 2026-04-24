import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'At least 2 characters').max(100),
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, 'Needs an uppercase letter')
    .regex(/[0-9]/, 'Needs a number')
    .regex(/[^A-Za-z0-9]/, 'Needs a special character'),
  phone: z.string().min(7, 'Invalid phone number'),
  role: z.enum(['business', 'customer']),
  businessName: z.string().max(100).optional(),
}).refine(
  d => d.role !== 'business' || (!!d.businessName && d.businessName.trim().length >= 2),
  { message: 'Business name required', path: ['businessName'] },
);

export const sendSchema = z.object({
  amount: z.number().positive('Must be positive').max(50000, 'Exceeds limit'),
  note: z.string().max(200).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
