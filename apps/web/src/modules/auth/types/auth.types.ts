export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface AuthUser {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  employeeCode: string;
  timezone: string;
  status: 'active' | 'inactive';
  schedule: {
    start: string;
    end: string;
    breakMinutes: number;
    graceMinutes: number;
  };
  canPunch?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  timezone?: string;
  scheduleStart?: string;
  scheduleEnd?: string;
}
