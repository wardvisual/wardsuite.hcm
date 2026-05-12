/**
 * Seed script: creates admin + 2 employee demo accounts in Firebase Auth + Firestore.
 * Run: npm run seed --workspace=api
 */
import path from 'path';
import dotenv from 'dotenv';

// Load root .env explicitly so running from the `apps/api` cwd picks up project vars.
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

const { env } = require('../src/lib/env');
const admin = require('firebase-admin');

const projectId = env.firebaseProjectId;
const clientEmail = env.firebaseClientEmail;
const privateKey = env.firebasePrivateKey?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      ...(env.firebaseDatabaseId ? { databaseURL: `https://${projectId}.firebaseio.com` } : {}),
    });
  } else if (projectId) {
    admin.initializeApp({ projectId });
  } else {
    throw new Error('FIREBASE_PROJECT_ID is required to run seed');
  }
}

const db = admin.firestore();
const auth = admin.auth();

const SEED_ACCOUNTS = [
  {
    email: 'admin@wardsuite.demo',
    password: 'Demo@1234',
    name: 'Admin User',
    role: 'ADMIN' as const,
    employeeCode: 'EMP-0001',
    schedule: { start: '09:00', end: '18:00', breakMinutes: 60, graceMinutes: 5 },
  },
  {
    email: 'juan@wardsuite.demo',
    password: 'Demo@1234',
    name: 'Juan Dela Cruz',
    role: 'STAFF' as const,
    employeeCode: 'EMP-0002',
    schedule: { start: '09:00', end: '18:00', breakMinutes: 60, graceMinutes: 5 },
  },
  {
    email: 'maria@wardsuite.demo',
    password: 'Demo@1234',
    name: 'Maria Santos',
    role: 'STAFF' as const,
    employeeCode: 'EMP-0003',
    schedule: { start: '08:00', end: '17:00', breakMinutes: 60, graceMinutes: 5 },
  },
];

async function seed() {
  console.log('[seed] Starting...\n');

  for (const account of SEED_ACCOUNTS) {
    try {
      let uid: string;

      try {
        const existing = await auth.getUserByEmail(account.email);
        uid = existing.uid;
        console.log(`[seed] ✓ Auth user already exists: ${account.email} (${uid})`);
      } catch {
        const created = await auth.createUser({
          email: account.email,
          password: account.password,
          displayName: account.name,
          emailVerified: true,
        });
        uid = created.uid;
        console.log(`[seed] ✓ Created auth user: ${account.email} (${uid})`);
      }

      const now = new Date().toISOString();
      const userDoc = {
        uid,
        employeeCode: account.employeeCode,
        name: account.name,
        email: account.email,
        role: account.role,
        timezone: 'Asia/Manila',
        status: 'active',
        schedule: account.schedule,
        createdAt: now,
        updatedAt: now,
        createdBy: 'seed',
      };

      await db.collection('users').doc(uid).set(userDoc, { merge: true });
      console.log(`[seed] ✓ Upserted Firestore user: ${account.name} (${account.role})\n`);
    } catch (err: any) {
      console.error(`[seed] ✗ Failed for ${account.email}:`, err.message);
    }
  }

  console.log('[seed] Done.');
  console.log('\nDemo credentials:');
  console.log('  Admin:      admin@wardsuite.demo   /  Demo@1234');
  console.log('  Employee 1: juan@wardsuite.demo    /  Demo@1234');
  console.log('  Employee 2: maria@wardsuite.demo   /  Demo@1234\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Fatal:', err);
  process.exit(1);
});
