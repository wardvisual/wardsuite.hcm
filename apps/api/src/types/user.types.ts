import { BaseEntity, UserRole } from './common.types';

export interface Schedule {
  start: string;        // HH:mm
  end: string;          // HH:mm
  breakMinutes: number; // default 60
  graceMinutes: number; // default 5
}

export interface User extends BaseEntity {
  uid: string;
  employeeCode: string;
  email: string;
  name: string;
  role: UserRole;
  timezone: string;
  status: 'active' | 'inactive';
  schedule: Schedule;
  createdBy?: string;
  canPunch?: boolean;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  timezone?: string;
  employeeCode?: string;
  schedule?: Partial<Schedule>;
}

export interface UpdateUserDto {
  name?: string;
  timezone?: string;
  status?: 'active' | 'inactive';
  schedule?: Partial<Schedule>;
  canPunch?: boolean;
}
