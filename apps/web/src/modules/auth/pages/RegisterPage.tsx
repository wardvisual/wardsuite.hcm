import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
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

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

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
    } catch { /* error in store */ }
  }

  const displayError = validationError || error;

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col justify-between w-[45%] bg-[#fafafa] px-14 py-12 border-r border-[#f1f1f1]"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#111111] flex items-center justify-center">
            <span className="text-white font-black text-sm">W</span>
          </div>
          <span className="text-lg font-black text-[#111111]">WardSuite</span>
          <span className="text-[10px] font-bold text-[#bbbbbb] uppercase tracking-widest ml-1 border border-[#e5e7eb] px-1.5 py-0.5 rounded">HCM</span>
        </div>

        <div className="space-y-5">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-[44px] leading-[1.1] font-black text-[#111111] tracking-tight"
          >
            Join your<br />
            <span className="text-[#bbbbbb] font-light italic">team on</span><br />
            WardSuite.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-[#6b7280] text-sm leading-relaxed max-w-xs"
          >
            Set up your employee profile and start tracking your shifts with precision.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-2 text-xs text-[#aaaaaa]"
          >
            {['Auto-generated employee code', 'Configurable shift schedule', 'Real-time punch tracking'].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#aaaaaa]" />
                {f}
              </div>
            ))}
          </motion.div>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-bold text-[#bbbbbb] uppercase tracking-widest">
          <span>Secure</span>
          <span className="w-1 h-1 rounded-full bg-[#dddddd]" />
          <span>Firebase Auth</span>
          <span className="w-1 h-1 rounded-full bg-[#dddddd]" />
          <span>TypeScript</span>
        </div>
      </motion.div>

      {/* Right panel — form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex items-center justify-center px-6 sm:px-12 py-10 overflow-y-auto"
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-7">
            <div className="w-8 h-8 rounded-xl bg-[#111111] flex items-center justify-center">
              <span className="text-white font-black text-sm">W</span>
            </div>
            <span className="text-lg font-black text-[#111111]">WardSuite</span>
          </div>

          <h2 className="text-3xl font-black text-[#111111] tracking-tight">Create Account</h2>
          <p className="text-sm text-[#6b7280] mt-1.5 mb-6">Register as an employee of WardSuite HCM.</p>

          {displayError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {displayError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="section-label block mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbbbbb]" />
                <input type="text" required value={form.name} onChange={set('name')} className="input-theme pl-10" placeholder="Juan Dela Cruz" />
              </div>
            </div>

            <div>
              <label className="section-label block mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbbbbb]" />
                <input type="email" required autoComplete="email" value={form.email} onChange={set('email')} className="input-theme pl-10" placeholder="you@company.com" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="section-label block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbbbbb]" />
                  <input type="password" required minLength={6} autoComplete="new-password" value={form.password} onChange={set('password')} className="input-theme pl-10" placeholder="••••••" />
                </div>
              </div>
              <div>
                <label className="section-label block mb-1.5">Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbbbbb]" />
                  <input type="password" required minLength={6} autoComplete="new-password" value={form.confirmPassword} onChange={set('confirmPassword')} className="input-theme pl-10" placeholder="••••••" />
                </div>
              </div>
            </div>

            <div>
              <label className="section-label block mb-1.5">Timezone</label>
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
                <label className="section-label block mb-1.5">Shift Start</label>
                <input type="time" value={form.scheduleStart} onChange={set('scheduleStart')} className="input-theme" />
              </div>
              <div>
                <label className="section-label block mb-1.5">Shift End</label>
                <input type="time" value={form.scheduleEnd} onChange={set('scheduleEnd')} className="input-theme" />
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
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          <p className="mt-5 text-center text-sm text-[#6b7280]">
            Already have an account?{' '}
            <Link to="/auth/login" className="font-black text-[#111111] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
