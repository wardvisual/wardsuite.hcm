import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@web/modules/auth/store/auth.store';
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

export function useAttendance(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const { user } = useAuthStore();
  const [recentPunches, setRecentPunches] = useState<AttendancePunch[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    todayPunches, todaySummary, isPunching, error,
    history, historyLoading,
    setTodayPunches, setTodaySummary, upsertHistorySummary,
    setPunching, setError, setHistory, setHistoryLoading,
  } = useAttendanceStore();

  const timezone = user?.timezone ?? 'Asia/Manila';
  const userId = user?.uid ?? user?.id ?? null;
  const dateKey = getTodayKey(timezone);

  useEffect(() => {
    let cancelled = false;

    if (!userId || !enabled) {
      setTodayPunches([]);
      setTodaySummary(null);
      setRecentPunches([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    Promise.all([
      attendanceApi.getTodayPunches(timezone, 4),
      attendanceApi.getDailySummary(dateKey),
    ])
      .then(([punches, summary]) => {
        if (cancelled) return;

        const normalized = normalizePunches(punches);
        setTodayPunches(normalized);
        setRecentPunches(normalized.slice(0, 4));

        if (summary) {
          setTodaySummary(summary);
          upsertHistorySummary(summary);
        } else {
          setTodaySummary(null);
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          setError(err.message ?? 'Failed to load attendance data');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [dateKey, enabled, setError, setTodayPunches, setTodaySummary, timezone, upsertHistorySummary, userId]);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await attendanceApi.getHistory(30);
      setHistory(data);
    } catch {
      // history failure is non-critical
    } finally {
      setHistoryLoading(false);
    }
  }, [setHistory, setHistoryLoading]);

  const latestPunch = todayPunches.length > 0 ? todayPunches[0] : null;
  const isPunchedIn = latestPunch?.punchType === 'IN';
  const nextAction: 'IN' | 'OUT' = isPunchedIn ? 'OUT' : 'IN';

  const punch = useCallback(async () => {
    if (!user) return;
    setPunching(true);
    setError(null);
    try {
      const newPunch = await attendanceApi.punch(timezone);
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
    punchesLoading: loading,
    summaryLoading: loading,
    recentPunches,
    history,
    historyLoading,
    punch,
    fetchHistory,
  };
}
