import { computeDaySummary, getWeekKey } from '@api/core/utils/time.utils';
import {
  AttendancePunch,
  AttendanceHistory,
  DailySummary,
  DailySummaryStatus,
  Schedule,
  User,
  WeeklySummary,
} from '@api/types';

export interface PaginationResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface AttendanceDayContext {
  dateKey: string;
  weekKey: string;
  timezone: string;
}

export function httpError(message: string, statusCode: number): Error & { statusCode: number } {
  return Object.assign(new Error(message), { statusCode });
}

export function getPageSize(limit: number | undefined, fallback: number): number {
  return Number.isFinite(limit) && (limit ?? 0) > 0 ? (limit as number) : fallback;
}

export function mapDoc<T>(doc: FirebaseFirestore.QueryDocumentSnapshot): T {
  return { id: doc.id, ...doc.data() } as T;
}

export function filterSchemaDocs<T extends FirebaseFirestore.QueryDocumentSnapshot>(docs: T[]): T[] {
  return docs.filter((doc) => doc.id !== '_schema');
}

export function orderPunchesChronologically(punches: AttendancePunch[]): AttendancePunch[] {
  return [...punches].sort((left, right) => new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime());
}

export function groupPunchesByDate(punches: AttendancePunch[]): Map<string, AttendancePunch[]> {
  const groups = new Map<string, AttendancePunch[]>();

  for (const punch of punches) {
    groups.set(punch.dateKey, [...(groups.get(punch.dateKey) ?? []), punch]);
  }

  return groups;
}

export function resolveNextPunchType(lastPunch: AttendancePunch | null): AttendancePunch['punchType'] {
  return !lastPunch || lastPunch.punchType === 'OUT' ? 'IN' : 'OUT';
}

export function buildPairGroup(dateKey: string, punchCount: number): string {
  return `${dateKey}_shift_${Math.floor(punchCount / 2) + 1}`;
}

export function calcScheduledMinutes(schedule: Pick<Schedule, 'start' | 'end' | 'breakMinutes'>): number {
  const [startHour, startMinute] = schedule.start.split(':').map(Number);
  const [endHour, endMinute] = schedule.end.split(':').map(Number);

  return endHour * 60 + endMinute - (startHour * 60 + startMinute) - schedule.breakMinutes;
}

