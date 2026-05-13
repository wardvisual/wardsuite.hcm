import React, { useReducer } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, Timer, Activity, AlertCircle } from 'lucide-react';
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
    <motion.div className="relative flex items-center justify-center" whileTap={{ scale: 0.97 }}>
      {isPunchedIn && (
        <>
          <motion.div
            className="absolute w-28 h-28 rounded-full border-2 border-emerald-300"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute w-28 h-28 rounded-full border-2 border-emerald-200"
            animate={{ scale: [1, 1.8], opacity: [0.35, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
          />
        </>
      )}
      <motion.button
        type="button"
        onClick={onPunch}
        disabled={isPunching}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.93 }}
        transition={{ type: 'spring', stiffness: 380, damping: 18 }}
        className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1.5 font-black text-white shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-300 ${isOut
          ? 'bg-gradient-to-br from-[#111111] to-[#2a2a2a]'
          : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
          }`}
      >
        <AnimatePresence mode="wait">
          {isPunching ? (
            <motion.div
              key="spin"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
            />
          ) : (
            <motion.div
              key={action}
              initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 15 }}
              transition={{ type: 'spring', stiffness: 480, damping: 22 }}
              className="flex flex-col items-center gap-1"
            >
              {isOut ? <LogOut className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              <span className="text-[9px] tracking-widest uppercase font-black">
                {isOut ? 'Punch Out' : 'Punch In'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}

interface PunchCardProps {
  todayPunches: AttendancePunch[];
  todaySummary: DailySummary | null;
  isPunchedIn: boolean;
  nextAction: 'IN' | 'OUT';
  isPunching: boolean;
  error: string | null;
  onPunch: () => void;
}

export function PunchCard({
  todayPunches, todaySummary, isPunchedIn, nextAction, isPunching, error, onPunch,
}: PunchCardProps) {
  const [ui, dispatch] = useReducer(
    (state: { historyOpen: boolean }, action: { type: 'OPEN_HISTORY' | 'CLOSE_HISTORY' }) => {
      if (action.type === 'OPEN_HISTORY') return { historyOpen: true };
      return { historyOpen: false };
    },
    { historyOpen: false },
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="floating-card p-7 flex flex-col items-center gap-5"
    >
      <LiveClock />

      <AnimatePresence mode="wait">
        <motion.div
          key={String(isPunchedIn)}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold ${isPunchedIn
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            : 'bg-[#f5f5f5] text-[#6b7280] border border-[#ebebeb]'
            }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isPunchedIn ? 'bg-emerald-500 animate-pulse' : 'bg-[#bbbbbb]'}`} />
          {isPunchedIn ? 'Currently Clocked In' : 'Not Clocked In'}
        </motion.div>
      </AnimatePresence>

      <PunchButton action={nextAction} isPunching={isPunching} isPunchedIn={isPunchedIn} onPunch={onPunch} />

      {todaySummary && (
        <div className="flex items-center gap-4 text-xs text-[#6b7280] w-full justify-center">
          <div className="flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-bold">In:</span>
            <span>{formatTime(todaySummary.firstIn)}</span>
          </div>
          {todaySummary.lastOut && (
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#aaaaaa]" />
              <span className="font-bold">Out:</span>
              <span>{formatTime(todaySummary.lastOut)}</span>
            </div>
          )}
        </div>
      )}

      {todayPunches.length > 0 && (
        <div className="w-full space-y-1.5 pt-1 border-t border-[#f5f5f5]">
          {todayPunches.slice(-4).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#fafafa]"
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${p.punchType === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-[#f0f0f0] text-[#6b7280]'
                }`}>
                {p.punchType === 'IN' ? <LogIn className="w-3 h-3" /> : <LogOut className="w-3 h-3" />}
              </div>
              <span className="text-xs text-[#6b7280] flex-1">Punch {p.punchType}</span>
              <span className="text-xs font-bold text-[#111111] tabular-nums">
                {new Date(p.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
            </motion.div>
          ))}
          <button
            type="button"
            onClick={() => dispatch({ type: 'OPEN_HISTORY' })}
            className="text-xs font-bold text-[#111111] hover:text-[#6b7280] transition-colors"
          >
            View more
          </button>
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 w-full"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </motion.div>
      )}

      <PunchHistoryDrawer
        open={ui.historyOpen}
        punches={todayPunches}
        onClose={() => dispatch({ type: 'CLOSE_HISTORY' })}
      />
    </motion.div>
  );
}
