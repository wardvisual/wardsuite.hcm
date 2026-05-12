import { Migration } from './runner';

export const migration002: Migration = {
  version: '002',
  description: 'Create attendance collection with schema seed',
  async up(db) {
    const sentinel = db.collection('attendance').doc('__schema__');
    await sentinel.set({
      _schemaVersion: 1,
      _description: 'Attendance punch record shape',
      _shape: {
        id: 'string',
        userId: 'string',
        type: 'IN | OUT',
        timestamp: 'ISO string',
        date: 'YYYY-MM-DD',
        createdAt: 'ISO string',
      },
      createdAt: new Date().toISOString(),
    });
  },
};
