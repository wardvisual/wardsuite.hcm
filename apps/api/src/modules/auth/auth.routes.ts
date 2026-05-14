import { Router } from 'express';
import { AuthController } from './auth.controller';
import { requireAuth } from '@api/core/middleware/auth.middleware';

const router = Router();
const controller = new AuthController();

router.post('/register', (req, res) => controller.register(req, res));
router.post('/login', (req, res) => controller.login(req, res));
router.post('/logout', requireAuth, (req, res) => controller.logout(req, res));
router.get('/me', requireAuth, (req, res) => controller.me(req as any, res));
router.patch('/profile', requireAuth, (req, res) => controller.updateProfile(req as any, res));

export default router;
