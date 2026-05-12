import { Schedule } from './user.types';

export type PunchType = 'IN' | 'OUT';
export type AttendanceSource = 'web' | 'mobile' | 'admin';
export type DailySummaryStatus = 'present' | 'absent' | 'late' | 'half-day';
export type HistoryAction =
  | 'CREATE_PUNCH'
  | 'UPDATE_PUNCH'
  | 'DELETE_PUNCH'
  | 'RECOMPUTE_DAY'
  | 'MANUAL_ADJUSTMENT';

export interface AttendancePunch {
  id: string;
  userId: string;
  employeeCode: string;
  dateKey: string;   // YYYY-MM-DD
  weekKey: string;   // YYYY-WNN
  timezone: string;
  punchType: PunchType;
  timestamp: string; // ISO string
  source: AttendanceSource;
  scheduleSnapshot: Schedule;
  pairGroup: string;
  isEdited: boolean;
  editedAt: string | null;
  editedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailySummary {
  id: string;        // {userId}_{YYYY-MM-DD}
  userId: string;
  employeeCode: string;
  dateKey: string;
  weekKey: string;
  timezone: string;
  schedule: Schedule & { scheduledMinutes: number };
  firstIn: string | null;
  lastOut: string | null;
  punchCount: number;
  punchIds: string[];
  workedMinutes: number;
  regularMinutes: number;
  overtimeMinutes: number;
  nightDifferentialMinutes: number;
  lateMinutes: number;
  undertimeMinutes: number;
  status: DailySummaryStatus;
  computationVersion: number;
  computedAt: string;
  updatedAt: string;
}

export interface AttendanceHistory {
  id: string;
  attendanceId: string;
  userId: string;
  employeeCode: string;
  dateKey: string;
  weekKey: string;
  action: HistoryAction;
  changedBy: string;
  changedByRole: string;
  reason: string | null;
  before: Partial<AttendancePunch> | null;
  after: Partial<AttendancePunch> | null;
  summaryImpact: {
    regularMinutesBefore: number;
    regularMinutesAfter: number;
    overtimeMinutesBefore: number;
    overtimeMinutesAfter: number;
    lateMinutesBefore: number;
    lateMinutesAfter: number;
    undertimeMinutesBefore: number;
    undertimeMinutesAfter: number;
  } | null;
  changedAt: string;
}

export interface WeeklySummary {
  id: string;        // {userId}_{YYYY-WNN}
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
