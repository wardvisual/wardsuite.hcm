import { Navigate } from 'react-router-dom';
import type React from 'react';
import { LoginPage, RegisterPage } from '@web/modules/auth';
import { AttendancePage } from '@web/modules/attendance';
import { DashboardPage } from '@web/modules/dashboard';

export type RouteConfig = {
    path: string;
    element: React.ReactNode;
};

export const publicRoutes: RouteConfig[] = [
    { path: '/auth/login', element: <LoginPage /> },
    { path: '/auth/register', element: <RegisterPage /> },
    { path: '/', element: <Navigate to="/auth/login" replace /> },
];

export const protectedRoutes: RouteConfig[] = [
    { path: '/dashboard', element: <DashboardPage /> },
    { path: '/attendance', element: <AttendancePage /> },
    { path: '*', element: <Navigate to="/dashboard" replace /> },
];
