import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthComponent, LayoutComponent } from './components';
import { LoginPage, RegisterPage } from '@web/modules/auth';
import { AttendancePage } from '@web/modules/attendance';
import { DashboardPage } from '@web/modules/dashboard';
import { AdminReportsPage, AdminPunchesPage } from '@web/modules/admin';
import { useAuthStore } from '@web/modules/auth/store/auth.store';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (user && user.role !== 'ADMIN' && user.role !== 'MANAGER') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/auth/login" replace />} />

        {/* Protected */}
        <Route
          path="/*"
          element={
            <AuthComponent.AuthGuard>
              <LayoutComponent.Shell>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/attendance" element={<AttendancePage />} />
                  <Route
                    path="/admin/reports"
                    element={<AdminGuard><AdminReportsPage /></AdminGuard>}
                  />
                  <Route
                    path="/admin/punches"
                    element={<AdminGuard><AdminPunchesPage /></AdminGuard>}
                  />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </LayoutComponent.Shell>
            </AuthComponent.AuthGuard>
          }
        />
      </Routes>
    </Router>
  );
}

import React from 'react';
