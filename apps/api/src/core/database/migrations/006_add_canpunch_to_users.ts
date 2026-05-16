import { Migration } from './runner';

export const migration006: Migration = {
  version: '006',
  description: 'Add canPunch field to users collection — backfill ADMIN/MANAGER to false',
  async up(db) {
    // Update schema sentinel to document the new field
    await db.collection('users').doc('_schema').set(
      {
        _shape: {
          canPunch: 'boolean | undefined — when true, ADMIN/MANAGER accounts can clock in/out',
        },
        _schemaVersion: 3,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    // Backfill: set canPunch = false on all ADMIN/MANAGER docs that don't have the field yet
    const snap = await db
      .collection('users')
      .where('role', 'in', ['ADMIN', 'MANAGER'])
      .get();

    const batch = db.batch();
    const now = new Date().toISOString();

    for (const doc of snap.docs) {
      if (doc.id === '_schema') continue;
      const data = doc.data();
      if (data.canPunch === undefined) {
        batch.update(doc.ref, { canPunch: false, updatedAt: now });
      }
    }

    await batch.commit();
  },
};
