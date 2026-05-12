import { BaseEntity, UserRole } from './common.types';

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  timezone?: string;
  schedule?: {
    start: string; // HH:mm format (e.g., "09:00")
    end: string;   // HH:mm format (e.g., "18:00")
  };
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  timezone?: string;
  schedule?: {
    start: string;
    end: string;
  };
}

export interface UpdateUserDto {
  name?: string;
  timezone?: string;
  schedule?: {
    start: string;
    end: string;
  };
}
