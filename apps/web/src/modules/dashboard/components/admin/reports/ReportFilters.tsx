import { RefreshCw } from 'lucide-react';
import type { ReportMode } from '@web/modules/dashboard/store/dashboard.store';

interface ReportFiltersProps {
    mode: ReportMode;
    dateKey: string;
    weekKey: string;
    onModeChange: (mode: ReportMode) => void;
    onDateChange: (dateKey: string) => void;
    onWeekChange: (weekKey: string) => void;
    onRefresh: () => void;
}

export function ReportFilters({
    mode,
    dateKey,
    weekKey,
    onModeChange,
    onDateChange,
    onWeekChange,
    onRefresh,
}: ReportFiltersProps) {
    return (
        <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-1 bg-[#f5f5f5] rounded-2xl p-1">
                {(['daily', 'weekly'] as ReportMode[]).map((m) => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => onModeChange(m)}
                        className={`px-5 py-2 rounded-xl text-sm font-bold transition-all capitalize ${mode === m ? 'bg-white text-[#111111] shadow-sm' : 'text-[#bbbbbb] hover:text-[#111111]'
                            }`}
                    >
                        {m}
                    </button>
                ))}
            </div>

            {mode === 'daily' ? (
                <input
                    type="date"
                    value={dateKey}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="input-theme max-w-[180px]"
                />
            ) : (
                <input
                    type="week"
                    value={weekKey}
                    onChange={(e) => { if (e.target.value) onWeekChange(e.target.value); }}
                    className="input-theme max-w-[180px]"
                />
            )}

            <button type="button" onClick={onRefresh} className="btn-secondary ml-auto">
                <RefreshCw className="w-4 h-4" />
                Refresh
            </button>
        </div>
    );
}
