// ── Auth ─────────────────────────────────────────────────────────────────────
export * as AuthComponent from './auth/AuthGuard';

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
