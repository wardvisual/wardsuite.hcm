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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-[#111111]">Admin Panel</h2>
          <p className="text-xs text-[#6b7280] mt-0.5">Manage attendance records and view company-wide reports.</p>
        </div>
        <div className="flex gap-1 bg-[#f5f5f5] rounded-2xl p-1">
          {(['reports', 'punches'] as AdminTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tab === t ? 'bg-white text-[#111111] shadow-sm' : 'text-[#bbbbbb] hover:text-[#111111]'
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
