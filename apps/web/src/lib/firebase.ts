import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { env } from '@web/lib/env';

const app = initializeApp(env.firebase);

export const firebaseAuth = getAuth(app);
export const firestore = getFirestore(app);
