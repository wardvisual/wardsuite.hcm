import { motion } from 'motion/react';
import { useAdminReports } from '@web/modules/dashboard/hooks/useAdminReports';
import { ReportFilters } from './reports/ReportFilters';
import { ReportKpis } from './reports/ReportKpis';
import { ReportTable } from './reports/ReportTable';

export function AdminReportsPanel() {
    const { reports, setMode, setDateKey, setWeekKey, fetchReport } = useAdminReports();

    return (
        <div className="space-y-4">
            <ReportFilters
                mode={reports.mode}
                dateKey={reports.dateKey}
                weekKey={reports.weekKey}
                onModeChange={setMode}
                onDateChange={setDateKey}
                onWeekChange={setWeekKey}
                onRefresh={fetchReport}
            />

            {reports.mode === 'daily' && <ReportKpis data={reports.dailyData} />}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <ReportTable
                    mode={reports.mode}
                    dailyData={reports.dailyData}
                    weeklyData={reports.weeklyData}
                    loading={reports.loading}
                    error={reports.error}
                    dateKey={reports.dateKey}
                    weekKey={reports.weekKey}
                />
            </motion.div>
        </div>
    );
}
