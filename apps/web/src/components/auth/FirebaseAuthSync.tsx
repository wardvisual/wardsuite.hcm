import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@web/lib/firebase';
import { useAuthStore } from '@web/modules/auth/store/auth.store';

export function FirebaseAuthSync() {
    const { clearAuth, setHydrating } = useAuthStore();

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