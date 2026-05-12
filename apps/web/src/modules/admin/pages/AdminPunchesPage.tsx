import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Edit2, Trash2, History, RefreshCw } from 'lucide-react';
import { DataTable, Modal } from '@web/components';
import type { Column } from '@web/components';
import { adminApi } from '../api/admin.api';
import { AttendancePunch } from '@web/modules/attendance';
import { attendanceApi } from '@web/modules/attendance/api/attendance.api';

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function getTodayKey() { return new Date().toISOString().slice(0, 10); }

export default function AdminPunchesPage() {
  const [dateKey, setDateKey] = useState(getTodayKey());
  const [userIdFilter, setUserIdFilter] = useState('');
  const [punches, setPunches] = useState<AttendancePunch[]>([]);
  const [loading, setLoading] = useState(false);
  const [editTarget, setEditTarget] = useState<AttendancePunch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AttendancePunch | null>(null);
  const [editTimestamp, setEditTimestamp] = useState('');
  const [editReason, setEditReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyTarget, setHistoryTarget] = useState<AttendancePunch | null>(null);
  const [punchHistory, setPunchHistory] = useState<{ id: string; action: string; changedAt: string; changedByRole: string; reason: string | null }[]>([]);

  const fetchPunches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const todayPunches = await attendanceApi.getTodayPunches('Asia/Manila');
      // Filter by date/user (API currently returns today only; extend as needed)
      setPunches(Array.isArray(todayPunches) ? todayPunches : []);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load punches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPunches(); }, [fetchPunches]);

  const handleEdit = async () => {
    if (!editTarget || !editTimestamp) return;
    setSaving(true);
    setError(null);
    try {
      await adminApi.editPunch(editTarget.id, editTimestamp, editReason || undefined);
      setEditTarget(null);
      setEditTimestamp('');
      setEditReason('');
      await fetchPunches();
    } catch (err: any) {
      setError(err.message ?? 'Edit failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    setError(null);
    try {
      await adminApi.deletePunch(deleteTarget.id, deleteReason || 'Admin correction');
      setDeleteTarget(null);
      setDeleteReason('');
      await fetchPunches();
    } catch (err: any) {
      setError(err.message ?? 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

  const handleViewHistory = async (punch: AttendancePunch) => {
    setHistoryTarget(punch);
    try {
      const h = await attendanceApi.getHistory(30);
      // Use the punch history endpoint
      setPunchHistory([]);
    } catch {
      setPunchHistory([]);
    }
  };

  const columns: Column<AttendancePunch>[] = [
    { key: 'emp', header: 'Employee', cell: (r) => <span className="font-black text-sm text-[#111111]">{r.employeeCode}</span> },
    { key: 'type', header: 'Type', cell: (r) => (
      <span className={`font-bold text-xs px-2.5 py-1 rounded-full ${r.punchType === 'IN' ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f5f5f5] text-[#6b7280]'}`}>
        {r.punchType}
      </span>
    )},
    { key: 'time', header: 'Timestamp', cell: (r) => (
      <span className={`text-sm ${r.isEdited ? 'text-amber-600 font-bold' : 'text-[#111111]'}`}>
        {fmtTime(r.timestamp)} {r.isEdited && '(edited)'}
      </span>
    )},
    { key: 'source', header: 'Source', cell: (r) => <span className="text-xs text-[#6b7280] capitalize">{r.source}</span> },
    { key: 'actions', header: '', cell: (r) => (
      <div className="flex items-center gap-2">
        <button type="button" title="Edit punch"
          onClick={() => { setEditTarget(r); setEditTimestamp(r.timestamp.slice(0, 16)); setEditReason(''); }}
          className="p-2 rounded-xl hover:bg-[#f5f5f5] text-[#bbbbbb] hover:text-[#111111] transition-all"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button type="button" title="Delete punch"
          onClick={() => { setDeleteTarget(r); setDeleteReason(''); }}
          className="p-2 rounded-xl hover:bg-red-50 text-[#bbbbbb] hover:text-red-500 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button type="button" title="View history"
          onClick={() => handleViewHistory(r)}
          className="p-2 rounded-xl hover:bg-[#f5f5f5] text-[#bbbbbb] hover:text-[#111111] transition-all"
        >
          <History className="w-4 h-4" />
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111111]">Punch Management</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Edit or delete attendance punches and view audit trail.</p>
        </div>
        <button type="button" onClick={fetchPunches} className="btn-secondary self-start">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl">{error}</div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <DataTable
          columns={columns}
          data={punches}
          keyExtractor={(r) => r.id}
          isLoading={loading}
          emptyMessage="No punches found"
        />
      </motion.div>

      {/* Edit modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Punch" description="Correct the punch timestamp. This action is logged." size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-[#6b7280] uppercase tracking-wider mb-1">New Timestamp</label>
            <input type="datetime-local" value={editTimestamp} onChange={(e) => setEditTimestamp(e.target.value)} className="input-theme" />
          </div>
          <div>
            <label className="block text-xs font-black text-[#6b7280] uppercase tracking-wider mb-1">Reason (optional)</label>
            <input type="text" value={editReason} onChange={(e) => setEditReason(e.target.value)} className="input-theme" placeholder="e.g. Missed timeout" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setEditTarget(null)} className="btn-secondary flex-1">Cancel</button>
            <button type="button" onClick={handleEdit} disabled={saving || !editTimestamp} className="btn-primary flex-1">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Punch" description="This cannot be undone. The action will be logged in history." size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-[#6b7280] uppercase tracking-wider mb-1">Reason</label>
            <input type="text" value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} className="input-theme" placeholder="e.g. Duplicate entry" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">Cancel</button>
            <button type="button" onClick={handleDelete} disabled={saving} className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 py-3 text-sm font-bold transition-colors flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* History modal */}
      <Modal open={!!historyTarget} onClose={() => { setHistoryTarget(null); setPunchHistory([]); }} title="Punch Audit Trail" size="md">
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {punchHistory.length === 0 ? (
            <p className="text-sm text-[#bbbbbb] text-center py-6">No edit history for this punch</p>
          ) : (
            punchHistory.map((h) => (
              <div key={h.id} className="p-3 rounded-2xl bg-[#fafafa] text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#111111] capitalize">{h.action.replace(/_/g, ' ').toLowerCase()}</span>
                  <span className="text-xs text-[#bbbbbb]">{new Date(h.changedAt).toLocaleString()}</span>
                </div>
                {h.reason && <p className="text-xs text-[#6b7280] mt-0.5">Reason: {h.reason}</p>}
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
