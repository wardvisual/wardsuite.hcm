// ── Auth ─────────────────────────────────────────────────────────────────────
import { AuthGuard } from './auth/AuthGuard';
import { GuestGuard } from './auth/GuestGuard';
import { FirebaseAuthSync } from './auth/FirebaseAuthSync';
export const AuthComponent = { AuthGuard, GuestGuard, FirebaseAuthSync };

// ── Layout ───────────────────────────────────────────────────────────────────
import { Shell } from './layout/Shell';
import { Sidebar } from './layout/Sidebar';
export const LayoutComponent = { Shell, Sidebar };

// ── UI ───────────────────────────────────────────────────────────────────────
export { DataTable, StatusBadge } from './ui/DataTable';
export type { Column } from './ui/DataTable';
export { Modal } from './ui/Modal';
export { Drawer } from './ui/Modals';
export { PublicImage } from './ui/PublicImage';
export { Logo } from './ui/Logo';
export { Skeleton } from './ui/Skeleton';
