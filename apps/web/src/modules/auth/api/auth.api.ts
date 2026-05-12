import { apiRequest } from '@web/services/api.service';
import { AuthUser } from '@web/modules/auth/types/auth.types';

export interface LoginPayload {
  email: string;
  password: string; // holds Firebase ID token
}

export interface RegisterPayload {
  email: string;
  name: string;
  firebaseUid: string;
  timezone?: string;
  schedule?: { start: string; end: string; breakMinutes?: number; graceMinutes?: number };
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiRequest.post<LoginResult>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    apiRequest.post<{ user: AuthUser }>('/auth/register', payload),

  logout: () =>
    apiRequest.post<null>('/auth/logout'),

  me: () =>
    apiRequest.get<AuthUser>('/auth/me'),
};
