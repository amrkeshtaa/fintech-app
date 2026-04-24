'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Building2, User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/store';

const STEPS = ['account-type', 'personal', 'verify'];

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useApp();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<'business' | 'customer'>('business');
  const [form, setForm] = useState({ name: '', email: '', phone: '', businessName: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleNext = () => setStep(s => s + 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    login(role);
    router.push('/dashboard');
  };

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

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {['Account Type', 'Your Details', 'Verify'].map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-brand-500 text-white' : 'bg-dark-800 text-slate-500'
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? 'text-slate-200' : 'text-slate-500'}`}>{label}</span>
              {i < 2 && <div className={`flex-1 h-px ${i < step ? 'bg-emerald-500/40' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-6 border border-white/[0.08]">
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-slate-300 font-medium mb-4">I am a...</p>
              <button
                onClick={() => { setRole('business'); handleNext(); }}
                className="w-full text-left p-4 rounded-xl border border-white/[0.08] hover:border-brand-500/40 hover:bg-brand-500/5 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold group-hover:text-brand-300 transition-colors">Business / Freelancer</p>
                    <p className="text-slate-400 text-sm">Accept payments, create invoices, manage cash flow</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => { setRole('customer'); handleNext(); }}
                className="w-full text-left p-4 rounded-xl border border-white/[0.08] hover:border-brand-500/40 hover:bg-brand-500/5 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold group-hover:text-brand-300 transition-colors">Customer / Individual</p>
                    <p className="text-slate-400 text-sm">Pay, send money, virtual card, spending tracker</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={e => { e.preventDefault(); handleNext(); }} className="space-y-4">
              <Input
                label="Full name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                required
              />
              {role === 'business' && (
                <Input
                  label="Business name"
                  value={form.businessName}
                  onChange={e => setForm({ ...form, businessName: e.target.value })}
                  placeholder="My Business LLC"
                  required
                />
              )}
              <Input
                label="Email address"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
              <Input
                label="Phone number"
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                required
              />
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 8 characters"
                required
              />
              <Button type="submit" className="w-full" size="lg">Continue</Button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <p className="text-white font-semibold mb-2">Verify your phone</p>
                <p className="text-slate-400 text-sm">We sent a 6-digit code to your phone</p>
              </div>
              <div className="flex gap-2 justify-center">
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    className="w-10 h-12 text-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white text-lg font-bold focus:outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40"
                    defaultValue={i < 4 ? String(i + 1) : ''}
                  />
                ))}
              </div>
              <p className="text-center text-xs text-slate-500">
                Demo: code is pre-filled. Just click Complete.
              </p>
              <form onSubmit={handleSubmit}>
                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  Complete setup
                </Button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-slate-400 mt-5">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
