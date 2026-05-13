import { motion } from 'motion/react';
import { Clock, TrendingUp, Moon, AlertTriangle } from 'lucide-react';
import { formatHours, formatMinutes } from '@web/lib/utils';
import type { DailySummary } from '@web/modules/attendance';

interface ReportKpisProps {
    data: DailySummary[];
}

export function ReportKpis({ data }: ReportKpisProps) {
    if (data.length === 0) return null;

    const totalWorked = data.reduce((s, r) => s + r.workedMinutes, 0);
    const totalOT = data.reduce((s, r) => s + r.overtimeMinutes, 0);
    const totalND = data.reduce((s, r) => s + r.nightDifferentialMinutes, 0);
    const totalLate = data.reduce((s, r) => s + r.lateMinutes, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
            <SummaryKPI icon={<Clock className="w-5 h-5 text-[#111111]" />} label="Total Worked" value={formatHours(totalWorked)} color="bg-[#f5f5f5] border-[#ebebeb]" />
            <SummaryKPI icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} label="Total OT" value={formatHours(totalOT)} color="bg-emerald-50 border-emerald-100" />
            <SummaryKPI icon={<Moon className="w-5 h-5 text-blue-600" />} label="Total ND" value={formatHours(totalND)} color="bg-blue-50 border-blue-100" />
            <SummaryKPI icon={<AlertTriangle className="w-5 h-5 text-amber-600" />} label="Total Late" value={formatMinutes(totalLate)} color="bg-amber-50 border-amber-100" />
        </motion.div>
    );
}

function SummaryKPI({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
    return (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${color}`}>
            <div className="shrink-0">{icon}</div>
            <div>
                <p className="text-xs font-black text-[#bbbbbb] uppercase tracking-widest">{label}</p>
                <p className="text-lg font-black text-[#111111] tabular-nums">{value}</p>
            </div>
        </div>
    );
}
