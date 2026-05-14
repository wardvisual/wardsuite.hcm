import { motion } from 'motion/react';
import { CalendarDays, CheckCircle2, CheckCircle2Icon, ShieldCheck } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { useAttendance } from '@web/modules/attendance/hooks/useAttendance';
import { useAuthStore } from '@web/modules/auth/store/auth.store';
import { PunchCard } from '../components/PunchCard';
import { KPIGrid } from '../components/KPIGrid';
import { WeeklyChart } from '../components/WeeklyChart';
import { AttendanceHistoryTable } from '../components/AttendanceHistoryTable';
import { AdminPanel } from '../components/admin';
import { Skeleton } from '@web/components';
import { greeting, todayLabel } from '@web/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { history, last7, historyLoading } = useDashboard();
  const {
    todayPunches, todaySummary, isPunchedIn, nextAction,
    isPunching, error, summaryLoading, recentPunches, punch,
  } = useAttendance();

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const isLoading = summaryLoading;
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[28px] border border-[#f0f0f0] bg-white px-5 py-5 shadow-[0_8px_40px_-18px_rgba(15,23,42,0.18)] sm:px-7"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f1f1f1] bg-[#fafafa] px-3 py-1.5 text-[11px] font-bold text-[#6b7280]">
                <CalendarDays className="h-3.5 w-3.5" />
                {todayLabel()}
              </span>
              {isAdmin && (
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {user?.role}
                </span>
              )}
            </div>
            <h1 className="text-1xl font-black tracking-tight text-[#111111] sm:text-2xl">
              {greeting()}, {firstName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
              Track today’s attendance.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="col-span-2 floating-card p-4 flex flex-wrap items-center gap-4"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2Icon className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <p className="section-label">Today's Status</p>
                <p className="text-sm font-black text-[#111111] capitalize">{todaySummary?.['status']}</p>
              </div>
            </div>
            <div className="h-6 w-px bg-[#f1f1f1] hidden sm:block" />
            <div>
              <p className="section-label">Punches Today</p>
              <p className="text-sm font-black text-[#111111]">{todayPunches.length}</p>
            </div>
            <div className="h-6 w-px bg-[#f1f1f1] hidden sm:block" />
            <div>
              <p className="section-label">Schedule</p>
              <p className="text-sm font-black text-[#111111]">
                {todaySummary?.['schedule'].start} – {todaySummary?.['schedule'].end}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.header>

      <div className="space-y-6">
        {isLoading ? (
          loadingCard
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

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="floating-card p-6"
            >
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-black text-[#111111]">My Weekly Attendance</h2>
                  <p className="mt-1 text-xs text-[#6b7280]">Weekly regular time and overtime overview.</p>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 text-xs text-[#6b7280] sm:pb-0">
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white px-3 py-1.5 font-bold">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#111111]" /> Regular
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 font-bold text-emerald-700">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" /> Overtime
                  </span>
                </div>
              </div>
              <WeeklyChart data={last7} />
            </motion.div>

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

        {isAdmin && <AdminPanel />}
      </div>
    </div>
  );
}
