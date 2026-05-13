import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@web/lib/firebase';
import { AuthComponent, LayoutComponent } from './components';
import { LoginPage, RegisterPage } from '@web/modules/auth';
import { AttendancePage } from '@web/modules/attendance';
import { DashboardPage } from '@web/modules/dashboard';
import { useAuthStore } from '@web/modules/auth/store/auth.store';

function FirebaseAuthSync() {
    const { clearAuth, setHydrating } = useAuthStore();

    console.log({ firebaseAuth })
    
    useEffect(() => {
        const unsub = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
            if (!firebaseUser) {
                clearAuth();
            }
            setHydrating(false);
        });
        return unsub;
    }, [clearAuth, setHydrating]);

    return null;
}

export function AppRoutes() {
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
