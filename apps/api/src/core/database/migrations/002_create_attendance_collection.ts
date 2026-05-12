import { Migration } from './runner';

export const migration002: Migration = {
  version: '002',
  description: 'Create attendance collection with full punch schema seed',
  async up(db) {
    await db.collection('attendance').doc('__schema__').set({
      _schemaVersion: 2,
      _description: 'Attendance punch event — one doc per IN or OUT event',
      _shape: {
        userId: 'string — Firebase Auth UID',
        employeeCode: 'string',
        dateKey: 'string — YYYY-MM-DD',
        weekKey: 'string — YYYY-WNN',
        timezone: 'string',
        punchType: 'IN | OUT',
        timestamp: 'Firestore Timestamp',
        source: 'web | mobile | admin',
        scheduleSnapshot: {
          start: 'HH:mm',
          end: 'HH:mm',
          breakMinutes: 'number',
          graceMinutes: 'number',
        },
        pairGroup: 'string — dateKey_shift_N groups IN/OUT pairs',
        isEdited: 'boolean',
        editedAt: 'ISO string | null',
        editedBy: 'string uid | null',
        createdAt: 'ISO string',
        updatedAt: 'ISO string',
      },
      updatedAt: new Date().toISOString(),
    });
  },
};
