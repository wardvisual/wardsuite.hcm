import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, Menu, Search } from 'lucide-react';
import { useAuthStore } from '@web/modules/auth/store/auth.store';

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const roleLabel = user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'MANAGER' ? 'Manager' : 'Employee';

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 lg:ml-[280px] flex flex-col h-screen overflow-hidden">
        {/* Top navbar */}
        <header className="h-[72px] px-4 lg:px-8 flex items-center justify-between gap-4 bg-white/70 backdrop-blur-2xl border-b border-[#f1f1f1] shrink-0 sticky top-0 z-10">
          {/* Left: mobile hamburger */}
          <button
            type="button"
            title="Open menu"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2.5 rounded-xl hover:bg-[#f5f5f5] text-[#aaaaaa] hover:text-black transition-all shrink-0"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
            <span className="sr-only">Open menu</span>
          </button>

          {/* Center: search (hidden on small screens) */}
          <div className="hidden md:flex flex-1 max-w-sm items-center gap-3 bg-[#f5f5f5] rounded-2xl px-4 h-10">
            <Search className="w-4 h-4 text-[#bbbbbb] shrink-0" />
            <input
              type="search"
              placeholder="Search…"
              className="bg-transparent text-sm text-[#111111] placeholder:text-[#bbbbbb] outline-none w-full"
            />
          </div>

          {/* Right: notifications + user */}
          <div className="flex items-center gap-2 lg:gap-3 shrink-0 ml-auto">
            {/* Notifications */}
            <button
              type="button"
              title="Notifications"
              className="relative p-2.5 hover:bg-[#f5f5f5] rounded-xl transition-all"
            >
              <Bell className="w-5 h-5 text-[#aaaaaa]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full border-[1.5px] border-white" />
            </button>

            {/* Divider */}
            <div className="w-px h-8 bg-[#f1f1f1] hidden sm:block" />

            {/* User chip */}
            <div className="flex items-center gap-3 pl-1">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-[#111111] leading-tight">{user?.name ?? 'User'}</p>
                <p className="text-[10px] font-bold text-[#bbbbbb] uppercase tracking-[0.15em]">{roleLabel}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#f0f0f0] flex items-center justify-center font-black text-[#6b7280] text-sm overflow-hidden ring-2 ring-white shadow-sm">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name ?? 'user')}`}
                  alt={user?.name ?? 'User'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                    (e.currentTarget.parentElement as HTMLElement).textContent = initials;
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 pb-10 pt-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
