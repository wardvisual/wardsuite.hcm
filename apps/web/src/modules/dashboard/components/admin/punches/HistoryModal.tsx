import { motion } from 'motion/react';
import { ArrowRightLeft, CalendarDays, Clock3, LogIn, LogOut, PencilLine, Trash2 } from 'lucide-react';
import { Drawer } from '@web/components';
import { cn, formatDetailedDateTime, formatTime } from '@web/lib/utils';
import type { AttendanceHistory } from '@web/modules/attendance/types/attendance.types';

interface HistoryModalProps {
    open: boolean;
    history: AttendanceHistory[];
    loading: boolean;
    onClose: () => void;
}

export function HistoryModal({ open, history, loading, onClose }: HistoryModalProps) {
    const sortedHistory = [...history].sort(
        (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
    );

    const getPunchType = (item: AttendanceHistory) => item.after?.punchType ?? item.before?.punchType ?? null;

    const getTone = (item: AttendanceHistory) => {
        const punchType = getPunchType(item);
        if (punchType === 'IN') return 'emerald';
        if (punchType === 'OUT') return 'slate';
        if (item.action === 'DELETE_PUNCH') return 'rose';
        if (item.action === 'MANUAL_ADJUSTMENT') return 'amber';
        return 'blue';
    };

    const getIcon = (item: AttendanceHistory) => {
        const punchType = getPunchType(item);
        if (punchType === 'IN') return LogIn;
        if (punchType === 'OUT') return LogOut;
        if (item.action === 'DELETE_PUNCH') return Trash2;
        if (item.action === 'MANUAL_ADJUSTMENT') return PencilLine;
        return ArrowRightLeft;
    };

    return (
        <Drawer
            isOpen={open}
            onClose={onClose}
            title="Punch Audit Trail"
            description="Audit events rendered from the employee punch perspective."
        >
            <div className="space-y-4">
                {loading ? (
                    <div className="rounded-3xl border border-dashed border-[#e5e7eb] bg-white px-4 py-10 text-center">
                        <p className="text-sm font-medium text-[#6b7280]">Loading history…</p>
                    </div>
                ) : sortedHistory.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-[#e5e7eb] bg-white px-4 py-10 text-center">
                        <p className="text-sm font-medium text-[#6b7280]">No edit history for this punch</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedHistory.map((item, index) => {
                            const tone = getTone(item);
                            const punchType = getPunchType(item);
                            const Icon = getIcon(item);
                            const beforeType = item.before?.punchType ?? null;
                            const afterType = item.after?.punchType ?? null;
                            const beforeTime = item.before?.timestamp ?? null;
                            const afterTime = item.after?.timestamp ?? null;
                            const eventTime = afterTime ?? beforeTime ?? item.changedAt;

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    className={cn(
                                        'relative overflow-hidden rounded-3xl border bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]',
                                        tone === 'emerald' && 'border-emerald-100',
                                        tone === 'slate' && 'border-slate-200',
                                        tone === 'rose' && 'border-rose-100',
                                        tone === 'amber' && 'border-amber-100',
                                        tone === 'blue' && 'border-blue-100',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'absolute inset-y-0 left-0 w-1',
                                            tone === 'emerald' && 'bg-emerald-500',
                                            tone === 'slate' && 'bg-slate-400',
                                            tone === 'rose' && 'bg-rose-500',
                                            tone === 'amber' && 'bg-amber-500',
                                            tone === 'blue' && 'bg-blue-500',
                                        )}
                                    />

                                    <div className="flex items-start gap-3 pl-2">
                                        <div
                                            className={cn(
                                                'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                                                tone === 'emerald' && 'bg-emerald-50 text-emerald-600',
                                                tone === 'slate' && 'bg-slate-100 text-slate-600',
                                                tone === 'rose' && 'bg-rose-50 text-rose-600',
                                                tone === 'amber' && 'bg-amber-50 text-amber-600',
                                                tone === 'blue' && 'bg-blue-50 text-blue-600',
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-[#111111] capitalize">
                                                        {item.action.replace(/_/g, ' ').toLowerCase()}
                                                    </p>
                                                    <p className="mt-1 text-xs text-[#6b7280]">{formatDetailedDateTime(item.changedAt)}</p>
                                                </div>
                                                {punchType && (
                                                    <span
                                                        className={cn(
                                                            'rounded-full px-2.5 py-1 text-[11px] font-black tracking-[0.2em]',
                                                            punchType === 'IN' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600',
                                                        )}
                                                    >
                                                        {punchType}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                                <div className="rounded-2xl bg-[#fafafa] p-3 text-xs text-[#6b7280]">
                                                    <div className="flex items-center gap-1.5 font-black uppercase tracking-[0.2em] text-[#bbbbbb]">
                                                        <CalendarDays className="h-3.5 w-3.5" />
                                                        Before
                                                    </div>
                                                    <p className="mt-2 font-bold text-[#111111]">
                                                        {beforeType ? `Punch ${beforeType}` : 'No previous punch'}
                                                    </p>
                                                    <p className="mt-1 tabular-nums">{beforeTime ? formatTime(beforeTime) : '—'}</p>
                                                </div>

                                                <div className="rounded-2xl bg-[#fafafa] p-3 text-xs text-[#6b7280]">
                                                    <div className="flex items-center gap-1.5 font-black uppercase tracking-[0.2em] text-[#bbbbbb]">
                                                        <Clock3 className="h-3.5 w-3.5" />
                                                        After
                                                    </div>
                                                    <p className="mt-2 font-bold text-[#111111]">
                                                        {afterType ? `Punch ${afterType}` : 'No updated punch'}
                                                    </p>
                                                    <p className="mt-1 tabular-nums">{afterTime ? formatTime(afterTime) : '—'}</p>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fafafa] px-2.5 py-1 text-[#6b7280]">
                                                    Employee {item.employeeCode}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fafafa] px-2.5 py-1 text-[#6b7280]">
                                                    {item.changedByRole}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fafafa] px-2.5 py-1 text-[#6b7280] tabular-nums">
                                                    {formatTime(eventTime)}
                                                </span>
                                            </div>

                                            {item.reason && <p className="mt-3 text-xs text-[#6b7280]">Reason: {item.reason}</p>}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Drawer>
    );
}
