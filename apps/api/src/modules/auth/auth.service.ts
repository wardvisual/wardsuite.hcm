import * as admin from 'firebase-admin';
import { getDb } from '@api/core/database/firestore.client';
import { LoginDto, RegisterDto, LoginResult } from './auth.dto';
import { User } from '@api/types';

export class AuthService {
  private db = getDb();
  private auth = admin.auth();

  async register(dto: RegisterDto): Promise<{ user: User }> {
    const firebaseUser = await this.auth.createUser({
      email: dto.email,
      password: dto.password,
      displayName: dto.name,
    });

    const now = new Date().toISOString();
    const user: User = {
      id: firebaseUser.uid,
      email: dto.email,
      name: dto.name,
      role: dto.role ?? 'STAFF',
      timezone: dto.timezone ?? 'Asia/Manila',
      schedule: dto.schedule ?? { start: '09:00', end: '18:00' },
      createdAt: now,
      updatedAt: now,
    };

    await this.db.collection('users').doc(firebaseUser.uid).set(user);

    return { user };
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    // Firebase Admin SDK does not expose email/password sign-in.
    // The client (web) authenticates with Firebase Auth SDK and sends the ID token.
    // This endpoint accepts a pre-authenticated Firebase ID token, not a raw password.
    // The LoginDto.password field here holds the Firebase ID token from the client.
    const decodedToken = await this.auth.verifyIdToken(dto.password);

    const userDoc = await this.db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    const user = userDoc.data() as User;

    // Mint a custom token so the client can persist session state
    const token = await this.auth.createCustomToken(decodedToken.uid, {
      role: user.role,
    });

    return { token, user };
  }

  async getMe(uid: string): Promise<User> {
    const userDoc = await this.db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    return userDoc.data() as User;
  }
}
