import type { ReportMode } from '@web/modules/dashboard/store/dashboard.store';
import { ActivePeriodPicker } from '../common/ActivePeriodPicker';

interface ReportFiltersProps {
    mode: ReportMode;
    dateKey: string;
    weekKey: string;
    onModeChange: (mode: ReportMode) => void;
    onDateChange: (dateKey: string) => void;
    onWeekChange: (weekKey: string) => void;
}

export function ReportFilters({
    mode,
    dateKey,
    weekKey,
    onModeChange,
    onDateChange,
    onWeekChange,
}: ReportFiltersProps) {
    return (
        <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-1 bg-[#f5f5f5] rounded-2xl p-1">
                {(['daily', 'weekly'] as ReportMode[]).map((m) => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => onModeChange(m)}
                        className={`px-5 py-2 rounded-xl text-sm font-bold transition-all capitalize ${mode === m ? 'bg-white text-[#111111] shadow-sm' : 'text-[#bbbbbb] hover:text-[#111111]'}`}
                    >
                        {m}
                    </button>
                ))}
            </div>

            <ActivePeriodPicker
                mode={mode}
                value={mode === 'daily' ? dateKey : weekKey}
                onChange={mode === 'daily' ? onDateChange : onWeekChange}
                className="min-w-[180px]"
            />
        </div>
    );
}
