import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@web/modules/auth/hooks/useAuth';

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(form);
      navigate('/dashboard');
    } catch { /* error handled in store */ }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-3xl bg-[#111111] flex items-center justify-center">
            <span className="text-white font-black text-xl">W</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-[#f1f1f1] p-8">
          <h1 className="text-2xl font-black text-[#111111] mb-1">Sign in</h1>
          <p className="text-sm text-[#6b7280] mb-6">Welcome back to WardSuite HCM</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-2xl"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-[#6b7280] uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="input-theme"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#6b7280] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="input-theme"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-4 h-4" />
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#6b7280]">
            No account?{' '}
            <Link to="/auth/register" className="font-bold text-[#111111] hover:underline">
              Register
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-5 p-3 bg-[#f9fafb] rounded-2xl border border-[#f1f1f1]">
            <p className="text-xs font-black text-[#bbbbbb] uppercase tracking-wider mb-2">Demo accounts</p>
            <div className="space-y-1 text-xs text-[#6b7280]">
              <p><span className="font-bold">Admin:</span> admin@wardsuite.demo · Demo@1234</p>
              <p><span className="font-bold">Employee:</span> juan@wardsuite.demo · Demo@1234</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import React from 'react';
