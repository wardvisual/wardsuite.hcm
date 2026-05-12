import { create } from 'zustand';
import { AttendancePunch, DailySummary } from '../types/attendance.types';

interface AttendanceState {
  todayPunches: AttendancePunch[];
  todaySummary: DailySummary | null;
  isPunching: boolean;
  error: string | null;

  setTodayPunches: (punches: AttendancePunch[]) => void;
  setTodaySummary: (summary: DailySummary | null) => void;
  setPunching: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useAttendanceStore = create<AttendanceState>()((set) => ({
  todayPunches: [],
  todaySummary: null,
  isPunching: false,
  error: null,

  setTodayPunches: (todayPunches) => set({ todayPunches }),
  setTodaySummary: (todaySummary) => set({ todaySummary }),
  setPunching: (isPunching) => set({ isPunching }),
  setError: (error) => set({ error }),
}));
