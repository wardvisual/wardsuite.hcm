import { motion } from 'motion/react';
import { useDashboard } from '../hooks/useDashboard';
import { useAttendance } from '@web/modules/attendance/hooks/useAttendance';
import { useAuthStore } from '@web/modules/auth/store/auth.store';
import { PunchCard } from '../components/PunchCard';
import { KPIGrid } from '../components/KPIGrid';
import { WeeklyChart } from '../components/WeeklyChart';
import { AttendanceHistoryTable } from '../components/AttendanceHistoryTable';
import { AdminPanel } from '../components/AdminPanel';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { history, last7, historyLoading } = useDashboard();
  const {
    todayPunches, todaySummary, isPunchedIn, nextAction,
    isPunching, error, summaryLoading, punch,
  } = useAttendance();

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">{greeting()}, {user?.name?.split(' ')[0] ?? 'there'}</h1>
        <p className="page-subtitle">{today}</p>
      </div>

      {/* Punch card + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        <PunchCard
          todayPunches={todayPunches}
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
      </div>

      {/* Weekly attendance chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="floating-card p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-black text-[#111111]">Weekly Attendance</h2>
          <div className="flex items-center gap-3 text-xs text-[#bbbbbb]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#111111] inline-block" /> Regular
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" /> OT
            </span>
          </div>
        </div>
        <WeeklyChart data={last7} />
      </motion.div>

      {/* Attendance history table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="floating-card p-6"
      >
        <h2 className="text-base font-black text-[#111111] mb-4">Attendance History</h2>
        <AttendanceHistoryTable data={history} isLoading={historyLoading} />
      </motion.div>

      {/* Admin panel — visible to ADMIN and MANAGER only */}
      {isAdmin && <AdminPanel />}
    </div>
  );
}
