import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@web/modules/auth/hooks/useAuth';

const QUICK_ACCESS = [
  { label: 'Admin', initial: 'A', email: 'admin@wardsuite.demo', color: 'bg-[#111111] text-white' },
  { label: 'Employee', initial: 'J', email: 'juan@wardsuite.demo', color: 'bg-[#f5f5f5] text-[#111111]' },
  { label: 'Staff', initial: 'M', email: 'maria@wardsuite.demo', color: 'bg-[#f5f5f5] text-[#111111]' },
];

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const applyQuickAccess = (email: string) => {
    setForm({ email, password: 'Demo@1234' });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(form);
      navigate('/dashboard');
    } catch { /* error in store */ }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col justify-between w-[55%] bg-[#fafafa] px-16 py-12 border-r border-[#f1f1f1]"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#111111] flex items-center justify-center">
            <span className="text-white font-black text-sm">W</span>
          </div>
          <span className="text-lg font-black text-[#111111] tracking-tight">WardSuite</span>
          <span className="text-[10px] font-bold text-[#bbbbbb] uppercase tracking-widest ml-1 border border-[#e5e7eb] px-1.5 py-0.5 rounded">HCM</span>
        </div>

        {/* Hero copy */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-[56px] leading-[1.05] font-black text-[#111111] tracking-tight">
              Experience<br />
              <span className="text-[#bbbbbb] font-light italic">the next-gen</span><br />
              HR Platform.
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-[#6b7280] text-base leading-relaxed max-w-sm"
          >
            Track time, manage shifts, and streamline HR operations — with real-time accuracy.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex items-center gap-6 pt-2"
          >
            {[
              { value: 'Real-time', label: 'Sync' },
              { value: 'OT / ND', label: 'Auto-computed' },
              { value: 'Role-based', label: 'Access Control' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-base font-black text-[#111111]">{stat.value}</p>
                <p className="text-[10px] font-bold text-[#bbbbbb] uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer badges */}
        <div className="flex items-center gap-4 text-[10px] font-bold text-[#bbbbbb] uppercase tracking-widest">
          <span>Firebase Powered</span>
          <span className="w-1 h-1 rounded-full bg-[#dddddd]" />
          <span>Firestore Real-time</span>
          <span className="w-1 h-1 rounded-full bg-[#dddddd]" />
          <span>TypeScript</span>
        </div>
      </motion.div>

      {/* ── Right panel ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex items-center justify-center px-6 sm:px-12 py-12 bg-white"
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-[#111111] flex items-center justify-center">
              <span className="text-white font-black text-sm">W</span>
            </div>
            <span className="text-lg font-black text-[#111111]">WardSuite</span>
          </div>

          <h2 className="text-3xl font-black text-[#111111] tracking-tight">Sign In</h2>
          <p className="text-sm text-[#6b7280] mt-1.5 mb-7">Enter your credentials to access your workspace.</p>

          {/* Quick access chips */}
          <div className="mb-6">
            <p className="section-label mb-3">Quick Access</p>
            <div className="flex gap-2">
              {QUICK_ACCESS.map((qa) => (
                <button
                  key={qa.email}
                  type="button"
                  onClick={() => applyQuickAccess(qa.email)}
                  className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-[#ebebeb] hover:border-[#cccccc] transition-all hover:shadow-sm group"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${qa.color} group-hover:scale-105 transition-transform`}>
                    {qa.initial}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#aaaaaa]">{qa.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="section-label block mb-1.5">Workspace Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbbbbb]" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={setField('email')}
                  className="input-theme pl-10"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="section-label">Secure Password</label>
                <span className="text-[10px] font-black text-[#bbbbbb] uppercase tracking-widest hover:text-[#111111] cursor-pointer transition-colors">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbbbbb]" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={setField('password')}
                  className="input-theme pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-2 h-12 bg-[#111111] text-white rounded-2xl font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Access Workspace <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6b7280]">
            New to the platform?{' '}
            <Link to="/auth/register" className="font-black text-[#111111] hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
