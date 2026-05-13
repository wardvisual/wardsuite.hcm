import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AttendancePunch, DailySummary } from '../types/attendance.types';

interface AttendanceState {
  todayPunches: AttendancePunch[];
  todaySummary: DailySummary | null;
  history: DailySummary[];
  historyLoading: boolean;
  isPunching: boolean;
  error: string | null;

  setTodayPunches: (punches: AttendancePunch[]) => void;
  setTodaySummary: (summary: DailySummary | null) => void;
  setHistory: (history: DailySummary[]) => void;
  setHistoryLoading: (loading: boolean) => void;
  upsertHistorySummary: (summary: DailySummary) => void;
  setPunching: (v: boolean) => void;
  setError: (e: string | null) => void;
  resetAttendance: () => void;
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      todayPunches: [],
      todaySummary: null,
      history: [],
      historyLoading: false,
      isPunching: false,
      error: null,

      setTodayPunches: (todayPunches) => set({ todayPunches }),
      setTodaySummary: (todaySummary) => set({ todaySummary }),
      setHistory: (history) => set({ history }),
      setHistoryLoading: (historyLoading) => set({ historyLoading }),
      upsertHistorySummary: (summary) => {
        const current = get().history;
        const index = current.findIndex((item) => item.id === summary.id);
        if (index === -1) {
          set({ history: [summary, ...current] });
          return;
        }
        const next = [...current];
        next[index] = summary;
        set({ history: next });
      },
      setPunching: (isPunching) => set({ isPunching }),
      setError: (error) => set({ error }),
      resetAttendance: () => set({
        todayPunches: [],
        todaySummary: null,
        history: [],
        historyLoading: false,
        isPunching: false,
        error: null,
      }),
    }),
    {
      name: 'hcm-attendance',
      partialize: (state) => ({
        todayPunches: state.todayPunches,
        todaySummary: state.todaySummary,
        history: state.history,
      }),
    },
  ),
);
