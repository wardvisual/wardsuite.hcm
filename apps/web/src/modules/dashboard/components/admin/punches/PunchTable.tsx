import { History } from 'lucide-react';
import { DataTable } from '@web/components';
import type { Column } from '@web/components';
import { formatTime } from '@web/lib/utils';
import type { AttendancePunch } from '@web/modules/attendance';

type EmployeePunchRow = {
    employeeCode: string;
    punches: AttendancePunch[];
    latestPunch: AttendancePunch;
    firstPunch: AttendancePunch;
    lastPunch: AttendancePunch;
    punchCount: number;
};

interface PunchTableProps {
    punches: EmployeePunchRow[];
    loading: boolean;
    onHistory: (punches: AttendancePunch[]) => void;
}

export function PunchTable({ punches, loading, onHistory }: PunchTableProps) {
    const columns: Column<EmployeePunchRow>[] = [
        { key: 'emp', header: 'Employee', cell: (r) => <span className="font-black text-sm text-[#111111]">{r.employeeCode}</span> },
        {
            key: 'count', header: 'Punches', cell: (r) => (
                <span className="font-bold text-sm tabular-nums text-[#111111]">{r.punchCount}</span>
            )
        },
        {
            key: 'latest', header: 'Latest', cell: (r) => (
                <span className={`font-bold text-xs px-2.5 py-1 rounded-full ${r.latestPunch.punchType === 'IN' ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f5f5f5] text-[#6b7280]'}`}>
                    {r.latestPunch.punchType}
                </span>
            )
        },
        {
            key: 'first', header: 'First', cell: (r) => (
                <span className="text-sm text-[#111111]">{formatTime(r.firstPunch.timestamp)}</span>
            )
        },
        {
            key: 'last', header: 'Last', cell: (r) => (
                <span className="text-sm text-[#111111]">{formatTime(r.lastPunch.timestamp)}</span>
            )
        },
        { key: 'source', header: 'Source', cell: (r) => <span className="text-xs text-[#6b7280] capitalize">{r.latestPunch.source}</span> },
        {
            key: 'actions', header: '', cell: (r) => (
                <div className="flex items-center gap-2">
                    <button type="button" title="View employee history" onClick={() => onHistory(r.punches)} className="p-2 rounded-xl hover:bg-[#f5f5f5] text-[#bbbbbb] hover:text-[#111111] transition-all">
                        <History className="w-4 h-4" />
                    </button>
                </div>
            )
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={punches}
            keyExtractor={(r) => r.employeeCode}
            isLoading={loading}
            emptyMessage="No punches found"
        />
    );
}
