import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { CalendarDays, Clock3, LogIn, LogOut } from 'lucide-react';
import { Drawer } from '@web/components';
import { useAuthStore } from '@web/modules/auth/store/auth.store';
import { attendanceApi } from '@web/modules/attendance/api/attendance.api';
import type { AttendancePunch } from '@web/modules/attendance';
import { ActivePeriodPicker } from '@web/modules/dashboard/components/admin/common/ActivePeriodPicker';
import { cn, formatDetailedDateTime, formatTime } from '@web/lib/utils';

interface PunchHistoryDrawerProps {
    open: boolean;
    onClose: () => void;
}

const PAGE_SIZE = 20;
const SCROLL_THRESHOLD_PX = 180;
const MAX_RENDERED_PUNCHES = 60;

type FilterPunchType = 'ALL' | 'IN' | 'OUT';

function mergePunches(current: AttendancePunch[], next: AttendancePunch[]) {
    return [...new Map([...current, ...next].map((punch) => [punch.id, punch])).values()].sort(
        (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
    );
}

function trimPunches(punches: AttendancePunch[]) {
    return punches.length > MAX_RENDERED_PUNCHES ? punches.slice(0, MAX_RENDERED_PUNCHES) : punches;
}

export function PunchHistoryDrawer({ open, onClose }: PunchHistoryDrawerProps) {
    const { user } = useAuthStore();
    const userId = user?.uid ?? user?.id ?? null;
    const [selectedDateKey, setSelectedDateKey] = useState('');
    const [historyPunchType, setHistoryPunchType] = useState<FilterPunchType>('ALL');
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [punches, setPunches] = useState<AttendancePunch[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loadingInitial, setLoadingInitial] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPage = useCallback(async (mode: 'refresh' | 'more') => {
        if (!userId) return;
        if (mode === 'more' && (!hasMore || loadingMore || loadingInitial)) return;
        if (mode === 'refresh' && loadingMore) return;

        if (mode === 'more') {
            setLoadingMore(true);
        } else {
            setLoadingInitial(true);
        }

        setError(null);

        try {
            const page = await attendanceApi.getPunchHistoryPage(
                PAGE_SIZE,
                mode === 'more' ? nextCursor ?? undefined : undefined,
                {
                    fromDate: selectedDateKey || undefined,
                    toDate: selectedDateKey || undefined,
                    punchType: historyPunchType === 'ALL' ? undefined : historyPunchType,
                },
            );

            setPunches((current) => {
                const merged = mode === 'more' ? mergePunches(current, page.items) : mergePunches([], page.items);
                return trimPunches(merged);
            });
            setNextCursor(page.nextCursor);
            setHasMore(page.hasMore);
        } catch (err: any) {
            setError(err.message ?? 'Failed to load punch history');
        } finally {
            setLoadingInitial(false);
            setLoadingMore(false);
        }
    }, [hasMore, selectedDateKey, historyPunchType, loadingInitial, loadingMore, nextCursor, userId]);

    useEffect(() => {
        if (open) return;
        setPunches([]);
        setNextCursor(null);
        setHasMore(true);
        setSelectedDateKey('');
        setHistoryPunchType('ALL');
        setError(null);
    }, [open]);

    useEffect(() => {
        if (!open || !userId) return;
        void loadPage('refresh');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, userId, selectedDateKey, historyPunchType]);

    const sortedPunches = useMemo(() => punches, [punches]);

    const availableDates = useMemo(
        () => [...new Set(punches.map((p) => p.dateKey))].sort((a, b) => b.localeCompare(a)),
        [punches],
    );

    const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        const element = event.currentTarget;
        const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
        if (distanceFromBottom < SCROLL_THRESHOLD_PX && hasMore && !loadingMore && !loadingInitial) {
            void loadPage('more');
        }
    }, [hasMore, loadingInitial, loadingMore, loadPage]);

    return (
        <Drawer
            isOpen={open}
            onClose={onClose}
            title="Punch History"
            description="Employee punch history with date and punch-type filters."
        >
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-[#f1f1f1] bg-[#fafafa] p-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#bbbbbb]">Date</span>
                        <ActivePeriodPicker
                            mode="daily"
                            value={selectedDateKey}
                            onChange={setSelectedDateKey}
                            allowAll
                            staticOptions={availableDates}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#bbbbbb]">Type</span>
                        <select value={historyPunchType} onChange={(e) => setHistoryPunchType(e.target.value as FilterPunchType)} className="input-theme h-9 py-0 min-w-[80px]">
                            <option value="ALL">All</option>
                            <option value="IN">IN</option>
                            <option value="OUT">OUT</option>
                        </select>
                    </div>
                    {(selectedDateKey || historyPunchType !== 'ALL') && (
                        <button
                            type="button"
                            onClick={() => { setSelectedDateKey(''); setHistoryPunchType('ALL'); }}
                            className="ml-auto rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-xs font-bold text-[#111111]"
                        >
                            Clear
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-3xl border border-[#f1f1f1] bg-[#fafafa] p-4">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#bbbbbb]">Records</p>
                        <p className="mt-1 text-lg font-black text-[#111111]">{sortedPunches.length}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#bbbbbb]">Latest</p>
                        <p className="mt-1 text-sm font-bold text-[#111111]">
                            {sortedPunches[0] ? formatDetailedDateTime(sortedPunches[0].timestamp) : 'No punches yet'}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
                        {error}
                    </div>
                )}

                {loadingInitial && sortedPunches.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-[#e5e7eb] bg-white px-4 py-10 text-center">
                        <p className="text-sm font-medium text-[#6b7280]">Loading punch history...</p>
                    </div>
                ) : sortedPunches.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-[#e5e7eb] bg-white px-4 py-10 text-center">
                        <p className="text-sm font-medium text-[#6b7280]">No punches yet</p>
                    </div>
                ) : (
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="max-h-[calc(100dvh-17rem)] space-y-3 overflow-y-auto pr-1"
                    >
                        {sortedPunches.map((p, index) => {
                            const isIn = p.punchType === 'IN';
                            const Icon = isIn ? LogIn : LogOut;

                            return (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    className={cn(
                                        'relative overflow-hidden rounded-3xl border bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]',
                                        isIn ? 'border-emerald-100' : 'border-slate-200',
                                    )}
                                >
                                    <div className={cn('absolute inset-y-0 left-0 w-1', isIn ? 'bg-emerald-500' : 'bg-slate-400')} />
                                    <div className="flex items-start gap-3 pl-2">
                                        <div className={cn('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', isIn ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600')}>
                                            <Icon className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-[#111111]">Punch {p.punchType}</p>
                                                    <p className="mt-1 text-xs text-[#6b7280]">{formatDetailedDateTime(p.timestamp)}</p>
                                                </div>
                                                <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-black tracking-[0.2em]', isIn ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600')}>
                                                    {p.punchType}
                                                </span>
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fafafa] px-2.5 py-1 text-[#6b7280]">
                                                    <CalendarDays className="h-3.5 w-3.5" />
                                                    {p.dateKey}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fafafa] px-2.5 py-1 text-[#6b7280]">
                                                    <Clock3 className="h-3.5 w-3.5" />
                                                    {formatTime(p.timestamp)}
                                                </span>
                                                <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold', isIn ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600')}>
                                                    Employee {p.employeeCode}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        <div className="py-2 text-center text-xs text-[#9ca3af]">
                            {loadingMore ? 'Loading more punches...' : hasMore ? 'Scroll for more' : 'No more punches to load'}
                        </div>
                    </div>
                )}
            </div>
        </Drawer>
    );
}
