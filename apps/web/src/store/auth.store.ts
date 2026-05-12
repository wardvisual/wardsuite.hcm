// Auth store has moved to @web/modules/auth/store/auth.store
// This file is kept for backwards compatibility during migration.
export { useAuthStore, getStoredToken } from '@web/modules/auth/store/auth.store';
export type { AuthUser, UserRole } from '@web/modules/auth/types/auth.types';
