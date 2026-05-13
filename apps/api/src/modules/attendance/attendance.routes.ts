import { Router } from 'express';
import { requireAuth, requireRole } from '@api/core/middleware/auth.middleware';
import { AttendanceController } from './attendance.controller';

const router = Router();
const controller = new AttendanceController();

// Employee — punch in/out
router.post('/punch', requireAuth, (req, res) => controller.punch(req, res));

// Employee — read own data
router.get('/today', requireAuth, (req, res) => controller.getTodayPunches(req, res));
router.get('/today/page', requireAuth, (req, res) => controller.getTodayPunchPage(req, res));
router.get('/history', requireAuth, (req, res) => controller.getHistory(req, res));
router.get('/daily-summary/:dateKey', requireAuth, (req, res) => controller.getDailySummary(req, res));
router.get('/punches/:punchId/history', requireAuth, (req, res) => controller.getPunchHistory(req, res));

// Admin / Manager — edit/delete punches
router.patch('/punches/:punchId', requireAuth, requireRole('ADMIN', 'MANAGER'), (req, res) =>
  controller.adminEditPunch(req, res)
);
router.delete('/punches/:punchId', requireAuth, requireRole('ADMIN'), (req, res) =>
  controller.adminDeletePunch(req, res)
);

// Admin — reports
router.get('/admin/daily-report', requireAuth, requireRole('ADMIN', 'MANAGER'), (req, res) =>
  controller.getAdminDailyReport(req, res)
);
router.get('/admin/weekly-report', requireAuth, requireRole('ADMIN', 'MANAGER'), (req, res) =>
  controller.getAdminWeeklyReport(req, res)
);

export default router;
