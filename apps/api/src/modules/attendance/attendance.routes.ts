import { Router } from 'express';
import { requireAuth, requireRole } from '@api/core/middleware/auth.middleware';
import { AttendanceController } from './attendance.controller';
import { RouteDefinition } from '@api/types';

const router = Router();
const controller = new AttendanceController();

const routes: RouteDefinition[] = [
  // Employee — punch in/out
  {
    method: 'post',
    path: '/punch',
    middleware: [requireAuth],
    handler: (req, res) => controller.punch(req, res),
  },

  // Employee — read own data
  {
    method: 'get',
    path: '/today',
    middleware: [requireAuth],
    handler: (req, res) => controller.getTodayPunches(req, res),
  },
  {
    method: 'get',
    path: '/today/page',
    middleware: [requireAuth],
    handler: (req, res) => controller.getTodayPunchPage(req, res),
  },
  {
    method: 'get',
    path: '/history',
    middleware: [requireAuth],
    handler: (req, res) => controller.getHistory(req, res),
  },
  {
    method: 'get',
    path: '/punch-history',
    middleware: [requireAuth],
    handler: (req, res) => controller.getPunchHistoryPage(req, res),
  },
  {
    method: 'get',
    path: '/daily-summary/:dateKey',
    middleware: [requireAuth],
    handler: (req, res) => controller.getDailySummary(req, res),
  },
  {
    method: 'get',
    path: '/punches/:punchId/history',
    middleware: [requireAuth],
    handler: (req, res) => controller.getPunchHistory(req, res),
  },

  // Admin / Manager — edit/delete punches
  {
    method: 'get',
    path: '/admin/today',
    middleware: [requireAuth, requireRole('ADMIN', 'MANAGER')],
    handler: (req, res) => controller.getAdminTodayPunches(req, res),
  },
  {
    method: 'post',
    path: '/admin/punch-corrections',
    middleware: [requireAuth, requireRole('ADMIN', 'MANAGER')],
    handler: (req, res) => controller.saveAdminPunchCorrection(req, res),
  },
  {
    method: 'patch',
    path: '/punches/:punchId',
    middleware: [requireAuth, requireRole('ADMIN', 'MANAGER')],
    handler: (req, res) => controller.adminEditPunch(req, res),
  },
  {
    method: 'delete',
    path: '/punches/:punchId',
    middleware: [requireAuth, requireRole('ADMIN')],
    handler: (req, res) => controller.adminDeletePunch(req, res),
  },
  {
    method: 'get',
    path: '/admin/employees/:userId/punches/page',
    middleware: [requireAuth, requireRole('ADMIN', 'MANAGER')],
    handler: (req, res) => controller.getEmployeePunchPage(req, res),
  },
  {
    method: 'get',
    path: '/admin/employees/:userId/punch-history',
    middleware: [requireAuth, requireRole('ADMIN', 'MANAGER')],
    handler: (req, res) => controller.getAdminEmployeePunchHistoryPage(req, res),
  },
  {
    method: 'get',
    path: '/admin/employees/:userId/punch-history/groups',
    middleware: [requireAuth, requireRole('ADMIN', 'MANAGER')],
    handler: (req, res) => controller.getAdminEmployeePunchHistoryGroups(req, res),
  },

  // Admin — reports
  {
    method: 'get',
    path: '/admin/daily-report',
    middleware: [requireAuth, requireRole('ADMIN', 'MANAGER')],
    handler: (req, res) => controller.getAdminDailyReport(req, res),
  },
  {
    method: 'get',
    path: '/admin/weekly-report',
    middleware: [requireAuth, requireRole('ADMIN', 'MANAGER')],
    handler: (req, res) => controller.getAdminWeeklyReport(req, res),
  },
];

routes.forEach(({ method, path, middleware = [], handler }) => {
  router[method](path, ...middleware, handler);
});

export default router;
