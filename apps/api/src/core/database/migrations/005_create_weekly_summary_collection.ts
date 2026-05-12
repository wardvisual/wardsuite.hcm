import { Migration } from './runner';

export const migration005: Migration = {
  version: '005',
  description: 'Create weeklySummary collection — aggregated weekly totals for admin reports',
  async up(db) {
    await db.collection('weeklySummary').doc('__schema__').set({
      _schemaVersion: 1,
      _description: 'Aggregated weekly totals — doc ID: {uid}_{YYYY-WNN}',
      _shape: {
        userId: 'string',
        employeeCode: 'string',
        weekKey: 'YYYY-WNN',
        dateRange: {
          start: 'YYYY-MM-DD — Monday',
          end: 'YYYY-MM-DD — Sunday',
        },
        daysPresent: 'number',
        daysAbsent: 'number',
        workedMinutes: 'number',
        regularMinutes: 'number',
        overtimeMinutes: 'number',
        nightDifferentialMinutes: 'number',
        lateMinutes: 'number',
        undertimeMinutes: 'number',
        dailySummaryIds: 'string[]',
        computedAt: 'ISO string',
        updatedAt: 'ISO string',
      },
      createdAt: new Date().toISOString(),
    });
  },
};
