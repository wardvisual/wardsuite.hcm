import React, { useReducer, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, LogIn, LogOut, Timer, Activity, AlertCircle, Circle } from 'lucide-react';
import type { AttendancePunch, DailySummary } from '@web/modules/attendance';
import { formatTime } from '@web/lib/utils';
import { PunchHistoryDrawer } from './PunchHistoryDrawer';

function LiveClock() {
  const [time, setTime] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <p className="text-4xl sm:text-5xl font-black text-[#111111] tabular-nums tracking-tight">
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
      {isPunchedIn && (
        <>
          <motion.div
            className="absolute h-44 w-44 rounded-full border-2 border-emerald-300 sm:h-52 sm:w-52 lg:h-60 lg:w-60"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute h-44 w-44 rounded-full border-2 border-emerald-200 sm:h-52 sm:w-52 lg:h-60 lg:w-60"
            animate={{ scale: [1, 1.8], opacity: [0.35, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
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
        animate={{
          boxShadow: isPunching
            ? [
              '0_28px_70px_rgba(15,23,42,0.24)',
              '0_34px_85px_rgba(16,185,129,0.28)',
              '0_28px_70px_rgba(15,23,42,0.24)',
            ]
            : '0_28px_70px_rgba(15,23,42,0.24)',
        }}
        className={`relative z-10 flex h-48 w-48 cursor-pointer overflow-hidden flex-col items-center justify-center gap-2 rounded-full font-black text-white shadow-[0_28px_70px_rgba(15,23,42,0.24)] disabled:cursor-not-allowed disabled:opacity-60 sm:h-56 sm:w-56 lg:h-64 lg:w-64 ${isOut
          ? 'bg-[#111111]'
          : 'bg-emerald-600'
          }`}
      >
        <motion.div
          aria-hidden="true"
          className={`absolute inset-0 ${isOut
            ? 'bg-[linear-gradient(120deg,#0f172a_0%,#334155_35%,#111827_70%,#64748b_100%)]'
            : 'bg-[linear-gradient(120deg,#22c55e_0%,#14b8a6_35%,#10b981_70%,#84cc16_100%)]'
            }`}
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          style={{ backgroundSize: '200% 200%' }}
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={action}
            initial={{ opacity: 0, scale: 0.5, rotate: -15, y: 8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 15, y: -8 }}
            transition={{ type: 'spring', stiffness: 460, damping: 20 }}
            className="relative z-10 flex flex-col items-center gap-2"
          >
            <div className="relative flex items-center justify-center">
              {isOut ? <LogOut className="h-7 w-7 sm:h-8 sm:w-8" /> : <LogIn className="h-7 w-7 sm:h-8 sm:w-8" />}
              {isPunching && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  className="absolute -right-2 -top-2 h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                  style={{ animation: 'spin 0.75s linear infinite' }}
                />
              )}
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.22em] sm:text-xs">
              {isOut ? 'Punch Out' : 'Punch In'}
            </span>
          </motion.div>
        </AnimatePresence>
      </motion.button>
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
  recentPunches, todaySummary, isPunchedIn, nextAction, isPunching, error, onPunch,
}: PunchCardProps) {
  const [punchImpact, setPunchImpact] = useState(false);
  const [ui, dispatch] = useReducer(
    (state: { historyOpen: boolean }, action: { type: 'OPEN_HISTORY' | 'CLOSE_HISTORY' }) => {
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
      className="floating-card p-5 sm:p-7"
    >
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="order-2 min-w-0 space-y-5 lg:order-1"
        >
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <motion.span
                animate={{ scale: isPunchedIn ? [1, 1.08, 1] : 1 }}
                transition={{ duration: 1.8, repeat: isPunchedIn ? Infinity : 0, ease: 'easeInOut' }}
                className={`h-2.5 w-2.5 rounded-full ${isPunchedIn ? 'bg-emerald-500' : 'bg-[#bbbbbb]'}`}
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={String(isPunchedIn)}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.22 }}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold ${isPunchedIn
                    ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                    : 'border-[#ebebeb] bg-[#f5f5f5] text-[#6b7280]'
                    }`}
                >
                  {isPunchedIn ? 'Currently Clocked In' : 'Not Clocked In'}
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.3 }}
              className={`text-2xl w-max font-black tracking-tight text-[#111111] sm:text-3xl ${isPunchedIn ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                : 'border-[#ebebeb] bg-[#f5f5f5] text-[#6b7280]'}`}
            >
              {isPunchedIn ? 'You are currently clocked in' : 'Ready to start your shift?'}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.3 }}
              className="max-w-2xl text-sm leading-6 text-[#6b7280]"
            >
              {isPunchedIn
                ? 'Use Punch Out when your shift ends. The latest punch activity updates instantly below.'
                : 'Use Punch In to begin tracking your attendance for today. Your punch history updates in real time.'}
            </motion.p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-[#6b7280]">
            {todaySummary && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16, duration: 0.25 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#fafafa] px-3 py-1.5"
              >
                <Timer className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-bold">In:</span>
                <span>{formatTime(todaySummary.firstIn)}</span>
              </motion.div>
            )}
            {!isPunchedIn && todaySummary?.lastOut && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.25 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#fafafa] px-3 py-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-[#aaaaaa]" />
                <span className="font-bold">Out:</span>
                <span>{formatTime(todaySummary.lastOut)}</span>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.3 }}
            className="max-w-2xl rounded-3xl border border-[#f5f5f5] bg-[#fafafa] p-4"
          >

            {displayPunches.length > 0 ? (
              <>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#bbbbbb]">Punch History</p>
                    <p className="mt-1 text-xs text-[#6b7280]">Showing your 4 most recent punches. Tap View more to open the full punch timeline.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'OPEN_HISTORY' })}
                    className="cursor-pointer rounded-full border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-bold text-[#111111] shadow-sm transition-colors hover:border-[#d1d5db] hover:bg-[#f9fafb] hover:text-[#6b7280]"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      View more
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </button>
                </div>
                <div className="space-y-1.5">
                  {displayPunches.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.05, duration: 0.25 }}
                      className="flex items-center gap-2.5 rounded-2xl bg-white px-3 py-2 shadow-[0_1px_0_rgba(15,23,42,0.03)]"
                    >
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${p.punchType === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-[#f0f0f0] text-[#6b7280]'
                        }`}>
                        {p.punchType === 'IN' ? <LogIn className="h-3 w-3" /> : <LogOut className="h-3 w-3" />}
                      </div>
                      <span className="flex-1 text-xs text-[#6b7280]">Punch {p.punchType}</span>
                      <span className="text-xs font-bold tabular-nums text-[#111111]">
                        {new Date(p.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#e5e7eb] bg-white px-4 py-6 text-sm text-[#9ca3af]">
                No punches recorded yet today.
              </div>
            )}
          </motion.div>

          <div className="grid max-w-2xl gap-2 rounded-3xl border border-[#f1f1f1] bg-white p-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-3 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <LogIn className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="whitespace-nowrap text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">Punch In</p>
                <p className="truncate text-xs text-emerald-700/80">Start or resume tracked time</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-[#f5f5f5] px-3 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#111111] text-white">
                <LogOut className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="whitespace-nowrap text-[11px] font-black uppercase tracking-[0.16em] text-[#111111]">Punch Out</p>
                <p className="truncate text-xs text-[#6b7280]">End the active shift window</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, x: 12 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.12, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="order-1 flex justify-center lg:order-2 lg:justify-end lg:self-stretch"
        >
          <motion.div
            animate={punchImpact ? { scale: [1, 0.92, 1.06, 1], rotate: [0, -2, 2, 0] } : { scale: 1 }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex h-full w-full items-center justify-center py-3"
          >
            <div className="absolute top-0 right-0 hidden items-center gap-2 rounded-full border border-[#f1f1f1] bg-white px-3 py-1.5 text-[11px] font-bold text-[#6b7280] shadow-sm lg:flex">
              <Circle className={`h-2.5 w-2.5 fill-current ${nextAction === 'IN' ? 'text-emerald-500' : 'text-[#111111]'}`} />
              Next: {nextAction === 'IN' ? 'Punch In' : 'Punch Out'}
            </div>
            {punchImpact && (
              <motion.div
                initial={{ opacity: 0.9, scale: 0.55 }}
                animate={{ opacity: 0, scale: 1.7 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="pointer-events-none absolute inset-0 rounded-full bg-emerald-400/20 blur-xl"
              />
            )}
            <PunchButton action={nextAction} isPunching={isPunching} isPunchedIn={isPunchedIn} onPunch={handlePunch} />
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="mt-5 flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <PunchHistoryDrawer
        open={ui.historyOpen}
        onClose={() => dispatch({ type: 'CLOSE_HISTORY' })}
      />
    </motion.div>
  );
}
