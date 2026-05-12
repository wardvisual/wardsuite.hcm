export const env = {
    apiPort: Number(process.env.API_PORT ?? 3000),
    nodeEnv: process.env.NODE_ENV ?? 'development',

    firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? '',
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
    firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY ?? '',
    firebaseDatabaseId: process.env.FIREBASE_DATABASE_ID ?? '',
} as const;

export function requireFirebaseProjectId(): string {
    if (!env.firebaseProjectId) throw new Error('FIREBASE_PROJECT_ID is required in environment variables');
    return env.firebaseProjectId;
}
