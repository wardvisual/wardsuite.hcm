import { Navigate } from 'react-router-dom';
import type React from 'react';
import { LoginPage, RegisterPage } from '@web/modules/auth';
import { DashboardPage } from '@web/modules/dashboard';
import { LandingPage } from '@web/modules/Landing';
import { SettingsPage } from '@web/modules/settings';

export type RouteConfig = {
    path: string;
    element: React.ReactNode;
};

export const publicRoutes: RouteConfig[] = [
    { path: '/', element: <LandingPage /> },
    { path: '/auth/login', element: <LoginPage /> },
    { path: '/auth/register', element: <RegisterPage /> },
];

export const protectedRoutes: RouteConfig[] = [
    { path: '/dashboard', element: <DashboardPage /> },
    { path: '/settings', element: <SettingsPage /> },
    { path: '*', element: <Navigate to="/dashboard" replace /> },
];
