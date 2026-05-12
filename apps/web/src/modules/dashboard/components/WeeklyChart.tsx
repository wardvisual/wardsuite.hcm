import { motion } from 'motion/react';
import type { DailySummary } from '@web/modules/attendance';

function fmtH(m: number): string { return `${(m / 60).toFixed(1)}h`; }

interface WeeklyChartProps {
  data: DailySummary[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-28 text-[#bbbbbb] text-sm">
        No data yet
      </div>
    );
  }

  const maxMin = Math.max(...data.map((d) => d.workedMinutes), 1);

  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((day, i) => {
        const regPct = (day.regularMinutes / maxMin) * 100;
        const otPct = (day.overtimeMinutes / maxMin) * 100;
        const label = new Date(day.dateKey + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
        const isToday = day.dateKey === new Date().toISOString().slice(0, 10);
        return (
          <div key={day.dateKey} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full flex flex-col justify-end" style={{ height: 96 }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${regPct}%` }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`w-full rounded-t-lg ${isToday ? 'bg-[#111111]' : 'bg-[#e5e7eb]'}`}
              />
              {day.overtimeMinutes > 0 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${otPct}%` }}
                  transition={{ delay: i * 0.05 + 0.2, duration: 0.4 }}
                  className="absolute w-full rounded-t-lg bg-emerald-400 opacity-70"
                  style={{ bottom: `${regPct}%` }}
                />
              )}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#111111] text-white text-[9px] font-bold px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {fmtH(day.workedMinutes)}
              </div>
            </div>
            <span className={`text-[10px] font-bold ${isToday ? 'text-[#111111]' : 'text-[#bbbbbb]'}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
