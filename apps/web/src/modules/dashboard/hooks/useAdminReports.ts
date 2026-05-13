import { useCallback, useEffect } from 'react';
import { adminApi } from '@web/modules/dashboard/api/admin.api';
import { useDashboardStore } from '@web/modules/dashboard/store/dashboard.store';

export function useAdminReports() {
    const { reports, dispatchReports } = useDashboardStore();

    const fetchReport = useCallback(async () => {
        dispatchReports({ type: 'SET_LOADING', loading: true });
        dispatchReports({ type: 'SET_ERROR', error: null });
        try {
            if (reports.mode === 'daily') {
                const data = await adminApi.getDailyReport(reports.dateKey);
                dispatchReports({ type: 'SET_DAILY_DATA', data });
            } else {
                const data = await adminApi.getWeeklyReport(reports.weekKey);
                dispatchReports({ type: 'SET_WEEKLY_DATA', data });
            }
        } catch (err: any) {
            dispatchReports({ type: 'SET_ERROR', error: err.message ?? 'Failed to load report' });
        } finally {
            dispatchReports({ type: 'SET_LOADING', loading: false });
        }
    }, [dispatchReports, reports.mode, reports.dateKey, reports.weekKey]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    return {
        reports,
        setMode: (mode: typeof reports.mode) => dispatchReports({ type: 'SET_MODE', mode }),
        setDateKey: (dateKey: string) => dispatchReports({ type: 'SET_DATE', dateKey }),
        setWeekKey: (weekKey: string) => dispatchReports({ type: 'SET_WEEK', weekKey }),
        fetchReport,
    };
}
