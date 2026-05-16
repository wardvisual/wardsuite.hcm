import { useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@web/lib/firebase';
import { useAuthStore, getStoredToken } from '@web/modules/auth/store/auth.store';
import { useAttendanceStore } from '@web/modules/attendance/store/attendance.store';
import { useDashboardStore } from '@web/modules/dashboard/store/dashboard.store';
import { authApi } from '@web/modules/auth/api/auth.api';

export function FirebaseAuthSync() {
    const { clearAuth, setHydrating, setAuth } = useAuthStore();
    const previousUserIdRef = useRef<string | null>(null);
    const { resetAttendance } = useAttendanceStore();
    const { resetDashboard } = useDashboardStore();

    useEffect(() => {
        const unsub = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
            const nextUserId = firebaseUser?.uid ?? null;
            if (previousUserIdRef.current !== nextUserId) {
                resetAttendance();
                resetDashboard();
            }

            if (!firebaseUser) {
                clearAuth();
            } else {
                // Always fetch fresh profile from API so fields like canPunch
                // reflect the current database value across all browser sessions.
                const token = getStoredToken();
                if (token) {
                    try {
                        const freshUser = await authApi.me();
                        setAuth(freshUser, token);
                    } catch {
                        clearAuth();
                    }
                }
            }

            previousUserIdRef.current = nextUserId;
            setHydrating(false);
        });

        return unsub;
    }, [clearAuth, setAuth, resetAttendance, resetDashboard, setHydrating]);

    return null;
}