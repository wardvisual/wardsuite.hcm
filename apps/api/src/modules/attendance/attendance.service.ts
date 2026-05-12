import * as admin from 'firebase-admin';
import { getDb } from '@api/core/database/firestore.client';
import {
  getDateKey,
  getWeekKey,
  computeDaySummary,
  computeWeekRange,
} from '@api/core/utils/time.utils';
import {
  AttendancePunch,
  DailySummary,
  AttendanceHistory,
  WeeklySummary,
  User,
  HistoryAction,
} from '@api/types';
import { PunchDto, AdminEditPunchDto } from './attendance.dto';

export class AttendanceService {
  private db = getDb();

  async punch(userId: string, dto: PunchDto): Promise<AttendancePunch> {
    const userDoc = await this.db.collection('users').doc(userId).get();
    if (!userDoc.exists) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    const user = userDoc.data() as User;

    const now = new Date();
    const timezone = dto.timezone ?? user.timezone ?? 'Asia/Manila';
    const dateKey = getDateKey(now, timezone);
    const weekKey = getWeekKey(now, timezone);

    // Determine punch type from last punch on this day
    const lastPunchSnap = await this.db
      .collection('attendance')
      .where('userId', '==', userId)
      .where('dateKey', '==', dateKey)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    const lastPunch = lastPunchSnap.empty ? null : (lastPunchSnap.docs[0].data() as AttendancePunch);
    const punchType = !lastPunch || lastPunch.punchType === 'OUT' ? 'IN' : 'OUT';

    // Compute pair group (shift index for this day)
    const allPunchesSnap = await this.db
      .collection('attendance')
      .where('userId', '==', userId)
      .where('dateKey', '==', dateKey)
      .get();
    const shiftIndex = Math.floor(allPunchesSnap.size / 2) + 1;
    const pairGroup = `${dateKey}_shift_${shiftIndex}`;

    const isoNow = now.toISOString();
    const punch: Omit<AttendancePunch, 'id'> = {
      userId,
      employeeCode: user.employeeCode,
      dateKey,
      weekKey,
      timezone,
      punchType,
      timestamp: isoNow,
      source: dto.source ?? 'web',
      scheduleSnapshot: user.schedule,
      pairGroup,
      isEdited: false,
      editedAt: null,
      editedBy: null,
      createdAt: isoNow,
      updatedAt: isoNow,
    };

    const ref = await this.db.collection('attendance').add(punch);
    const created = { id: ref.id, ...punch };

    // Log creation history
    await this.writeHistory({
      attendanceId: ref.id,
      userId,
      employeeCode: user.employeeCode,
      dateKey,
      weekKey,
      action: 'CREATE_PUNCH',
      changedBy: userId,
      changedByRole: user.role,
      reason: null,
      before: null,
      after: created,
      summaryImpact: null,
    });

    // Recompute daily summary
    await this.recomputeDailySummary(userId, dateKey, timezone);

    return created;
  }

  async getTodayPunches(userId: string, timezone: string): Promise<AttendancePunch[]> {
    const dateKey = getDateKey(new Date(), timezone);
    const snap = await this.db
      .collection('attendance')
      .where('userId', '==', userId)
      .where('dateKey', '==', dateKey)
      .orderBy('timestamp', 'asc')
      .get();

    return snap.docs
      .filter((d) => d.id !== '_schema')
      .map((d) => ({ id: d.id, ...d.data() }) as AttendancePunch);
  }

  async getDailySummary(userId: string, dateKey: string): Promise<DailySummary | null> {
    const docId = `${userId}_${dateKey}`;
    const snap = await this.db.collection('dailySummary').doc(docId).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as DailySummary;
  }

  async getHistory(userId: string, limit = 30): Promise<DailySummary[]> {
    const snap = await this.db
      .collection('dailySummary')
      .where('userId', '==', userId)
      .orderBy('dateKey', 'desc')
      .limit(limit)
      .get();

    return snap.docs
      .filter((d) => d.id !== '_schema')
      .map((d) => ({ id: d.id, ...d.data() }) as DailySummary);
  }

  async getAttendanceHistory(attendanceId: string): Promise<AttendanceHistory[]> {
    const snap = await this.db
      .collection('attendanceHistory')
      .where('attendanceId', '==', attendanceId)
      .orderBy('changedAt', 'desc')
      .get();

    return snap.docs
      .filter((d) => d.id !== '_schema')
      .map((d) => ({ id: d.id, ...d.data() }) as AttendanceHistory);
  }

