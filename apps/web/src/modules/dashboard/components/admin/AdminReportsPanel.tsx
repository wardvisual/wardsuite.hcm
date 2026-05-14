import { motion } from 'motion/react';
import { Download, RefreshCw } from 'lucide-react';
import { useAdminReports } from '@web/modules/dashboard/hooks/useAdminReports';
import { ReportFilters } from './reports/ReportFilters';
import { ReportKpis } from './reports/ReportKpis';
import { ReportTable } from './reports/ReportTable';
import { exportDailyReportPDF, exportWeeklyReportPDF } from '@web/modules/dashboard/utils/pdf.utils';

export function AdminReportsPanel() {
    const { reports, setMode, setDateKey, setWeekKey, fetchReport } = useAdminReports();

    const handleExport = () => {
        if (reports.mode === 'daily') {
            exportDailyReportPDF(reports.dailyData, reports.dateKey);
        } else {
            exportWeeklyReportPDF(reports.weeklyData, reports.weekKey);
        }
    };

    const hasData =
        reports.mode === 'daily'
            ? reports.dailyData.length > 0
            : reports.weeklyData.length > 0;

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <ReportFilters
                    mode={reports.mode}
                    dateKey={reports.dateKey}
                    weekKey={reports.weekKey}
                    onModeChange={setMode}
                    onDateChange={setDateKey}
                    onWeekChange={setWeekKey}
                    onRefresh={fetchReport}
                />

                <div className="flex items-center gap-2 shrink-0">
                    <button type="button" onClick={fetchReport} className="btn-secondary">
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                    <motion.button
                        type="button"
                        onClick={handleExport}
                        disabled={!hasData || reports.loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 rounded-full border border-[#111111] bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Download className="h-4 w-4" />
                        Export PDF
                    </motion.button>
                </div>
            </div>

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
