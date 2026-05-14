import { motion } from 'motion/react';
import { CalendarDays, RefreshCw } from 'lucide-react';
import { useAdminPunches } from '@web/modules/dashboard/hooks/useAdminPunches';
import { PunchTable } from './punches/PunchTable';
import { HistoryModal } from './punches/HistoryModal';
import { todayLabel } from '@web/lib/utils';

export function AdminPunchesPanel() {
    const {
        punches,
        groupedPunches,
        fetchPunches,
        openHistory,
        closeHistory,
    } = useAdminPunches();

    console.log({ punches, groupedPunches })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-[#6b7280]">Showing today's punches </p>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#f1f1f1] bg-[#fafafa] px-3 py-1.5 text-[11px] font-bold text-[#6b7280]">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {todayLabel()}
                    </span>
                </div>
                <button type="button" onClick={fetchPunches} className="btn-secondary">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {punches.error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl">{punches.error}</div>
            )}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="floating-card p-6">
                <PunchTable
                    punches={groupedPunches}
                    loading={punches.loading}
                    onHistory={openHistory}
                />
            </motion.div>

            <HistoryModal
                open={!!punches.historyTarget}
                userId={punches.historyTarget?.userId ?? null}
                punches={punches.history}
                employeeCode={punches.historyTarget?.employeeCode ?? null}
                onClose={closeHistory}
                onSaved={fetchPunches}
            />
        </div>
    );
}
