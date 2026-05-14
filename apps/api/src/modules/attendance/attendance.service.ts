import { getDb } from '@api/core/database/firestore.client';
import { getDateKey, getWeekKey, computeWeekRange } from '@api/core/utils/time.utils';
import {
  AttendancePunch,
  DailySummary,
  AttendanceHistory,
  WeeklySummary,
  User,
} from '@api/types';
import { PunchDto, AdminEditPunchDto, AdminPunchCorrectionDto, PunchHistoryQuery, PunchHistoryGroupQuery } from './attendance.dto';
import {
  buildAttendancePunch,
  buildCorrectedPunch,
  buildDailySummaryFromPunches,
  buildDateRangeKeys,
  buildPairGroup,
  buildSummaryImpact,
  buildWeeklySummary,
  filterSchemaDocs,
  getPageSize,
  groupPunchesByDate,
  httpError,
  mapDoc,
  orderPunchesChronologically,
  resolveNextPunchType,
} from './utils/attendance.utils';

export class AttendanceService {
  private db = getDb();

  async punch(userId: string, dto: PunchDto): Promise<AttendancePunch> {
    const userDoc = await this.db.collection('users').doc(userId).get();
    if (!userDoc.exists) throw httpError('User not found', 404);
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

    const lastPunch = lastPunchSnap.empty ? null : mapDoc<AttendancePunch>(lastPunchSnap.docs[0]);
    const punchType = resolveNextPunchType(lastPunch);

    // Compute pair group (shift index for this day)
    const allPunchesSnap = await this.db
      .collection('attendance')
      .where('userId', '==', userId)
      .where('dateKey', '==', dateKey)
      .get();
    const isoNow = now.toISOString();
    const punch = buildAttendancePunch({
      userId,
      user,
      context: { dateKey, weekKey, timezone },
      punchType,
      timestamp: isoNow,
      source: dto.source ?? 'web',
      pairGroup: buildPairGroup(dateKey, filterSchemaDocs(allPunchesSnap.docs).length),
      isEdited: false,
      editedAt: null,
      editedBy: null,
      createdAt: isoNow,
      updatedAt: isoNow,
    });

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
    const pageSize = getPageSize(limit, 20);
    const dateKey = getDateKey(new Date(), timezone);
    let query = this.db
      .collection('attendance')
      .where('userId', '==', userId)
      .where('dateKey', '==', dateKey)
      .orderBy('timestamp', 'desc');

    if (cursor) {
      const cursorSnap = await this.db.collection('attendance').doc(cursor).get();
      if (!cursorSnap.exists) {
        throw httpError('Cursor not found', 400);
      }
      query = query.startAfter(cursorSnap);
    }

    query = query.limit(pageSize + 1);

    const snap = await query.get();
    const docs = filterSchemaDocs(snap.docs);
    const hasMore = docs.length > pageSize;
    const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;
    const items = pageDocs.map((doc) => mapDoc<AttendancePunch>(doc));

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
    const pageSize = getPageSize(limit, 20);
    const batchSize = Math.max(pageSize * 5, 100);
    const items: AttendancePunch[] = [];
    let nextCursor = cursor ?? null;
    let hasMore = false;
    let cursorSnap: FirebaseFirestore.DocumentSnapshot | null = null;

    if (cursor) {
      const snap = await this.db.collection('attendance').doc(cursor).get();
      if (!snap.exists) {
        throw httpError('Cursor not found', 400);
      }
      cursorSnap = snap;
    }

    while (items.length <= pageSize) {
      let query = this.db.collection('attendance').orderBy('timestamp', 'desc').limit(batchSize);
      if (cursorSnap) {
        query = query.startAfter(cursorSnap);
      }

      const snap = await query.get();
      const docs = filterSchemaDocs(snap.docs);
      if (docs.length === 0) break;

      for (const doc of docs) {
        const punch = mapDoc<AttendancePunch>(doc);
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
    const pageSize = getPageSize(limit, Number.MAX_SAFE_INTEGER);
    const batchSize = Math.min(Math.max(pageSize, 100), 500);
    const items: AttendancePunch[] = [];
    let cursorSnap: FirebaseFirestore.DocumentSnapshot | null = null;

    while (items.length < pageSize) {
      let query = this.db.collection('attendance').orderBy('timestamp', 'desc').limit(batchSize);
      if (cursorSnap) {
        query = query.startAfter(cursorSnap);
      }

      const snap = await query.get();
      const docs = filterSchemaDocs(snap.docs);
      if (docs.length === 0) break;

      let hitOlderDay = false;
      for (const doc of docs) {
        const punch = mapDoc<AttendancePunch>(doc);
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
    const pageSize = getPageSize(limit, 30);
    const batchSize = Math.max(pageSize * 5, 100);
    const userDoc = await this.db.collection('users').doc(userId).get();
    if (!userDoc.exists) throw httpError('User not found', 404);
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
      const docs = filterSchemaDocs(snap.docs);
      if (docs.length === 0) break;

      for (const doc of docs) {
        const punch = mapDoc<AttendancePunch>(doc);
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
        const summary = buildDailySummaryFromPunches(userId, user, dateKey, punches);
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
      .filter((doc) => doc.id !== '_schema')
      .map((doc) => mapDoc<AttendanceHistory>(doc));
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
      throw httpError('fromDate must be before or equal to toDate', 400);
    }

    const userDoc = await this.db.collection('users').doc(userId).get();
    if (!userDoc.exists) throw httpError('User not found', 404);
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
      const docs = filterSchemaDocs(snap.docs);
      if (docs.length === 0) break;

      for (const doc of docs) {
        const punch = mapDoc<AttendancePunch>(doc);
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

    const orderedPunches = orderPunchesChronologically(punches);
    const groupMap = groupPunchesByDate(orderedPunches);
    const dayKeys = buildDateRangeKeys(query.fromDate, query.toDate);

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
    const pageSize = getPageSize(query.limit, 20);
    const batchSize = Math.max(pageSize * 5, 100);
    const items: AttendancePunch[] = [];
    let nextCursor = query.cursor ?? null;
    let hasMore = false;
    let cursorSnap: FirebaseFirestore.DocumentSnapshot | null = null;

    if (query.cursor) {
      const snap = await this.db.collection('attendance').doc(query.cursor).get();
      if (!snap.exists) {
        throw httpError('Cursor not found', 400);
      }
      cursorSnap = snap;
    }

    const punchType = query.punchType && (query.punchType === 'IN' || query.punchType === 'OUT') ? query.punchType : null;
    const fromDate = query.fromDate ?? null;
    const toDate = query.toDate ?? null;

    if (fromDate && toDate && fromDate > toDate) {
      throw httpError('fromDate must be before or equal to toDate', 400);
    }

    while (items.length <= pageSize) {
      let queryRef = this.db.collection('attendance').orderBy('timestamp', 'desc').limit(batchSize);
      if (cursorSnap) {
        queryRef = queryRef.startAfter(cursorSnap);
      }

      const snap = await queryRef.get();
      const docs = filterSchemaDocs(snap.docs);
      if (docs.length === 0) break;

      for (const doc of docs) {
        const punch = mapDoc<AttendancePunch>(doc);
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
    if (!snap.exists) throw httpError('Punch not found', 404);

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
    if (!userDoc.exists) throw httpError('User not found', 404);
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
      summaryImpact: buildSummaryImpact(summaryBefore, summaryAfter),
    });

    return after;
  }

  async saveAdminPunchCorrection(
    dto: AdminPunchCorrectionDto,
    adminId: string,
    adminRole: string
  ): Promise<AttendancePunch> {
    const userDoc = await this.db.collection('users').doc(dto.userId).get();
    if (!userDoc.exists) throw httpError('User not found', 404);

    const user = userDoc.data() as User;
    const timezone = user.timezone ?? 'Asia/Manila';
    const timestamp = new Date(dto.timestamp);
    if (Number.isNaN(timestamp.getTime())) {
      throw httpError('Invalid punch timestamp', 400);
    }

    const isoNow = new Date().toISOString();
    const dateKey = getDateKey(timestamp, timezone);
    const weekKey = getWeekKey(timestamp, timezone);

    if (dto.isNew || !dto.punchId) {
      const pairGroup = await this.buildPairGroup(dto.userId, dateKey);
      const punch = buildAttendancePunch({
        userId: dto.userId,
        user,
        context: { dateKey, weekKey, timezone },
        punchType: dto.punchType,
        timestamp: timestamp.toISOString(),
        source: 'admin',
        pairGroup,
        isEdited: true,
        editedAt: isoNow,
        editedBy: adminId,
        createdAt: isoNow,
        updatedAt: isoNow,
      });

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
    if (!snap.exists) throw httpError('Punch not found', 404);

    const before = { id: snap.id, ...snap.data() } as AttendancePunch;
    const previousDateKey = before.dateKey;
    const previousPunchUserId = before.userId;

    const after = buildCorrectedPunch({
      before,
      userId: dto.userId,
      user,
      context: { dateKey, weekKey, timezone },
      punchType: dto.punchType,
      timestamp: timestamp.toISOString(),
      pairGroup: await this.buildPairGroup(dto.userId, dateKey),
      editedAt: isoNow,
      editedBy: adminId,
    });

    await ref.set(after, { merge: true });

    const summaryBefore = await this.getDailySummary(previousPunchUserId, previousDateKey);
    await this.recomputeDailySummary(previousPunchUserId, previousDateKey, before.timezone);
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
          ? buildSummaryImpact(summaryBefore, summaryAfter)
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
    if (!snap.exists) throw httpError('Punch not found', 404);

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
    if (!userDoc.exists) throw httpError('User not found', 404);
    const user = userDoc.data() as User;
    await this.recomputeDailySummary(punch.userId, punch.dateKey, user.timezone);
  }

  async getAdminDailyReport(dateKey: string): Promise<DailySummary[]> {
    const snap = await this.db
      .collection('dailySummary')
      .where('dateKey', '==', dateKey)
      .get();

    return filterSchemaDocs(snap.docs).map((doc) => mapDoc<DailySummary>(doc));
  }

  async getAdminWeeklyReport(weekKey: string): Promise<WeeklySummary[]> {
    // Aggregate from dailySummary by weekKey
    const snap = await this.db
      .collection('dailySummary')
      .where('weekKey', '==', weekKey)
      .get();

    const byUser = new Map<string, DailySummary[]>();
    filterSchemaDocs(snap.docs)
      .forEach((doc) => {
        const s = mapDoc<DailySummary>(doc);
        if (!byUser.has(s.userId)) byUser.set(s.userId, []);
        byUser.get(s.userId)!.push(s);
      });

    const dateRange = computeWeekRange(weekKey);
    const results: WeeklySummary[] = [];

    for (const summaries of byUser.values()) {
      const weekly = buildWeeklySummary(weekKey, dateRange, summaries);

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

    const punches = filterSchemaDocs(punchesSnap.docs).map((doc) => mapDoc<AttendancePunch>(doc));

    const docId = `${userId}_${dateKey}`;

    if (punches.length === 0) {
      await this.db.collection('dailySummary').doc(docId).delete();
      return;
    }

    const userDoc = await this.db.collection('users').doc(userId).get();
    if (!userDoc.exists) throw httpError('User not found', 404);
    const user = userDoc.data() as User;
    const summary = buildDailySummaryFromPunches(userId, { ...user, timezone }, dateKey, punches);

    if (!summary) {
      await this.db.collection('dailySummary').doc(docId).delete();
      return;
    }

    await this.db.collection('dailySummary').doc(docId).set(summary, { merge: true });
  }

  private async buildPairGroup(userId: string, dateKey: string): Promise<string> {
    const snap = await this.db
      .collection('attendance')
      .where('userId', '==', userId)
      .where('dateKey', '==', dateKey)
      .get();

    return buildPairGroup(dateKey, filterSchemaDocs(snap.docs).length);
  }

  private async writeHistory(data: Omit<AttendanceHistory, 'id' | 'changedAt'>): Promise<void> {
    await this.db.collection('attendanceHistory').add({
      ...data,
      changedAt: new Date().toISOString(),
    });
  }
}
