import React from 'react';
import { motion } from 'motion/react';
import { Clock, TrendingUp, Moon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { DailySummary, AttendancePunch } from '@web/modules/attendance';
import { formatHours, formatMinutes } from '@web/lib/utils';

function KPICard({ icon, label, value, sub, color, delay = 0 }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="floating-card p-5 flex items-start gap-4"
    >
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="section-label truncate">{label}</p>
        <p className="text-2xl font-black text-[#111111] mt-0.5 tabular-nums">{value}</p>
        {sub && <p className="text-xs text-[#6b7280] mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

interface KPIGridProps {
  todaySummary: DailySummary | null;
  todayPunches: AttendancePunch[];
  isLoading: boolean;
}

export function KPIGrid({ todaySummary, todayPunches, isLoading }: KPIGridProps) {
  const worked = todaySummary?.workedMinutes ?? 0;
  const regular = todaySummary?.regularMinutes ?? 0;
  const ot = todaySummary?.overtimeMinutes ?? 0;
  const nd = todaySummary?.nightDifferentialMinutes ?? 0;
  const late = todaySummary?.lateMinutes ?? 0;
  const ut = todaySummary?.undertimeMinutes ?? 0;

  return (
    <div className="grid grid-cols-2 gap-4 content-start">
      <KPICard
        icon={<Clock className="w-5 h-5 text-[#111111]" />}
        label="Worked Today"
        value={isLoading ? '—' : formatHours(worked)}
        sub={`Regular: ${formatHours(regular)}`}
        color="bg-[#f5f5f5]"
        delay={0.05}
      />
      <KPICard
        icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
        label="Overtime"
        value={isLoading ? '—' : formatHours(ot)}
        sub={ot > 0 ? 'Beyond shift' : 'None today'}
        color="bg-emerald-50"
        delay={0.1}
      />
      <KPICard
        icon={<Moon className="w-5 h-5 text-blue-600" />}
        label="Night Diff"
        value={isLoading ? '—' : formatHours(nd)}
        sub="22:00 – 06:00"
        color="bg-blue-50"
        delay={0.15}
      />
      <KPICard
        icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
        label="Late / UT"
        value={isLoading ? '—' : `${formatMinutes(late)} / ${formatMinutes(ut)}`}
        sub={late === 0 && ut === 0 ? 'On time today!' : 'Deductions'}
        color="bg-amber-50"
        delay={0.2}
      />

      {todaySummary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="col-span-2 floating-card p-4 flex flex-wrap items-center gap-4"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <p className="section-label">Today's Status</p>
              <p className="text-sm font-black text-[#111111] capitalize">{todaySummary.status}</p>
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
              {todaySummary.schedule.start} – {todaySummary.schedule.end}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
