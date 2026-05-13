import { apiRequest } from '@web/services/api.service';
import type { AttendancePunch } from '@web/modules/attendance';
import type { DailySummary, WeeklySummary } from '@web/modules/attendance';

export interface AdminPunchCorrectionPayload {
  userId: string;
  punchId?: string;
  timestamp: string;
  punchType: 'IN' | 'OUT';
  reason?: string;
  isNew?: boolean;
}

export const adminApi = {
  getTodayPunches: (timezone = 'Asia/Manila', limit?: number) => {
    const params = new URLSearchParams({ timezone });
    if (Number.isFinite(limit) && limit && limit > 0) {
      params.set('limit', String(limit));
    }
    return apiRequest.get<AttendancePunch[]>(`/attendance/admin/today?${params.toString()}`);
  },

  getDailyReport: (dateKey: string) =>
    apiRequest.get<DailySummary[]>(`/attendance/admin/daily-report?dateKey=${dateKey}`),

  getWeeklyReport: (weekKey: string) =>
    apiRequest.get<WeeklySummary[]>(`/attendance/admin/weekly-report?weekKey=${encodeURIComponent(weekKey)}`),

  savePunchCorrection: (body: AdminPunchCorrectionPayload) =>
    apiRequest.post<AttendancePunch>(`/attendance/admin/punch-corrections`, body),

  editPunch: (punchId: string, timestamp: string, reason?: string) =>
    apiRequest.patch<{ id: string }>(`/attendance/punches/${punchId}`, { timestamp, reason }),

  deletePunch: (punchId: string, reason: string) =>
    apiRequest.delete<null>(`/attendance/punches/${punchId}`, { reason }),

  getUsers: () =>
    apiRequest.get<{ id: string; name: string; email: string; role: string; employeeCode: string; status: string; schedule: unknown }[]>('/users'),

  updateUser: (id: string, body: Record<string, unknown>) =>
    apiRequest.patch<unknown>(`/users/${id}`, body),
};
