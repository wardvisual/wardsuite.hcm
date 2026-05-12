import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Calendar, RefreshCw, Download, TrendingUp, Clock, AlertTriangle, Moon } from 'lucide-react';
import { DataTable, StatusBadge, Modal } from '@web/components';
import type { Column } from '@web/components';
import { adminApi } from '../api/admin.api';
import { DailySummary } from '@web/modules/attendance';
import { WeeklySummary } from '../types/admin.types';

type ReportMode = 'daily' | 'weekly';

function fmtH(m: number) { return `${(m / 60).toFixed(1)}h`; }
function fmtM(m: number) { if (m === 0) return '—'; const h = Math.floor(m / 60); const min = m % 60; return h > 0 ? (min > 0 ? `${h}h ${min}m` : `${h}h`) : `${min}m`; }
function fmtTime(iso: string | null) { if (!iso) return '—'; return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }); }
function getTodayKey() { return new Date().toISOString().slice(0, 10); }
function getCurrentWeekKey(): string {
  const now = new Date();
  const tmp = new Date(now);
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() + 4 - (tmp.getDay() || 7));
  const yearStart = new Date(tmp.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${tmp.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}
function statusVariant(s: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (s === 'present') return 'success';
  if (s === 'late') return 'warning';
  if (s === 'half-day') return 'danger';
  return 'neutral';
}

// ── Daily columns ────────────────────────────────────────────────────────────
const dailyColumns: Column<DailySummary>[] = [
  { key: 'emp', header: 'Employee', cell: (r) => <div><p className="font-black text-[#111111] text-sm">{r.employeeCode}</p></div> },
  { key: 'in', header: 'In', cell: (r) => <span className="font-bold text-emerald-700">{fmtTime(r.firstIn)}</span> },
  { key: 'out', header: 'Out', cell: (r) => <span className="text-[#6b7280]">{fmtTime(r.lastOut)}</span> },
  { key: 'worked', header: 'Worked', cell: (r) => <span className="font-bold tabular-nums">{fmtH(r.workedMinutes)}</span> },
  { key: 'regular', header: 'Regular', cell: (r) => <span className="tabular-nums">{fmtH(r.regularMinutes)}</span> },
  { key: 'ot', header: 'OT', cell: (r) => r.overtimeMinutes > 0 ? <span className="font-bold text-emerald-600 tabular-nums">{fmtH(r.overtimeMinutes)}</span> : <span className="text-[#bbbbbb]">—</span> },
  { key: 'nd', header: 'ND', cell: (r) => r.nightDifferentialMinutes > 0 ? <span className="font-bold text-blue-600 tabular-nums">{fmtH(r.nightDifferentialMinutes)}</span> : <span className="text-[#bbbbbb]">—</span> },
  { key: 'late', header: 'Late', cell: (r) => r.lateMinutes > 0 ? <span className="font-bold text-amber-600 tabular-nums">{fmtM(r.lateMinutes)}</span> : <span className="text-[#bbbbbb]">—</span> },
  { key: 'ut', header: 'UT', cell: (r) => r.undertimeMinutes > 0 ? <span className="font-bold text-red-600 tabular-nums">{fmtM(r.undertimeMinutes)}</span> : <span className="text-[#bbbbbb]">—</span> },
  { key: 'status', header: 'Status', cell: (r) => <StatusBadge label={r.status.charAt(0).toUpperCase() + r.status.slice(1)} variant={statusVariant(r.status)} /> },
];

// ── Weekly columns ────────────────────────────────────────────────────────────
const weeklyColumns: Column<WeeklySummary>[] = [
  { key: 'emp', header: 'Employee', cell: (r) => <p className="font-black text-sm text-[#111111]">{r.employeeCode}</p> },
  { key: 'present', header: 'Days Present', cell: (r) => <span className="font-bold tabular-nums">{r.daysPresent}</span> },
  { key: 'worked', header: 'Worked', cell: (r) => <span className="font-bold tabular-nums">{fmtH(r.workedMinutes)}</span> },
  { key: 'regular', header: 'Regular', cell: (r) => <span className="tabular-nums">{fmtH(r.regularMinutes)}</span> },
  { key: 'ot', header: 'OT', cell: (r) => r.overtimeMinutes > 0 ? <span className="font-bold text-emerald-600 tabular-nums">{fmtH(r.overtimeMinutes)}</span> : <span className="text-[#bbbbbb]">—</span> },
  { key: 'nd', header: 'ND', cell: (r) => r.nightDifferentialMinutes > 0 ? <span className="font-bold text-blue-600 tabular-nums">{fmtH(r.nightDifferentialMinutes)}</span> : <span className="text-[#bbbbbb]">—</span> },
  { key: 'late', header: 'Late', cell: (r) => r.lateMinutes > 0 ? <span className="font-bold text-amber-600 tabular-nums">{fmtM(r.lateMinutes)}</span> : <span className="text-[#bbbbbb]">—</span> },
  { key: 'ut', header: 'UT', cell: (r) => r.undertimeMinutes > 0 ? <span className="font-bold text-red-600 tabular-nums">{fmtM(r.undertimeMinutes)}</span> : <span className="text-[#bbbbbb]">—</span> },
];

function SummaryKPI({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border ${color}`}>
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-xs font-black text-[#bbbbbb] uppercase tracking-widest">{label}</p>
        <p className="text-lg font-black text-[#111111] tabular-nums">{value}</p>
      </div>
    </div>
  );
}

export default function AdminReportsPage() {
  const [mode, setMode] = useState<ReportMode>('daily');
  const [dateKey, setDateKey] = useState(getTodayKey());
  const [weekKey, setWeekKey] = useState(getCurrentWeekKey());
  const [dailyData, setDailyData] = useState<DailySummary[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'daily') {
        const data = await adminApi.getDailyReport(dateKey);
        setDailyData(data);
      } else {
        const data = await adminApi.getWeeklyReport(weekKey);
        setWeeklyData(data as WeeklySummary[]);
      }
    } catch (err: any) {
      setError(err.message ?? 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [mode, dateKey, weekKey]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  // Aggregate KPIs
  const kpiData = mode === 'daily' ? dailyData : [];
  const totalWorked = kpiData.reduce((s, r) => s + r.workedMinutes, 0);
  const totalOT = kpiData.reduce((s, r) => s + r.overtimeMinutes, 0);
  const totalND = kpiData.reduce((s, r) => s + r.nightDifferentialMinutes, 0);
  const totalLate = kpiData.reduce((s, r) => s + r.lateMinutes, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111111]">Reports</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">View daily and weekly attendance metrics for all employees.</p>
        </div>
        <button type="button" onClick={fetchReport} className="btn-secondary self-start sm:self-auto">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Mode toggle + date selector */}
      <div className="glass-card p-4 flex flex-wrap gap-4 items-center">
        <div className="flex gap-1 bg-[#f5f5f5] rounded-2xl p-1">
          {(['daily', 'weekly'] as ReportMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all capitalize ${
                mode === m ? 'bg-white text-[#111111] shadow-sm' : 'text-[#bbbbbb] hover:text-[#111111]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === 'daily' ? (
          <input
            type="date"
            value={dateKey}
            onChange={(e) => setDateKey(e.target.value)}
            className="input-theme max-w-[180px]"
          />
        ) : (
          <input
            type="week"
            value={weekKey.replace('W', 'W')}
            onChange={(e) => {
              const v = e.target.value;
              if (v) setWeekKey(v.replace('-W', '-W'));
            }}
            className="input-theme max-w-[180px]"
          />
        )}
      </div>

      {/* KPIs (daily only) */}
      {mode === 'daily' && dailyData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <SummaryKPI icon={<Clock className="w-5 h-5 text-[#111111]" />} label="Total Worked" value={fmtH(totalWorked)} color="bg-[#f5f5f5] border-[#ebebeb]" />
          <SummaryKPI icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} label="Total OT" value={fmtH(totalOT)} color="bg-emerald-50 border-emerald-100" />
          <SummaryKPI icon={<Moon className="w-5 h-5 text-blue-600" />} label="Total ND" value={fmtH(totalND)} color="bg-blue-50 border-blue-100" />
          <SummaryKPI icon={<AlertTriangle className="w-5 h-5 text-amber-600" />} label="Total Late" value={fmtM(totalLate)} color="bg-amber-50 border-amber-100" />
        </motion.div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl">
            {error}
          </div>
        )}

        <h2 className="text-base font-black text-[#111111] mb-4">
          {mode === 'daily' ? `Daily Report — ${dateKey}` : `Weekly Report — ${weekKey}`}
        </h2>

        {mode === 'daily' ? (
          <DataTable
            columns={dailyColumns}
            data={dailyData}
            keyExtractor={(r) => r.id}
            isLoading={loading}
            emptyMessage="No attendance data for this date"
          />
        ) : (
          <DataTable
            columns={weeklyColumns}
            data={weeklyData}
            keyExtractor={(r) => r.id}
            isLoading={loading}
            emptyMessage="No data for this week"
          />
        )}
      </motion.div>
    </div>
  );
}

import React from 'react';
