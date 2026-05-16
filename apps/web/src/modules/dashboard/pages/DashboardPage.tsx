import { motion } from 'motion/react';
import { CalendarDays, CheckCircle2Icon, ShieldCheck } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { useAttendance } from '@web/modules/attendance/hooks/useAttendance';
import { useAuthStore } from '@web/modules/auth/store/auth.store';
import { PunchCard } from '../components/PunchCard';
import { KPIGrid } from '../components/KPIGrid';
import { AttendanceHistoryTable } from '../components/AttendanceHistoryTable';
import { AdminPanel } from '../components/admin';
import { WeeklyInsightsCard } from '../components/WeeklyInsightsCard';
import { Skeleton } from '@web/components';
import { greeting, todayLabel } from '@web/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const canPunch = !isAdmin || !!user?.canPunch;

  const { history, last7, historyLoading } = useDashboard({ enabled: canPunch });
  const {
    todayPunches, todaySummary, isPunchedIn, nextAction,
    isPunching, error, summaryLoading, recentPunches, punch,
  } = useAttendance({ enabled: canPunch });

  const isLoading = canPunch && summaryLoading;
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const loadingCard = (
    <div className="floating-card p-6 space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-48 rounded-[28px]" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-[24px]" />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-5 w-52" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-[24px]" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[28px] bg-[#0f172a] px-6 py-7 shadow-[0_20px_60px_-12px_rgba(15,23,42,0.5)] sm:px-8 sm:py-8"
      >
        {/* Decorative gradient orbs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-blue-500/8 blur-3xl" />
          <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: greeting */}
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-bold text-white/60 backdrop-blur-sm">
                <CalendarDays className="h-3.5 w-3.5" />
                {todayLabel()}
              </span>
              {isAdmin && (
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/15 px-3 py-1.5 text-[11px] font-bold text-blue-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {user?.role}
                </span>
              )}
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="bg-gradient-to-br from-white via-white/90 to-white/60 bg-clip-text text-2xl font-black tracking-tight text-transparent sm:text-3xl"
            >
              {greeting()}, {firstName}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
              className="mt-2 text-sm text-white/40"
            >
              {isAdmin ? "Manage your team's attendance and daily records." : "Track and manage your attendance for today."}
            </motion.p>
          </div>

          {/* Right: status card */}
          {canPunch ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="flex flex-wrap items-center gap-5 rounded-2xl border border-white/10 bg-white/6 px-5 py-4 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${todaySummary?.['status'] === 'present' ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
                  <CheckCircle2Icon className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Status</p>
                  <p className="text-sm font-black capitalize text-white">{todaySummary?.['status'] ?? '—'}</p>
                </div>
              </div>
              <div className="hidden h-8 w-px bg-white/10 sm:block" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Punches</p>
                <p className="text-sm font-black text-white">{todayPunches.length}</p>
              </div>
              <div className="hidden h-8 w-px bg-white/10 sm:block" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Schedule</p>
                <p className="text-sm font-black text-white">
                  {todaySummary?.['schedule']?.start ?? '—'} – {todaySummary?.['schedule']?.end ?? '—'}
                </p>
              </div>
            </motion.div>
          ) : isAdmin ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="flex flex-wrap items-center gap-5 rounded-2xl border border-white/10 bg-white/6 px-5 py-4 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/20">
                  <ShieldCheck className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Mode</p>
                  <p className="text-sm font-black text-white">Admin View</p>
                </div>
              </div>
              <div className="hidden h-8 w-px bg-white/10 sm:block" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Record Own Punches</p>
                <p className="text-sm font-black text-white/60">Disabled</p>
              </div>
              <div className="hidden h-8 w-px bg-white/10 sm:block" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Tip</p>
                <p className="text-xs text-white/40">Enable in Settings to clock in/out</p>
              </div>
            </motion.div>
          ) : null}
        </div>
      </motion.header>

      <div className="space-y-6">
        {isLoading ? (
          loadingCard
        ) : (
          <>
            {!canPunch ? (
              <p className="text-xs text-[#bbbbbb]">
                As an admin. You can also record your own attendance — enable punch access in{' '}
                <a href="/settings" className="underline hover:text-[#6b7280] transition-colors">Settings</a>.
              </p>
            ) : (
              <>
                <PunchCard
                  recentPunches={recentPunches}
                  todaySummary={todaySummary}
                  isPunchedIn={isPunchedIn}
                  nextAction={nextAction}
                  isPunching={isPunching}
                  error={error}
                  onPunch={punch}
                />

                <KPIGrid
                  todaySummary={todaySummary}
                  todayPunches={todayPunches}
                  isLoading={summaryLoading}
                />

                <WeeklyInsightsCard data={last7} />

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32 }}
                  className="floating-card p-6"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-black text-[#111111]">My Attendance History</h2>
                      <p className="mt-1 text-xs text-[#6b7280]">Recent computed summary for the employee timeline.</p>
                    </div>
                  </div>
                  <AttendanceHistoryTable data={history} isLoading={historyLoading} />
                </motion.div>
              </>
            )}
          </>
        )}

        {isAdmin && <AdminPanel />}
      </div>
    </div>
  );
}
