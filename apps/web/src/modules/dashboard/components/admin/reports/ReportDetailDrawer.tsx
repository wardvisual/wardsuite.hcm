import { Drawer } from '@web/components';
import { cn, formatDateKey, formatDetailedDateTime, formatHours, formatMinutes, formatTime, formatWeekRange } from '@web/lib/utils';
import type { DailySummary, WeeklySummary } from '@web/modules/attendance';

type ReportMode = 'daily' | 'weekly';

interface ReportDetailDrawerProps {
    open: boolean;
    mode: ReportMode;
    report: DailySummary | WeeklySummary | null;
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

export function ReportDetailDrawer({ open, mode, report, onClose }: ReportDetailDrawerProps) {
    const isDaily = mode === 'daily';
    const dailyReport = isDaily ? (report as DailySummary | null) : null;
    const weeklyReport = !isDaily ? (report as WeeklySummary | null) : null;

    return (
        <Drawer
            isOpen={open}
            onClose={onClose}
            title={report ? `${isDaily ? 'Daily' : 'Weekly'} Report Details — ${report.employeeCode}` : 'Report Details'}
            description={isDaily ? 'Detailed attendance summary for the selected employee.' : 'Weekly attendance summary for the selected employee.'}
            className="sm:max-w-4xl lg:max-w-6xl"
        >
            {!report ? (
                <div className="rounded-3xl border border-dashed border-[#e5e7eb] bg-white px-4 py-10 text-center text-sm text-[#6b7280]">
                    No report selected.
                </div>
            ) : dailyReport ? (
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#111111] px-3 py-1.5 text-xs font-black text-white">{dailyReport.employeeCode}</span>
                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">{dailyReport.status}</span>
                        <span className="rounded-full bg-[#fafafa] px-3 py-1.5 text-xs font-bold text-[#6b7280]">{formatDateKey(dailyReport.dateKey)}</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <MetricCard label="Worked" value={formatHours(dailyReport.workedMinutes)} />
                        <MetricCard label="Regular" value={formatHours(dailyReport.regularMinutes)} />
                        <MetricCard label="Overtime" value={formatHours(dailyReport.overtimeMinutes)} />
                        <MetricCard label="Night Diff" value={formatHours(dailyReport.nightDifferentialMinutes)} />
                        <MetricCard label="Late" value={formatMinutes(dailyReport.lateMinutes)} />
                        <MetricCard label="Undertime" value={formatMinutes(dailyReport.undertimeMinutes)} />
                    </div>

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

                    <div className="rounded-3xl border border-[#f1f1f1] bg-[#fafafa] p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#bbbbbb]">Punch IDs</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {dailyReport.punchIds.map((id: string) => (
                                <span key={id} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#6b7280] shadow-sm">
                                    {id}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            ) : weeklyReport ? (
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#111111] px-3 py-1.5 text-xs font-black text-white">{weeklyReport.employeeCode}</span>
                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">Days Present {weeklyReport.daysPresent}</span>
                        <span className="rounded-full bg-[#fafafa] px-3 py-1.5 text-xs font-bold text-[#6b7280]">{formatWeekRange(weeklyReport.dateRange.start, weeklyReport.dateRange.end)}</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <MetricCard label="Worked" value={formatHours(weeklyReport.workedMinutes)} />
                        <MetricCard label="Regular" value={formatHours(weeklyReport.regularMinutes)} />
                        <MetricCard label="Overtime" value={formatHours(weeklyReport.overtimeMinutes)} />
                        <MetricCard label="Night Diff" value={formatHours(weeklyReport.nightDifferentialMinutes)} />
                        <MetricCard label="Late" value={formatMinutes(weeklyReport.lateMinutes)} />
                        <MetricCard label="Undertime" value={formatMinutes(weeklyReport.undertimeMinutes)} />
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                        <DetailCard label="Week Start" value={weeklyReport.dateRange.start} tone="blue" />
                        <DetailCard label="Week End" value={weeklyReport.dateRange.end} tone="blue" />
                        <DetailCard label="Days Absent" value={`${weeklyReport.daysAbsent}`} tone="rose" />
                        <DetailCard label="Daily Summaries" value={`${weeklyReport.dailySummaryIds.length}`} />
                        <DetailCard label="Computed At" value={formatDetailedDateTime(weeklyReport.computedAt)} />
                        <DetailCard label="Updated At" value={formatDetailedDateTime(weeklyReport.updatedAt)} />
                    </div>

                    <div className="rounded-3xl border border-[#f1f1f1] bg-[#fafafa] p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#bbbbbb]">Daily Summary IDs</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {weeklyReport.dailySummaryIds.map((id: string) => (
                                <span key={id} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#6b7280] shadow-sm">
                                    {id}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}
        </Drawer>
    );
}