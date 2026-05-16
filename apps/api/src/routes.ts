import { Router, RequestHandler } from 'express';
import authRoutes from '@api/modules/auth/auth.routes';
import usersRoutes from '@api/modules/users/users.routes';
import attendanceRoutes from '@api/modules/attendance/attendance.routes';

export interface AppRouteDefinition {
    path: string;
    handler: Router;
    middleware?: RequestHandler[];
}

export const routes: AppRouteDefinition[] = [
    {
        path: '/api/auth',
        handler: authRoutes,
    },
    {
        path: '/api/users',
        handler: usersRoutes,
    },
    {
        path: '/api/attendance',
        handler: attendanceRoutes,
    },
];
