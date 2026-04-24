'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Zap, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginSchema } from '@/lib/validation';

type FieldErrors = Partial<Record<'email' | 'password', string>>;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validate = (): boolean => {
    const result = loginSchema.safeParse({ email, password });
    if (result.success) { setFieldErrors({}); return true; }
    const errs: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof FieldErrors;
      if (!errs[key]) errs[key] = issue.message;
    }
    setFieldErrors(errs);
    return false;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    if (!validate()) return;

    setLoading(true);
    const result = await signIn('credentials', {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });
    setLoading(false);

    if (!result?.ok) {
      // Deliberate vague message — don't tell attacker which field was wrong
      setGlobalError('Incorrect email or password. Please try again.');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">PayNow</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 mt-1 text-sm">Sign in to your PayNow account</p>
        </div>

        <div className="glass rounded-2xl p-6 border border-white/[0.08]">
          {/* Demo credentials hint */}
          <div className="mb-5 p-3 rounded-xl bg-brand-500/5 border border-brand-500/20 text-xs text-slate-400 space-y-1">
            <p className="text-brand-300 font-semibold mb-1">Demo accounts</p>
            <p>Business: <span className="text-slate-300 font-mono">alex@coffeehouse.com</span></p>
            <p>Customer: <span className="text-slate-300 font-mono">jordan@email.com</span></p>
            <p>Password: <span className="text-slate-300 font-mono">Demo@1234!</span></p>
          </div>

          {/* Global error */}
          {globalError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {globalError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: undefined })); }}
              placeholder="you@example.com"
              autoComplete="email"
              error={fieldErrors.email}
              required
            />

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <button type="button" className="text-xs text-brand-400 hover:text-brand-300">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: undefined })); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className={`w-full rounded-xl border bg-white/[0.04] px-3 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.password
                      ? 'border-red-500/50 focus:ring-red-500/40'
                      : 'border-white/[0.08] focus:ring-brand-500/60 focus:border-brand-500/60'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign in
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Shield className="w-3 h-3 text-emerald-400" />
            Secured with bcrypt · HttpOnly JWT · rate-limited
          </div>
        </div>

        <p className="text-center text-sm text-slate-400 mt-5">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-brand-400 hover:text-brand-300 font-medium">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
