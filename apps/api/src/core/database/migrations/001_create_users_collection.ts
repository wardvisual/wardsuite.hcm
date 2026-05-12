import { Migration } from './runner';

export const migration001: Migration = {
  version: '001',
  description: 'Create users collection with full HCM schema seed',
  async up(db) {
    await db.collection('users').doc('__schema__').set({
      _schemaVersion: 2,
      _description: 'User document shape',
      _shape: {
        uid: 'string — Firebase Auth UID',
        employeeCode: 'string — EMP-0001',
        name: 'string',
        email: 'string',
        role: 'ADMIN | MANAGER | STAFF',
        timezone: 'string — IANA tz (e.g. Asia/Manila)',
        status: 'active | inactive',
        schedule: {
          start: 'HH:mm',
          end: 'HH:mm',
          breakMinutes: 'number',
          graceMinutes: 'number',
        },
        createdAt: 'ISO string',
        updatedAt: 'ISO string',
        createdBy: 'string — uid of creator',
      },
      updatedAt: new Date().toISOString(),
    });
  },
};
