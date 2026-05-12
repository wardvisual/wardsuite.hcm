import { useAuthStore } from '@web/modules/auth/store/auth.store';
import { useDailySummaryRealtime, useHistoryRealtime } from '@web/lib/firestore';
import { DailySummary } from '@web/modules/attendance';

function getTodayKey(timezone = 'Asia/Manila'): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: timezone }).slice(0, 10);
}

export function useDashboard() {
  const { user } = useAuthStore();
  const timezone = user?.timezone ?? 'Asia/Manila';
  const dateKey = getTodayKey(timezone);

  const { data: todaySummary, loading: todayLoading } =
    useDailySummaryRealtime<DailySummary>(user?.id ?? null, dateKey);

  const { data: history, loading: historyLoading } =
    useHistoryRealtime<DailySummary>(user?.id ?? null, 14);

  // Last 7 days for the weekly bar chart
  const last7 = history.slice(0, 7).reverse();

  return {
    user,
    todaySummary,
    history,
    last7,
    dateKey,
    todayLoading,
    historyLoading,
  };
}
