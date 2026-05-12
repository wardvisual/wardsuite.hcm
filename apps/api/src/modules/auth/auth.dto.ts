import { UserRole } from '@api/types';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  timezone?: string;
  schedule?: {
    start: string;
    end: string;
  };
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    timezone?: string;
    schedule?: { start: string; end: string };
  };
}
