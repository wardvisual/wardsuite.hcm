import { Router } from 'express';
import { AuthController } from './auth.controller';
import { requireAuth, AuthenticatedRequest } from '@api/core/middleware/auth.middleware';
import { RouteDefinition } from '@api/types';

const router = Router();
const controller = new AuthController();

const routes: RouteDefinition[] = [
  {
    method: 'post',
    path: '/register',
    handler: (req, res) => controller.register(req, res),
  },
  {
    method: 'post',
    path: '/login',
    handler: (req, res) => controller.login(req, res),
  },
  {
    method: 'post',
    path: '/logout',
    middleware: [requireAuth],
    handler: (req, res) => controller.logout(req, res),
  },
  {
    method: 'get',
    path: '/me',
    middleware: [requireAuth],
    handler: (req: AuthenticatedRequest, res) => controller.me(req, res),
  },
  {
    method: 'patch',
    path: '/profile',
    middleware: [requireAuth],
    handler: (req: AuthenticatedRequest, res) => controller.updateProfile(req, res),
  },
];

routes.forEach(({ method, path, middleware = [], handler }) => {
  router[method](path, ...middleware, handler);
});

export default router;
