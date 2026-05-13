import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@web/modules/auth/store/auth.store';
import { useTodayPunches, useDailySummaryRealtime } from '@web/lib/firestore';
import type { AttendancePunch } from '../types/attendance.types';
import { useAttendanceStore } from '../store/attendance.store';
import { attendanceApi } from '../api/attendance.api';

function getTodayKey(timezone = 'Asia/Manila'): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: timezone }).slice(0, 10);
}

function normalizePunches(punches: AttendancePunch[]): AttendancePunch[] {
  return [...new Map(punches.map((punch) => [punch.id, punch])).values()].sort(
    (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );
}

export function useAttendance() {
  const { user } = useAuthStore();
  const [recentPunches, setRecentPunches] = useState<AttendancePunch[]>([]);
  const {
    todayPunches, todaySummary, isPunching, error,
    setTodayPunches, setTodaySummary, upsertHistorySummary,
    setPunching, setError,
  } = useAttendanceStore();

  const timezone = user?.timezone ?? 'Asia/Manila';
  const userId = user?.uid ?? user?.id ?? null;
  const dateKey = getTodayKey(timezone);

  // Firestore real-time → sync to Zustand store (background refresh)
  const { data: realtimePunches, loading: punchesLoading } = useTodayPunches(userId, dateKey);
  const { data: realtimeSummary, loading: summaryLoading } = useDailySummaryRealtime(userId, dateKey);

  useEffect(() => {
    const normalized = normalizePunches(realtimePunches);
    setTodayPunches(normalized);
    setRecentPunches(normalized.slice(0, 4));
  }, [realtimePunches, setTodayPunches]);
  useEffect(() => {
    if (!realtimeSummary) return;
    setTodaySummary(realtimeSummary);
    upsertHistorySummary(realtimeSummary);
  }, [realtimeSummary, setTodaySummary, upsertHistorySummary]);

  const latestPunch = todayPunches.length > 0 ? todayPunches[0] : null;
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
      const normalized = normalizePunches([...current, newPunch]);
      setTodayPunches(normalized);
      setRecentPunches(normalized.slice(0, 4));
      if (newPunch.punchType === 'IN') {
        const summary = useAttendanceStore.getState().todaySummary;
        if (summary) {
          setTodaySummary({ ...summary, lastOut: null, firstIn: newPunch.timestamp });
        }
      }
      try {
        const recent = await attendanceApi.getTodayPunches(timezone, 4);
        setRecentPunches(normalizePunches(recent).slice(0, 4));
      } catch {
        setRecentPunches(normalized.slice(0, 4));
      }
      // Fetch updated daily summary from API
      try {
        const summary = await attendanceApi.getDailySummary(dateKey);
        if (summary) {
          setTodaySummary(summary);
          upsertHistorySummary(summary);
        }
      } catch { /* Firestore real-time will eventually sync */ }
    } catch (err: any) {
      setError(err.message ?? 'Punch failed');
    } finally {
      setPunching(false);
    }
  }, [
    user,
    timezone,
    dateKey,
    setPunching,
    setError,
    setTodayPunches,
    setTodaySummary,
    upsertHistorySummary,
  ]);

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
    recentPunches,
    punch,
  };
}
