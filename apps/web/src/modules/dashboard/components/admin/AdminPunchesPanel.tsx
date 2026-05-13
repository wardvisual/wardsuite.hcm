import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { useAdminPunches } from '@web/modules/dashboard/hooks/useAdminPunches';
import { PunchTable } from './punches/PunchTable';
import { EditModal } from './punches/EditModal';
import { DeleteModal } from './punches/DeleteModal';
import { HistoryModal } from './punches/HistoryModal';

export function AdminPunchesPanel() {
    const {
        punches,
        fetchPunches,
        openEdit,
        openDelete,
        openHistory,
        closeEdit,
        closeDelete,
        closeHistory,
        setEditTimestamp,
        setEditReason,
        setDeleteReason,
        saveEdit,
        saveDelete,
    } = useAdminPunches();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-[#6b7280]">Edit or delete attendance punches and view audit trail.</p>
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
                    punches={punches.punches}
                    loading={punches.loading}
                    onEdit={(punch) => openEdit(punch, punch.timestamp.slice(0, 16))}
                    onDelete={openDelete}
                    onHistory={openHistory}
                />
            </motion.div>

            <EditModal
                open={!!punches.editTarget}
                timestamp={punches.editTimestamp}
                reason={punches.editReason}
                saving={punches.saving}
                onChangeTimestamp={setEditTimestamp}
                onChangeReason={setEditReason}
                onClose={closeEdit}
                onSave={saveEdit}
            />

            <DeleteModal
                open={!!punches.deleteTarget}
                reason={punches.deleteReason}
                saving={punches.saving}
                onChangeReason={setDeleteReason}
                onClose={closeDelete}
                onDelete={saveDelete}
            />

            <HistoryModal
                open={!!punches.historyTarget}
                history={punches.history}
                loading={punches.historyLoading}
                onClose={closeHistory}
            />
        </div>
    );
}
