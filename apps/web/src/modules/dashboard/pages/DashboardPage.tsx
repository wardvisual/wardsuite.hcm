import { motion } from 'motion/react';
import {
  Clock,
  TrendingUp,
  Moon,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Timer,
} from 'lucide-react';
import { DataTable, StatusBadge } from '@web/components';
import type { Column } from '@web/components';
import { useDashboard } from '../hooks/useDashboard';
import { DailySummary } from '@web/modules/attendance';

function fmtH(minutes: number): string {
  const h = (minutes / 60).toFixed(1);
  return `${h}h`;
}
function fmtMinutes(m: number): string {
  if (m === 0) return '0m';
  const h = Math.floor(m / 60);
  const min = m % 60;
  return h > 0 ? (min > 0 ? `${h}h ${min}m` : `${h}h`) : `${min}m`;
}
function fmtDate(dateKey: string): string {
  return new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });
}
function fmtTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function statusVariant(s: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (s === 'present') return 'success';
  if (s === 'late') return 'warning';
  if (s === 'half-day') return 'danger';
  return 'neutral';
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
  delay?: number;
}
function KPICard({ icon, label, value, sub, color, delay = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card p-5 flex items-start gap-4"
    >
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black text-[#bbbbbb] uppercase tracking-widest truncate">{label}</p>
        <p className="text-2xl font-black text-[#111111] mt-0.5 tabular-nums">{value}</p>
        {sub && <p className="text-xs text-[#6b7280] mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

// ── Weekly Bar Chart ──────────────────────────────────────────────────────────
function WeeklyChart({ data }: { data: DailySummary[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-[#bbbbbb] text-sm">
        No data for this period
      </div>
    );
  }

  const maxMinutes = Math.max(...data.map((d) => d.workedMinutes), 1);

  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((day, i) => {
        const regularPct = (day.regularMinutes / maxMinutes) * 100;
        const otPct = (day.overtimeMinutes / maxMinutes) * 100;
        const label = new Date(day.dateKey + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'short',
        });
        const isToday = day.dateKey === new Date().toISOString().slice(0, 10);

        return (
          <div key={day.dateKey} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full flex flex-col justify-end" style={{ height: '96px' }}>
              {/* Regular hours bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${regularPct}%` }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`w-full rounded-t-lg ${isToday ? 'bg-[#111111]' : 'bg-[#e5e7eb]'}`}
              />
              {/* OT bar on top */}
              {day.overtimeMinutes > 0 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${otPct}%` }}
                  transition={{ delay: i * 0.05 + 0.2, duration: 0.4 }}
                  className="absolute bottom-0 w-full rounded-t-lg bg-emerald-400 opacity-70"
                  style={{ bottom: `${regularPct}%` }}
                />
              )}
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#111111] text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
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

// ── History columns ───────────────────────────────────────────────────────────
const historyColumns: Column<DailySummary>[] = [
  {
    key: 'date',
    header: 'Date',
    cell: (row) => (
      <span className="font-bold text-[#111111]">{fmtDate(row.dateKey)}</span>
    ),
  },
  {
    key: 'in',
    header: 'In',
    cell: (row) => <span className="text-emerald-700 font-bold">{fmtTime(row.firstIn)}</span>,
  },
  {
    key: 'out',
    header: 'Out',
    cell: (row) => <span className="text-[#6b7280]">{fmtTime(row.lastOut)}</span>,
  },
  {
    key: 'worked',
    header: 'Worked',
    cell: (row) => <span className="font-bold tabular-nums">{fmtH(row.workedMinutes)}</span>,
  },
  {
    key: 'regular',
    header: 'Regular',
    cell: (row) => <span className="tabular-nums">{fmtH(row.regularMinutes)}</span>,
  },
  {
    key: 'ot',
    header: 'OT',
    cell: (row) =>
      row.overtimeMinutes > 0 ? (
        <span className="font-bold text-emerald-600 tabular-nums">{fmtH(row.overtimeMinutes)}</span>
      ) : (
        <span className="text-[#bbbbbb]">—</span>
      ),
  },
  {
    key: 'nd',
    header: 'ND',
    cell: (row) =>
      row.nightDifferentialMinutes > 0 ? (
        <span className="font-bold text-blue-600 tabular-nums">{fmtH(row.nightDifferentialMinutes)}</span>
      ) : (
        <span className="text-[#bbbbbb]">—</span>
      ),
  },
  {
    key: 'late',
    header: 'Late',
    cell: (row) =>
      row.lateMinutes > 0 ? (
        <span className="font-bold text-amber-600 tabular-nums">{fmtMinutes(row.lateMinutes)}</span>
      ) : (
        <span className="text-[#bbbbbb]">—</span>
      ),
  },
  {
    key: 'undertime',
    header: 'UT',
    cell: (row) =>
      row.undertimeMinutes > 0 ? (
        <span className="font-bold text-red-600 tabular-nums">{fmtMinutes(row.undertimeMinutes)}</span>
      ) : (
        <span className="text-[#bbbbbb]">—</span>
      ),
  },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => (
      <StatusBadge
        label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        variant={statusVariant(row.status)}
      />
    ),
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, todaySummary, history, last7, todayLoading } = useDashboard();

  const workedToday = todaySummary?.workedMinutes ?? 0;
  const regularToday = todaySummary?.regularMinutes ?? 0;
  const otToday = todaySummary?.overtimeMinutes ?? 0;
  const ndToday = todaySummary?.nightDifferentialMinutes ?? 0;
  const lateToday = todaySummary?.lateMinutes ?? 0;
  const undertimeToday = todaySummary?.undertimeMinutes ?? 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-black text-[#111111]">
          {greeting()}, {user?.name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="text-sm text-[#6b7280] mt-0.5">
          Here's your attendance summary for today.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={<Clock className="w-5 h-5 text-[#111111]" />}
          label="Worked Today"
          value={todayLoading ? '—' : fmtH(workedToday)}
          sub={`Regular: ${fmtH(regularToday)}`}
          color="bg-[#f5f5f5]"
          delay={0}
        />
        <KPICard
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          label="Overtime"
          value={todayLoading ? '—' : fmtH(otToday)}
          sub={otToday > 0 ? 'Beyond shift' : 'None today'}
          color="bg-emerald-50"
          delay={0.05}
        />
        <KPICard
          icon={<Moon className="w-5 h-5 text-blue-600" />}
          label="Night Diff"
          value={todayLoading ? '—' : fmtH(ndToday)}
          sub="22:00 – 06:00"
          color="bg-blue-50"
          delay={0.1}
        />
        <KPICard
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          label="Late / UT"
          value={todayLoading ? '—' : `${fmtMinutes(lateToday)} / ${fmtMinutes(undertimeToday)}`}
          sub={lateToday === 0 && undertimeToday === 0 ? 'On time today!' : 'Deductions'}
          color="bg-amber-50"
          delay={0.15}
        />
      </div>

      {/* Today's status card */}
      {todaySummary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 flex flex-wrap items-center gap-4"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-xs text-[#bbbbbb] font-black uppercase tracking-widest">Today's Status</p>
              <p className="text-base font-black text-[#111111] capitalize">{todaySummary.status}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-[#f1f1f1] hidden sm:block" />
          <div className="flex items-center gap-3">
            <Timer className="w-5 h-5 text-[#6b7280]" />
            <div>
              <p className="text-xs text-[#bbbbbb] font-black uppercase tracking-widest">First In</p>
              <p className="text-base font-black text-[#111111]">{fmtTime(todaySummary.firstIn)}</p>
            </div>
          </div>
          {todaySummary.lastOut && (
            <>
              <div className="h-8 w-px bg-[#f1f1f1] hidden sm:block" />
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-[#6b7280]" />
                <div>
                  <p className="text-xs text-[#bbbbbb] font-black uppercase tracking-widest">Last Out</p>
                  <p className="text-base font-black text-[#111111]">{fmtTime(todaySummary.lastOut)}</p>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Weekly chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black text-[#111111]">Weekly Attendance</h2>
          <div className="flex items-center gap-3 text-xs text-[#bbbbbb]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#111111] inline-block" />
              Regular
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />
              OT
            </span>
          </div>
        </div>
        <WeeklyChart data={last7} />
      </motion.div>

      {/* History table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h2 className="text-base font-black text-[#111111] mb-4">Attendance History</h2>
        <DataTable
          columns={historyColumns}
          data={history}
          keyExtractor={(row) => row.id}
          emptyMessage="No attendance records yet"
        />
      </motion.div>
    </div>
  );
}

import React from 'react';
