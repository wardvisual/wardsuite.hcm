import { useAuthStore } from '@web/modules/auth/store/auth.store';
import { useHistoryRealtime } from '@web/lib/firestore';

export function useDashboard() {
  const { user } = useAuthStore();
  const timezone = user?.timezone ?? 'Asia/Manila';

  const { data: history, loading: historyLoading } = useHistoryRealtime(user?.id ?? null, 14);
  const last7 = history.slice(0, 7).reverse();

  return { user, history, last7, timezone, historyLoading };
}
