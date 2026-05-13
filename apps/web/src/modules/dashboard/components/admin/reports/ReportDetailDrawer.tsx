import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, LogIn, LogOut } from 'lucide-react';
import { Drawer } from '@web/components';
import { adminApi, type PunchHistoryDayGroup, type PunchHistoryGroupResponse } from '@web/modules/dashboard/api/admin.api';
import { cn, formatDateKey, formatDetailedDateTime, formatHours, formatMinutes, formatTime, formatWeekRange } from '@web/lib/utils';
import type { DailySummary, WeeklySummary } from '@web/modules/attendance';

type ReportMode = 'daily' | 'weekly';
type PunchTypeFilter = 'ALL' | 'IN' | 'OUT';

interface ReportDetailDrawerProps {
    open: boolean;
    mode: ReportMode;
    report: DailySummary | WeeklySummary | null;
    dateKey: string;
    weekKey: string;
    onClose: () => void;
}

function DetailCard({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'emerald' | 'amber' | 'blue' | 'rose' }) {
    return (
        <div className={cn('rounded-3xl border p-4', tone === 'emerald' && 'border-emerald-100 bg-emerald-50', tone === 'amber' && 'border-amber-100 bg-amber-50', tone === 'blue' && 'border-blue-100 bg-blue-50', tone === 'rose' && 'border-rose-100 bg-rose-50', tone === 'default' && 'border-[#f1f1f1] bg-[#fafafa]')}>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#9ca3af]">{label}</p>
            <p className="mt-2 text-sm font-black text-[#111111] break-words">{value}</p>
        </div>
    );
}

function MetricCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-3xl border border-[#f1f1f1] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#bbbbbb]">{label}</p>
            <p className="mt-2 text-lg font-black text-[#111111] tabular-nums">{value}</p>
        </div>
    );
}

function PunchItem({ punch }: { punch: PunchHistoryDayGroup['punches'][number] }) {
    const isIn = punch.punchType === 'IN';
    const Icon = isIn ? LogIn : LogOut;

    return (
        <div className={cn('relative overflow-hidden rounded-3xl border bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]', isIn ? 'border-emerald-100' : 'border-slate-200')}>
            <div className={cn('absolute inset-y-0 left-0 w-1', isIn ? 'bg-emerald-500' : 'bg-slate-400')} />
            <div className="flex items-start gap-3 pl-2">
                <div className={cn('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', isIn ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600')}>
                    <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-black text-[#111111]">Punch {punch.punchType}</p>
                            <p className="mt-1 text-xs text-[#6b7280]">{formatDetailedDateTime(punch.timestamp)}</p>
                        </div>
                        <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-black tracking-[0.2em]', isIn ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600')}>
                            {punch.punchType}
                        </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fafafa] px-2.5 py-1 text-[#6b7280]">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {punch.dateKey}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fafafa] px-2.5 py-1 text-[#6b7280]">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatTime(punch.timestamp)}
                        </span>
                        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold', isIn ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600')}>
                            Employee {punch.employeeCode}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PunchDaySection({ group }: { group: PunchHistoryDayGroup }) {
    return (
        <section className="rounded-3xl border border-[#f1f1f1] bg-[#fafafa] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-black text-[#111111]">{formatDateKey(group.dateKey)}</p>
                    <p className="mt-0.5 text-xs text-[#6b7280]">{group.punches.length} punches</p>
                </div>
            </div>

            {group.punches.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#e5e7eb] bg-white px-4 py-6 text-center text-sm text-[#6b7280]">
                    No punches on this day.
                </div>
            ) : (
                <div className="space-y-3">
                    {group.punches.map((punch) => (
                        <PunchItem key={punch.id} punch={punch} />
                    ))}
                </div>
            )}
        </section>
    );
}

