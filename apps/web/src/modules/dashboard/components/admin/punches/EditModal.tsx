import { Modal } from '@web/components';

interface EditModalProps {
    open: boolean;
    timestamp: string;
    reason: string;
    saving: boolean;
    onChangeTimestamp: (value: string) => void;
    onChangeReason: (value: string) => void;
    onClose: () => void;
    onSave: () => void;
}

export function EditModal({
    open,
    timestamp,
    reason,
    saving,
    onChangeTimestamp,
    onChangeReason,
    onClose,
    onSave,
}: EditModalProps) {
    return (
        <Modal open={open} onClose={onClose} title="Edit Punch" description="Correct the punch timestamp. This action is logged." size="sm">
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-black text-[#6b7280] uppercase tracking-wider mb-1">New Timestamp</label>
                    <input type="datetime-local" value={timestamp} onChange={(e) => onChangeTimestamp(e.target.value)} className="input-theme" />
                </div>
                <div>
                    <label className="block text-xs font-black text-[#6b7280] uppercase tracking-wider mb-1">Reason (optional)</label>
                    <input type="text" value={reason} onChange={(e) => onChangeReason(e.target.value)} className="input-theme" placeholder="e.g. Missed timeout" />
                </div>
                <div className="flex gap-2 pt-2">
                    <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                    <button type="button" onClick={onSave} disabled={saving || !timestamp} className="btn-primary flex-1">
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
