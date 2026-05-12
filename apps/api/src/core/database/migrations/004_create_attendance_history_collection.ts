import { Migration } from './runner';

export const migration004: Migration = {
  version: '004',
  description: 'Create attendanceHistory collection — immutable audit log for punch edits',
  async up(db) {
    await db.collection('attendanceHistory').doc('__schema__').set({
      _schemaVersion: 1,
      _description: 'Immutable audit trail — one doc per change event on an attendance punch',
      _shape: {
        attendanceId: 'string — ref to attendance doc',
        userId: 'string',
        employeeCode: 'string',
        dateKey: 'YYYY-MM-DD',
        weekKey: 'YYYY-WNN',
        action: 'CREATE_PUNCH | UPDATE_PUNCH | DELETE_PUNCH | RECOMPUTE_DAY | MANUAL_ADJUSTMENT',
        changedBy: 'string — admin uid',
        changedByRole: 'ADMIN | MANAGER',
        reason: 'string | null',
        before: {
          punchType: 'IN | OUT',
          timestamp: 'ISO string',
          scheduleSnapshot: 'object',
        },
        after: {
          punchType: 'IN | OUT',
          timestamp: 'ISO string',
          scheduleSnapshot: 'object',
        },
        summaryImpact: {
          regularMinutesBefore: 'number',
          regularMinutesAfter: 'number',
          overtimeMinutesBefore: 'number',
          overtimeMinutesAfter: 'number',
          lateMinutesBefore: 'number',
          lateMinutesAfter: 'number',
          undertimeMinutesBefore: 'number',
          undertimeMinutesAfter: 'number',
        },
        changedAt: 'ISO string',
      },
      createdAt: new Date().toISOString(),
    });
  },
};
