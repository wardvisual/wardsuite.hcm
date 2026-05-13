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
import { PunchDto, AdminEditPunchDto, AdminPunchCorrectionDto, PunchHistoryQuery, PunchHistoryGroupQuery } from './attendance.dto';

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

  async getTodayPunches(userId: string, timezone: string, limit?: number): Promise<AttendancePunch[]> {
    const page = await this.getTodayPunchPage(userId, timezone, limit);
    return page.items;
  }

  async getTodayPunchPage(
    userId: string,
    timezone: string,
    limit = 20,
    cursor?: string,
  ): Promise<{ items: AttendancePunch[]; nextCursor: string | null; hasMore: boolean }> {
    const pageSize = Number.isFinite(limit) && limit > 0 ? limit : 20;
    const dateKey = getDateKey(new Date(), timezone);
    let query = this.db
      .collection('attendance')
      .where('userId', '==', userId)
      .where('dateKey', '==', dateKey)
      .orderBy('timestamp', 'desc');

    if (cursor) {
      const cursorSnap = await this.db.collection('attendance').doc(cursor).get();
      if (!cursorSnap.exists) {
        throw Object.assign(new Error('Cursor not found'), { statusCode: 400 });
      }
      query = query.startAfter(cursorSnap);
    }

    query = query.limit(pageSize + 1);

    const snap = await query.get();
    const docs = snap.docs.filter((d) => d.id !== '_schema');
    const hasMore = docs.length > pageSize;
    const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;
    const items = pageDocs.map((d) => ({ id: d.id, ...d.data() }) as AttendancePunch);

    return {
      items,
      nextCursor: hasMore && pageDocs.length > 0 ? pageDocs[pageDocs.length - 1].id : null,
      hasMore,
    };
  }

  async getEmployeePunchPage(
    userId: string,
    limit = 20,
    cursor?: string,
  ): Promise<{ items: AttendancePunch[]; nextCursor: string | null; hasMore: boolean }> {
    const pageSize = Number.isFinite(limit) && limit > 0 ? limit : 20;
    const batchSize = Math.max(pageSize * 5, 100);
    const items: AttendancePunch[] = [];
    let nextCursor = cursor ?? null;
    let hasMore = false;
    let cursorSnap: FirebaseFirestore.DocumentSnapshot | null = null;

    if (cursor) {
      const snap = await this.db.collection('attendance').doc(cursor).get();
      if (!snap.exists) {
        throw Object.assign(new Error('Cursor not found'), { statusCode: 400 });
      }
      cursorSnap = snap;
    }

    while (items.length <= pageSize) {
      let query = this.db.collection('attendance').orderBy('timestamp', 'desc').limit(batchSize);
      if (cursorSnap) {
        query = query.startAfter(cursorSnap);
      }

      const snap = await query.get();
      const docs = snap.docs.filter((d) => d.id !== '_schema');
      if (docs.length === 0) break;

      for (const doc of docs) {
        const punch = { id: doc.id, ...doc.data() } as AttendancePunch;
        if (punch.userId === userId) {
          items.push(punch);
        }
        cursorSnap = doc;
        nextCursor = doc.id;

        if (items.length > pageSize) {
          hasMore = true;
          break;
        }
      }

      if (hasMore || docs.length < batchSize) {
        break;
      }
    }

    return {
      items: items.slice(0, pageSize),
      nextCursor: hasMore ? nextCursor : null,
      hasMore,
    };
  }

  async getAdminTodayPunches(timezone: string, limit?: number): Promise<AttendancePunch[]> {
    const dateKey = getDateKey(new Date(), timezone);
    const pageSize = Number.isFinite(limit) && limit && limit > 0 ? limit : Number.MAX_SAFE_INTEGER;
    const batchSize = Math.min(Math.max(pageSize, 100), 500);
    const items: AttendancePunch[] = [];
    let cursorSnap: FirebaseFirestore.DocumentSnapshot | null = null;

    while (items.length < pageSize) {
      let query = this.db.collection('attendance').orderBy('timestamp', 'desc').limit(batchSize);
      if (cursorSnap) {
        query = query.startAfter(cursorSnap);
      }

      const snap = await query.get();
      const docs = snap.docs.filter((d) => d.id !== '_schema');
      if (docs.length === 0) break;

      let hitOlderDay = false;
      for (const doc of docs) {
        const punch = { id: doc.id, ...doc.data() } as AttendancePunch;
        cursorSnap = doc;

        if (punch.dateKey === dateKey) {
          items.push(punch);
          if (items.length >= pageSize) {
            break;
          }
        } else {
          hitOlderDay = true;
          break;
        }
      }

      if (hitOlderDay || docs.length < batchSize) {
        break;
      }
    }

    return items;
  }

  async getDailySummary(userId: string, dateKey: string): Promise<DailySummary | null> {
    const docId = `${userId}_${dateKey}`;
    const snap = await this.db.collection('dailySummary').doc(docId).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as DailySummary;
  }

  async getHistory(userId: string, limit = 30): Promise<DailySummary[]> {
    const pageSize = Number.isFinite(limit) && limit > 0 ? limit : 30;
    const batchSize = Math.max(pageSize * 5, 100);
    const userDoc = await this.db.collection('users').doc(userId).get();
    if (!userDoc.exists) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    const user = userDoc.data() as User;

    const punchesByDate = new Map<string, AttendancePunch[]>();
    const dateOrder: string[] = [];
    let cursorSnap: FirebaseFirestore.DocumentSnapshot | null = null;
    let hitOlderDate = false;

    while (!hitOlderDate) {
      let query = this.db.collection('attendance').orderBy('timestamp', 'desc').limit(batchSize);
      if (cursorSnap) {
        query = query.startAfter(cursorSnap);
      }

      const snap = await query.get();
      const docs = snap.docs.filter((d) => d.id !== '_schema');
      if (docs.length === 0) break;

      for (const doc of docs) {
        const punch = { id: doc.id, ...doc.data() } as AttendancePunch;
        cursorSnap = doc;

        if (punch.userId !== userId) {
          continue;
        }

        if (!punchesByDate.has(punch.dateKey)) {
          if (dateOrder.length >= pageSize) {
            hitOlderDate = true;
            break;
          }
          punchesByDate.set(punch.dateKey, []);
          dateOrder.push(punch.dateKey);
        }

        punchesByDate.get(punch.dateKey)!.push(punch);
      }

      if (docs.length < batchSize) {
        break;
      }
    }

    const histories = dateOrder
      .map((dateKey) => {
        const punches = punchesByDate.get(dateKey) ?? [];
        const summary = this.buildDailySummaryFromPunches(userId, user, dateKey, punches);
        return summary;
      })
      .filter((summary): summary is DailySummary => summary !== null)
      .sort((left, right) => right.dateKey.localeCompare(left.dateKey));

    return histories.slice(0, pageSize);
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

  async getEmployeePunchHistoryGroups(
    userId: string,
    query: PunchHistoryGroupQuery,
  ): Promise<{
    userId: string;
    employeeCode: string;
    fromDate: string;
    toDate: string;
    totalPunches: number;
    groups: Array<{ dateKey: string; punches: AttendancePunch[] }>;
  }> {
    if (query.fromDate > query.toDate) {
      throw Object.assign(new Error('fromDate must be before or equal to toDate'), { statusCode: 400 });
    }

    const userDoc = await this.db.collection('users').doc(userId).get();
    if (!userDoc.exists) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    const user = userDoc.data() as User;

    const batchSize = 200;
    const punches: AttendancePunch[] = [];
    let cursorSnap: FirebaseFirestore.DocumentSnapshot | null = null;
    let hitBeforeRange = false;

    while (!hitBeforeRange) {
      let queryRef = this.db.collection('attendance').orderBy('timestamp', 'desc').limit(batchSize);
      if (cursorSnap) {
        queryRef = queryRef.startAfter(cursorSnap);
      }

      const snap = await queryRef.get();
      const docs = snap.docs.filter((d) => d.id !== '_schema');
      if (docs.length === 0) break;

      for (const doc of docs) {
        const punch = { id: doc.id, ...doc.data() } as AttendancePunch;
        cursorSnap = doc;

        if (punch.userId !== userId) {
          continue;
        }

        if (punch.dateKey < query.fromDate) {
          hitBeforeRange = true;
          break;
        }

        if (punch.dateKey > query.toDate) {
          continue;
        }

        if (query.punchType && punch.punchType !== query.punchType) {
          continue;
        }

        punches.push(punch);
      }

      if (docs.length < batchSize) {
        break;
      }
    }

    const orderedPunches = punches.sort((left, right) => new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime());
    const groupMap = new Map<string, AttendancePunch[]>();
    const dayKeys = this.buildDateRangeKeys(query.fromDate, query.toDate);

    for (const punch of orderedPunches) {
      if (!groupMap.has(punch.dateKey)) {
        groupMap.set(punch.dateKey, []);
      }
      groupMap.get(punch.dateKey)!.push(punch);
    }

    const groups = dayKeys.map((dateKey) => ({
      dateKey,
      punches: groupMap.get(dateKey) ?? [],
    }));

    return {
      userId,
      employeeCode: user.employeeCode,
      fromDate: query.fromDate,
      toDate: query.toDate,
      totalPunches: orderedPunches.length,
      groups,
    };
  }

  async getPunchHistoryPage(
    userId: string,
    query: PunchHistoryQuery,
  ): Promise<{ items: AttendancePunch[]; nextCursor: string | null; hasMore: boolean }> {
    const pageSize = Number.isFinite(query.limit) && (query.limit ?? 0) > 0 ? (query.limit as number) : 20;
    const batchSize = Math.max(pageSize * 5, 100);
    const items: AttendancePunch[] = [];
    let nextCursor = query.cursor ?? null;
    let hasMore = false;
    let cursorSnap: FirebaseFirestore.DocumentSnapshot | null = null;

    if (query.cursor) {
      const snap = await this.db.collection('attendance').doc(query.cursor).get();
      if (!snap.exists) {
        throw Object.assign(new Error('Cursor not found'), { statusCode: 400 });
      }
      cursorSnap = snap;
    }

    const punchType = query.punchType && (query.punchType === 'IN' || query.punchType === 'OUT') ? query.punchType : null;
    const fromDate = query.fromDate ?? null;
    const toDate = query.toDate ?? null;

    if (fromDate && toDate && fromDate > toDate) {
      throw Object.assign(new Error('fromDate must be before or equal to toDate'), { statusCode: 400 });
    }

    while (items.length <= pageSize) {
      let queryRef = this.db.collection('attendance').orderBy('timestamp', 'desc').limit(batchSize);
      if (cursorSnap) {
        queryRef = queryRef.startAfter(cursorSnap);
      }

      const snap = await queryRef.get();
      const docs = snap.docs.filter((d) => d.id !== '_schema');
      if (docs.length === 0) break;

      for (const doc of docs) {
        const punch = { id: doc.id, ...doc.data() } as AttendancePunch;
        cursorSnap = doc;
        nextCursor = doc.id;

        if (punch.userId !== userId) {
          continue;
        }

        if (fromDate && punch.dateKey < fromDate) {
          continue;
        }

        if (toDate && punch.dateKey > toDate) {
          continue;
        }

        if (punchType && punch.punchType !== punchType) {
          continue;
        }

        items.push(punch);
        if (items.length > pageSize) {
          hasMore = true;
          break;
        }
      }

      if (hasMore || docs.length < batchSize) {
        break;
      }
    }

    return {
      items: items.slice(0, pageSize),
      nextCursor: hasMore ? nextCursor : null,
      hasMore,
    };
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

  async saveAdminPunchCorrection(
    dto: AdminPunchCorrectionDto,
    adminId: string,
    adminRole: string
  ): Promise<AttendancePunch> {
    const userDoc = await this.db.collection('users').doc(dto.userId).get();
    if (!userDoc.exists) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    const user = userDoc.data() as User;
    const timezone = user.timezone ?? 'Asia/Manila';
    const timestamp = new Date(dto.timestamp);
    if (Number.isNaN(timestamp.getTime())) {
      throw Object.assign(new Error('Invalid punch timestamp'), { statusCode: 400 });
    }

    const isoNow = new Date().toISOString();
    const dateKey = getDateKey(timestamp, timezone);
    const weekKey = getWeekKey(timestamp, timezone);

    if (dto.isNew || !dto.punchId) {
      const pairGroup = await this.buildPairGroup(dto.userId, dateKey);
      const punch: Omit<AttendancePunch, 'id'> = {
        userId: dto.userId,
        employeeCode: user.employeeCode,
        dateKey,
        weekKey,
        timezone,
        punchType: dto.punchType,
        timestamp: timestamp.toISOString(),
        source: 'admin',
        scheduleSnapshot: user.schedule,
        pairGroup,
        isEdited: true,
        editedAt: isoNow,
        editedBy: adminId,
        createdAt: isoNow,
        updatedAt: isoNow,
      };

      const ref = await this.db.collection('attendance').add(punch);
      const created = { id: ref.id, ...punch };

      await this.writeHistory({
        attendanceId: ref.id,
        userId: dto.userId,
        employeeCode: user.employeeCode,
        dateKey,
        weekKey,
        action: 'CREATE_PUNCH',
        changedBy: adminId,
        changedByRole: adminRole,
        reason: dto.reason ?? null,
        before: null,
        after: created,
        summaryImpact: null,
      });

      await this.recomputeDailySummary(dto.userId, dateKey, timezone);
      return created;
    }

    const ref = this.db.collection('attendance').doc(dto.punchId);
    const snap = await ref.get();
    if (!snap.exists) throw Object.assign(new Error('Punch not found'), { statusCode: 404 });

    const before = { id: snap.id, ...snap.data() } as AttendancePunch;
    const previousDateKey = before.dateKey;
    const previousWeekKey = before.weekKey;
    const previousPunchUserId = before.userId;

    const after: AttendancePunch = {
      ...before,
      userId: dto.userId,
      employeeCode: user.employeeCode,
      dateKey,
      weekKey,
      timezone,
      punchType: dto.punchType,
      timestamp: timestamp.toISOString(),
      source: before.source,
      scheduleSnapshot: before.scheduleSnapshot ?? user.schedule,
      pairGroup: await this.buildPairGroup(dto.userId, dateKey),
      isEdited: true,
      editedAt: isoNow,
      editedBy: adminId,
      updatedAt: isoNow,
    };

    await ref.set(after, { merge: true });

    const summaryBefore = await this.getDailySummary(previousPunchUserId, previousDateKey);
    await this.recomputeDailySummary(previousPunchUserId, previousDateKey, timezone);
    if (previousPunchUserId !== dto.userId || previousDateKey !== dateKey) {
      await this.recomputeDailySummary(dto.userId, dateKey, timezone);
    }
    const summaryAfter = await this.getDailySummary(dto.userId, dateKey);

    await this.writeHistory({
      attendanceId: before.id,
      userId: dto.userId,
      employeeCode: user.employeeCode,
      dateKey,
      weekKey,
      action: 'UPDATE_PUNCH',
      changedBy: adminId,
      changedByRole: adminRole,
      reason: dto.reason ?? null,
      before,
      after,
      summaryImpact:
        previousPunchUserId === dto.userId && previousDateKey === dateKey && summaryBefore && summaryAfter
          ? {
            regularMinutesBefore: summaryBefore.regularMinutes,
            regularMinutesAfter: summaryAfter.regularMinutes,
            overtimeMinutesBefore: summaryBefore.overtimeMinutes,
            overtimeMinutesAfter: summaryAfter.overtimeMinutes,
            lateMinutesBefore: summaryBefore.lateMinutes,
            lateMinutesAfter: summaryAfter.lateMinutes,
            undertimeMinutesBefore: summaryBefore.undertimeMinutes,
            undertimeMinutesAfter: summaryAfter.undertimeMinutes,
          }
          : null,
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
      .filter((d) => d.id !== '_schema')
      .map((d) => ({ id: d.id, ...d.data() }) as AttendancePunch);

    const docId = `${userId}_${dateKey}`;

    if (punches.length === 0) {
      await this.db.collection('dailySummary').doc(docId).delete();
      return;
    }

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

  private async buildPairGroup(userId: string, dateKey: string): Promise<string> {
    const snap = await this.db
      .collection('attendance')
      .where('userId', '==', userId)
      .where('dateKey', '==', dateKey)
      .get();

    const count = snap.docs.filter((doc) => doc.id !== '_schema').length;
    return `${dateKey}_shift_${Math.floor(count / 2) + 1}`;
  }

  private buildDateRangeKeys(fromDate: string, toDate: string): string[] {
    const keys: string[] = [];
    const [fromYear, fromMonth, fromDay] = fromDate.split('-').map(Number);
    const [toYear, toMonth, toDay] = toDate.split('-').map(Number);
    const current = new Date(Date.UTC(fromYear, fromMonth - 1, fromDay));
    const end = new Date(Date.UTC(toYear, toMonth - 1, toDay));

    const formatDateKey = (date: Date): string =>
      `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;

    while (current <= end) {
      keys.push(formatDateKey(current));
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return keys;
  }

  private buildDailySummaryFromPunches(
    userId: string,
    user: User,
    dateKey: string,
    punches: AttendancePunch[],
  ): DailySummary | null {
    if (punches.length === 0) {
      return null;
    }

    const orderedPunches = [...punches].sort((left, right) => new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime());
    const timezone = orderedPunches[0]?.timezone ?? user.timezone ?? 'Asia/Manila';
    const firstInPunch = orderedPunches.find((punch) => punch.punchType === 'IN') ?? orderedPunches[0];
    const outPunches = orderedPunches.filter((punch) => punch.punchType === 'OUT');
    const lastOutPunch = outPunches.length > 0 ? outPunches[outPunches.length - 1] : null;
    const firstIn = firstInPunch ? new Date(firstInPunch.timestamp) : null;
    const lastOut = lastOutPunch ? new Date(lastOutPunch.timestamp) : null;

    if (!firstIn) {
      return null;
    }

    const schedule = user.schedule;
    const scheduledMinutes = this.calcScheduledMinutes(schedule);
    const computed = computeDaySummary(firstIn, lastOut, schedule, timezone);
    const weekKey = orderedPunches[0]?.weekKey ?? getWeekKey(new Date(firstInPunch.timestamp), timezone);
    const now = new Date().toISOString();

    return {
      id: `${userId}_${dateKey}`,
      userId,
      employeeCode: user.employeeCode,
      dateKey,
      weekKey,
      timezone,
      schedule: { ...schedule, scheduledMinutes },
      firstIn: firstIn.toISOString(),
      lastOut: lastOut?.toISOString() ?? null,
      punchCount: orderedPunches.length,
      punchIds: orderedPunches.map((punch) => punch.id),
      workedMinutes: computed.workedMinutes,
      regularMinutes: computed.regularMinutes,
      overtimeMinutes: computed.overtimeMinutes,
      nightDifferentialMinutes: computed.nightDifferentialMinutes,
      lateMinutes: computed.lateMinutes,
      undertimeMinutes: computed.undertimeMinutes,
      status: computed.status,
      computationVersion: 1,
      computedAt: now,
      updatedAt: now,
    };
  }

  private async writeHistory(data: Omit<AttendanceHistory, 'id' | 'changedAt'>): Promise<void> {
    await this.db.collection('attendanceHistory').add({
      ...data,
      changedAt: new Date().toISOString(),
    });
  }
}
