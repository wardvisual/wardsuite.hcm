import { Router } from 'express';
import { UsersController } from './users.controller';
import { requireAuth, requireRole } from '@api/core/middleware/auth.middleware';
import { RouteDefinition } from '@api/types';

const router = Router();
const controller = new UsersController();

const routes: RouteDefinition[] = [
  {
    method: 'get',
    path: '/',
    middleware: [requireAuth, requireRole('ADMIN', 'MANAGER')],
    handler: (req, res) => controller.findAll(req, res),
  },
  {
    method: 'get',
    path: '/:id',
    middleware: [requireAuth],
    handler: (req, res) => controller.findOne(req, res),
  },
  {
    method: 'patch',
    path: '/:id',
    middleware: [requireAuth, requireRole('ADMIN')],
    handler: (req, res) => controller.update(req, res),
  },
  {
    method: 'delete',
    path: '/:id',
    middleware: [requireAuth, requireRole('ADMIN')],
    handler: (req, res) => controller.delete(req, res),
  },
];

routes.forEach(({ method, path, middleware = [], handler }) => {
  router[method](path, ...middleware, handler);
});

export default router;
