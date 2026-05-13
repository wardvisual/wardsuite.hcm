import { useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@web/lib/firebase';
import { useAuthStore } from '@web/modules/auth/store/auth.store';
import { useAttendanceStore } from '@web/modules/attendance/store/attendance.store';
import { useDashboardStore } from '@web/modules/dashboard/store/dashboard.store';

export function FirebaseAuthSync() {
    const { clearAuth, setHydrating } = useAuthStore();
    const previousUserIdRef = useRef<string | null>(null);
    const { resetAttendance } = useAttendanceStore();
    const { resetDashboard } = useDashboardStore();

    useEffect(() => {
        const unsub = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
            const nextUserId = firebaseUser?.uid ?? null;
            if (previousUserIdRef.current !== nextUserId) {
                resetAttendance();
                resetDashboard();
            }

            if (!firebaseUser) {
                clearAuth();
            }

            previousUserIdRef.current = nextUserId;
            setHydrating(false);
        });

        return unsub;
    }, [clearAuth, resetAttendance, resetDashboard, setHydrating]);

    return null;
}