import { useEffect } from 'react';
import { useAuthStore } from '@web/modules/auth/store/auth.store';
import { useHistoryRealtime } from '@web/lib/firestore';
import { useAttendanceStore } from '@web/modules/attendance/store/attendance.store';

export function useDashboard() {
  const { user } = useAuthStore();
  const timezone = user?.timezone ?? 'Asia/Manila';
  const userId = user?.uid ?? user?.id ?? null;
  const { history, setHistory, setHistoryLoading } = useAttendanceStore();

  const { data: historyRealtime, loading: historyLoading } = useHistoryRealtime(userId, 14);

  const last7 = history.slice(0, 7).reverse();

  useEffect(() => {
    setHistory(historyRealtime);
  }, [historyRealtime, setHistory]);

  useEffect(() => {
    setHistoryLoading(historyLoading);
  }, [historyLoading, setHistoryLoading]);

  return { user, history, last7, timezone, historyLoading };
}
