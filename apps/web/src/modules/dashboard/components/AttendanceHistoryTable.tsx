import { useState } from 'react';
import { CalendarDays, ChevronDown, X } from 'lucide-react';
import { DataTable, StatusBadge } from '@web/components';
import type { Column } from '@web/components';
import type { DailySummary } from '@web/modules/attendance';
import { cn, formatDateKey, formatHours, formatMinutes, formatTime } from '@web/lib/utils';

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
  const [filterDate, setFilterDate] = useState('');

  const filtered = filterDate
    ? data.filter((r) => r.dateKey === filterDate)
    : data;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative inline-flex">
          <div className={cn(
            'flex items-center gap-2 h-8 rounded-2xl border px-3 text-xs font-bold select-none transition-all cursor-pointer',
            filterDate
              ? 'border-[#111111] bg-[#111111] text-white'
              : 'border-[#e5e7eb] bg-white text-[#6b7280] shadow-sm hover:border-[#d1d5db]',
          )}>
            <CalendarDays className="h-3 w-3 shrink-0" />
            <span className="whitespace-nowrap">{filterDate ? formatDateKey(filterDate) : 'Filter by date'}</span>
            {!filterDate && <ChevronDown className="h-3 w-3 text-[#9ca3af] shrink-0" />}
          </div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>

        {filterDate && (
          <button
            type="button"
            onClick={() => setFilterDate('')}
            className="inline-flex items-center gap-1 h-8 rounded-2xl border border-[#e5e7eb] bg-white px-2.5 text-xs font-bold text-[#6b7280] shadow-sm hover:border-[#d1d5db] hover:text-[#111111]"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        emptyMessage={filterDate ? `No record for ${formatDateKey(filterDate)}` : 'No attendance records yet'}
      />
    </div>
  );
}
