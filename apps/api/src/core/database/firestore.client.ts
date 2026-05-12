import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let db: Firestore | null = null;

import { env, requireFirebaseProjectId } from '@api/lib/env';

function initFirebase(): App {
  if (getApps().length) return getApps()[0];

  const projectId = requireFirebaseProjectId();

  const clientEmail = env.firebaseClientEmail;
  const rawKey = env.firebasePrivateKey;
  const privateKey = rawKey ? rawKey.replace(/\\n/g, '\n') : undefined;

  if (clientEmail && privateKey) {
    return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }

  return initializeApp({ projectId });
}

export class FirestoreClient {
  private static instance: FirestoreClient | null = null;
  private firestore: Firestore;

  private constructor() {
    const app = initFirebase();
    const databaseId = process.env.FIREBASE_DATABASE_ID;
    this.firestore = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  }

  static getInstance(): FirestoreClient {
    if (!FirestoreClient.instance) {
      FirestoreClient.instance = new FirestoreClient();
    }
    return FirestoreClient.instance;
  }

  getDb(): Firestore {
    return this.firestore;
  }

  collection(name: string) {
    return this.firestore.collection(name);
  }
}

export function getDb(): Firestore {
  if (!db) {
    db = FirestoreClient.getInstance().getDb();
  }
  return db;
}
