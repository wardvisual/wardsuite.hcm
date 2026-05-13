import { useCallback, useEffect } from 'react';
import { attendanceApi } from '@web/modules/attendance/api/attendance.api';
import { adminApi } from '@web/modules/dashboard/api/admin.api';
import { useDashboardStore } from '@web/modules/dashboard/store/dashboard.store';

export function useAdminPunches() {
    const { punches, dispatchPunches } = useDashboardStore();

    const fetchPunches = useCallback(async () => {
        dispatchPunches({ type: 'SET_LOADING', loading: true });
        dispatchPunches({ type: 'SET_ERROR', error: null });
        try {
            const data = await attendanceApi.getTodayPunches('Asia/Manila');
            dispatchPunches({ type: 'SET_PUNCHES', punches: Array.isArray(data) ? data : [] });
        } catch (err: any) {
            dispatchPunches({ type: 'SET_ERROR', error: err.message ?? 'Failed to load punches' });
        } finally {
            dispatchPunches({ type: 'SET_LOADING', loading: false });
        }
    }, [dispatchPunches]);

    useEffect(() => {
        fetchPunches();
    }, [fetchPunches]);

    const openEdit = (target: any, timestamp: string) => {
        dispatchPunches({ type: 'OPEN_EDIT', target, timestamp });
    };

    const openDelete = (target: any) => {
        dispatchPunches({ type: 'OPEN_DELETE', target });
    };

    const openHistory = async (target: any) => {
        dispatchPunches({ type: 'OPEN_HISTORY', target });
        dispatchPunches({ type: 'SET_HISTORY_LOADING', loading: true });
        try {
            const data = await attendanceApi.getPunchHistory(target.id);
            dispatchPunches({ type: 'SET_HISTORY', history: Array.isArray(data) ? data : [] });
        } catch {
            dispatchPunches({ type: 'SET_HISTORY', history: [] });
        } finally {
            dispatchPunches({ type: 'SET_HISTORY_LOADING', loading: false });
        }
    };

    const closeEdit = () => dispatchPunches({ type: 'CLOSE_EDIT' });
    const closeDelete = () => dispatchPunches({ type: 'CLOSE_DELETE' });
    const closeHistory = () => dispatchPunches({ type: 'CLOSE_HISTORY' });

    const saveEdit = async () => {
        if (!punches.editTarget || !punches.editTimestamp) return;
        dispatchPunches({ type: 'SET_SAVING', saving: true });
        dispatchPunches({ type: 'SET_ERROR', error: null });
        try {
            await adminApi.editPunch(punches.editTarget.id, punches.editTimestamp, punches.editReason || undefined);
            closeEdit();
            await fetchPunches();
        } catch (err: any) {
            dispatchPunches({ type: 'SET_ERROR', error: err.message ?? 'Edit failed' });
        } finally {
            dispatchPunches({ type: 'SET_SAVING', saving: false });
        }
    };

    const saveDelete = async () => {
        if (!punches.deleteTarget) return;
        dispatchPunches({ type: 'SET_SAVING', saving: true });
        dispatchPunches({ type: 'SET_ERROR', error: null });
        try {
            await adminApi.deletePunch(punches.deleteTarget.id, punches.deleteReason || 'Admin correction');
            closeDelete();
            await fetchPunches();
        } catch (err: any) {
            dispatchPunches({ type: 'SET_ERROR', error: err.message ?? 'Delete failed' });
        } finally {
            dispatchPunches({ type: 'SET_SAVING', saving: false });
        }
    };

    return {
        punches,
        fetchPunches,
        openEdit,
        openDelete,
        openHistory,
        closeEdit,
        closeDelete,
        closeHistory,
        setEditTimestamp: (value: string) => dispatchPunches({ type: 'SET_EDIT_TIMESTAMP', value }),
        setEditReason: (value: string) => dispatchPunches({ type: 'SET_EDIT_REASON', value }),
        setDeleteReason: (value: string) => dispatchPunches({ type: 'SET_DELETE_REASON', value }),
        saveEdit,
        saveDelete,
    };
}
