import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { success, error } from '@api/core/utils/response.utils';
import { AuthenticatedRequest } from '@api/core/middleware/auth.middleware';

export class AuthController {
  private service = new AuthService();

  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.service.register(req.body);
      res.status(201).json(success(result, 'User registered successfully'));
    } catch (err: any) {
      res.status(err.statusCode ?? 400).json(error(err.message));
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.service.login(req.body);
      res.status(200).json(success(result, 'Login successful'));
    } catch (err: any) {
      res.status(err.statusCode ?? 401).json(error(err.message));
    }
  }

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json(error('Unauthorized', 401));
        return;
      }
      const user = await this.service.getMe(req.user.id);
      res.status(200).json(success(user));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json(error('Unauthorized', 401));
        return;
      }
      const user = await this.service.updateProfile(req.user.id, req.body);
      res.status(200).json(success(user, 'Profile updated successfully'));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json(error(err.message));
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    // Firebase tokens are stateless; logout is handled client-side.
    res.status(200).json(success(null, 'Logged out successfully'));
  }
}
