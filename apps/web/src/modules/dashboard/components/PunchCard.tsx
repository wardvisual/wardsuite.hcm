import React, { useReducer, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, LogIn, LogOut, Timer, Activity, AlertCircle, Circle, Clock } from 'lucide-react';
import type { AttendancePunch, DailySummary } from '@web/modules/attendance';
import { formatTime } from '@web/lib/utils';
import { PunchHistoryDrawer } from './PunchHistoryDrawer';

function LiveClock() {
  const [time, setTime] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const hours = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).split(' ')[0];
  const ampm = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).split(' ')[1];
  const seconds = time.getSeconds().toString().padStart(2, '0');
  return (
    <div className="flex flex-col items-center lg:items-start">
      <div className="flex items-end gap-1.5">
        <span className="text-4xl sm:text-5xl font-black text-[#0f172a] tabular-nums tracking-tighter leading-none">
          {hours}
        </span>
        <div className="flex flex-col items-start pb-0.5 gap-0">
          <span className="text-xs font-black uppercase tracking-widest text-[#94a3b8] leading-tight">{ampm}</span>
          <span className="text-xs font-bold tabular-nums text-[#cbd5e1] leading-tight">:{seconds}</span>
        </div>
      </div>
      <p className="text-[11px] font-semibold text-[#94a3b8] tracking-wide mt-0.5">
        {time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
      </p>
    </div>
  );
}

interface StatusBadgeProps {
  isPunchedIn: boolean;
}

