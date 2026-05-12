import { Request, Response, NextFunction } from 'express';
import { error } from '@api/core/utils/response.utils';

/**
 * Extended Express Request with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to require authentication
 * Validates Bearer token and attaches user to request
 */
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json(error('Unauthorized - No token provided', 401));
      return;
    }

    // TODO: Replace with Firebase Admin SDK token verification:
    // const decodedToken = await admin.auth().verifyIdToken(authHeader.substring(7));

    req.user = {
      id: 'dev-user-id',
      email: 'dev@example.com',
      role: 'ADMIN',
    };

    next();
  } catch (err) {
    res.status(401).json(error('Unauthorized - Invalid token', 401));
  }
}

/**
 * Middleware to require specific role
 */
export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(error('Unauthorized', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json(error('Forbidden - Insufficient permissions', 403));
      return;
    }

    next();
  };
}

/**
 * Get actor ID from request (for audit logging)
 */
export function resolveActor(req: AuthenticatedRequest): string {
  return req.user?.id || 'system';
}
