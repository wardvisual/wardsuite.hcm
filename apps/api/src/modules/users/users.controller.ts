import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { success, error } from '@api/core/utils/response.utils';

export class UsersController {
  private service = new UsersService();

  async findAll(_req: Request, res: Response): Promise<void> {
    try {
      const users = await this.service.findAll();
      res.status(200).json(success(users));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  }

  async findOne(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.service.findById(req.params.id);
      res.status(200).json(success(user));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.service.update(req.params.id, req.body);
      res.status(200).json(success(user, 'User updated successfully'));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await this.service.delete(req.params.id);
      res.status(200).json(success(null, 'User deleted successfully'));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  }
}
