import { RequestHandler, Response } from 'express';

export interface RouteDefinition {
  method: 'get' | 'post' | 'patch' | 'delete';
  path: string;
  middleware?: RequestHandler[];
  handler: (req: any, res: Response) => void;
}

/**
 * Common API Response Types
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, any>;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}
