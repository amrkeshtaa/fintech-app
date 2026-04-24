'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Zap, Building2, User, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { registerSchema } from '@/lib/validation';
import type { RegisterInput } from '@/lib/validation';

type Step = 0 | 1 | 2;
type FieldErrors = Partial<Record<keyof RegisterInput, string>>;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [role, setRole] = useState<'business' | 'customer'>('business');
  const [form, setForm] = useState({ name: '', email: '', phone: '', businessName: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState('');

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setFieldErrors(p => ({ ...p, [field]: undefined }));
  };

  const validateStep1 = (): boolean => {
    const result = registerSchema.safeParse({ ...form, role });
    if (result.success) { setFieldErrors({}); return true; }
    const errs: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof FieldErrors;
      if (!errs[key]) errs[key] = issue.message;
    }
    setFieldErrors(errs);
    return false;
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGlobalError('');

    // Call the real registration API
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role }),
    });

    if (!res.ok) {
      const body = await res.json();
      if (res.status === 422 && body.fields) {
        setFieldErrors(body.fields);
        setStep(1); // Go back to form step to show errors
      } else if (res.status === 429) {
        setGlobalError('Too many attempts. Please try again in a few minutes.');
      } else {
        setGlobalError(body.error ?? 'Registration failed. Please try again.');
      }
      setLoading(false);
      return;
    }

    // Auto sign-in after successful registration
    const signInResult = await signIn('credentials', {
      email: form.email.trim().toLowerCase(),
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (signInResult?.ok) {
      router.push('/dashboard');
      router.refresh();
    } else {
      setGlobalError('Account created but sign-in failed. Please log in manually.');
      router.push('/auth/login');
    }
  };

  const passwordStrength = (() => {
    const p = form.password;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength];
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-brand-500', 'bg-emerald-500'][passwordStrength];

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">PayNow</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 mt-1 text-sm">Join 120,000+ users — it's free</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6">
          {['Account Type', 'Your Details', 'Confirm'].map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? 'bg-emerald-500 text-white' :
                i === step ? 'bg-brand-500 text-white' :
                'bg-dark-800 text-slate-500'
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? 'text-slate-200' : 'text-slate-500'}`}>
                {label}
              </span>
              {i < 2 && <div className={`flex-1 h-px ${i < step ? 'bg-emerald-500/40' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        {globalError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {globalError}
          </div>
        )}

        <div className="glass rounded-2xl p-6 border border-white/[0.08]">
          {/* Step 0 — Account type */}
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-slate-300 font-medium mb-4">I am a...</p>
              {[
                { r: 'business' as const, icon: Building2, color: 'from-brand-500 to-purple-600', title: 'Business / Freelancer', desc: 'Accept payments, create invoices, manage cash flow' },
                { r: 'customer' as const, icon: User, color: 'from-purple-500 to-pink-600', title: 'Customer / Individual', desc: 'Pay, send money, virtual card, spending tracker' },
              ].map(({ r, icon: Icon, color, title, desc }) => (
                <button
                  key={r}
                  onClick={() => { setRole(r); setStep(1); }}
                  className="w-full text-left p-4 rounded-xl border border-white/[0.08] hover:border-brand-500/40 hover:bg-brand-500/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold group-hover:text-brand-300 transition-colors">{title}</p>
                      <p className="text-slate-400 text-sm">{desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 1 — Details */}
          {step === 1 && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4" noValidate>
              <Input label="Full name" value={form.name} onChange={set('name')} placeholder="John Doe" autoComplete="name" error={fieldErrors.name} required />
              {role === 'business' && (
                <Input label="Business name" value={form.businessName} onChange={set('businessName')} placeholder="My Business LLC" error={fieldErrors.businessName} required />
              )}
              <Input label="Email address" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" error={fieldErrors.email} required />
              <Input label="Phone number" type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" autoComplete="tel" error={fieldErrors.phone} required />

              {/* Password with strength meter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Min 8 chars, uppercase, number, symbol"
                    autoComplete="new-password"
                    required
                    className={`w-full rounded-xl border bg-white/[0.04] px-3 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.password ? 'border-red-500/50 focus:ring-red-500/40' : 'border-white/[0.08] focus:ring-brand-500/60'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    aria-label={showPass ? 'Hide password' : 'Show password'}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength bar */}
                {form.password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= passwordStrength ? strengthColor : 'bg-dark-800'}`} />
                      ))}
                    </div>
                    <p className={`text-xs ${['','text-red-400','text-amber-400','text-brand-400','text-emerald-400'][passwordStrength]}`}>
                      {strengthLabel}
                    </p>
                  </div>
                )}
                {fieldErrors.password && <p className="text-xs text-red-400">{fieldErrors.password}</p>}
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="secondary" size="sm" onClick={() => setStep(0)}>Back</Button>
                <Button type="submit" className="flex-1" size="lg">Continue</Button>
              </div>
            </form>
          )}

          {/* Step 2 — Confirm */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📱</span>
                </div>
                <p className="text-white font-semibold">Confirm your details</p>
                <p className="text-slate-400 text-sm mt-1">Creating account for <span className="text-white">{form.email}</span></p>
              </div>

              <div className="space-y-2 text-sm">
                {[
                  { label: 'Name', value: form.name },
                  { label: 'Role', value: role === 'business' ? 'Business / Freelancer' : 'Customer' },
                  ...(form.businessName ? [{ label: 'Business', value: form.businessName }] : []),
                  { label: 'Phone', value: form.phone },
                ].map(r => (
                  <div key={r.label} className="flex justify-between py-1.5 border-b border-white/[0.05]">
                    <span className="text-slate-400">{r.label}</span>
                    <span className="text-slate-200 font-medium">{r.value}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="flex gap-3">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setStep(1)}>Edit</Button>
                  <Button type="submit" className="flex-1" size="lg" loading={loading}>
                    Create account
                  </Button>
                </div>
              </form>

              <p className="text-center text-xs text-slate-500">
                By creating an account you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-slate-400 mt-5">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
