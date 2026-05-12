import { useCallback, useEffect } from 'react';
import { useAuthStore } from '@web/modules/auth/store/auth.store';
import { useTodayPunches, useDailySummaryRealtime } from '@web/lib/firestore';
import { useAttendanceStore } from '../store/attendance.store';
import { attendanceApi } from '../api/attendance.api';
import { AttendancePunch, DailySummary } from '../types/attendance.types';

function getTodayKey(timezone = 'Asia/Manila'): string {
  return new Date()
    .toLocaleDateString('sv-SE', { timeZone: timezone })
    .slice(0, 10);
}

export function useAttendance() {
  const { user } = useAuthStore();
  const { isPunching, error, setPunching, setError } = useAttendanceStore();

  const timezone = user?.timezone ?? 'Asia/Manila';
  const dateKey = getTodayKey(timezone);

  // Real-time today's punches via Firestore listener
  const { data: realtimePunches, loading: punchesLoading } = useTodayPunches<AttendancePunch>(
    user?.id ?? null,
    dateKey
  );

  // Real-time daily summary via Firestore listener
  const { data: realtimeSummary, loading: summaryLoading } =
    useDailySummaryRealtime<DailySummary>(user?.id ?? null, dateKey);

  // Derive current punch state from latest punch in real-time list
  const latestPunch = realtimePunches.length > 0 ? realtimePunches[realtimePunches.length - 1] : null;
  const isPunchedIn = latestPunch?.punchType === 'IN';
  const nextAction: 'IN' | 'OUT' = isPunchedIn ? 'OUT' : 'IN';

  const punch = useCallback(async () => {
    if (!user) return;
    setPunching(true);
    setError(null);
    try {
      await attendanceApi.punch(timezone);
      // State updates automatically via Firestore real-time listener
    } catch (err: any) {
      setError(err.message ?? 'Punch failed');
    } finally {
      setPunching(false);
    }
  }, [user, timezone, setPunching, setError]);

  return {
    todayPunches: realtimePunches,
    todaySummary: realtimeSummary,
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
