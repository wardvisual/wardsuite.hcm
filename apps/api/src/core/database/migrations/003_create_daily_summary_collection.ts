import { Migration } from './runner';

export const migration003: Migration = {
  version: '003',
  description: 'Create dailySummary collection with full metrics schema seed',
  async up(db) {
    await db.collection('dailySummary').doc('__schema__').set({
      _schemaVersion: 2,
      _description: 'Pre-computed daily totals — doc ID: {uid}_{YYYY-MM-DD}',
      _shape: {
        userId: 'string',
        employeeCode: 'string',
        dateKey: 'YYYY-MM-DD',
        weekKey: 'YYYY-WNN',
        timezone: 'string',
        schedule: {
          start: 'HH:mm',
          end: 'HH:mm',
          breakMinutes: 'number',
          graceMinutes: 'number',
          scheduledMinutes: 'number',
        },
        firstIn: 'ISO string | null',
        lastOut: 'ISO string | null',
        punchCount: 'number',
        punchIds: 'string[]',
        workedMinutes: 'number',
        regularMinutes: 'number',
        overtimeMinutes: 'number',
        nightDifferentialMinutes: 'number',
        lateMinutes: 'number',
        undertimeMinutes: 'number',
        status: 'present | absent | late | half-day',
        computationVersion: 'number',
        computedAt: 'ISO string',
        updatedAt: 'ISO string',
      },
      updatedAt: new Date().toISOString(),
    });
  },
};
