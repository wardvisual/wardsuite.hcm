import * as admin from 'firebase-admin';
import { getDb } from '@api/core/database/firestore.client';
import { LoginDto, RegisterDto, LoginResult, UpdateProfileDto } from './auth.dto';
import { User } from '@api/types';

export class AuthService {
  private db = getDb();
  private auth = admin.auth();

  async register(dto: RegisterDto): Promise<{ user: User }> {
    let uid: string;

    if (dto.firebaseUid) {
      // Client already created the Firebase Auth user — just create the Firestore profile
      uid = dto.firebaseUid;
    } else if (dto.password) {
      const firebaseUser = await this.auth.createUser({
        email: dto.email,
        password: dto.password,
        displayName: dto.name,
      });
      uid = firebaseUser.uid;
    } else {
      throw Object.assign(new Error('Either firebaseUid or password is required'), { statusCode: 400 });
    }

    // Auto-generate employee code based on user count
    const existingSnap = await this.db.collection('users').count().get();
    const count = existingSnap.data().count + 1;
    const employeeCode = `EMP-${String(count).padStart(4, '0')}`;

    const now = new Date().toISOString();
    const user: User = {
      id: uid,
      uid,
      employeeCode,
      email: dto.email,
      name: dto.name,
      role: dto.role ?? 'STAFF',
      timezone: dto.timezone ?? 'Asia/Manila',
      status: 'active',
      schedule: {
        start: dto.schedule?.start ?? '09:00',
        end: dto.schedule?.end ?? '18:00',
        breakMinutes: dto.schedule?.breakMinutes ?? 60,
        graceMinutes: dto.schedule?.graceMinutes ?? 5,
      },
      createdAt: now,
      updatedAt: now,
      createdBy: uid,
    };

    await this.db.collection('users').doc(uid).set(user);

    return { user };
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    // dto.password holds the Firebase ID token from the client-side Firebase Auth SDK
    const decodedToken = await this.auth.verifyIdToken(dto.password);

    const userDoc = await this.db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      throw Object.assign(new Error('User profile not found. Please contact your administrator.'), { statusCode: 404 });
    }

    const user = userDoc.data() as User;

    const token = await this.auth.createCustomToken(decodedToken.uid, {
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        employeeCode: user.employeeCode,
        timezone: user.timezone,
        status: user.status,
        schedule: user.schedule,
      },
    };
  }

  async updateProfile(uid: string, dto: UpdateProfileDto): Promise<User> {
    const userDoc = await this.db.collection('users').doc(uid).get();
    if (!userDoc.exists) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    const current = userDoc.data() as User;
    const now = new Date().toISOString();
    const updates: Partial<User> = { updatedAt: now };

    if (dto.name) updates.name = dto.name;
    if (dto.timezone) updates.timezone = dto.timezone;
    if (dto.schedule) {
      updates.schedule = {
        start: dto.schedule.start ?? current.schedule.start,
        end: dto.schedule.end ?? current.schedule.end,
        breakMinutes: dto.schedule.breakMinutes ?? current.schedule.breakMinutes,
        graceMinutes: dto.schedule.graceMinutes ?? current.schedule.graceMinutes,
      };
    }

    await this.db.collection('users').doc(uid).update(updates);
    return { ...current, ...updates };
  }

  async getMe(uid: string): Promise<User> {
    const userDoc = await this.db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    return userDoc.data() as User;
  }
}