  async adminEditPunch(
    punchId: string,
    dto: AdminEditPunchDto,
    adminId: string,
    adminRole: string
  ): Promise<AttendancePunch> {
    const ref = this.db.collection('attendance').doc(punchId);
    const snap = await ref.get();
    if (!snap.exists) throw Object.assign(new Error('Punch not found'), { statusCode: 404 });

    const before = { id: snap.id, ...snap.data() } as AttendancePunch;
    const isoNow = new Date().toISOString();

    const update = {
      timestamp: dto.timestamp,
      isEdited: true,
      editedAt: isoNow,
      editedBy: adminId,
      updatedAt: isoNow,
    };

    await ref.update(update);
    const after = { ...before, ...update };

    // Get summary before edit
    const summaryBefore = await this.getDailySummary(before.userId, before.dateKey);

    // Recompute
    const userDoc = await this.db.collection('users').doc(before.userId).get();
    const user = userDoc.data() as User;
    await this.recomputeDailySummary(before.userId, before.dateKey, user.timezone);

    const summaryAfter = await this.getDailySummary(before.userId, before.dateKey);

    await this.writeHistory({
      attendanceId: punchId,
      userId: before.userId,
      employeeCode: before.employeeCode,
      dateKey: before.dateKey,
      weekKey: before.weekKey,
      action: 'UPDATE_PUNCH',
      changedBy: adminId,
      changedByRole: adminRole,
      reason: dto.reason ?? null,
      before,
      after,
      summaryImpact: summaryBefore && summaryAfter ? {
        regularMinutesBefore: summaryBefore.regularMinutes,
        regularMinutesAfter: summaryAfter.regularMinutes,
        overtimeMinutesBefore: summaryBefore.overtimeMinutes,
        overtimeMinutesAfter: summaryAfter.overtimeMinutes,
        lateMinutesBefore: summaryBefore.lateMinutes,
        lateMinutesAfter: summaryAfter.lateMinutes,
        undertimeMinutesBefore: summaryBefore.undertimeMinutes,
        undertimeMinutesAfter: summaryAfter.undertimeMinutes,
      } : null,
    });

    return after;
  }

  async adminDeletePunch(
    punchId: string,
    reason: string,
    adminId: string,
    adminRole: string
  ): Promise<void> {
    const ref = this.db.collection('attendance').doc(punchId);
    const snap = await ref.get();
    if (!snap.exists) throw Object.assign(new Error('Punch not found'), { statusCode: 404 });

    const punch = { id: snap.id, ...snap.data() } as AttendancePunch;

    await this.writeHistory({
      attendanceId: punchId,
      userId: punch.userId,
      employeeCode: punch.employeeCode,
      dateKey: punch.dateKey,
      weekKey: punch.weekKey,
      action: 'DELETE_PUNCH',
      changedBy: adminId,
      changedByRole: adminRole,
      reason,
      before: punch,
      after: null,
      summaryImpact: null,
    });

    await ref.delete();

    const userDoc = await this.db.collection('users').doc(punch.userId).get();
    const user = userDoc.data() as User;
    await this.recomputeDailySummary(punch.userId, punch.dateKey, user.timezone);
  }

  async getAdminDailyReport(dateKey: string): Promise<DailySummary[]> {
    const snap = await this.db
      .collection('dailySummary')
      .where('dateKey', '==', dateKey)
      .get();

    return snap.docs
      .filter((d) => d.id !== '_schema')
      .map((d) => ({ id: d.id, ...d.data() }) as DailySummary);
  }

