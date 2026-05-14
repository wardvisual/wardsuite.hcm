import { UserRole } from '@api/types';

export interface LoginDto {
  email: string;
  password: string; // carries the Firebase ID token from the client
}

export interface RegisterDto {
  email: string;
  password?: string;  // optional — client uses Firebase Auth, server uses Admin SDK
  name: string;
  firebaseUid?: string;
  role?: UserRole;
  timezone?: string;
  schedule?: {
    start: string;
    end: string;
    breakMinutes?: number;
    graceMinutes?: number;
  };
}

export interface UpdateProfileDto {
  name?: string;
  timezone?: string;
  schedule?: {
    start?: string;
    end?: string;
    breakMinutes?: number;
    graceMinutes?: number;
  };
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    uid: string;
    email: string;
    name: string;
    role: UserRole;
    employeeCode: string;
    timezone: string;
    status: string;
    schedule: { start: string; end: string; breakMinutes: number; graceMinutes: number };
  };
}
