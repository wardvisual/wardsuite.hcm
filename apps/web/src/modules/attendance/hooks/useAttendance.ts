import { useCallback, useEffect } from 'react';
import { useAuthStore } from '@web/modules/auth/store/auth.store';
import { useTodayPunches, useDailySummaryRealtime } from '@web/lib/firestore';
import { useAttendanceStore } from '../store/attendance.store';
import { attendanceApi } from '../api/attendance.api';

function getTodayKey(timezone = 'Asia/Manila'): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: timezone }).slice(0, 10);
}

export function useAttendance() {
  const { user } = useAuthStore();
  const {
    todayPunches, todaySummary, isPunching, error,
    setTodayPunches, setTodaySummary, setPunching, setError,
  } = useAttendanceStore();

  const timezone = user?.timezone ?? 'Asia/Manila';
  const dateKey = getTodayKey(timezone);

  // Firestore real-time → sync to Zustand store (background refresh)
  const { data: realtimePunches, loading: punchesLoading } = useTodayPunches(user?.id ?? null, dateKey);
  const { data: realtimeSummary, loading: summaryLoading } = useDailySummaryRealtime(user?.id ?? null, dateKey);

  useEffect(() => { setTodayPunches(realtimePunches); }, [realtimePunches, setTodayPunches]);
  useEffect(() => { if (realtimeSummary) setTodaySummary(realtimeSummary); }, [realtimeSummary, setTodaySummary]);

  const latestPunch = todayPunches.length > 0 ? todayPunches[todayPunches.length - 1] : null;
  const isPunchedIn = latestPunch?.punchType === 'IN';
  const nextAction: 'IN' | 'OUT' = isPunchedIn ? 'OUT' : 'IN';

  const punch = useCallback(async () => {
    if (!user) return;
    setPunching(true);
    setError(null);
    try {
      const newPunch = await attendanceApi.punch(timezone);
      // Optimistic update: immediately reflect new punch in store before Firestore catches up
      const current = useAttendanceStore.getState().todayPunches;
      setTodayPunches([...current, newPunch]);
      // Fetch updated daily summary from API
      try {
        const summary = await attendanceApi.getDailySummary(dateKey);
        if (summary) setTodaySummary(summary);
      } catch { /* Firestore real-time will eventually sync */ }
    } catch (err: any) {
      setError(err.message ?? 'Punch failed');
    } finally {
      setPunching(false);
    }
  }, [user, timezone, dateKey, setPunching, setError, setTodayPunches, setTodaySummary]);

  return {
    todayPunches,
    todaySummary,
    isPunchedIn,
    nextAction,
    isPunching,
    error,
    dateKey,
    punchesLoading,
    summaryLoading,
    punch,
  };
}
