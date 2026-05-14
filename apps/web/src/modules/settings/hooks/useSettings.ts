import { useCallback } from 'react';
import { useSettingsStore } from '../store/settings.store';
import { settingsApi } from '../api/settings.api';
import { useAuthStore } from '@web/modules/auth/store/auth.store';
import type { UpdateProfilePayload } from '../types/settings.types';

export function useSettings() {
  const { isSaving, error, successMessage, setSaving, setError, setSuccess } = useSettingsStore();
  const { user, token, setAuth } = useAuthStore();

  const saveProfile = useCallback(
    async (payload: UpdateProfilePayload) => {
      setSaving(true);
      setError(null);
      setSuccess(null);
      try {
        await settingsApi.updateProfile(payload);
        if (user && token) {
          setAuth(
            {
              ...user,
              name: payload.name ?? user.name,
              timezone: payload.timezone ?? user.timezone,
              schedule: payload.schedule
                ? {
                    start: payload.schedule.start ?? user.schedule.start,
                    end: payload.schedule.end ?? user.schedule.end,
                    breakMinutes: payload.schedule.breakMinutes ?? user.schedule.breakMinutes,
                    graceMinutes: payload.schedule.graceMinutes ?? user.schedule.graceMinutes,
                  }
                : user.schedule,
            },
            token,
          );
        }
        setSuccess('Settings saved successfully');
      } catch (err: any) {
        setError(err.message ?? 'Failed to save settings');
      } finally {
        setSaving(false);
      }
    },
    [setSaving, setError, setSuccess, user, token, setAuth],
  );

  return { isSaving, error, successMessage, saveProfile, user };
}
