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
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiRequest<LoginResult>('/auth/login', { method: 'POST', body: payload }),

  register: (payload: RegisterPayload) =>
    apiRequest<{ user: AuthUser }>('/auth/register', { method: 'POST', body: payload }),

  logout: () =>
    apiRequest<null>('/auth/logout', { method: 'POST' }),

  me: () =>
    apiRequest<AuthUser>('/auth/me'),
};
