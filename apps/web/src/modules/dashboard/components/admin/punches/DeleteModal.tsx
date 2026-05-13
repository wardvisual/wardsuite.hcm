import { Modal } from '@web/components';

interface DeleteModalProps {
    open: boolean;
    reason: string;
    saving: boolean;
    onChangeReason: (value: string) => void;
    onClose: () => void;
    onDelete: () => void;
}

export function DeleteModal({ open, reason, saving, onChangeReason, onClose, onDelete }: DeleteModalProps) {
    return (
        <Modal open={open} onClose={onClose} title="Delete Punch" description="This cannot be undone. The action will be logged in history." size="sm">
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-black text-[#6b7280] uppercase tracking-wider mb-1">Reason</label>
                    <input type="text" value={reason} onChange={(e) => onChangeReason(e.target.value)} className="input-theme" placeholder="e.g. Duplicate entry" />
                </div>
                <div className="flex gap-2 pt-2">
                    <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                    <button type="button" onClick={onDelete} disabled={saving} className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 py-3 text-sm font-bold transition-colors flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                        {saving ? 'Deleting…' : 'Delete'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
