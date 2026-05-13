import { useState } from 'react';
import { motion } from 'motion/react';
import { AdminReportsPanel } from './AdminReportsPanel';
import { AdminPunchesPanel } from './AdminPunchesPanel';

type AdminTab = 'reports' | 'punches';

export function AdminPanel() {
    const [tab, setTab] = useState<AdminTab>('reports');

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="floating-card p-6 space-y-5"
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-base font-black text-[#111111]">Employee Punches</h2>
                    <p className="text-xs text-[#6b7280] mt-0.5">Manage attendance records and view company-wide reports.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-3xl border border-[#ebebeb] bg-[#fafafa] p-2 shadow-sm sm:min-w-[19rem]">
                    {(['reports', 'punches'] as AdminTab[]).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTab(t)}
                            className={`rounded-2xl px-5 py-3 text-sm font-black tracking-wide transition-all sm:text-base ${tab === t ? 'bg-white text-[#111111] shadow-[0_8px_20px_rgba(15,23,42,0.08)]' : 'text-[#9ca3af] hover:text-[#111111]'
                                }`}
                        >
                            {t === 'reports' ? 'Reports' : 'Punch Mgmt'}
                        </button>
                    ))}
                </div>
            </div>

            {tab === 'reports' ? <AdminReportsPanel /> : <AdminPunchesPanel />}
        </motion.div>
    );
}
