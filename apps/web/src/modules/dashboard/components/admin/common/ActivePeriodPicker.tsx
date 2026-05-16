import { useState, useEffect } from 'react';
import { CalendarDays, ChevronDown, Loader2, RotateCcw } from 'lucide-react';
import { adminApi } from '@web/modules/dashboard/api/admin.api';
import { cn, formatDateKey, getTodayKey } from '@web/lib/utils';
import type { ReportMode } from '@web/modules/dashboard/store/dashboard.store';

interface ActivePeriodPickerProps {
  mode: ReportMode;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Allow empty string value, displayed as "All dates" */
  allowAll?: boolean;
  /** When provided, skips the API fetch and uses these keys directly */
  staticOptions?: string[];
}

function formatWeekKey(weekKey: string): string {
  const [year, weekPart] = weekKey.split('-W');
  return `Week ${weekPart}, ${year}`;
}

function safeFormatDate(value: string): string {
  if (!value) return 'All dates';
  return formatDateKey(value);
}

/**
 * Standalone date/week picker that fetches only periods with attendance records.
 * Self-contained — owns its own loading state and API call.
 */
export function ActivePeriodPicker({ mode, value, onChange, className, allowAll, staticOptions }: ActivePeriodPickerProps) {
  const [dateKeys, setDateKeys] = useState<string[]>([]);
  const [weekKeys, setWeekKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(!staticOptions);
  const today = getTodayKey();
  const isToday = value === today;

  useEffect(() => {
    if (staticOptions) return;
    let cancelled = false;
    setLoading(true);
    adminApi.getActiveDates()
      .then(({ dateKeys: d, weekKeys: w }) => {
        if (!cancelled) {
          setDateKeys(d);
          setWeekKeys(w);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [staticOptions]);

  const options = staticOptions ?? (mode === 'daily' ? dateKeys : weekKeys);
  const formatOption = mode === 'daily' ? safeFormatDate : formatWeekKey;
  const currentValueInList = value ? options.includes(value) : false;
  const displayValue = value ? formatOption(value) : 'All dates';

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      {/* Picker chip */}
      <div className="relative inline-flex">
        <div
          className={cn(
            'flex items-center gap-2 h-9 rounded-2xl border px-3 text-sm font-bold select-none transition-all',
            loading
              ? 'border-[#f1f1f1] bg-[#fafafa] text-[#bbbbbb] cursor-wait'
              : 'border-[#e5e7eb] bg-white text-[#111111] shadow-sm hover:border-[#d1d5db] hover:shadow-md cursor-pointer',
          )}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#bbbbbb] shrink-0" />
          ) : (
            <CalendarDays className="h-3.5 w-3.5 text-[#6b7280] shrink-0" />
          )}
          <span className="whitespace-nowrap">{loading ? 'Loading…' : displayValue}</span>
          {!loading && <ChevronDown className="h-3 w-3 text-[#9ca3af] shrink-0" />}
        </div>

        {/* Native select — transparent, covers the button for native UX */}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          aria-label="Select period"
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-wait"
        >
          {allowAll && (
            <option value="">All dates</option>
          )}
          {value && !currentValueInList && (
            <option value={value}>{formatOption(value)}</option>
          )}
          {options.length === 0 && !loading && (
            <option value="" disabled>No records found</option>
          )}
          {options.map((key) => (
            <option key={key} value={key}>
              {formatOption(key)}
            </option>
          ))}
        </select>
      </div>

      {/* Reset to today button */}
      {!loading && mode === 'daily' && !isToday && value && (
        <button
          type="button"
          onClick={() => onChange(today)}
          title="Go to today"
          className="inline-flex items-center gap-1 h-9 rounded-2xl border border-[#e5e7eb] bg-white px-2.5 text-xs font-bold text-[#6b7280] shadow-sm transition-all hover:border-[#d1d5db] hover:text-[#111111] hover:shadow-md"
        >
          <RotateCcw className="h-3 w-3" />
          Today
        </button>
      )}
    </div>
  );
}
