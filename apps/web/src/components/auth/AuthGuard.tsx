import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuthStore } from '@web/modules/auth/store/auth.store';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isHydrating } = useAuthStore();
  const location = useLocation();

  // Wait for Firebase to confirm auth state before making routing decisions.
  // This prevents the flash-redirect to login on page refresh.
  if (isHydrating) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#111111] flex items-center justify-center">
            <span className="text-white font-black text-lg">W</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#aaaaaa]">
            <div className="w-4 h-4 border-2 border-[#dddddd] border-t-[#111111] rounded-full animate-spin" />
            Loading…
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
