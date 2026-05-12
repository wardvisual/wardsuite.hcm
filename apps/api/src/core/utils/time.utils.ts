import { Schedule, DailySummaryStatus } from '@api/types';

function toMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function localMinutesOfDay(date: Date, timezone: string): number {
  const local = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  return local.getHours() * 60 + local.getMinutes();
}

export function getDateKey(date: Date, timezone: string): string {
  const local = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  const y = local.getFullYear();
  const m = String(local.getMonth() + 1).padStart(2, '0');
  const d = String(local.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getWeekKey(date: Date, timezone: string): string {
  const local = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  const tmp = new Date(local);
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() + 4 - (tmp.getDay() || 7));
  const yearStart = new Date(tmp.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${tmp.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function computeWeekRange(weekKey: string): { start: string; end: string } {
  const [year, week] = weekKey.split('-W').map(Number);
  const jan4 = new Date(year, 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - (jan4.getDay() || 7) + 1);
  const monday = new Date(startOfWeek1);
  monday.setDate(startOfWeek1.getDate() + (week - 1) * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start: fmt(monday), end: fmt(sunday) };
}

function computeNightDifferentialMinutes(
  start: Date,
  end: Date,
  timezone: string
): number {
  const totalMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
  if (totalMinutes <= 0 || totalMinutes > 1440) return 0;

  let nd = 0;
  for (let i = 0; i < totalMinutes; i++) {
    const t = new Date(start.getTime() + i * 60000);
    const h = new Date(t.toLocaleString('en-US', { timeZone: timezone })).getHours();
    if (h >= 22 || h < 6) nd++;
  }
  return nd;
}

export interface ComputedDaySummary {
  workedMinutes: number;
  regularMinutes: number;
  overtimeMinutes: number;
  nightDifferentialMinutes: number;
  lateMinutes: number;
  undertimeMinutes: number;
  status: DailySummaryStatus;
  scheduledMinutes: number;
}

export function computeDaySummary(
  firstIn: Date,
  lastOut: Date | null,
  schedule: Schedule,
  timezone: string
): ComputedDaySummary {
  const schedStartMin = toMinutes(schedule.start);
  const schedEndMin = toMinutes(schedule.end);
  const scheduledMinutes = schedEndMin - schedStartMin - schedule.breakMinutes;

  const punchInMin = localMinutesOfDay(firstIn, timezone);
  const punchOutMin = lastOut ? localMinutesOfDay(lastOut, timezone) : null;

  // Late: arrival beyond grace window (counted from schedule start, not grace end)
  const lateMinutes = Math.max(0, punchInMin - (schedStartMin + schedule.graceMinutes));

  // Worked
  const workedMinutes =
    punchOutMin !== null ? Math.max(0, punchOutMin - punchInMin) : 0;

  // Undertime: only if clocked out before shift end
  const undertimeMinutes =
    punchOutMin !== null ? Math.max(0, schedEndMin - punchOutMin) : 0;

  // Regular: capped at net scheduled
  const regularMinutes = Math.min(workedMinutes, scheduledMinutes);

  // Overtime: beyond net scheduled
  const overtimeMinutes = Math.max(0, workedMinutes - scheduledMinutes);

  // Night differential
  const nightDifferentialMinutes = lastOut
    ? computeNightDifferentialMinutes(firstIn, lastOut, timezone)
    : 0;

  let status: DailySummaryStatus = 'present';
  if (lateMinutes > 0) status = 'late';
  if (workedMinutes > 0 && workedMinutes < scheduledMinutes / 2) status = 'half-day';

  return {
    workedMinutes,
    regularMinutes,
    overtimeMinutes,
    nightDifferentialMinutes,
    lateMinutes,
    undertimeMinutes,
    status,
    scheduledMinutes,
  };
}

export function minutesToHHMM(minutes: number): string {
  const h = Math.floor(Math.abs(minutes) / 60);
  const m = Math.abs(minutes) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
