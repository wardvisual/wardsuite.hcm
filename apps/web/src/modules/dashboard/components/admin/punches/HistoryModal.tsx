import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, Edit2, LogIn, LogOut, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { Drawer, Modal } from '@web/components';
import type { AttendancePunch } from '@web/modules/attendance';
import { adminApi } from '@web/modules/dashboard/api/admin.api';
import { cn, formatDetailedDateTime, formatTime } from '@web/lib/utils';

interface HistoryModalProps {
    open: boolean;
    punches: AttendancePunch[];
    employeeCode: string | null;
    onClose: () => void;
    onSaved: () => void;
}

type FormMode = 'update' | 'insert' | null;

function toDateInputValue(timestamp: string): string {
    return new Date(timestamp).toISOString().slice(0, 10);
}

function toTimeInputValue(timestamp: string): string {
    const date = new Date(timestamp);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function buildTimestamp(dateValue: string, timeValue: string): string {
    return new Date(`${dateValue}T${timeValue}:00`).toISOString();
}

export function HistoryModal({ open, punches, employeeCode, onClose, onSaved }: HistoryModalProps) {
    const sortedPunches = useMemo(
        () => [...punches].sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()),
        [punches],
    );
    const defaultPunch = sortedPunches[0] ?? null;
    const [mode, setMode] = useState<FormMode>(null);
    const [selectedPunchId, setSelectedPunchId] = useState<string | null>(null);
    const [dateValue, setDateValue] = useState(defaultPunch ? toDateInputValue(defaultPunch.timestamp) : new Date().toISOString().slice(0, 10));
    const [timeValue, setTimeValue] = useState(defaultPunch ? toTimeInputValue(defaultPunch.timestamp) : '08:00');
    const [punchType, setPunchType] = useState<'IN' | 'OUT'>(defaultPunch?.punchType ?? 'IN');
    const [reason, setReason] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const userId = sortedPunches[0]?.userId ?? null;

    useEffect(() => {
        if (!open) {
            setMode(null);
            setSelectedPunchId(null);
            setError(null);
            return;
        }

        const firstPunch = sortedPunches[0] ?? null;
        setMode(null);
        setSelectedPunchId(null);
        setDateValue(firstPunch ? toDateInputValue(firstPunch.timestamp) : new Date().toISOString().slice(0, 10));
        setTimeValue(firstPunch ? toTimeInputValue(firstPunch.timestamp) : '08:00');
        setPunchType(firstPunch?.punchType ?? 'IN');
        setReason('');
        setError(null);
    }, [open, sortedPunches]);

    const startEdit = (punch: AttendancePunch) => {
        setMode('update');
        setSelectedPunchId(punch.id);
        setDateValue(toDateInputValue(punch.timestamp));
        setTimeValue(toTimeInputValue(punch.timestamp));
        setPunchType(punch.punchType);
        setReason('');
        setError(null);
    };

    const startInsert = () => {
        const base = sortedPunches[0] ?? null;
        setMode('insert');
        setSelectedPunchId(null);
        setDateValue(base ? toDateInputValue(base.timestamp) : new Date().toISOString().slice(0, 10));
        setTimeValue(base ? toTimeInputValue(base.timestamp) : '08:00');
        setPunchType(base?.punchType === 'IN' ? 'OUT' : 'IN');
        setReason('');
        setError(null);
    };

    const cancelEdit = () => {
        setMode(null);
        setSelectedPunchId(null);
        setError(null);
    };

    const handleSave = async () => {
        if (!userId) {
            setError('Missing employee user id');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            await adminApi.savePunchCorrection({
                userId,
                punchId: selectedPunchId ?? undefined,
                timestamp: buildTimestamp(dateValue, timeValue),
                punchType,
                reason: reason.trim() || undefined,
                isNew: mode === 'insert',
            });
            setMode(null);
            setSelectedPunchId(null);
            onSaved();
        } catch (err: any) {
            setError(err.message ?? 'Failed to save punch correction');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Drawer
            isOpen={open}
            onClose={onClose}
            title={employeeCode ? `Punch History — ${employeeCode}` : 'Punch History'}
            description="Employee punch timeline from the selected table row."
            className="sm:max-w-4xl lg:max-w-6xl"
        >
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={startInsert} className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-4 py-2 text-xs font-bold text-white">
                        <Plus className="h-3.5 w-3.5" />
                        Add Missing Punch
                    </button>
                    {mode === 'update' && (
                        <button type="button" onClick={cancelEdit} className="inline-flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-xs font-bold text-[#111111]">
                            Cancel Edit
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-3xl border border-[#f1f1f1] bg-[#fafafa] p-4">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#bbbbbb]">Records</p>
                        <p className="mt-1 text-lg font-black text-[#111111]">{sortedPunches.length}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#bbbbbb]">Latest</p>
                        <p className="mt-1 text-sm font-bold text-[#111111]">
                            {sortedPunches[0] ? formatDetailedDateTime(sortedPunches[0].timestamp) : 'No punches yet'}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                        {error}
                    </div>
                )}

                {sortedPunches.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-[#e5e7eb] bg-white px-4 py-10 text-center">
                        <p className="text-sm font-medium text-[#6b7280]">No punches for this employee</p>
                    </div>
                ) : (
                    <div className="max-h-[calc(100dvh-17rem)] space-y-3 overflow-y-auto pr-1">
                        {sortedPunches.map((punch, index) => {
                            const isIn = punch.punchType === 'IN';
                            const Icon = isIn ? LogIn : LogOut;

                            return (
                                <motion.div
                                    key={punch.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    className={cn(
                                        'relative overflow-hidden rounded-3xl border bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]',
                                        isIn ? 'border-emerald-100' : 'border-slate-200',
                                    )}
                                >
                                    <div className={cn('absolute inset-y-0 left-0 w-1', isIn ? 'bg-emerald-500' : 'bg-slate-400')} />
                                    <div className="flex items-start gap-3 pl-2">
                                        <div className={cn('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', isIn ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600')}>
                                            <Icon className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-[#111111]">Punch {punch.punchType}</p>
                                                    <p className="mt-1 text-xs text-[#6b7280]">{formatDetailedDateTime(punch.timestamp)}</p>
                                                </div>
                                                <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-black tracking-[0.2em]', isIn ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600')}>
                                                    {punch.punchType}
                                                </span>
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fafafa] px-2.5 py-1 text-[#6b7280]">
                                                    <CalendarDays className="h-3.5 w-3.5" />
                                                    {punch.dateKey}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fafafa] px-2.5 py-1 text-[#6b7280]">
                                                    <Clock3 className="h-3.5 w-3.5" />
                                                    {formatTime(punch.timestamp)}
                                                </span>
                                                <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold', isIn ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600')}>
                                                    Employee {punch.employeeCode}
                                                </span>
                                                <button type="button" onClick={() => startEdit(punch)} className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white px-2.5 py-1 font-bold text-[#111111]">
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                <Modal
                    open={!!mode}
                    onClose={cancelEdit}
                    title={mode === 'update' ? 'Edit Punch' : 'Add Missing Punch'}
                    description={
                        mode === 'update'
                            ? 'Correct the punch time, date, punch type, and add a note.'
                            : 'Insert a missing punch with the correct type, date, and time.'
                    }
                    size="md"
                >
                    <div className="space-y-4">
                        {error && (
                            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-black uppercase tracking-wider text-[#6b7280]">Date</label>
                                <input type="date" value={dateValue} onChange={(e) => setDateValue(e.target.value)} className="input-theme" />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-black uppercase tracking-wider text-[#6b7280]">Time</label>
                                <input type="time" value={timeValue} onChange={(e) => setTimeValue(e.target.value)} className="input-theme" />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-black uppercase tracking-wider text-[#6b7280]">Punch Type</label>
                                <select value={punchType} onChange={(e) => setPunchType(e.target.value as 'IN' | 'OUT')} className="input-theme">
                                    <option value="IN">IN</option>
                                    <option value="OUT">OUT</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-black uppercase tracking-wider text-[#6b7280]">Reason / Note</label>
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="input-theme"
                                    placeholder="e.g. corrected wrong date"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button type="button" onClick={cancelEdit} className="btn-secondary flex-1">Cancel</button>
                            <button type="button" onClick={handleSave} disabled={saving || !dateValue || !timeValue} className="btn-primary flex-1">
                                {saving ? 'Saving…' : 'Save Correction'}
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </Drawer>
    );
}