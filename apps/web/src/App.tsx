import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@web/lib/firebase';
import { AuthComponent, LayoutComponent } from './components';
import { LoginPage, RegisterPage } from '@web/modules/auth';
import { AttendancePage } from '@web/modules/attendance';
import { DashboardPage } from '@web/modules/dashboard';
import { useAuthStore } from '@web/modules/auth/store/auth.store';

// Syncs Firebase auth state → Zustand store on every app boot.
// Resolves the "logout on refresh" bug: Firebase Auth restores sessions
// asynchronously, so we wait for the first onAuthStateChanged event before
// letting AuthGuard make any routing decisions.
function FirebaseAuthSync() {
  const { clearAuth, setHydrating } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (!firebaseUser) {
        // Firebase says no session — clear any stale Zustand state
        clearAuth();
      }
      // Either way, hydration is done
      setHydrating(false);
    });
    return unsub;
  }, [clearAuth, setHydrating]);

  return null;
}

export default function App() {
  return (
    <Router>
      <FirebaseAuthSync />
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
