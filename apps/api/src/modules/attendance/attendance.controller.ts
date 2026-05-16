import { Request, Response } from 'express';
import { AttendanceService } from './attendance.service';
import { AuthenticatedRequest, resolveActor } from '@api/core/middleware/auth.middleware';
import { success, successWithMeta, error } from '@api/core/utils/response.utils';

export class AttendanceController {
  private service = new AttendanceService();

  punch = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await this.service.punch(userId, req.body);
      res.status(201).json(success(result, `Punched ${result.punchType} successfully`));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  };

  getTodayPunches = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const timezone = (req.query.timezone as string) ?? 'Asia/Manila';
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const data = await this.service.getTodayPunches(userId, timezone, limit);
      res.status(200).json(success(data));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  };

  getTodayPunchPage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const timezone = (req.query.timezone as string) ?? 'Asia/Manila';
      const parsedLimit = Number(req.query.limit ?? 20);
      const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20;
      const cursor = (req.query.cursor as string) ?? undefined;
      const page = await this.service.getTodayPunchPage(userId, timezone, limit, cursor);
      res.status(200).json(successWithMeta(page.items, { nextCursor: page.nextCursor, hasMore: page.hasMore, limit }));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  };

  getPunchHistoryPage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const parsedLimit = Number(req.query.limit ?? 20);
      const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20;
      const cursor = (req.query.cursor as string) ?? undefined;
      const fromDate = (req.query.fromDate as string) ?? undefined;
      const toDate = (req.query.toDate as string) ?? undefined;
      const punchType = (req.query.punchType as 'IN' | 'OUT' | undefined) ?? undefined;
      const page = await this.service.getPunchHistoryPage(userId, { limit, cursor, fromDate, toDate, punchType });
      res.status(200).json(successWithMeta(page.items, { nextCursor: page.nextCursor, hasMore: page.hasMore, limit }));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  };

  getEmployeePunchPage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      const parsedLimit = Number(req.query.limit ?? 20);
      const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20;
      const cursor = (req.query.cursor as string) ?? undefined;
      const page = await this.service.getEmployeePunchPage(userId, limit, cursor);
      res.status(200).json(successWithMeta(page.items, { nextCursor: page.nextCursor, hasMore: page.hasMore, limit }));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  };

  getAdminEmployeePunchHistoryPage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      const parsedLimit = Number(req.query.limit ?? 20);
      const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20;
      const cursor = (req.query.cursor as string) ?? undefined;
      const fromDate = (req.query.fromDate as string) ?? undefined;
      const toDate = (req.query.toDate as string) ?? undefined;
      const punchType = (req.query.punchType as 'IN' | 'OUT' | undefined) ?? undefined;
      const page = await this.service.getPunchHistoryPage(userId, { limit, cursor, fromDate, toDate, punchType });
      res.status(200).json(successWithMeta(page.items, { nextCursor: page.nextCursor, hasMore: page.hasMore, limit }));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  };

  getAdminEmployeePunchHistoryGroups = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      const fromDate = (req.query.fromDate as string) ?? '';
      const toDate = (req.query.toDate as string) ?? '';
      const punchType = (req.query.punchType as 'IN' | 'OUT' | undefined) ?? undefined;

      if (!fromDate || !toDate) {
        res.status(400).json(error('fromDate and toDate query params required (YYYY-MM-DD)'));
        return;
      }

      const data = await this.service.getEmployeePunchHistoryGroups(userId, { fromDate, toDate, punchType });
      res.status(200).json(success(data));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  };

  getActiveDates = async (_req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.getActiveDates();
      res.status(200).json(success(data));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  };

  getAdminTodayPunches = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const timezone = (req.query.timezone as string) ?? 'Asia/Manila';
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const targetDate = (req.query.dateKey as string) ?? undefined;
      const data = await this.service.getAdminTodayPunches(timezone, limit, targetDate);
      res.status(200).json(success(data));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  };

  saveAdminPunchCorrection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const adminId = resolveActor(req);
      const adminRole = req.user!.role;
      const data = await this.service.saveAdminPunchCorrection(req.body, adminId, adminRole);
      res.status(200).json(success(data, 'Punch correction saved'));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  };

  getDailySummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const dateKey = req.params.dateKey as string;
      const data = await this.service.getDailySummary(userId, dateKey);
      res.status(200).json(success(data));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  };

  getHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const limit = Number(req.query.limit ?? 30);
      const data = await this.service.getHistory(userId, limit);
      res.status(200).json(success(data));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  };

  getPunchHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const punchId = req.params.punchId as string;
      const data = await this.service.getAttendanceHistory(punchId);
      res.status(200).json(success(data));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  };

  adminEditPunch = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const punchId = req.params.punchId as string;
      const adminId = resolveActor(req);
      const adminRole = req.user!.role;
      const data = await this.service.adminEditPunch(punchId, req.body, adminId, adminRole);
      res.status(200).json(success(data, 'Punch updated'));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  };

  adminDeletePunch = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const punchId = req.params.punchId as string;
      const adminId = resolveActor(req);
      const adminRole = req.user!.role;
      await this.service.adminDeletePunch(punchId, req.body.reason ?? '', adminId, adminRole);
      res.status(200).json(success(null, 'Punch deleted'));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  };

  getAdminDailyReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const dateKey = (req.query.dateKey as string) ?? new Date().toISOString().slice(0, 10);
      const data = await this.service.getAdminDailyReport(dateKey);
      res.status(200).json(success(data));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  };

  getAdminWeeklyReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const weekKey = req.query.weekKey as string;
      if (!weekKey) {
        res.status(400).json(error('weekKey query param required (YYYY-WNN)'));
        return;
      }
      const data = await this.service.getAdminWeeklyReport(weekKey);
      res.status(200).json(success(data));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  };
}
