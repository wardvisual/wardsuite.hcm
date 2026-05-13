import { Edit2, History, Trash2 } from 'lucide-react';
import { DataTable } from '@web/components';
import type { Column } from '@web/components';
import { formatDateTime } from '@web/lib/utils';
import type { AttendancePunch } from '@web/modules/attendance';

interface PunchTableProps {
    punches: AttendancePunch[];
    loading: boolean;
    onEdit: (punch: AttendancePunch) => void;
    onDelete: (punch: AttendancePunch) => void;
    onHistory: (punch: AttendancePunch) => void;
}

export function PunchTable({ punches, loading, onEdit, onDelete, onHistory }: PunchTableProps) {
    const columns: Column<AttendancePunch>[] = [
        { key: 'emp', header: 'Employee', cell: (r) => <span className="font-black text-sm text-[#111111]">{r.employeeCode}</span> },
        {
            key: 'type', header: 'Type', cell: (r) => (
                <span className={`font-bold text-xs px-2.5 py-1 rounded-full ${r.punchType === 'IN' ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f5f5f5] text-[#6b7280]'}`}>
                    {r.punchType}
                </span>
            )
        },
        {
            key: 'time', header: 'Timestamp', cell: (r) => (
                <span className={`text-sm ${r.isEdited ? 'text-amber-600 font-bold' : 'text-[#111111]'}`}>
                    {formatDateTime(r.timestamp)} {r.isEdited && '(edited)'}
                </span>
            )
        },
        { key: 'source', header: 'Source', cell: (r) => <span className="text-xs text-[#6b7280] capitalize">{r.source}</span> },
        {
            key: 'actions', header: '', cell: (r) => (
                <div className="flex items-center gap-2">
                    <button type="button" title="Edit punch" onClick={() => onEdit(r)} className="p-2 rounded-xl hover:bg-[#f5f5f5] text-[#bbbbbb] hover:text-[#111111] transition-all">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button type="button" title="Delete punch" onClick={() => onDelete(r)} className="p-2 rounded-xl hover:bg-red-50 text-[#bbbbbb] hover:text-red-500 transition-all">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button type="button" title="View history" onClick={() => onHistory(r)} className="p-2 rounded-xl hover:bg-[#f5f5f5] text-[#bbbbbb] hover:text-[#111111] transition-all">
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
            keyExtractor={(r) => r.id}
            isLoading={loading}
            emptyMessage="No punches found"
        />
    );
}
