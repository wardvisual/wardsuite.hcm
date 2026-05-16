import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@web/modules/auth/store/auth.store';

export function GuestGuard() {
  const { isAuthenticated, isHydrating } = useAuthStore();
  const location = useLocation();

  if (isHydrating) return null;

  const isAuthRoute =
    location.pathname === '/auth/login' ||
    location.pathname === '/auth/register';

  if (isAuthenticated && isAuthRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}