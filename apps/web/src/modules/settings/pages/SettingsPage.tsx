import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Clock, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

const TIMEZONES = [
  { value: 'Asia/Manila', label: 'Asia/Manila (PHT)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
];

export default function SettingsPage() {
  const { user, isSaving, error, successMessage, saveProfile } = useSettings();

  const [form, setForm] = useState({
    name: user?.name ?? '',
    timezone: user?.timezone ?? 'Asia/Manila',
    scheduleStart: user?.schedule?.start ?? '09:00',
    scheduleEnd: user?.schedule?.end ?? '18:00',
    breakMinutes: user?.schedule?.breakMinutes ?? 60,
    graceMinutes: user?.schedule?.graceMinutes ?? 5,
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        timezone: user.timezone,
        scheduleStart: user.schedule.start,
        scheduleEnd: user.schedule.end,
        breakMinutes: user.schedule.breakMinutes,
        graceMinutes: user.schedule.graceMinutes,
      });
    }
  }, [user?.uid]);

  const set =
    <K extends keyof typeof form>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({
        ...f,
        [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value,
      }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile({
      name: form.name,
      timezone: form.timezone,
      schedule: {
        start: form.scheduleStart,
        end: form.scheduleEnd,
        breakMinutes: form.breakMinutes,
        graceMinutes: form.graceMinutes,
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#111111]">Settings</h1>
        <p className="mt-0.5 text-sm text-[#6b7280]">Manage your profile and schedule preferences.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="floating-card p-6"
      >
        <div className="mb-6 flex items-center gap-3 border-b border-[#f1f1f1] pb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#111111]">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-[#111111]">Account</h2>
            <p className="text-xs text-[#6b7280]">
              {user?.employeeCode} · {user?.role}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="section-label mb-1.5 block">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={set('name')}
                className="input-theme"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="section-label mb-1.5 block">Timezone</label>
              <select value={form.timezone} onChange={set('timezone')} className="input-theme">
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-[#f1f1f1] pt-5">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f5f5f5]">
                <Clock className="h-4 w-4 text-[#6b7280]" />
              </div>
              <div>
                <p className="text-sm font-black text-[#111111]">Work Schedule</p>
                <p className="text-xs text-[#6b7280]">Your shift hours and break configuration.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="section-label mb-1.5 block">Shift Start</label>
                <input
                  type="time"
                  value={form.scheduleStart}
                  onChange={set('scheduleStart')}
                  className="input-theme"
                />
              </div>
              <div>
                <label className="section-label mb-1.5 block">Shift End</label>
                <input
                  type="time"
                  value={form.scheduleEnd}
                  onChange={set('scheduleEnd')}
                  className="input-theme"
                />
              </div>
              <div>
                <label className="section-label mb-1.5 block">Break (minutes)</label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={form.breakMinutes}
                  onChange={set('breakMinutes')}
                  className="input-theme"
                />
              </div>
              <div>
                <label className="section-label mb-1.5 block">Grace Period (minutes)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={form.graceMinutes}
                  onChange={set('graceMinutes')}
                  className="input-theme"
                />
              </div>
            </div>
          </div>

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {successMessage}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isSaving}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex h-12 items-center gap-2 rounded-2xl bg-[#111111] px-8 text-sm font-black uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="floating-card p-5"
      >
        <p className="section-label mb-3">Account Info</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { label: 'Email', value: user?.email ?? '—' },
            { label: 'Employee Code', value: user?.employeeCode ?? '—' },
            { label: 'Role', value: user?.role ?? '—' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#f1f1f1] bg-[#fafafa] px-4 py-3"
            >
              <p className="section-label mb-1">{item.label}</p>
              <p className="text-sm font-black text-[#111111]">{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
