import { DataTable, StatusBadge } from '@web/components';
import type { Column } from '@web/components';
import { formatHours, formatMinutes, formatTime } from '@web/lib/utils';
import type { DailySummary, WeeklySummary } from '@web/modules/attendance';

type ReportMode = 'daily' | 'weekly';

function statusVariant(s: string): 'success' | 'warning' | 'danger' | 'neutral' {
    if (s === 'present') return 'success';
    if (s === 'late') return 'warning';
    if (s === 'half-day') return 'danger';
    return 'neutral';
}

const dailyColumns: Column<DailySummary>[] = [
    { key: 'emp', header: 'Employee', cell: (r) => <p className="font-black text-[#111111] text-sm">{r.employeeCode}</p> },
    { key: 'in', header: 'In', cell: (r) => <span className="font-bold text-emerald-700">{formatTime(r.firstIn)}</span> },
    { key: 'out', header: 'Out', cell: (r) => <span className="text-[#6b7280]">{formatTime(r.lastOut)}</span> },
    { key: 'regular', header: 'Regular', cell: (r) => <span className="tabular-nums">{formatHours(r.regularMinutes)}</span> },
    { key: 'ot', header: 'OT', cell: (r) => r.overtimeMinutes > 0 ? <span className="font-bold text-emerald-600 tabular-nums">{formatHours(r.overtimeMinutes)}</span> : <span className="text-[#bbbbbb]">—</span> },
    { key: 'nd', header: 'ND', cell: (r) => r.nightDifferentialMinutes > 0 ? <span className="font-bold text-blue-600 tabular-nums">{formatHours(r.nightDifferentialMinutes)}</span> : <span className="text-[#bbbbbb]">—</span> },
    { key: 'late', header: 'Late', cell: (r) => r.lateMinutes > 0 ? <span className="font-bold text-amber-600 tabular-nums">{formatMinutes(r.lateMinutes)}</span> : <span className="text-[#bbbbbb]">—</span> },
    { key: 'ut', header: 'UT', cell: (r) => r.undertimeMinutes > 0 ? <span className="font-bold text-red-600 tabular-nums">{formatMinutes(r.undertimeMinutes)}</span> : <span className="text-[#bbbbbb]">—</span> },
    { key: 'status', header: 'Status', cell: (r) => <StatusBadge label={r.status.charAt(0).toUpperCase() + r.status.slice(1)} variant={statusVariant(r.status)} /> },
];

const weeklyColumns: Column<WeeklySummary>[] = [
    { key: 'emp', header: 'Employee', cell: (r) => <p className="font-black text-sm text-[#111111]">{r.employeeCode}</p> },
    { key: 'present', header: 'Days Present', cell: (r) => <span className="font-bold tabular-nums">{r.daysPresent}</span> },
    { key: 'regular', header: 'Regular', cell: (r) => <span className="tabular-nums">{formatHours(r.regularMinutes)}</span> },
    { key: 'ot', header: 'OT', cell: (r) => r.overtimeMinutes > 0 ? <span className="font-bold text-emerald-600 tabular-nums">{formatHours(r.overtimeMinutes)}</span> : <span className="text-[#bbbbbb]">—</span> },
    { key: 'nd', header: 'ND', cell: (r) => r.nightDifferentialMinutes > 0 ? <span className="font-bold text-blue-600 tabular-nums">{formatHours(r.nightDifferentialMinutes)}</span> : <span className="text-[#bbbbbb]">—</span> },
    { key: 'late', header: 'Late', cell: (r) => r.lateMinutes > 0 ? <span className="font-bold text-amber-600 tabular-nums">{formatMinutes(r.lateMinutes)}</span> : <span className="text-[#bbbbbb]">—</span> },
    { key: 'ut', header: 'UT', cell: (r) => r.undertimeMinutes > 0 ? <span className="font-bold text-red-600 tabular-nums">{formatMinutes(r.undertimeMinutes)}</span> : <span className="text-[#bbbbbb]">—</span> },
];

interface ReportTableProps {
    mode: ReportMode;
    dailyData: DailySummary[];
    weeklyData: WeeklySummary[];
    loading: boolean;
    error: string | null;
    dateKey: string;
    weekKey: string;
}

export function ReportTable({ mode, dailyData, weeklyData, loading, error, dateKey, weekKey }: ReportTableProps) {
    return (
        <div className="floating-card p-6">
            {error && (
                <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl">{error}</div>
            )}
            <h3 className="text-sm font-black text-[#111111] mb-4">
                {mode === 'daily' ? `Daily Report — ${dateKey}` : `Weekly Report — ${weekKey}`}
            </h3>
            {mode === 'daily' ? (
                <DataTable columns={dailyColumns} data={dailyData} keyExtractor={(r) => r.id} isLoading={loading} emptyMessage="No attendance data for this date" />
            ) : (
                <DataTable columns={weeklyColumns} data={weeklyData} keyExtractor={(r) => r.id} isLoading={loading} emptyMessage="No data for this week" />
            )}
        </div>
    );
}
