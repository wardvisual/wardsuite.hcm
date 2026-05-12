import { motion, AnimatePresence } from 'motion/react';
import { Clock, LogIn, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAttendance } from '../hooks/useAttendance';
import { AttendancePunch } from '../types/attendance.types';

function fmt(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function fmtMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min}m`;
  return min === 0 ? `${h}h` : `${h}h ${min}m`;
}

function PunchTimeline({ punches }: { punches: AttendancePunch[] }) {
  if (punches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-[#bbbbbb] gap-2">
        <Clock className="w-8 h-8" />
        <p className="text-sm font-medium">No punches recorded today</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {punches.map((punch, i) => (
        <motion.div
          key={punch.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-[#fafafa] hover:bg-[#f5f5f5] transition-colors"
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              punch.punchType === 'IN'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-[#f5f5f5] text-[#6b7280]'
            }`}
          >
            {punch.punchType === 'IN' ? (
              <LogIn className="w-4 h-4" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-[#111111]">
              Punch {punch.punchType}
            </p>
            <p className="text-xs text-[#bbbbbb]">
              {fmt(punch.timestamp)}
              {punch.isEdited && ' · edited'}
            </p>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              punch.punchType === 'IN'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-[#f5f5f5] text-[#6b7280]'
            }`}
          >
            {punch.punchType}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export default function AttendancePage() {
  const {
    todayPunches,
    todaySummary,
    isPunchedIn,
    nextAction,
    isPunching,
    error,
    dateKey,
    punch,
  } = useAttendance();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#111111]">Time & Attendance</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">{today}</p>
      </div>

      {/* Punch button card */}
      <div className="floating-card p-8 sm:p-12 flex flex-col items-center gap-6">
        {/* Live clock */}
        <LiveClock />

        {/* Status pill */}
        <AnimatePresence mode="wait">
          <motion.div
            key={String(isPunchedIn)}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
              isPunchedIn
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-[#f5f5f5] text-[#6b7280] border border-[#ebebeb]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isPunchedIn ? 'bg-emerald-500 animate-pulse' : 'bg-[#bbbbbb]'}`}
            />
            {isPunchedIn ? 'Currently Clocked In' : 'Not Clocked In'}
          </motion.div>
        </AnimatePresence>

        {/* The big punch button */}
        <PunchButton
          action={nextAction}
          isPunching={isPunching}
          isPunchedIn={isPunchedIn}
          onPunch={punch}
        />

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 w-full"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </div>

      {/* Today's metrics */}
      {todaySummary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <MetricCard label="Worked" value={fmtMinutes(todaySummary.workedMinutes)} />
          <MetricCard label="Regular" value={fmtMinutes(todaySummary.regularMinutes)} />
          <MetricCard
            label="Overtime"
            value={fmtMinutes(todaySummary.overtimeMinutes)}
            highlight={todaySummary.overtimeMinutes > 0}
          />
          <MetricCard
            label="Late"
            value={fmtMinutes(todaySummary.lateMinutes)}
            danger={todaySummary.lateMinutes > 0}
          />
        </motion.div>
      )}

      {/* Timeline */}
      <div className="floating-card p-6">
        <h2 className="text-base font-black text-[#111111] mb-4">Today's Timeline</h2>
        <PunchTimeline punches={todayPunches} />
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="text-5xl font-black text-[#111111] tabular-nums tracking-tight">
      {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </p>
  );
}

interface PunchButtonProps {
  action: 'IN' | 'OUT';
  isPunching: boolean;
  isPunchedIn: boolean;
  onPunch: () => void;
}

function PunchButton({ action, isPunching, isPunchedIn, onPunch }: PunchButtonProps) {
  const isOut = action === 'OUT';

  return (
    <motion.div className="relative flex items-center justify-center" whileTap={{ scale: 0.96 }}>
      {/* Pulse rings when punched in */}
      {isPunchedIn && (
        <>
          <motion.div
            className="absolute w-36 h-36 rounded-full border-2 border-emerald-300"
            animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute w-36 h-36 rounded-full border-2 border-emerald-200"
            animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
          />
        </>
      )}

      <motion.button
        type="button"
        onClick={onPunch}
        disabled={isPunching}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={`relative z-10 w-32 h-32 rounded-full flex flex-col items-center justify-center gap-1 font-black text-white shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-300 ${
          isOut
            ? 'bg-gradient-to-br from-[#111111] to-[#333333]'
            : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
        }`}
      >
        <AnimatePresence mode="wait">
          {isPunching ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"
            />
          ) : (
            <motion.div
              key={action}
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="flex flex-col items-center gap-1"
            >
              {isOut ? (
                <LogOut className="w-6 h-6" />
              ) : (
                <LogIn className="w-6 h-6" />
              )}
              <span className="text-xs tracking-widest uppercase">
                {isOut ? 'Punch Out' : 'Punch In'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success ripple */}
        <AnimatePresence>
          {!isPunching && (
            <motion.div
              key="ripple"
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-full bg-white/30"
            />
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  highlight?: boolean;
  danger?: boolean;
}

function MetricCard({ label, value, highlight, danger }: MetricCardProps) {
  return (
    <div
      className={`rounded-2xl p-4 border ${
        danger
          ? 'bg-red-50 border-red-100'
          : highlight
          ? 'bg-emerald-50 border-emerald-100'
          : 'bg-[#fafafa] border-[#f1f1f1]'
      }`}
    >
      <p className={`text-xs font-black uppercase tracking-wider mb-1 ${danger ? 'text-red-400' : highlight ? 'text-emerald-600' : 'text-[#bbbbbb]'}`}>
        {label}
      </p>
      <p className={`text-xl font-black ${danger ? 'text-red-700' : highlight ? 'text-emerald-700' : 'text-[#111111]'}`}>
        {value}
      </p>
    </div>
  );
}

import React from 'react';
