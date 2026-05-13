import { useCallback, useEffect } from 'react';
import { adminApi } from '@web/modules/dashboard/api/admin.api';
import { useDashboardStore } from '@web/modules/dashboard/store/dashboard.store';
import type { AttendancePunch } from '@web/modules/attendance';

type EmployeePunchRow = {
    employeeCode: string;
    punches: AttendancePunch[];
    latestPunch: AttendancePunch;
    firstPunch: AttendancePunch;
    lastPunch: AttendancePunch;
    punchCount: number;
};

function groupByEmployee(punches: AttendancePunch[]): EmployeePunchRow[] {
    const grouped = new Map<string, AttendancePunch[]>();
    punches
        .slice()
        .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
        .forEach((punch) => {
            const key = punch.employeeCode;
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key)!.push(punch);
        });

    return [...grouped.entries()].map(([employeeCode, employeePunches]) => ({
        employeeCode,
        punches: employeePunches,
        latestPunch: employeePunches[0],
        firstPunch: employeePunches[employeePunches.length - 1],
        lastPunch: employeePunches[0],
        punchCount: employeePunches.length,
    }));
}

export function useAdminPunches() {
    const { punches, dispatchPunches } = useDashboardStore();

    const fetchPunches = useCallback(async () => {
        dispatchPunches({ type: 'SET_LOADING', loading: true });
        dispatchPunches({ type: 'SET_ERROR', error: null });
        try {
            const data = await adminApi.getTodayPunches('Asia/Manila');
            const nextPunches = Array.isArray(data) ? data : [];
            dispatchPunches({ type: 'SET_PUNCHES', punches: nextPunches });
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

    const openHistory = (historyPunches: AttendancePunch[]) => {
        const target = historyPunches[0] ?? null;
        if (!target) return;
        dispatchPunches({ type: 'OPEN_HISTORY', target });
        dispatchPunches({ type: 'SET_HISTORY', history: historyPunches });
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
        groupedPunches: groupByEmployee(punches.punches),
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
