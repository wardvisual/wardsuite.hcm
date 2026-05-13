import { DataTable, StatusBadge } from '@web/components';
import type { Column } from '@web/components';
import type { DailySummary } from '@web/modules/attendance';
import { formatDateKey, formatHours, formatMinutes, formatTime } from '@web/lib/utils';
function statusVariant(s: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (s === 'present') return 'success';
  if (s === 'late') return 'warning';
  if (s === 'half-day') return 'danger';
  return 'neutral';
}

const columns: Column<DailySummary>[] = [
  { key: 'date', header: 'Date', cell: (r) => <span className="font-bold text-[#111111]">{formatDateKey(r.dateKey)}</span> },
  { key: 'in', header: 'In', cell: (r) => <span className="text-emerald-700 font-bold">{formatTime(r.firstIn)}</span> },
  { key: 'out', header: 'Out', cell: (r) => <span className="text-[#6b7280]">{formatTime(r.lastOut)}</span> },
  { key: 'regular', header: 'Regular', cell: (r) => <span className="tabular-nums">{formatHours(r.regularMinutes)}</span> },
  {
    key: 'ot', header: 'OT',
    cell: (r) => r.overtimeMinutes > 0
      ? <span className="font-bold text-emerald-600 tabular-nums">{formatHours(r.overtimeMinutes)}</span>
      : <span className="text-[#bbbbbb]">—</span>,
  },
  {
    key: 'nd', header: 'ND',
    cell: (r) => r.nightDifferentialMinutes > 0
      ? <span className="font-bold text-blue-600 tabular-nums">{formatHours(r.nightDifferentialMinutes)}</span>
      : <span className="text-[#bbbbbb]">—</span>,
  },
  {
    key: 'late', header: 'Late',
    cell: (r) => r.lateMinutes > 0
      ? <span className="font-bold text-amber-600 tabular-nums">{formatMinutes(r.lateMinutes)}</span>
      : <span className="text-[#bbbbbb]">—</span>,
  },
  {
    key: 'ut', header: 'UT',
    cell: (r) => r.undertimeMinutes > 0
      ? <span className="font-bold text-red-600 tabular-nums">{formatMinutes(r.undertimeMinutes)}</span>
      : <span className="text-[#bbbbbb]">—</span>,
  },
  {
    key: 'status', header: 'Status',
    cell: (r) => (
      <StatusBadge
        label={r.status.charAt(0).toUpperCase() + r.status.slice(1)}
        variant={statusVariant(r.status)}
      />
    ),
  },
];

interface AttendanceHistoryTableProps {
  data: DailySummary[];
  isLoading?: boolean;
}

export function AttendanceHistoryTable({ data, isLoading }: AttendanceHistoryTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      keyExtractor={(r) => r.id}
      isLoading={isLoading}
      emptyMessage="No attendance records yet"
    />
  );
}
