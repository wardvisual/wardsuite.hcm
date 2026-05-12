import { Migration } from './runner';

export const migration001: Migration = {
  version: '001',
  description: 'Create users collection with schema seed',
  async up(db) {
    const sentinel = db.collection('users').doc('__schema__');
    await sentinel.set({
      _schemaVersion: 1,
      _description: 'User document shape',
      _shape: {
        id: 'string',
        email: 'string',
        name: 'string',
        role: 'ADMIN | MANAGER | STAFF',
        timezone: 'string (optional)',
        schedule: {
          start: 'HH:mm',
          end: 'HH:mm',
        },
        createdAt: 'ISO string',
        updatedAt: 'ISO string',
      },
      createdAt: new Date().toISOString(),
    });
  },
};
