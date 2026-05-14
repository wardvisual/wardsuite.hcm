import { motion } from 'motion/react';
import type { DailySummary } from '@web/modules/attendance';
import { formatHours, formatWeekdayShort, getTodayKey } from '@web/lib/utils';

interface WeeklyChartProps {
  data: DailySummary[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const actualData = data.filter((entry) => entry.status !== 'absent');

  if (data.length === 0) {
    const todayKey = getTodayKey();
    const currentDate = new Date(`${todayKey}T00:00:00`);
    const dayIndex = currentDate.getDay() || 7;
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - dayIndex + 1);

    return (
      <motion.div
        className="rounded-[24px] border border-[#f1f1f1] bg-white p-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex h-48 items-end gap-2 sm:gap-3">
          {Array.from({ length: 7 }).map((_, index) => {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + index);
            const dateKey = date.toLocaleDateString('sv-SE').slice(0, 10);
            const label = formatWeekdayShort(dateKey);

            return (
              <div key={dateKey} className="group flex flex-1 flex-col items-center gap-2">
                <div className="relative flex h-36 w-full items-end justify-center rounded-2xl border border-dashed border-[#d1d5db] bg-white p-1">
                  <div className="absolute inset-x-2 bottom-2 rounded-[18px] border border-[#111111] bg-white shadow-[0_8px_20px_rgba(15,23,42,0.04)]" style={{ height: '8%' }} />
                </div>

                <div className="text-center">
                  <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-[#9ca3af]">
                    {label}
                  </span>
                  <span className="mt-1 block text-[10px] font-medium text-[#9ca3af]">
                    —
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  const todayKey = getTodayKey();
  const currentDate = new Date(`${todayKey}T00:00:00`);
  const dayIndex = currentDate.getDay() || 7;
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - dayIndex + 1);
  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const dateKey = date.toLocaleDateString('sv-SE').slice(0, 10);
    return {
      dateKey,
      label: formatWeekdayShort(dateKey),
      summary: data.find((entry) => entry.dateKey === dateKey) ?? null,
    };
  });
  const maxMin = Math.max(...actualData.map((d) => d.workedMinutes), 1);
  const totalWorked = weekDays.reduce((total, day) => total + (day.summary?.workedMinutes ?? 0), 0);
  const totalOvertime = weekDays.reduce((total, day) => total + (day.summary?.overtimeMinutes ?? 0), 0);

  return (
    <motion.div
      className="rounded-[24px] border border-[#f1f1f1] bg-white p-4 sm:p-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-5 grid gap-3 border-b border-[#f5f5f5] pb-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="section-label">This Week</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black tabular-nums text-[#111111]">{formatHours(totalWorked)}</span>
            <span className="whitespace-nowrap text-xs font-bold text-[#9ca3af]">worked</span>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#e5e7eb] bg-[#fafafa] px-3 py-1.5 text-[11px] font-bold text-[#6b7280]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#111111]" />
            Regular
          </span>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            OT {formatHours(totalOvertime)}
          </span>
        </div>
      </div>

      <div className="flex h-52 items-end gap-2 sm:gap-3">
        {weekDays.map((day, i) => {
          const summary = day.summary;
          const hasData = Boolean(summary && summary.status !== 'absent' && summary.workedMinutes > 0);
          const regPct = hasData && summary ? (summary.regularMinutes / maxMin) * 100 : 0;
          const otPct = hasData && summary ? (summary.overtimeMinutes / maxMin) * 100 : 0;
          const isToday = day.dateKey === todayKey;

          return (
            <div key={day.dateKey} className="group flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className={`relative flex h-40 w-full items-end justify-center rounded-2xl p-1 ring-1 ${isToday ? 'ring-[#111111]' : hasData ? 'bg-[#fafafa] ring-[#f1f1f1]' : 'bg-white ring-[#e5e7eb] ring-dashed'}`}>
                {hasData ? (
                  <motion.div
                    className="absolute inset-x-1.5 bottom-2 rounded-[18px] bg-[#111111] shadow-[0_8px_20px_rgba(15,23,42,0.15)] sm:inset-x-2"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(regPct, 8)}%` }}
                    transition={{ delay: i * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  />
                ) : (
                  <div className="absolute inset-x-1.5 bottom-2 rounded-[18px] border border-[#111111] bg-white sm:inset-x-2" style={{ height: '8%' }} />
                )}
                {hasData && summary && summary.overtimeMinutes > 0 && (
                  <motion.div
                    className="absolute inset-x-1.5 rounded-[18px] bg-emerald-500 opacity-85 shadow-[0_10px_24px_rgba(16,185,129,0.16)] sm:inset-x-2"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(otPct, 4)}%` }}
                    transition={{ delay: i * 0.06 + 0.15, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                    style={{ bottom: `${Math.max(regPct, 8)}%` }}
                  />
                )}
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 + 0.25, duration: 0.3 }}
                  className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#111111] px-2.5 py-1 text-[9px] font-black text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                >
                  {hasData && summary ? formatHours(summary.workedMinutes) : '—'}
                </motion.div>
              </div>

              <div className="text-center">
                <span className={`block text-[10px] font-black uppercase tracking-[0.12em] sm:tracking-[0.24em] ${isToday ? 'text-[#111111]' : 'text-[#9ca3af]'}`}>
                  {day.label}
                </span>
                <span className="mt-1 block whitespace-nowrap text-[10px] font-medium tabular-nums text-[#6b7280]">
                  {summary ? formatHours(summary.workedMinutes) : '—'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