  async getAdminWeeklyReport(weekKey: string): Promise<WeeklySummary[]> {
    // Aggregate from dailySummary by weekKey
    const snap = await this.db
      .collection('dailySummary')
      .where('weekKey', '==', weekKey)
      .get();

    const byUser = new Map<string, DailySummary[]>();
    snap.docs
      .filter((d) => d.id !== '_schema')
      .forEach((d) => {
        const s = { id: d.id, ...d.data() } as DailySummary;
        if (!byUser.has(s.userId)) byUser.set(s.userId, []);
        byUser.get(s.userId)!.push(s);
      });

    const { start, end } = computeWeekRange(weekKey);
    const results: WeeklySummary[] = [];

    for (const [userId, summaries] of byUser) {
      const first = summaries[0];
      const total = summaries.reduce(
        (acc, s) => ({
          workedMinutes: acc.workedMinutes + s.workedMinutes,
          regularMinutes: acc.regularMinutes + s.regularMinutes,
          overtimeMinutes: acc.overtimeMinutes + s.overtimeMinutes,
          nightDifferentialMinutes: acc.nightDifferentialMinutes + s.nightDifferentialMinutes,
          lateMinutes: acc.lateMinutes + s.lateMinutes,
          undertimeMinutes: acc.undertimeMinutes + s.undertimeMinutes,
        }),
        { workedMinutes: 0, regularMinutes: 0, overtimeMinutes: 0, nightDifferentialMinutes: 0, lateMinutes: 0, undertimeMinutes: 0 }
      );

      const now = new Date().toISOString();
      const weekly: WeeklySummary = {
        id: `${userId}_${weekKey}`,
        userId,
        employeeCode: first.employeeCode,
        weekKey,
        dateRange: { start, end },
        daysPresent: summaries.filter((s) => s.status !== 'absent').length,
        daysAbsent: 0,
        ...total,
        dailySummaryIds: summaries.map((s) => s.id),
        computedAt: now,
        updatedAt: now,
      };

      // Persist/update weeklySummary
      await this.db.collection('weeklySummary').doc(weekly.id).set(weekly, { merge: true });
      results.push(weekly);
    }

    return results;
  }

  // ── private helpers ─────────────────────────────────────────────────────────

  private async recomputeDailySummary(
    userId: string,
    dateKey: string,
    timezone: string
  ): Promise<void> {
    const punchesSnap = await this.db
      .collection('attendance')
      .where('userId', '==', userId)
      .where('dateKey', '==', dateKey)
      .orderBy('timestamp', 'asc')
      .get();

    const punches = punchesSnap.docs
      .filter((d) => d.id !== '__schema__')
      .map((d) => ({ id: d.id, ...d.data() }) as AttendancePunch);

    if (punches.length === 0) return;

    const userDoc = await this.db.collection('users').doc(userId).get();
    const user = userDoc.data() as User;
    const schedule = user.schedule;

    const inPunches = punches.filter((p) => p.punchType === 'IN');
    const outPunches = punches.filter((p) => p.punchType === 'OUT');

    const firstIn = inPunches.length > 0 ? new Date(inPunches[0].timestamp) : null;
    const lastOut = outPunches.length > 0 ? new Date(outPunches[outPunches.length - 1].timestamp) : null;

    const weekKey = getWeekKey(new Date(punches[0].timestamp), timezone);
    const scheduledMinutes = this.calcScheduledMinutes(schedule);

    const computed = firstIn
      ? computeDaySummary(firstIn, lastOut, schedule, timezone)
      : null;

    const now = new Date().toISOString();
    const docId = `${userId}_${dateKey}`;

    const summary: DailySummary = {
      id: docId,
      userId,
      employeeCode: user.employeeCode,
      dateKey,
      weekKey,
      timezone,
      schedule: { ...schedule, scheduledMinutes },
      firstIn: firstIn?.toISOString() ?? null,
      lastOut: lastOut?.toISOString() ?? null,
      punchCount: punches.length,
      punchIds: punches.map((p) => p.id),
      workedMinutes: computed?.workedMinutes ?? 0,
      regularMinutes: computed?.regularMinutes ?? 0,
      overtimeMinutes: computed?.overtimeMinutes ?? 0,
      nightDifferentialMinutes: computed?.nightDifferentialMinutes ?? 0,
      lateMinutes: computed?.lateMinutes ?? 0,
      undertimeMinutes: computed?.undertimeMinutes ?? 0,
      status: computed?.status ?? 'absent',
      computationVersion: 1,
      computedAt: now,
      updatedAt: now,
    };

    await this.db.collection('dailySummary').doc(docId).set(summary, { merge: true });
  }

  private calcScheduledMinutes(schedule: { start: string; end: string; breakMinutes: number }): number {
    const [sh, sm] = schedule.start.split(':').map(Number);
    const [eh, em] = schedule.end.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm) - schedule.breakMinutes;
  }

  private async writeHistory(data: Omit<AttendanceHistory, 'id' | 'changedAt'>): Promise<void> {
    await this.db.collection('attendanceHistory').add({
      ...data,
      changedAt: new Date().toISOString(),
    });
  }
}
