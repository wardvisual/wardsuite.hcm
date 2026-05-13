import { useEffect } from 'react';
import { useAuthStore } from '@web/modules/auth/store/auth.store';
import { useAttendanceStore } from '@web/modules/attendance/store/attendance.store';
import { attendanceApi } from '@web/modules/attendance/api/attendance.api';

export function useDashboard() {
  const { user } = useAuthStore();
  const timezone = user?.timezone ?? 'Asia/Manila';
  const userId = user?.uid ?? user?.id ?? null;
  const { history, historyLoading, setHistory, setHistoryLoading } = useAttendanceStore();

  const last7 = history.slice(0, 7).reverse();

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setHistory([]);
      setHistoryLoading(false);
      return;
    }

    setHistoryLoading(true);

    attendanceApi.getHistory(30)
      .then((data) => {
        if (!cancelled) {
          setHistory(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHistory([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [setHistory, setHistoryLoading, userId]);

  return { user, history, last7, timezone, historyLoading };
}
