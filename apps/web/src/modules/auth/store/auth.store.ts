import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser } from '@web/modules/auth/types/auth.types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean; // true until Firebase confirms auth state on first load
  isLoading: boolean;
  error: string | null;

  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  setHydrating: (v: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrating: true,
      isLoading: false,
      error: null,

      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true, error: null }),

      clearAuth: () =>
        set({ user: null, token: null, isAuthenticated: false, error: null }),

      setHydrating: (isHydrating) => set({ isHydrating }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),
    }),
    {
      name: 'hcm-auth',
      // Only persist user + token — never persist isHydrating (it should always start true)
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    },
  ),
);

export function getStoredToken(): string | null {
  return useAuthStore.getState().token;
}
