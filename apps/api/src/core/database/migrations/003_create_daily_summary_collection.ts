import { Migration } from './runner';

export const migration003: Migration = {
  version: '003',
  description: 'Create dailySummary collection with schema seed',
  async up(db) {
    const sentinel = db.collection('dailySummary').doc('__schema__');
    await sentinel.set({
      _schemaVersion: 1,
      _description: 'Daily summary aggregation shape',
      _shape: {
        id: 'string — format: {userId}_{YYYY-MM-DD}',
        userId: 'string',
        date: 'YYYY-MM-DD',
        regularHours: 'number',
        overtimeHours: 'number',
        nightDiffHours: 'number',
        lateMinutes: 'number',
        undertimeMinutes: 'number',
        firstPunchIn: 'ISO string | null',
        lastPunchOut: 'ISO string | null',
        createdAt: 'ISO string',
        updatedAt: 'ISO string',
      },
      createdAt: new Date().toISOString(),
    });
  },
};
