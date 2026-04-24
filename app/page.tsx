'use client';

import Link from 'next/link';
import {
  ArrowRight, Shield, Zap, CreditCard, Smartphone, QrCode,
  FileText, BarChart3, Wallet, CheckCircle, Star, Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: CreditCard,
    title: 'Virtual Cards',
    desc: 'Get a virtual Visa/Mastercard instantly. Add to Apple Pay or Google Pay in seconds.',
    color: 'from-brand-500 to-purple-600',
  },
  {
    icon: Smartphone,
    title: 'Phone as POS',
    desc: 'Turn your phone into a point-of-sale terminal. Accept contactless and QR payments anywhere.',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: QrCode,
    title: 'QR Payments',
    desc: 'Generate dynamic QR codes for payments. Works offline and anywhere in the world.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: FileText,
    title: 'Invoices',
    desc: 'Create professional invoices in seconds and get paid online with payment links.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: BarChart3,
    title: 'Spending Analytics',
    desc: 'Track every dollar. Visualize spending by category and time with beautiful charts.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Wallet,
    title: 'Digital Wallet',
    desc: 'Keep a balance, receive money, and pay — all in one secure digital account.',
    color: 'from-cyan-500 to-blue-600',
  },
];

const stats = [
  { label: 'Active Users', value: '120K+' },
  { label: 'Transactions Daily', value: '2.4M+' },
  { label: 'Countries Supported', value: '45+' },
  { label: 'Uptime', value: '99.99%' },
];

const testimonials = [
  {
    name: 'Maria Santos',
    role: 'Freelance Designer',
    avatar: 'MS',
    text: "PayNow changed how I get paid. I send an invoice, share a link, and money hits my account the same day. No banks, no hassle.",
    rating: 5,
  },
  {
    name: 'Jake Thompson',
    role: 'Food Truck Owner',
    avatar: 'JT',
    text: "I use my phone as my POS now. Customers tap their card or scan the QR. I saved $800/month on terminal fees.",
    rating: 5,
  },
  {
    name: 'Priya Nair',
    role: 'Online Seller',
    avatar: 'PN',
    text: "The virtual card + Apple Pay combo is unreal. I shop online and pay in-store. My spending dashboard keeps me on budget.",
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.06] bg-dark-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">PayNow</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 sm:px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
            Trusted by 120,000+ users worldwide
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            <span className="text-white">Payments for</span>
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              Everyone, Everywhere
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Virtual cards, Apple Pay &amp; Google Pay, phone-as-POS, invoices, payment links, and
            spending analytics — all in one beautiful app for businesses and customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start for free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                View demo
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> No monthly fees</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> Instant setup</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> No POS hardware needed</span>
          </div>
        </div>

        {/* Hero card mockup */}
        <div className="mt-20 max-w-4xl mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-brand-900/30">
            <div className="bg-dark-800/90 p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl p-6 card-shine min-h-[160px] flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-white/80 text-sm">Virtual Card</span>
                  <div className="flex gap-1">
                    <div className="w-5 h-5 rounded-full bg-white/30" />
                    <div className="w-5 h-5 rounded-full bg-white/20 -ml-2" />
                  </div>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">•••• •••• •••• 4242</p>
                  <p className="text-white text-xl font-bold">Alex Morgan</p>
                  <p className="text-white/60 text-xs mt-1">VISA · Expires 12/28</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="glass rounded-xl p-4 flex-1">
                  <p className="text-slate-400 text-xs mb-1">Balance</p>
                  <p className="text-white font-bold text-lg">$12,450.75</p>
                  <p className="text-emerald-400 text-xs mt-1">↑ +8.2% this month</p>
                </div>
                <div className="glass rounded-xl p-4 flex-1">
                  <p className="text-slate-400 text-xs mb-1">Today's Revenue</p>
                  <p className="text-white font-bold text-lg">$850.00</p>
                  <p className="text-slate-500 text-xs mt-1">3 transactions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-white mb-1">{s.value}</p>
              <p className="text-slate-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Everything you need to get paid
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              One platform for businesses, freelancers, and customers. Ditch the hardware.
              Ditch the complexity.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div
                key={f.title}
                className="glass glass-hover rounded-2xl p-6 transition-all duration-200 cursor-default"
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}
                >
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">How it works</h2>
            <p className="text-slate-400 text-lg">Up and running in under 3 minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create your account', desc: 'Sign up as a business or customer. Verify your identity and you\'re ready to go.' },
              { step: '02', title: 'Set up your wallet & card', desc: 'Get a virtual card instantly. Add it to Apple Pay or Google Pay with one tap.' },
              { step: '03', title: 'Start sending & receiving', desc: 'Share your QR code, payment link, or use POS mode to accept payments anywhere.' },
            ].map(s => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-lg mb-5 shadow-lg shadow-brand-500/30">
                  {s.step}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Loved by thousands</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="glass rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass rounded-3xl p-12">
            <Globe className="w-12 h-12 text-brand-400 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to simplify your payments?
            </h2>
            <p className="text-slate-400 mb-8">
              Join 120,000+ businesses and freelancers already using PayNow.
            </p>
            <Link href="/auth/register">
              <Button size="lg">
                Create free account <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-slate-400">PayNow · Digital Payments Platform · v1.0</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-500">256-bit encryption · PCI DSS compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
