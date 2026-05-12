import { DailySummary } from '@web/modules/attendance';

export interface WeeklySummary {
  id: string;
  userId: string;
  employeeCode: string;
  weekKey: string;
  dateRange: { start: string; end: string };
  daysPresent: number;
  daysAbsent: number;
  workedMinutes: number;
  regularMinutes: number;
  overtimeMinutes: number;
  nightDifferentialMinutes: number;
  lateMinutes: number;
  undertimeMinutes: number;
  dailySummaryIds: string[];
  computedAt: string;
  updatedAt: string;
}

export interface AdminDailyReport {
  dateKey: string;
  summaries: DailySummary[];
}

export interface AdminWeeklyReport {
  weekKey: string;
  summaries: WeeklySummary[];
}
