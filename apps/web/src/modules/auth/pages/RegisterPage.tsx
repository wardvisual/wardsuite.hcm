import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '@web/modules/auth/hooks/useAuth';

export default function RegisterPage() {
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    timezone: 'Asia/Manila',
    scheduleStart: '09:00',
    scheduleEnd: '18:00',
  });
  const [validationError, setValidationError] = useState('');

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }
    setValidationError('');
    try {
      await register(form);
      navigate('/auth/login');
    } catch { /* error handled in store */ }
  }

  const displayError = validationError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-3xl bg-[#111111] flex items-center justify-center">
            <span className="text-white font-black text-xl">W</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-[#f1f1f1] p-8">
          <h1 className="text-2xl font-black text-[#111111] mb-1">Create account</h1>
          <p className="text-sm text-[#6b7280] mb-6">Register as an employee of WardSuite HCM</p>

          {displayError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-2xl"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {displayError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-[#6b7280] uppercase tracking-wider mb-1.5">Full Name</label>
              <input type="text" required value={form.name} onChange={set('name')} className="input-theme" placeholder="Juan Dela Cruz" />
            </div>

            <div>
              <label className="block text-xs font-black text-[#6b7280] uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" required autoComplete="email" value={form.email} onChange={set('email')} className="input-theme" placeholder="you@example.com" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-[#6b7280] uppercase tracking-wider mb-1.5">Password</label>
                <input type="password" required minLength={6} autoComplete="new-password" value={form.password} onChange={set('password')} className="input-theme" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-black text-[#6b7280] uppercase tracking-wider mb-1.5">Confirm</label>
                <input type="password" required minLength={6} autoComplete="new-password" value={form.confirmPassword} onChange={set('confirmPassword')} className="input-theme" placeholder="••••••••" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#6b7280] uppercase tracking-wider mb-1.5">Timezone</label>
              <select value={form.timezone} onChange={set('timezone')} className="input-theme">
                <option value="Asia/Manila">Asia/Manila (PHT)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-[#6b7280] uppercase tracking-wider mb-1.5">Shift Start</label>
                <input type="time" value={form.scheduleStart} onChange={set('scheduleStart')} className="input-theme" />
              </div>
              <div>
                <label className="block text-xs font-black text-[#6b7280] uppercase tracking-wider mb-1.5">Shift End</label>
                <input type="time" value={form.scheduleEnd} onChange={set('scheduleEnd')} className="input-theme" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4" />
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#6b7280]">
            Already have an account?{' '}
            <Link to="/auth/login" className="font-bold text-[#111111] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

import React from 'react';