export function ReportDetailDrawer({ open, mode, report, dateKey, weekKey, onClose }: ReportDetailDrawerProps) {
    const [data, setData] = useState<PunchHistoryGroupResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [punchType, setPunchType] = useState<PunchTypeFilter>('ALL');

    const isDaily = mode === 'daily';
    const dailyReport = isDaily ? (report as DailySummary | null) : null;
    const weeklyReport = !isDaily ? (report as WeeklySummary | null) : null;

    const range = useMemo(() => {
        if (dailyReport) {
            return { fromDate: dateKey || dailyReport.dateKey, toDate: dateKey || dailyReport.dateKey };
        }

        if (weeklyReport) {
            return { fromDate: weeklyReport.dateRange.start, toDate: weeklyReport.dateRange.end };
        }

        return { fromDate: '', toDate: '' };
    }, [dailyReport, weeklyReport, dateKey, weekKey]);

    useEffect(() => {
        if (!open || !report) {
            setData(null);
            setError(null);
            setPunchType('ALL');
            return;
        }

        setPunchType('ALL');
    }, [open, report]);

    useEffect(() => {
        if (!open || !report || !range.fromDate || !range.toDate) {
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        adminApi.getEmployeePunchHistoryGroups(
            report.userId,
            range.fromDate,
            range.toDate,
            punchType === 'ALL' ? undefined : punchType,
        )
            .then((response) => {
                if (!cancelled) {
                    setData(response);
                }
            })
            .catch((err: any) => {
                if (!cancelled) {
                    setError(err.message ?? 'Failed to load punch details');
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [open, punchType, range.fromDate, range.toDate, report]);
    return (
        <Drawer
            isOpen={open}
            onClose={onClose}
            title={report ? `${isDaily ? 'Daily' : 'Weekly'} Report Details — ${report.employeeCode}` : 'Report Details'}
            description={isDaily ? 'Detailed punches for the selected day.' : 'Detailed punches grouped by day for the selected week.'}
            className="sm:max-w-4xl lg:max-w-6xl"
        >
            {!report ? (
                <div className="rounded-3xl border border-dashed border-[#e5e7eb] bg-white px-4 py-10 text-center text-sm text-[#6b7280]">
                    No report selected.
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid gap-3 rounded-3xl border border-[#f1f1f1] bg-[#fafafa] p-4 sm:grid-cols-3">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#bbbbbb]">From</p>
                            <p className="mt-1 text-sm font-black text-[#111111]">{range.fromDate}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#bbbbbb]">To</p>
                            <p className="mt-1 text-sm font-black text-[#111111]">{range.toDate}</p>
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-black uppercase tracking-[0.2em] text-[#bbbbbb]">Punch type</label>
                            <select value={punchType} onChange={(e) => setPunchType(e.target.value as PunchTypeFilter)} className="input-theme">
                                <option value="ALL">All</option>
                                <option value="IN">IN</option>
                                <option value="OUT">OUT</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#111111] px-3 py-1.5 text-xs font-black text-white">{report.employeeCode}</span>
                        {isDaily ? (
                            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                                {dailyReport?.status}
                            </span>
                        ) : (
                            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                                Days Present {weeklyReport?.daysPresent}
                            </span>
                        )}
                        <span className="rounded-full bg-[#fafafa] px-3 py-1.5 text-xs font-bold text-[#6b7280]">
                            {isDaily ? formatDateKey(range.fromDate) : (weekKey || formatWeekRange(range.fromDate, range.toDate))}
                        </span>
                    </div>

                    {isDaily && dailyReport ? (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            <MetricCard label="Worked" value={formatHours(dailyReport.workedMinutes)} />
                            <MetricCard label="Regular" value={formatHours(dailyReport.regularMinutes)} />
                            <MetricCard label="Overtime" value={formatHours(dailyReport.overtimeMinutes)} />
                            <MetricCard label="Night Diff" value={formatHours(dailyReport.nightDifferentialMinutes)} />
                            <MetricCard label="Late" value={formatMinutes(dailyReport.lateMinutes)} />
                            <MetricCard label="Undertime" value={formatMinutes(dailyReport.undertimeMinutes)} />
                        </div>
                    ) : weeklyReport ? (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            <MetricCard label="Worked" value={formatHours(weeklyReport.workedMinutes)} />
                            <MetricCard label="Regular" value={formatHours(weeklyReport.regularMinutes)} />
                            <MetricCard label="Overtime" value={formatHours(weeklyReport.overtimeMinutes)} />
                            <MetricCard label="Night Diff" value={formatHours(weeklyReport.nightDifferentialMinutes)} />
                            <MetricCard label="Late" value={formatMinutes(weeklyReport.lateMinutes)} />
                            <MetricCard label="Undertime" value={formatMinutes(weeklyReport.undertimeMinutes)} />
                        </div>
                    ) : null}

                    {isDaily && dailyReport ? (
                        <div className="grid gap-3 lg:grid-cols-2">
                            <DetailCard label="First In" value={formatTime(dailyReport.firstIn)} tone="emerald" />
                            <DetailCard label="Last Out" value={formatTime(dailyReport.lastOut)} tone="amber" />
                            <DetailCard label="Punch Count" value={`${dailyReport.punchCount} punches`} />
                            <DetailCard label="Timezone" value={dailyReport.timezone} />
                            <DetailCard label="Schedule Start" value={dailyReport.schedule.start} tone="blue" />
                            <DetailCard label="Schedule End" value={dailyReport.schedule.end} tone="blue" />
                            <DetailCard label="Break Minutes" value={`${dailyReport.schedule.breakMinutes}m`} />
                            <DetailCard label="Grace Minutes" value={`${dailyReport.schedule.graceMinutes}m`} />
                        </div>
                    ) : weeklyReport ? (
                        <div className="grid gap-3 lg:grid-cols-2">
                            <DetailCard label="Week Start" value={weeklyReport.dateRange.start} tone="blue" />
                            <DetailCard label="Week End" value={weeklyReport.dateRange.end} tone="blue" />
                            <DetailCard label="Days Absent" value={`${weeklyReport.daysAbsent}`} tone="rose" />
                            <DetailCard label="Daily Summaries" value={`${weeklyReport.dailySummaryIds.length}`} />
                            <DetailCard label="Computed At" value={formatDetailedDateTime(weeklyReport.computedAt)} />
                            <DetailCard label="Updated At" value={formatDetailedDateTime(weeklyReport.updatedAt)} />
                        </div>
                    ) : null}

                    {error && (
                        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="rounded-3xl border border-dashed border-[#e5e7eb] bg-white px-4 py-10 text-center">
                            <p className="text-sm font-medium text-[#6b7280]">Loading punches...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {(data?.groups ?? []).map((group) => (
                                <PunchDaySection key={group.dateKey} group={group} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Drawer>
    );
}
