import { apiRequest } from '@web/services/api.service';
import { AttendancePunch, AttendanceHistory, DailySummary } from '../types/attendance.types';

export const attendanceApi = {
  punch: (timezone?: string) =>
    apiRequest.post<AttendancePunch>('/attendance/punch', { timezone, source: 'web' }),

  getTodayPunches: (timezone = 'Asia/Manila') =>
    apiRequest.get<AttendancePunch[]>(`/attendance/today?timezone=${encodeURIComponent(timezone)}`),

  getDailySummary: (dateKey: string) =>
    apiRequest.get<DailySummary | null>(`/attendance/daily-summary/${dateKey}`),

  getHistory: (limit = 30) =>
    apiRequest.get<DailySummary[]>(`/attendance/history?limit=${limit}`),

  getPunchHistory: (punchId: string) =>
    apiRequest.get<AttendanceHistory[]>(`/attendance/punches/${punchId}/history`),

  adminEditPunch: (punchId: string, timestamp: string, reason?: string) =>
    apiRequest.patch<AttendancePunch>(`/attendance/punches/${punchId}`, { timestamp, reason }),

  adminDeletePunch: (punchId: string, reason: string) =>
    apiRequest.delete<null>(`/attendance/punches/${punchId}`, { reason }),

  getAdminDailyReport: (dateKey: string) =>
    apiRequest.get<DailySummary[]>(`/attendance/admin/daily-report?dateKey=${dateKey}`),

  getAdminWeeklyReport: (weekKey: string) =>
    apiRequest.get<DailySummary[]>(`/attendance/admin/weekly-report?weekKey=${encodeURIComponent(weekKey)}`),
};
