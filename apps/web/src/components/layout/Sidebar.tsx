import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  BarChart3,
  ClipboardEdit,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '@web/lib/utils';
import { motion } from 'motion/react';
import { Logo } from '@web/components/ui/Logo';
import { useAuthStore } from '@web/modules/auth/store/auth.store';
import { authApi } from '@web/services/auth.api';

const employeeNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Clock, label: 'Attendance', path: '/attendance' },
];

const adminNav = [
  { icon: BarChart3, label: 'Reports', path: '/dashboard' },
  { icon: ClipboardEdit, label: 'Punch Mgmt', path: '/dashboard' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* swallow */ }
    clearAuth();
    onClose?.();
    navigate('/auth/login');
  };

  const NavItem = ({ icon: Icon, label, path }: { icon: typeof LayoutDashboard; label: string; path: string }) => (
    <NavLink
      to={path}
      onClick={onClose}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-4 px-4 h-14 rounded-[20px] cursor-pointer transition-all duration-300 group relative',
          isActive
            ? 'bg-[#f5f5f5] text-[#111111]'
            : 'text-[#bbbbbb] hover:text-black hover:bg-[#fafafa]'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cn('w-5 h-5 transition-all', isActive ? 'text-black scale-110' : 'text-[#bbbbbb] group-hover:text-black')} />
          <span className={cn('text-base font-bold transition-colors', isActive ? 'text-black' : '')}>
            {label}
          </span>
          {isActive && (
            <motion.div
              layoutId="active-pill"
              className="right-4 absolute bg-black rounded-full w-1.5 h-1.5"
            />
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden z-30 fixed inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <aside className={cn(
        'top-0 left-0 z-40 fixed flex flex-col bg-white w-[280px] h-screen overflow-hidden transition-transform duration-300',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between px-8 h-24 shrink-0">
          <Logo size="sm" />
          <button
            type="button"
            title="Close menu"
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl hover:bg-[#f5f5f5] text-[#bbbbbb] hover:text-black transition-all"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 mt-4 px-6 overflow-y-auto">
          <div className="mb-2 px-4">
            <p className="font-black text-[#bbbbbb] text-[10px] uppercase tracking-[0.3em]">Menu</p>
          </div>
          {employeeNav.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </nav>

        <div className="space-y-1 mt-auto p-6">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) => cn(
              'flex items-center gap-4 px-4 h-14 rounded-[20px] text-[#bbbbbb] hover:text-black transition-all',
              isActive && 'bg-[#f5f5f5] text-black'
            )}
          >
            <Settings className="w-5 h-5" />
            <span className="font-bold text-base">Settings</span>
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 rounded-[20px] w-full h-14 text-[#bbbbbb] text-left hover:text-red-500 transition-all group"
          >
            <LogOut className="group-hover:scale-110 w-5 h-5 transition-transform" />
            <span className="font-bold text-base">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