function StatusBadge({ isPunchedIn }: StatusBadgeProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={String(isPunchedIn)}
        initial={{ opacity: 0, y: -4, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.97 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide ${isPunchedIn
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-slate-200 bg-slate-50 text-slate-500'
          }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${isPunchedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
            }`}
        />
        {isPunchedIn ? 'Active Shift' : 'Not Clocked In'}
      </motion.div>
    </AnimatePresence>
  );
}

interface TimeStampChipsProps {
  todaySummary: DailySummary;
  isPunchedIn: boolean;
}

function TimeStampChips({ todaySummary, isPunchedIn }: TimeStampChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {todaySummary.firstIn && (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-1.5 text-xs text-emerald-700">
          <Timer className="w-3 h-3 text-emerald-500 shrink-0" />
          <span className="font-semibold">Clock In</span>
          <span className="font-black tabular-nums">{formatTime(todaySummary.firstIn)}</span>
        </span>
      )}
      {!isPunchedIn && todaySummary.lastOut && (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
          <Activity className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="font-semibold">Clock Out</span>
          <span className="font-black tabular-nums">{formatTime(todaySummary.lastOut)}</span>
        </span>
      )}
    </div>
  );
}

interface RecentPunchRowProps {
  punch: AttendancePunch;
  index: number;
}

function RecentPunchRow({ punch, index }: RecentPunchRowProps) {
  const isIn = punch.punchType === 'IN';
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.18 + index * 0.045, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 rounded-xl bg-white border border-[#f1f5f9] px-3 py-2.5"
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${isIn ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
          }`}
      >
        {isIn ? <LogIn className="h-3.5 w-3.5" /> : <LogOut className="h-3.5 w-3.5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-[#0f172a]">Punch {isIn ? 'In' : 'Out'}</p>
        <p className="text-[11px] text-[#94a3b8] truncate">
          {new Date(punch.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-black tabular-nums ${isIn ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}
      >
        {new Date(punch.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
      </span>
    </motion.div>
  );
}

interface RecentActivityPanelProps {
  punches: AttendancePunch[];
  onViewAll: () => void;
}

function RecentActivityPanel({ punches, onViewAll }: RecentActivityPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] p-3"
    >
      {punches.length > 0 ? (
        <>
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#94a3b8]">
              Recent Activity
            </p>
            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center gap-1 rounded-full border border-[#e2e8f0] bg-white px-2.5 py-1 text-[11px] font-bold text-[#64748b] shadow-sm hover:border-[#cbd5e1] hover:text-[#0f172a] transition-all duration-150 text-[14px]"
            >
              View all
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-1.5">
            {punches.map((p, i) => (
              <RecentPunchRow key={p.id} punch={p} index={i} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2.5 py-2 text-xs text-[#94a3b8]">
          <Clock className="h-3.5 w-3.5 text-[#cbd5e1]" />
          No punches recorded yet today.
        </div>
      )}
    </motion.div>
  );
}

interface PunchTypeLegendProps { }

function PunchTypeLegend(_: PunchTypeLegendProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-100/80 px-3 py-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-[0_2px_8px_rgba(5,150,105,0.30)]">
          <LogIn className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-emerald-800">Punch In</p>
          <p className="truncate text-[11px] text-emerald-600/70">Start or resume shift</p>
        </div>
      </div>
      <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 px-3 py-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#0f172a] text-white shadow-[0_2px_8px_rgba(15,23,42,0.18)]">
          <LogOut className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#0f172a]">Punch Out</p>
          <p className="truncate text-[11px] text-[#94a3b8]">End the active window</p>
        </div>
      </div>
    </div>
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
      {isPunchedIn && (
        <>
          <motion.div
            className="absolute h-40 w-40 rounded-full border border-emerald-300/60 sm:h-48 sm:w-48"
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute h-40 w-40 rounded-full border border-emerald-200/40 sm:h-48 sm:w-48"
            animate={{ scale: [1, 1.9], opacity: [0.4, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 0.7 }}
          />
        </>
      )}
      <motion.button
        type="button"
        onClick={onPunch}
        disabled={isPunching}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 320, damping: 16 }}
        className={`relative z-10 flex h-40 w-40 cursor-pointer overflow-hidden flex-col items-center justify-center gap-2 rounded-full font-black text-white shadow-[0_24px_64px_rgba(15,23,42,0.20)] disabled:cursor-not-allowed disabled:opacity-50 sm:h-48 sm:w-48 ${isOut ? 'bg-[#0f172a]' : 'bg-emerald-600'
          }`}
      >
        <motion.div
          aria-hidden="true"
          className={`absolute inset-0 ${isOut
            ? 'bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_40%,#334155_70%,#475569_100%)]'
            : 'bg-[linear-gradient(135deg,#059669_0%,#10b981_35%,#14b8a6_65%,#22c55e_100%)]'
            }`}
          animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
          style={{ backgroundSize: '200% 200%' }}
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={action}
            initial={{ opacity: 0, scale: 0.5, rotate: -12, y: 8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 12, y: -8 }}
            transition={{ type: 'spring', stiffness: 460, damping: 20 }}
            className="relative z-10 flex flex-col items-center gap-2"
          >
            <div className="relative flex items-center justify-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isOut ? 'bg-white/10' : 'bg-white/15'}`}>
                {isOut ? <LogOut className="h-5 w-5 sm:h-6 sm:w-6" /> : <LogIn className="h-5 w-5 sm:h-6 sm:w-6" />}
              </div>
              {isPunching && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                />
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.24em] sm:text-[11px]">
              {isOut ? 'Punch Out' : 'Punch In'}
            </span>
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}

interface NextActionBadgeProps {
  nextAction: 'IN' | 'OUT';
}

function NextActionBadge({ nextAction }: NextActionBadgeProps) {
  return (
    <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold shadow-sm whitespace-nowrap ${nextAction === 'IN'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-slate-200 bg-white text-slate-600'
          }`}
      >
        <Circle
          className={`h-2 w-2 fill-current ${nextAction === 'IN' ? 'text-emerald-500' : 'text-slate-400'}`}
        />
        Next: {nextAction === 'IN' ? 'Punch In' : 'Punch Out'}
      </span>
    </div>
  );
}

interface PunchButtonSectionProps {
  nextAction: 'IN' | 'OUT';
  isPunching: boolean;
  isPunchedIn: boolean;
  punchImpact: boolean;
  onPunch: () => void;
}

function PunchButtonSection({ nextAction, isPunching, isPunchedIn, punchImpact, onPunch }: PunchButtonSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, x: 10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ delay: 0.1, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="order-1 flex flex-col items-center gap-4 lg:order-2"
    >
      <div className="lg:hidden">
        <LiveClock />
      </div>

      <div className="relative pt-6">
        <NextActionBadge nextAction={nextAction} />
        <motion.div
          animate={
            punchImpact
              ? { scale: [1, 0.91, 1.07, 1], rotate: [0, -1.5, 1.5, 0] }
              : { scale: 1, rotate: 0 }
          }
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {punchImpact && (
            <motion.div
              initial={{ opacity: 0.8, scale: 0.5 }}
              animate={{ opacity: 0, scale: 1.8 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="pointer-events-none absolute inset-0 rounded-full bg-emerald-400/25 blur-2xl"
            />
          )}
          <PunchButton
            action={nextAction}
            isPunching={isPunching}
            isPunchedIn={isPunchedIn}
            onPunch={onPunch}
          />
        </motion.div>
      </div>

      <p className="text-[14px] text-[#94a3b8] font-bold text-center max-w-[140px] leading-relaxed">
        {isPunchedIn
          ? 'Tap to record your clock-out'
          : 'Tap to begin your shift'}
      </p>
    </motion.div>
  );
}

interface ErrorBannerProps {
  error: string;
}

function ErrorBanner({ error }: ErrorBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22 }}
      className="mt-5 flex items-start gap-2.5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
      <span className="leading-relaxed">{error}</span>
    </motion.div>
  );
}

interface PunchCardProps {
  recentPunches: AttendancePunch[];
  todaySummary: DailySummary | null;
  isPunchedIn: boolean;
  nextAction: 'IN' | 'OUT';
  isPunching: boolean;
  error: string | null;
  onPunch: () => void;
}

export function PunchCard({
  recentPunches,
  todaySummary,
  isPunchedIn,
  nextAction,
  isPunching,
  error,
  onPunch,
}: PunchCardProps) {
  const [punchImpact, setPunchImpact] = useState(false);
  const [ui, dispatch] = useReducer(
    (
      state: { historyOpen: boolean },
      action: { type: 'OPEN_HISTORY' | 'CLOSE_HISTORY' },
    ) => {
      if (action.type === 'OPEN_HISTORY') return { historyOpen: true };
      return { historyOpen: false };
    },
    { historyOpen: false },
  );

  const handlePunch = () => {
    setPunchImpact(true);
    window.setTimeout(() => setPunchImpact(false), 650);
    onPunch();
  };

  const displayPunches = recentPunches.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="floating-card overflow-hidden"
    >
      <div className="h-1 w-full bg-[linear-gradient(90deg,#059669_0%,#10b981_50%,#14b8a6_100%)]" />

      <div className="p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="order-2 min-w-0 space-y-4 lg:order-1"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <StatusBadge isPunchedIn={isPunchedIn} />
                <motion.h2
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.3 }}
                  className="text-xl font-black tracking-tight text-[#0f172a] sm:text-2xl leading-snug"
                >
                  {isPunchedIn ? 'You are currently clocked in' : 'Ready to start your shift?'}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.12 }}
                  className="text-sm text-[#94a3b8] leading-relaxed"
                >
                  {isPunchedIn
                    ? 'Use Punch Out when your shift ends.'
                    : 'Use Punch In to begin tracking your attendance.'}
                </motion.p>
              </div>
              <div className="hidden lg:block shrink-0">
                <LiveClock />
              </div>
            </div>

            {todaySummary && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }}
              >
                <TimeStampChips todaySummary={todaySummary} isPunchedIn={isPunchedIn} />
              </motion.div>
            )}

            <RecentActivityPanel
              punches={displayPunches}
              onViewAll={() => dispatch({ type: 'OPEN_HISTORY' })}
            />

            <PunchTypeLegend />
          </motion.div>

          <PunchButtonSection
            nextAction={nextAction}
            isPunching={isPunching}
            isPunchedIn={isPunchedIn}
            punchImpact={punchImpact}
            onPunch={handlePunch}
          />
        </div>

        <AnimatePresence>
          {error && <ErrorBanner error={error} />}
        </AnimatePresence>
      </div>

      <PunchHistoryDrawer
        open={ui.historyOpen}
        onClose={() => dispatch({ type: 'CLOSE_HISTORY' })}
      />
    </motion.div>
  );
}