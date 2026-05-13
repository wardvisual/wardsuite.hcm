import { motion } from 'motion/react';
import { useDashboard } from '../hooks/useDashboard';
import { useAttendance } from '@web/modules/attendance/hooks/useAttendance';
import { useAuthStore } from '@web/modules/auth/store/auth.store';
import { PunchCard } from '../components/PunchCard';
import { KPIGrid } from '../components/KPIGrid';
import { WeeklyChart } from '../components/WeeklyChart';
import { AttendanceHistoryTable } from '../components/AttendanceHistoryTable';
import { AdminPanel } from '../components/admin';
import { greeting, todayLabel } from '@web/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { history, last7, historyLoading } = useDashboard();
  const {
    todayPunches, todaySummary, isPunchedIn, nextAction,
    isPunching, error, summaryLoading, punch,
  } = useAttendance();

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">{greeting()}, {user?.name?.split(' ')[0] ?? 'there'}</h1>
        <p className="page-subtitle">{todayLabel()}</p>
      </div>

      <div className="space-y-6">
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="floating-card p-6"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-[#111111]">Weekly Attendance</h2>
              <p className="mt-1 text-xs text-[#6b7280]">Weekly regular time and overtime overview.</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#bbbbbb]">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm bg-[#111111]" /> Regular
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm bg-emerald-400" /> OT
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
              <h2 className="text-base font-black text-[#111111]">Attendance History</h2>
              <p className="mt-1 text-xs text-[#6b7280]">Recent computed summary for the employee timeline.</p>
            </div>
          </div>
          <AttendanceHistoryTable data={history} isLoading={historyLoading} />
        </motion.div>

        {isAdmin && <AdminPanel />}
      </div>
    </div>
  );
}
