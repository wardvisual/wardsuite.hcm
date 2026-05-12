import path from 'path';
import dotenv from 'dotenv';
// Defer loading application modules until after dotenv config so env vars are available.

// Load root .env explicitly so running from the `apps/api` cwd picks up project vars.
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });
console.error('[migrate] loaded env from', envPath, 'FIREBASE_PROJECT_ID=',
  process.env.FIREBASE_PROJECT_ID ? 'present' : 'missing');

const { createMigrationRunner } = require('../src/core/database/migrations');
const { env } = require('../src/lib/env');
const admin = require('firebase-admin');

// Initialize Firebase Admin similar to seed.ts so migrations can run standalone.
if (!admin.apps.length) {
  const projectId = env.firebaseProjectId;
  const clientEmail = env.firebaseClientEmail;
  const privateKey = env.firebasePrivateKey?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey } as any),
      ...(env.firebaseDatabaseId ? { databaseURL: `https://${projectId}.firebaseio.com` } : {}),
    });
  } else if (projectId) {
    // Fallback to application default credentials when running in GCP/emulator
    admin.initializeApp({ projectId });
  } else {
    throw new Error('FIREBASE_PROJECT_ID is required to run migrations');
  }
}

const command = process.argv[2] ?? 'run';

async function main() {
  const runner = createMigrationRunner();

  if (command === 'status') {
    await runner.status();
  } else if (command === 'run') {
    await runner.run();
  } else {
    console.error(`Unknown command: ${command}. Use "run" or "status".`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[migrate] Fatal error:', err);
  process.exit(1);
});
