import { getDb } from '../firestore.client';

export interface Migration {
  version: string;
  description: string;
  up: (db: FirebaseFirestore.Firestore) => Promise<void>;
}

const MIGRATIONS_COLLECTION = '_migrations';

export class MigrationRunner {
  private db = getDb();
  private migrations: Migration[] = [];

  register(migration: Migration): void {
    this.migrations.push(migration);
    this.migrations.sort((a, b) => a.version.localeCompare(b.version));
  }

  private async getApplied(): Promise<string[]> {
    const snap = await this.db.collection(MIGRATIONS_COLLECTION).get();
    return snap.docs.map((d) => d.id);
  }

  async run(): Promise<void> {
    const applied = await this.getApplied();
    const pending = this.migrations.filter((m) => !applied.includes(m.version));

    if (pending.length === 0) {
      console.log('[migrations] Nothing to run — schema is up to date.');
      return;
    }

    for (const migration of pending) {
      console.log(`[migrations] Applying ${migration.version}: ${migration.description}`);
      await migration.up(this.db);
      await this.db.collection(MIGRATIONS_COLLECTION).doc(migration.version).set({
        version: migration.version,
        description: migration.description,
        appliedAt: new Date().toISOString(),
      });
      console.log(`[migrations] Applied ${migration.version}`);
    }

    console.log(`[migrations] Done. Applied ${pending.length} migration(s).`);
  }

  async status(): Promise<void> {
    const applied = await this.getApplied();
    console.log('\n[migrations] Status:');
    for (const m of this.migrations) {
      const state = applied.includes(m.version) ? '✓' : '✗';
      console.log(`  ${state} ${m.version} — ${m.description}`);
    }
  }
}
