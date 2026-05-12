import { Router } from 'express';
import { UsersController } from './users.controller';
import { requireAuth, requireRole } from '@api/core/middleware/auth.middleware';

const router = Router();
const controller = new UsersController();

router.get('/', requireAuth, requireRole('ADMIN', 'MANAGER'), (req, res) =>
  controller.findAll(req, res),
);

router.get('/:id', requireAuth, (req, res) => controller.findOne(req, res));

router.patch('/:id', requireAuth, requireRole('ADMIN'), (req, res) =>
  controller.update(req, res),
);

router.delete('/:id', requireAuth, requireRole('ADMIN'), (req, res) =>
  controller.delete(req, res),
);

export default router;
