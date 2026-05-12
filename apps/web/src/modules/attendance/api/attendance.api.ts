import { apiRequest } from '@web/services/api.service';
import { AttendancePunch, DailySummary } from '../types/attendance.types';

export const attendanceApi = {
  punch: (timezone?: string) =>
    apiRequest<AttendancePunch>('/attendance/punch', {
      method: 'POST',
      body: { timezone, source: 'web' },
    }),

  getTodayPunches: (timezone = 'Asia/Manila') =>
    apiRequest<AttendancePunch[]>(`/attendance/today?timezone=${encodeURIComponent(timezone)}`),

  getDailySummary: (dateKey: string) =>
    apiRequest<DailySummary | null>(`/attendance/daily-summary/${dateKey}`),

  getHistory: (limit = 30) =>
    apiRequest<DailySummary[]>(`/attendance/history?limit=${limit}`),

  adminEditPunch: (punchId: string, timestamp: string, reason?: string) =>
    apiRequest<AttendancePunch>(`/attendance/punches/${punchId}`, {
      method: 'PATCH',
      body: { timestamp, reason },
    }),

  adminDeletePunch: (punchId: string, reason: string) =>
    apiRequest<null>(`/attendance/punches/${punchId}`, {
      method: 'DELETE',
      body: { reason },
    }),

  getAdminDailyReport: (dateKey: string) =>
    apiRequest<DailySummary[]>(`/attendance/admin/daily-report?dateKey=${dateKey}`),

  getAdminWeeklyReport: (weekKey: string) =>
    apiRequest<DailySummary[]>(`/attendance/admin/weekly-report?weekKey=${encodeURIComponent(weekKey)}`),
};
