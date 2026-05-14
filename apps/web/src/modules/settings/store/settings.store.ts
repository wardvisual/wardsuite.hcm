import { create } from 'zustand';

interface SettingsState {
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;
  setSaving: (v: boolean) => void;
  setError: (e: string | null) => void;
  setSuccess: (msg: string | null) => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  isSaving: false,
  error: null,
  successMessage: null,
  setSaving: (isSaving) => set({ isSaving }),
  setError: (error) => set({ error }),
  setSuccess: (successMessage) => set({ successMessage }),
}));