export function buildDateRangeKeys(fromDate: string, toDate: string): string[] {
  const keys: string[] = [];
  const [fromYear, fromMonth, fromDay] = fromDate.split('-').map(Number);
  const [toYear, toMonth, toDay] = toDate.split('-').map(Number);
  const current = new Date(Date.UTC(fromYear, fromMonth - 1, fromDay));
  const end = new Date(Date.UTC(toYear, toMonth - 1, toDay));

  while (current <= end) {
    keys.push(formatDateKey(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return keys;
}

export function buildAttendancePunch(input: {
  userId: string;
  user: User;
  context: AttendanceDayContext;
  punchType: AttendancePunch['punchType'];
  timestamp: string;
  source: AttendancePunch['source'];
  pairGroup: string;
  isEdited: boolean;
  editedAt: string | null;
  editedBy: string | null;
  createdAt: string;
  updatedAt: string;
}): Omit<AttendancePunch, 'id'> {
  return {
    userId: input.userId,
    employeeCode: input.user.employeeCode,
    dateKey: input.context.dateKey,
    weekKey: input.context.weekKey,
    timezone: input.context.timezone,
    punchType: input.punchType,
    timestamp: input.timestamp,
    source: input.source,
    scheduleSnapshot: input.user.schedule,
    pairGroup: input.pairGroup,
    isEdited: input.isEdited,
    editedAt: input.editedAt,
    editedBy: input.editedBy,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

export function buildCorrectedPunch(input: {
  before: AttendancePunch;
  userId: string;
  user: User;
  context: AttendanceDayContext;
  punchType: AttendancePunch['punchType'];
  timestamp: string;
  pairGroup: string;
  editedAt: string;
  editedBy: string;
}): AttendancePunch {
  return {
    ...input.before,
    userId: input.userId,
    employeeCode: input.user.employeeCode,
    dateKey: input.context.dateKey,
    weekKey: input.context.weekKey,
    timezone: input.context.timezone,
    punchType: input.punchType,
    timestamp: input.timestamp,
    source: input.before.source,
    scheduleSnapshot: input.before.scheduleSnapshot ?? input.user.schedule,
    pairGroup: input.pairGroup,
    isEdited: true,
    editedAt: input.editedAt,
    editedBy: input.editedBy,
    updatedAt: input.editedAt,
  };
}

// hours computaion
export function buildDailySummaryFromPunches(
  userId: string,
  user: User,
  dateKey: string,
  punches: AttendancePunch[],
  computedAt = new Date().toISOString(),
): DailySummary | null {
  if (punches.length === 0) {
    return null;
  }

  const orderedPunches = orderPunchesChronologically(punches);
  const timezone = orderedPunches[0]?.timezone ?? user.timezone ?? 'Asia/Manila';
  const firstInPunch = orderedPunches.find((punch) => punch.punchType === 'IN') ?? null;
  const outPunches = orderedPunches.filter((punch) => punch.punchType === 'OUT');
  const lastOutPunch = outPunches.length > 0 ? outPunches[outPunches.length - 1] : null;
  const firstIn = firstInPunch ? new Date(firstInPunch.timestamp) : null;
  const lastOut = lastOutPunch ? new Date(lastOutPunch.timestamp) : null;
  const scheduledMinutes = calcScheduledMinutes(user.schedule);
  const computed = firstIn ? computeDaySummary(firstIn, lastOut, user.schedule, timezone) : null;

  return {
    id: `${userId}_${dateKey}`,
    userId,
    employeeCode: user.employeeCode,
    dateKey,
    weekKey: orderedPunches[0]?.weekKey ?? getWeekKey(new Date(orderedPunches[0].timestamp), timezone),
    timezone,
    schedule: { ...user.schedule, scheduledMinutes },
    firstIn: firstIn?.toISOString() ?? null,
    lastOut: lastOut?.toISOString() ?? null,
    punchCount: orderedPunches.length,
    punchIds: orderedPunches.map((punch) => punch.id),
    workedMinutes: computed?.workedMinutes ?? 0,
    regularMinutes: computed?.regularMinutes ?? 0,
    overtimeMinutes: computed?.overtimeMinutes ?? 0,
    nightDifferentialMinutes: computed?.nightDifferentialMinutes ?? 0,
    lateMinutes: computed?.lateMinutes ?? 0,
    undertimeMinutes: computed?.undertimeMinutes ?? 0,
    status: computed?.status ?? ('absent' as DailySummaryStatus),
    computationVersion: 1,
    computedAt,
    updatedAt: computedAt,
  };
}

export function buildSummaryImpact(before: DailySummary | null, after: DailySummary | null): AttendanceHistorySummaryImpact | null {
  if (!before || !after) {
    return null;
  }

  return {
    regularMinutesBefore: before.regularMinutes,
    regularMinutesAfter: after.regularMinutes,
    overtimeMinutesBefore: before.overtimeMinutes,
    overtimeMinutesAfter: after.overtimeMinutes,
    lateMinutesBefore: before.lateMinutes,
    lateMinutesAfter: after.lateMinutes,
    undertimeMinutesBefore: before.undertimeMinutes,
    undertimeMinutesAfter: after.undertimeMinutes,
  };
}

export function buildWeeklySummary(
  weekKey: string,
  dateRange: WeeklySummary['dateRange'],
  summaries: DailySummary[],
  computedAt = new Date().toISOString(),
): WeeklySummary {
  const first = summaries[0];
  const totals = summaries.reduce(
    (acc, summary) => ({
      workedMinutes: acc.workedMinutes + summary.workedMinutes,
      regularMinutes: acc.regularMinutes + summary.regularMinutes,
      overtimeMinutes: acc.overtimeMinutes + summary.overtimeMinutes,
      nightDifferentialMinutes: acc.nightDifferentialMinutes + summary.nightDifferentialMinutes,
      lateMinutes: acc.lateMinutes + summary.lateMinutes,
      undertimeMinutes: acc.undertimeMinutes + summary.undertimeMinutes,
    }),
    {
      workedMinutes: 0,
      regularMinutes: 0,
      overtimeMinutes: 0,
      nightDifferentialMinutes: 0,
      lateMinutes: 0,
      undertimeMinutes: 0,
    },
  );

  return {
    id: `${first.userId}_${weekKey}`,
    userId: first.userId,
    employeeCode: first.employeeCode,
    weekKey,
    dateRange,
    daysPresent: summaries.filter((summary) => summary.status !== 'absent').length,
    daysAbsent: 0,
    ...totals,
    dailySummaryIds: summaries.map((summary) => summary.id),
    computedAt,
    updatedAt: computedAt,
  };
}

export type AttendanceHistorySummaryImpact = NonNullable<AttendanceHistory['summaryImpact']>;

function formatDateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(
    date.getUTCDate(),
  ).padStart(2, '0')}`;
}
