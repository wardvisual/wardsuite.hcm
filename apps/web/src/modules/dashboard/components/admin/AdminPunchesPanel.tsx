import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { useAdminPunches } from '@web/modules/dashboard/hooks/useAdminPunches';
import { PunchTable } from './punches/PunchTable';
import { HistoryModal } from './punches/HistoryModal';
import { ActivePeriodPicker } from './common/ActivePeriodPicker';
import { InfoTooltip } from './common/InfoTooltip';

export function AdminPunchesPanel() {
    const {
        punches,
        groupedPunches,
        fetchPunches,
        selectedDateKey,
        setSelectedDateKey,
        openHistory,
        closeHistory,
    } = useAdminPunches();

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-[#6b7280]">Showing punches for</p>
                    <ActivePeriodPicker
                        mode="daily"
                        value={selectedDateKey}
                        onChange={setSelectedDateKey}
                        className="min-w-[160px]"
                    />
                    <InfoTooltip text="Only dates with recorded attendance punches are listed." />
                </div>
                <button type="button" onClick={fetchPunches} className="btn-secondary">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {punches.error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl">{punches.error}</div>
            )}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
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
