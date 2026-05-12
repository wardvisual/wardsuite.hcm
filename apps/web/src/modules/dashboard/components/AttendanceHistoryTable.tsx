import { DataTable, StatusBadge } from '@web/components';
import type { Column } from '@web/components';
import type { DailySummary } from '@web/modules/attendance';

function fmtH(m: number): string { return `${(m / 60).toFixed(1)}h`; }
function fmtMin(m: number): string {
  if (m === 0) return '0m';
  const h = Math.floor(m / 60);
  const min = m % 60;
  return h > 0 ? (min > 0 ? `${h}h ${min}m` : `${h}h`) : `${min}m`;
}
function fmtDate(dateKey: string): string {
  return new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', weekday: 'short',
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

const columns: Column<DailySummary>[] = [
  { key: 'date', header: 'Date', cell: (r) => <span className="font-bold text-[#111111]">{fmtDate(r.dateKey)}</span> },
  { key: 'in', header: 'In', cell: (r) => <span className="text-emerald-700 font-bold">{fmtTime(r.firstIn)}</span> },
  { key: 'out', header: 'Out', cell: (r) => <span className="text-[#6b7280]">{fmtTime(r.lastOut)}</span> },
  { key: 'worked', header: 'Worked', cell: (r) => <span className="font-bold tabular-nums">{fmtH(r.workedMinutes)}</span> },
  { key: 'regular', header: 'Regular', cell: (r) => <span className="tabular-nums">{fmtH(r.regularMinutes)}</span> },
  {
    key: 'ot', header: 'OT',
    cell: (r) => r.overtimeMinutes > 0
      ? <span className="font-bold text-emerald-600 tabular-nums">{fmtH(r.overtimeMinutes)}</span>
      : <span className="text-[#bbbbbb]">—</span>,
  },
  {
    key: 'nd', header: 'ND',
    cell: (r) => r.nightDifferentialMinutes > 0
      ? <span className="font-bold text-blue-600 tabular-nums">{fmtH(r.nightDifferentialMinutes)}</span>
      : <span className="text-[#bbbbbb]">—</span>,
  },
  {
    key: 'late', header: 'Late',
    cell: (r) => r.lateMinutes > 0
      ? <span className="font-bold text-amber-600 tabular-nums">{fmtMin(r.lateMinutes)}</span>
      : <span className="text-[#bbbbbb]">—</span>,
  },
  {
    key: 'ut', header: 'UT',
    cell: (r) => r.undertimeMinutes > 0
      ? <span className="font-bold text-red-600 tabular-nums">{fmtMin(r.undertimeMinutes)}</span>
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
