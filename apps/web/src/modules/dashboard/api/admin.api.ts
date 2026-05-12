import { apiRequest } from '@web/services/api.service';
import type { DailySummary, WeeklySummary } from '@web/modules/attendance';

export const adminApi = {
  getDailyReport: (dateKey: string) =>
    apiRequest.get<DailySummary[]>(`/attendance/admin/daily-report?dateKey=${dateKey}`),

  getWeeklyReport: (weekKey: string) =>
    apiRequest.get<WeeklySummary[]>(`/attendance/admin/weekly-report?weekKey=${encodeURIComponent(weekKey)}`),

  editPunch: (punchId: string, timestamp: string, reason?: string) =>
    apiRequest.patch<{ id: string }>(`/attendance/punches/${punchId}`, { timestamp, reason }),

  deletePunch: (punchId: string, reason: string) =>
    apiRequest.delete<null>(`/attendance/punches/${punchId}`, { reason }),

  getUsers: () =>
    apiRequest.get<{ id: string; name: string; email: string; role: string; employeeCode: string; status: string; schedule: unknown }[]>('/users'),

  updateUser: (id: string, body: Record<string, unknown>) =>
    apiRequest.patch<unknown>(`/users/${id}`, body),
};
