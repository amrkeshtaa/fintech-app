'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [email, setEmail] = useState('alex@coffeehouse.com');
  const [password, setPassword] = useState('password123');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'business' | 'customer'>('business');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    login(role);
    router.push('/dashboard');
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
          {/* Demo role picker */}
          <div className="mb-5">
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Demo Mode — choose role</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setRole('business'); setEmail('alex@coffeehouse.com'); }}
                className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border ${
                  role === 'business'
                    ? 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                    : 'border-white/[0.08] text-slate-400 hover:border-white/20'
                }`}
              >
                Business
              </button>
              <button
                type="button"
                onClick={() => { setRole('customer'); setEmail('jordan@email.com'); }}
                className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border ${
                  role === 'customer'
                    ? 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                    : 'border-white/[0.08] text-slate-400 hover:border-white/20'
                }`}
              >
                Customer
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
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
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500/60 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign in
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Shield className="w-3 h-3 text-emerald-400" />
            Secured with 256-bit encryption
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
