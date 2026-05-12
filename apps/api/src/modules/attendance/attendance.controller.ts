import { Request, Response } from 'express';
import { AttendanceService } from './attendance.service';
import { AuthenticatedRequest, resolveActor } from '@api/core/middleware/auth.middleware';
import { success, error } from '@api/core/utils/response.utils';

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
      const data = await this.service.getTodayPunches(userId, timezone);
      res.status(200).json(success(data));
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
