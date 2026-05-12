export type PunchType = 'IN' | 'OUT';
export type DailySummaryStatus = 'present' | 'absent' | 'late' | 'half-day';

export interface ScheduleSnapshot {
  start: string;
  end: string;
  breakMinutes: number;
  graceMinutes: number;
}

export interface AttendancePunch {
  id: string;
  userId: string;
  employeeCode: string;
  dateKey: string;
  weekKey: string;
  timezone: string;
  punchType: PunchType;
  timestamp: string;
  source: string;
  scheduleSnapshot: ScheduleSnapshot;
  pairGroup: string;
  isEdited: boolean;
  editedAt: string | null;
  editedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailySummary {
  id: string;
  userId: string;
  employeeCode: string;
  dateKey: string;
  weekKey: string;
  timezone: string;
  schedule: ScheduleSnapshot & { scheduledMinutes: number };
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
