import { useCallback } from 'react';
import { useAuthStore } from '@web/modules/auth/store/auth.store';
import { authService } from '@web/modules/auth/services/auth.service';
import { LoginFormValues, RegisterFormValues } from '@web/modules/auth/types/auth.types';

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, error, setAuth, clearAuth, setLoading, setError } =
    useAuthStore();

  const login = useCallback(
    async (values: LoginFormValues) => {
      setLoading(true);
      setError(null);
      try {
        const { user, token } = await authService.login(values);
        setAuth(user, token);
      } catch (err: any) {
        setError(err.message ?? 'Login failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setAuth, setLoading, setError],
  );

  const register = useCallback(
    async (values: RegisterFormValues) => {
      setLoading(true);
      setError(null);
      try {
        await authService.register(values);
      } catch (err: any) {
        setError(err.message ?? 'Registration failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    clearAuth();
  }, [clearAuth]);

  return { user, token, isAuthenticated, isLoading, error, login, register, logout };
}
