export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  timezone?: string;
  schedule?: {
    start: string;
    end: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}
