import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { DailySummary } from '@web/modules/attendance';
import { formatHours, formatWeekdayShort, getTodayKey } from '@web/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type InsightView = 'attendance' | 'breakdown';

interface MetricItem {
  key: string;
  label: string;
  sublabel?: string;
  color: string;
  minutes: number;
}

// ─── Donut constants ──────────────────────────────────────────────────────────

const R = 52;
const CX = 70;
const CY = 70;
const SW = 13;
const CIRC = 2 * Math.PI * R;
const GAP = 2.5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildWeekDays(data: DailySummary[], todayKey: string) {
  const currentDate = new Date(`${todayKey}T00:00:00`);
  const dayIndex = currentDate.getDay() || 7;
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - dayIndex + 1);
  return Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dateKey = date.toLocaleDateString('sv-SE').slice(0, 10);
    return {
      dateKey,
      label: formatWeekdayShort(dateKey),
      summary: data.find((d) => d.dateKey === dateKey) ?? null,
    };
  });
}

// ─── Donut arc segment ────────────────────────────────────────────────────────

function DonutArc({
  minutes, total, offset, color, delay,
}: { minutes: number; total: number; offset: number; color: string; delay: number }) {
  if (minutes <= 0 || total <= 0) return null;
  const arcLen = Math.max(0, (minutes / total) * CIRC - GAP);
  return (
    <motion.circle
      cx={CX} cy={CY} r={R} fill="none"
      stroke={color} strokeWidth={SW} strokeLinecap="butt"
      style={{ strokeDashoffset: -(offset - CIRC / 4) }}
      initial={{ strokeDasharray: `0 ${CIRC}` }}
      animate={{ strokeDasharray: `${arcLen} ${CIRC - arcLen}` }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

// ─── Breakdown view ───────────────────────────────────────────────────────────

function BreakdownView({ data }: { data: DailySummary[] }) {
  const totalRegular = data.reduce((s, d) => s + d.regularMinutes, 0);
  const totalOT = data.reduce((s, d) => s + d.overtimeMinutes, 0);
  const totalND = data.reduce((s, d) => s + d.nightDifferentialMinutes, 0);
  const totalLate = data.reduce((s, d) => s + d.lateMinutes, 0);
  const totalUnder = data.reduce((s, d) => s + d.undertimeMinutes, 0);
  const totalWorked = data.reduce((s, d) => s + d.workedMinutes, 0);

  const metrics: MetricItem[] = [
    { key: 'regular', label: 'Regular', color: '#111111', minutes: totalRegular },
    { key: 'overtime', label: 'Overtime', color: '#10b981', minutes: totalOT },
    { key: 'nd', label: 'Night Diff', sublabel: 'of worked hrs', color: '#6366f1', minutes: totalND },
    { key: 'late', label: 'Late', sublabel: 'arrival penalty', color: '#f59e0b', minutes: totalLate },
    { key: 'undertime', label: 'Undertime', sublabel: 'early exit', color: '#ef4444', minutes: totalUnder },
  ].filter((m) => m.minutes > 0);

  const donutItems = metrics.filter((m) => m.key === 'regular' || m.key === 'overtime');
  let cumOffset = 0;
  const donutSegments = donutItems.map((item) => {
    const arcLen = totalWorked > 0 ? (item.minutes / totalWorked) * CIRC : 0;
    const seg = { ...item, arcOffset: cumOffset };
    cumOffset += arcLen;
    return seg;
  });

  if (totalWorked === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-[#bbbbbb]">
        <svg viewBox="0 0 140 140" width={96} height={96}>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f1f1f1" strokeWidth={SW}
            strokeDasharray={`${CIRC * 0.65} ${CIRC * 0.35}`}
            strokeDashoffset={-(0 - CIRC / 4)} strokeLinecap="round" />
        </svg>
        <p className="text-sm font-medium">No records this week</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      {/* Donut */}
      <div className="shrink-0 flex justify-center">
        <svg viewBox="0 0 140 140" width={148} height={148}>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f3f4f6" strokeWidth={SW} />
          {donutSegments.map((seg, i) => (
            <DonutArc key={seg.key} minutes={seg.minutes} total={totalWorked}
              offset={seg.arcOffset} color={seg.color} delay={i * 0.15} />
          ))}
          <text x={CX} y={CY - 7} textAnchor="middle"
            style={{ fontSize: '17px', fontWeight: 900, fill: '#111111', fontFamily: 'inherit' }}>
            {formatHours(totalWorked)}
          </text>
          <text x={CX} y={CY + 9} textAnchor="middle"
            style={{ fontSize: '8.5px', fontWeight: 700, fill: '#9ca3af', letterSpacing: '0.08em', fontFamily: 'inherit' }}>
            THIS WEEK
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-3.5 min-w-0">
        {metrics.map((item, i) => {
          const pct = totalWorked > 0 ? (item.minutes / totalWorked) * 100 : 0;
          return (
            <div key={item.key}>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-bold text-[#374151] truncate">{item.label}</span>
                  {item.sublabel && (
                    <span className="text-[10px] text-[#9ca3af] hidden sm:inline shrink-0">
                      ({item.sublabel})
                    </span>
                  )}
                </div>
                <span className="text-xs font-black text-[#111111] tabular-nums shrink-0">
                  {formatHours(item.minutes)}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#f3f4f6] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(pct, 100)}%` }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Attendance bar chart view ────────────────────────────────────────────────

function AttendanceView({ data }: { data: DailySummary[] }) {
  const todayKey = getTodayKey();
  const weekDays = buildWeekDays(data, todayKey);
  const actualData = data.filter((d) => d.status !== 'absent');
  const maxMin = Math.max(...actualData.map((d) => d.workedMinutes), 1);

  const totalWorked = weekDays.reduce((s, d) => s + (d.summary?.workedMinutes ?? 0), 0);
  const totalRegular = weekDays.reduce((s, d) => s + (d.summary?.regularMinutes ?? 0), 0);
  const totalOT = weekDays.reduce((s, d) => s + (d.summary?.overtimeMinutes ?? 0), 0);
  const totalND = weekDays.reduce((s, d) => s + (d.summary?.nightDifferentialMinutes ?? 0), 0);
  const totalLate = weekDays.reduce((s, d) => s + (d.summary?.lateMinutes ?? 0), 0);
  const totalUnder = weekDays.reduce((s, d) => s + (d.summary?.undertimeMinutes ?? 0), 0);

  const summaryPills = [
    { color: '#111111', label: 'Regular', value: totalRegular },
    { color: '#10b981', label: 'OT', value: totalOT },
    ...(totalND > 0 ? [{ color: '#6366f1', label: 'Night Diff', value: totalND }] : []),
    ...(totalLate > 0 ? [{ color: '#f59e0b', label: 'Late', value: totalLate }] : []),
    ...(totalUnder > 0 ? [{ color: '#ef4444', label: 'Undertime', value: totalUnder }] : []),
  ];

  return (
    <div>
      {/* Weekly totals header */}
      <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-[#f5f5f5] pb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black tabular-nums text-[#111111]">{formatHours(totalWorked)}</span>
          <span className="text-xs font-bold text-[#9ca3af]">worked this week</span>
        </div>
        <div className="ml-auto flex flex-wrap gap-1.5">
          {summaryPills.map((pill) => (
            <span
              key={pill.label}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#f1f1f1] bg-[#fafafa] px-2.5 py-1 text-[11px] font-bold text-[#6b7280]"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: pill.color }} />
              {pill.label} {formatHours(pill.value)}
            </span>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex h-52 items-end gap-1.5 sm:gap-2.5">
        {weekDays.map((day, i) => {
          const s = day.summary;
          const hasData = Boolean(s && s.status !== 'absent' && s.workedMinutes > 0);
          const regPct = hasData && s ? (s.regularMinutes / maxMin) * 100 : 0;
          const otPct = hasData && s ? (s.overtimeMinutes / maxMin) * 100 : 0;
          const isToday = day.dateKey === todayKey;
          const isLate = Boolean(s && s.lateMinutes > 0);
          const hasND = Boolean(s && s.nightDifferentialMinutes > 0);
          const hasUnder = Boolean(s && s.undertimeMinutes > 0);

          return (
            <div key={day.dateKey} className="group relative flex min-w-0 flex-1 flex-col items-center gap-1.5">
              {/* Hover tooltip */}
              <div className="pointer-events-none absolute -top-2 left-1/2 z-20 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="w-max min-w-[130px] rounded-2xl bg-[#111111] px-3.5 py-3 shadow-xl">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-[#6b7280]">{day.label}</p>
                  {hasData && s ? (
                    <div className="space-y-1.5">
                      {[
                        { label: 'Worked', value: s.workedMinutes, color: '#ffffff' },
                        { label: 'Regular', value: s.regularMinutes, color: '#9ca3af' },
                        { label: 'Overtime', value: s.overtimeMinutes, color: '#34d399' },
                        { label: 'Night Diff', value: s.nightDifferentialMinutes, color: '#a5b4fc' },
                        { label: 'Late', value: s.lateMinutes, color: '#fcd34d' },
                        { label: 'Undertime', value: s.undertimeMinutes, color: '#fca5a5' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="flex items-center justify-between gap-4">
                          <span className="text-[10px] font-medium text-[#6b7280]">{label}</span>
                          <span
                            className="text-[10px] font-black tabular-nums"
                            style={{ color: value > 0 ? color : '#374151' }}
                          >
                            {value > 0 ? formatHours(value) : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] font-medium text-[#4b5563]">No records</p>
                  )}
                </div>
                <div className="mx-auto h-0 w-0 border-x-[5px] border-t-[5px] border-x-transparent border-t-[#111111]" />
              </div>

              {/* Bar container */}
              <div
                className={`relative flex h-40 w-full items-end justify-center overflow-hidden rounded-2xl p-1 ring-1 transition-shadow group-hover:shadow-md ${
                  isToday
                    ? 'ring-[#111111]'
                    : hasData
                    ? 'bg-[#fafafa] ring-[#f1f1f1]'
                    : 'bg-white ring-[#e5e7eb] ring-dashed'
                }`}
              >
                {/* Regular bar */}
                {hasData ? (
                  <motion.div
                    className="absolute inset-x-1.5 bottom-2 rounded-[16px] bg-[#111111] shadow-[0_8px_20px_rgba(15,23,42,0.15)] sm:inset-x-2"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(regPct, 8)}%` }}
                    transition={{ delay: i * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  />
                ) : (
                  <div
                    className="absolute inset-x-1.5 bottom-2 rounded-[16px] border border-[#e5e7eb] bg-white sm:inset-x-2"
                    style={{ height: '8%' }}
                  />
                )}

                {/* OT bar */}
                {hasData && s && s.overtimeMinutes > 0 && (
                  <motion.div
                    className="absolute inset-x-1.5 rounded-[16px] bg-emerald-500 opacity-90 shadow-[0_10px_24px_rgba(16,185,129,0.18)] sm:inset-x-2"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(otPct, 4)}%` }}
                    transition={{ delay: i * 0.06 + 0.15, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                    style={{ bottom: `${Math.max(regPct, 8)}%` }}
                  />
                )}

                {/* Late strip */}
                {isLate && (
                  <div className="absolute inset-x-1.5 bottom-2 z-10 h-1 rounded-b-[16px] bg-amber-400 sm:inset-x-2" />
                )}
              </div>

              {/* Label */}
              <div className="flex flex-col items-center gap-0.5">
                <span
                  className={`text-[10px] font-black uppercase tracking-[0.1em] ${
                    isToday ? 'text-[#111111]' : 'text-[#9ca3af]'
                  }`}
                >
                  {day.label}
                </span>
                <span className="whitespace-nowrap text-[10px] tabular-nums font-medium text-[#6b7280]">
                  {s ? formatHours(s.workedMinutes) : '—'}
                </span>
                {(hasND || hasUnder) && (
                  <div className="flex items-center gap-1">
                    {hasND && <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />}
                    {hasUnder && <span className="h-1.5 w-1.5 rounded-full bg-red-400" />}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart legend */}
      <div className="mt-5 flex flex-wrap gap-3 border-t border-[#f5f5f5] pt-4 text-[11px] font-bold text-[#6b7280]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#111111]" /> Regular
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Overtime
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1 w-4 rounded-sm bg-amber-400" /> Late
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> Night Diff
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> Undertime
        </span>
      </div>
    </div>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────

export function WeeklyInsightsCard({ data }: { data: DailySummary[] }) {
  const [view, setView] = useState<InsightView>('attendance');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="floating-card p-6"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-black text-[#111111]">Weekly Insights</h2>
          <p className="mt-1 text-xs text-[#6b7280]">Your time records for this week.</p>
        </div>
        <div className="flex shrink-0 gap-1 self-start rounded-2xl bg-[#f5f5f5] p-1">
          {(['attendance', 'breakdown'] as InsightView[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold capitalize transition-all ${
                view === v
                  ? 'bg-white text-[#111111] shadow-sm'
                  : 'text-[#bbbbbb] hover:text-[#111111]'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'attendance' ? (
          <motion.div
            key="attendance"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.18 }}
          >
            <AttendanceView data={data} />
          </motion.div>
        ) : (
          <motion.div
            key="breakdown"
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.18 }}
          >
            <BreakdownView data={data} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
